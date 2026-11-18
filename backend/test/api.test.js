import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = crypto.randomBytes(32).toString('hex');
process.env.UPLOAD_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'hl-uploads-'));

const { MongoMemoryServer } = await import('mongodb-memory-server');
const mongoose = (await import('mongoose')).default;
const request = (await import('supertest')).default;
const { createApp } = await import('../src/app.js');
const { seedDatabase } = await import('../src/seed.js');
const { estimateDelivery, addWorkingDays } = await import('../src/lib/delivery.js');

let mongo;
let app;
const sid = crypto.randomUUID();
const ADMIN = { email: 'admin@example.com', password: 'correct-horse-battery' };

before(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
  await seedDatabase({ adminEmail: ADMIN.email, adminPassword: ADMIN.password });
  app = createApp({ rateLimitPerMinute: 10_000 });
});

after(async () => {
  await mongoose.disconnect();
  await mongo?.stop();
  fs.rmSync(process.env.UPLOAD_DIR, { recursive: true, force: true });
});

describe('catalogue', () => {
  test('health', async () => {
    const r = await request(app).get('/api/health').expect(200);
    assert.equal(r.body.db, 'up');
  });

  test('categories with counts and colours', async () => {
    const r = await request(app).get('/api/categories').expect(200);
    assert.equal(r.body.length, 6);
    assert.deepEqual(r.body.map((c) => c.code), ['T', 'S', 'E', 'K', 'R', 'D']);
    assert.ok(r.body.every((c) => c.count === 4));
    const c = await request(app).get('/api/colours').expect(200);
    assert.equal(c.body.length, 9);
  });

  test('lists all 24 products in featured order', async () => {
    const r = await request(app).get('/api/products?limit=100').expect(200);
    assert.equal(r.body.total, 24);
    assert.equal(r.body.items[0].code, 'HL-T-01');
    assert.equal(r.body.items[0].price, 62000);
  });

  test('filters by style and colour, sorts by price', async () => {
    const r = await request(app).get('/api/products?style=e&sort=price-asc').expect(200);
    assert.equal(r.body.total, 4);
    const prices = r.body.items.map((p) => p.price);
    assert.deepEqual(prices, [...prices].sort((a, b) => a - b));
    const c = await request(app).get('/api/products?colour=indigo').expect(200);
    assert.ok(c.body.items.length >= 3 && c.body.items.every((p) => p.colour === 'Indigo'));
    const d = await request(app).get('/api/products?sort=price-desc&limit=1').expect(200);
    assert.equal(d.body.items[0].price, 62000);
  });

  test('price range and pagination', async () => {
    const r = await request(app).get('/api/products?minPrice=10000&maxPrice=15000&limit=3&page=2').expect(200);
    assert.ok(r.body.items.every((p) => p.price >= 10000 && p.price <= 15000));
    assert.equal(r.body.page, 2);
  });

  test('search is case-insensitive and regex-safe', async () => {
    const r = await request(app).get('/api/search?q=SILK').expect(200);
    assert.ok(r.body.items.length >= 4);
    const weird = await request(app).get('/api/search?q=' + encodeURIComponent('.*(')).expect(200);
    assert.equal(weird.body.items.length, 0);
  });

  test('rejects bad query values', async () => {
    await request(app).get('/api/products?sort=evil').expect(400);
    await request(app).get('/api/products?style=T&style=E').expect(400);
  });

  test('product detail with related items, 404 for unknown', async () => {
    const r = await request(app).get('/api/products/hl-t-01').expect(200);
    assert.equal(r.body.product.name, 'Cobalt wrap overcoat');
    assert.equal(r.body.related.length, 3);
    await request(app).get('/api/products/HL-T-99').expect(404);
    await request(app).get('/api/products/nope').expect(400);
  });
});

describe('delivery estimate', () => {
  test('rules: Rajasthan 2, metro 3, elsewhere 5 working days', () => {
    const mon = new Date('2026-10-26T09:00:00'); // a Monday
    assert.equal(estimateDelivery('302001', 0, mon).workingDays, 2);
    assert.equal(estimateDelivery('400001', 0, mon).workingDays, 3);
    assert.equal(estimateDelivery('560001', 0, mon).workingDays, 3);
    assert.equal(estimateDelivery('682001', 0, mon).workingDays, 5);
    assert.equal(estimateDelivery('302001', 0, mon).label, 'Arrives by Wed, 28 Oct');
    assert.equal(estimateDelivery('12345', 0, mon), null);
  });

  test('skips Sundays', () => {
    const sat = new Date('2026-10-31T09:00:00'); // Saturday
    assert.equal(addWorkingDays(sat, 1).getDay(), 1); // Monday, not Sunday
  });

  test('endpoint validates and reports free shipping', async () => {
    const r = await request(app).get('/api/delivery?pincode=110001&subtotal=30000').expect(200);
    assert.equal(r.body.zone, 'Metro');
    assert.equal(r.body.freeShipping, true);
    await request(app).get('/api/delivery?pincode=abc').expect(400);
  });
});

describe('bag and saved lists', () => {
  test('rejects a non-uuid session', async () => {
    await request(app).get('/api/lists/not-a-uuid').expect(400);
  });

  test('add, merge, replace and remove bag lines', async () => {
    await request(app).post(`/api/lists/${sid}/bag`).send({ code: 'HL-T-01', size: 'M', qty: 1 }).expect(201);
    const r = await request(app).post(`/api/lists/${sid}/bag`).send({ code: 'HL-T-01', size: 'M', qty: 2 }).expect(201);
    assert.deepEqual(r.body.bag, [{ code: 'HL-T-01', size: 'M', qty: 3 }]);
    await request(app).post(`/api/lists/${sid}/bag`).send({ code: 'HL-Z-01', size: 'M' }).expect(404);
    await request(app).post(`/api/lists/${sid}/bag`).send({ code: 'HL-T-01', size: 'XXL' }).expect(400);
    const put = await request(app)
      .put(`/api/lists/${sid}/bag`)
      .send({ items: [{ code: 'HL-S-03', size: 'S', qty: 1 }, { code: 'HL-T-99', size: 'S', qty: 1 }] })
      .expect(200);
    assert.deepEqual(put.body.bag, [{ code: 'HL-S-03', size: 'S', qty: 1 }]);
    const del = await request(app).delete(`/api/lists/${sid}/bag/HL-S-03/S`).expect(200);
    assert.equal(del.body.bag.length, 0);
  });

  test('saved list add, replace, remove', async () => {
    await request(app).post(`/api/lists/${sid}/saved`).send({ code: 'HL-E-01' }).expect(201);
    await request(app).post(`/api/lists/${sid}/saved`).send({ code: 'HL-E-01' }).expect(201);
    let r = await request(app).get(`/api/lists/${sid}`).expect(200);
    assert.deepEqual(r.body.saved, ['HL-E-01']);
    r = await request(app).put(`/api/lists/${sid}/saved`).send({ codes: ['HL-K-01', 'HL-K-01', 'HL-X-01'] }).expect(200);
    assert.deepEqual(r.body.saved, ['HL-K-01']);
    r = await request(app).delete(`/api/lists/${sid}/saved/HL-K-01`).expect(200);
    assert.deepEqual(r.body.saved, []);
  });
});

describe('orders (demo checkout)', () => {
  const customer = { name: 'Asha Rao', email: 'asha@example.com', phone: '+91 98765 43210', address: '12 MI Road', city: 'Jaipur', pincode: '302001' };

  test('prices come from the database and the bag is cleared', async () => {
    await request(app).post(`/api/lists/${sid}/bag`).send({ code: 'HL-S-03', size: 'S', qty: 2 }).expect(201);
    const r = await request(app)
      .post('/api/orders')
      .send({ sessionId: sid, items: [{ code: 'HL-S-03', size: 'S', qty: 2, price: 1 }], customer })
      .expect(201);
    assert.equal(r.body.subtotal, 8400);
    assert.equal(r.body.shipping, 450);
    assert.equal(r.body.total, 8850);
    assert.equal(r.body.delivery.zone, 'Rajasthan');
    const list = await request(app).get(`/api/lists/${sid}`).expect(200);
    assert.equal(list.body.bag.length, 0);
    const got = await request(app).get(`/api/orders/${r.body.number}?sessionId=${sid}`).expect(200);
    assert.equal(got.body.total, 8850);
    await request(app).get(`/api/orders/${r.body.number}?sessionId=${crypto.randomUUID()}`).expect(404);
  });

  test('free shipping over ₹25,000 and validation errors', async () => {
    const r = await request(app)
      .post('/api/orders')
      .send({ sessionId: sid, items: [{ code: 'HL-T-01', size: 'M', qty: 1 }], customer })
      .expect(201);
    assert.equal(r.body.shipping, 0);
    const bad = await request(app).post('/api/orders').send({ sessionId: sid, items: [], customer: { ...customer, email: 'x' } }).expect(400);
    assert.ok(bad.body.details.length >= 2);
    await request(app)
      .post('/api/orders')
      .send({ sessionId: sid, items: [{ code: 'HL-T-77', size: 'M', qty: 1 }], customer })
      .expect(400);
  });
});

describe('newsletter', () => {
  test('signup is idempotent and validates email', async () => {
    await request(app).post('/api/newsletter').send({ email: 'Reader@Example.com' }).expect(201);
    const again = await request(app).post('/api/newsletter').send({ email: 'reader@example.com' }).expect(200);
    assert.equal(again.body.already, true);
    await request(app).post('/api/newsletter').send({ email: 'nope' }).expect(400);
  });
});

describe('admin', () => {
  let token;

  test('login rejects wrong password and issues a JWT', async () => {
    await request(app).post('/api/auth/login').send({ email: ADMIN.email, password: 'wrong-password' }).expect(401);
    await request(app).post('/api/auth/login').send({ email: 'ghost@example.com', password: 'whatever-123' }).expect(401);
    const r = await request(app).post('/api/auth/login').send(ADMIN).expect(200);
    token = r.body.token;
    const me = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${token}`).expect(200);
    assert.equal(me.body.email, ADMIN.email);
  });

  test('admin routes need a valid token', async () => {
    await request(app).get('/api/admin/products').expect(401);
    await request(app).get('/api/admin/products').set('Authorization', 'Bearer abc.def.ghi').expect(401);
  });

  test('create, update, delete a product', async () => {
    const auth = { Authorization: `Bearer ${token}` };
    const body = { code: 'HL-K-05', name: 'Cobalt mohair jumper', fabric: 'Kid mohair', price: 15800, colour: 'cobalt', style: 'K' };
    const c = await request(app).post('/api/admin/products').set(auth).send(body).expect(201);
    assert.equal(c.body.colour, 'Cobalt');
    assert.equal(c.body.colourHex, '#2b3fd6');
    assert.equal(c.body.styleLabel, 'Knitwear');
    await request(app).post('/api/admin/products').set(auth).send(body).expect(409);
    await request(app).post('/api/admin/products').set(auth).send({ ...body, code: 'HL-K-06', style: 'Q' }).expect(400);
    await request(app).post('/api/admin/products').set(auth).send({ ...body, code: 'HL-K-07', price: -5 }).expect(400);
    const u = await request(app).patch('/api/admin/products/HL-K-05').set(auth).send({ price: 14900 }).expect(200);
    assert.equal(u.body.price, 14900);
    const pub = await request(app).get('/api/products?style=K').expect(200);
    assert.equal(pub.body.total, 5);
    await request(app).delete('/api/admin/products/HL-K-05').set(auth).expect(204);
    await request(app).delete('/api/admin/products/HL-K-05').set(auth).expect(404);
  });

  test('image upload to disk, attached to a product', async () => {
    const auth = { Authorization: `Bearer ${token}` };
    // 1x1 PNG
    const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64');
    const r = await request(app).post('/api/admin/uploads?code=HL-T-02').set(auth).attach('image', png, { filename: 'a.png', contentType: 'image/png' }).expect(201);
    assert.match(r.body.url, /^\/uploads\/.+\.png$/);
    assert.ok(r.body.product.images.includes(r.body.url));
    await request(app).get(r.body.url).expect(200);
    await request(app)
      .post('/api/admin/uploads')
      .set(auth)
      .attach('image', Buffer.from('hello'), { filename: 'a.txt', contentType: 'text/plain' })
      .expect(415);
  });

  test('lists orders and subscribers', async () => {
    const auth = { Authorization: `Bearer ${token}` };
    const o = await request(app).get('/api/admin/orders').set(auth).expect(200);
    assert.ok(o.body.length >= 2);
    const s = await request(app).get('/api/admin/subscribers').set(auth).expect(200);
    assert.equal(s.body.length, 1);
  });

  test('the seeded demo admin can read but every write is refused', async () => {
    const { DEMO_ADMIN_EMAIL, DEMO_ADMIN_PASSWORD } = await import('../src/seed.js');
    const r = await request(app).post('/api/auth/login').send({ email: DEMO_ADMIN_EMAIL, password: DEMO_ADMIN_PASSWORD }).expect(200);
    assert.equal(r.body.admin.role, 'demo');
    const auth = { Authorization: `Bearer ${r.body.token}` };
    const me = await request(app).get('/api/auth/me').set(auth).expect(200);
    assert.equal(me.body.role, 'demo');
    const list = await request(app).get('/api/admin/products').set(auth).expect(200);
    assert.ok(list.body.length >= 24);
    await request(app).get('/api/admin/orders').set(auth).expect(200);
    await request(app).get('/api/admin/subscribers').set(auth).expect(200);
    const body = { code: 'HL-K-09', name: 'Demo jumper', fabric: 'Wool', price: 100, colour: 'cobalt', style: 'K' };
    const w = await request(app).post('/api/admin/products').set(auth).send(body).expect(403);
    assert.equal(w.body.demo, true);
    assert.match(w.body.error, /read-only/);
    await request(app).patch('/api/admin/products/HL-T-01').set(auth).send({ price: 1 }).expect(403);
    await request(app).delete('/api/admin/products/HL-T-01').set(auth).expect(403);
    await request(app).post('/api/admin/uploads').set(auth).expect(403);
    const still = await request(app).get('/api/products/HL-T-01').expect(200);
    assert.notEqual(still.body.product.price, 1);
  });

  test('seed refuses the demo email as the real admin and DEMO_ADMIN=off removes the demo user', async () => {
    const { DEMO_ADMIN_EMAIL, DEMO_ADMIN_PASSWORD } = await import('../src/seed.js');
    await assert.rejects(seedDatabase({ adminEmail: DEMO_ADMIN_EMAIL, adminPassword: 'long-enough-password' }), /demo email/);
    await seedDatabase({ adminEmail: '', adminPassword: '', demoAdmin: false });
    await request(app).post('/api/auth/login').send({ email: DEMO_ADMIN_EMAIL, password: DEMO_ADMIN_PASSWORD }).expect(401);
    await seedDatabase({ adminEmail: '', adminPassword: '' });
  });
});

describe('cors, errors, rate limit', () => {
  test('allows the Pages origin and refuses others', async () => {
    const ok = await request(app).get('/api/health').set('Origin', 'https://codelady-ship.github.io').expect(200);
    assert.equal(ok.headers['access-control-allow-origin'], 'https://codelady-ship.github.io');
    const no = await request(app).get('/api/health').set('Origin', 'https://evil.example').expect(200);
    assert.equal(no.headers['access-control-allow-origin'], undefined);
  });

  test('unknown routes and malformed JSON', async () => {
    await request(app).get('/api/nope').expect(404);
    await request(app).post('/api/newsletter').set('Content-Type', 'application/json').send('{bad').expect(400);
  });

  test('rate limit returns 429', async () => {
    const small = createApp({ rateLimitPerMinute: 3 });
    for (let i = 0; i < 3; i++) await request(small).get('/api/colours').expect(200);
    await request(small).get('/api/colours').expect(429);
  });
});
