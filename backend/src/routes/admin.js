import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import { z } from 'zod';
import { config } from '../config.js';
import { Admin, Category, Colour, Order, Product, Subscriber } from '../models/index.js';
import { HttpError, blockDemoWrites, requireAdmin, validate } from '../middleware/index.js';
import { ALLOWED_TYPES, saveImage } from '../lib/storage.js';
import { maskOrder, maskSubscriber } from '../lib/mask.js';

// ---------- auth ----------
export const auth = Router();
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', 10);

auth.post(
  '/login',
  validate({ body: z.object({ email: z.string().trim().toLowerCase().email(), password: z.string().min(1).max(200) }) }),
  async (req, res) => {
    const { email, password } = req.valid.body;
    const admin = await Admin.findOne({ email });
    // Compare against a dummy hash when the user is unknown so timing does not reveal valid emails.
    const ok = await bcrypt.compare(password, admin?.passwordHash || DUMMY_HASH);
    if (!admin || !ok) throw new HttpError(401, 'Wrong email or password');
    const role = admin.role === 'demo' ? 'demo' : 'admin';
    const token = jwt.sign({ sub: String(admin._id), email: admin.email, role }, config.jwtSecret, {
      algorithm: 'HS256',
      expiresIn: config.jwtExpiresIn,
    });
    res.json({ token, admin: { email: admin.email, role } });
  },
);

auth.get('/me', requireAdmin, (req, res) => res.json({ email: req.admin.email, role: req.admin.role }));

// ---------- admin CRUD ----------
export const admin = Router();
admin.use(requireAdmin, blockDemoWrites);

const image = z.string().trim().max(500).regex(/^(https:\/\/|\/uploads\/|[a-z0-9-]+$)/, 'Use an https URL, an /uploads/ path or an asset name');
const productBody = z.object({
  code: z.string().trim().toUpperCase().regex(/^HL-[A-Z]{1,3}-\d{2,3}$/),
  name: z.string().trim().min(2).max(120),
  fabric: z.string().trim().min(2).max(120),
  price: z.coerce.number().int().min(0).max(10_000_000),
  colour: z.string().trim().min(2).max(30),
  style: z.string().trim().toUpperCase().regex(/^[A-Z]{1,3}$/),
  images: z.array(image).max(8).default([]),
  description: z.string().trim().max(2000).default(''),
  stock: z.coerce.number().int().min(0).max(100000).default(48),
  order: z.coerce.number().int().min(0).optional(),
  active: z.boolean().default(true),
});
const codeParam = validate({ params: z.object({ code: z.string().toUpperCase().regex(/^HL-[A-Z]{1,3}-\d{2,3}$/) }) });

async function denormalise(body) {
  const out = { ...body };
  if (body.style) {
    const cat = await Category.findOne({ code: body.style });
    if (!cat) throw new HttpError(400, `Unknown style "${body.style}"`);
    out.styleLabel = cat.label;
    out.tint = cat.tint;
  }
  if (body.colour) {
    const col = await Colour.findOne({ name: new RegExp(`^${body.colour.replace(/[^\w ]/g, '')}$`, 'i') });
    if (!col) throw new HttpError(400, `Unknown colour "${body.colour}"`);
    out.colour = col.name;
    out.colourHex = col.hex;
  }
  return out;
}

admin.get('/products', async (_req, res) => {
  res.json(await Product.find().sort({ order: 1 }));
});

admin.post('/products', validate({ body: productBody }), async (req, res) => {
  const data = await denormalise(req.valid.body);
  if (data.order == null) data.order = (await Product.countDocuments()) + 1;
  res.status(201).json(await Product.create(data));
});

admin.patch('/products/:code', codeParam, validate({ body: productBody.partial().omit({ code: true }) }), async (req, res) => {
  const data = await denormalise(req.valid.body);
  const p = await Product.findOneAndUpdate({ code: req.valid.params.code }, data, { new: true, runValidators: true });
  if (!p) throw new HttpError(404, 'Product not found');
  res.json(p);
});

admin.delete('/products/:code', codeParam, async (req, res) => {
  const p = await Product.findOneAndDelete({ code: req.valid.params.code });
  if (!p) throw new HttpError(404, 'Product not found');
  res.status(204).end();
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) =>
    ALLOWED_TYPES.includes(file.mimetype) ? cb(null, true) : cb(new HttpError(415, 'Only JPEG, PNG, WebP or AVIF images')),
});

// multipart/form-data, field "image". Optional ?code=HL-T-01 appends the URL to that product's images.
admin.post('/uploads', upload.single('image'), async (req, res) => {
  if (!req.file) throw new HttpError(400, 'Attach an image in the "image" field');
  const saved = await saveImage(req.file);
  const code = typeof req.query.code === 'string' ? req.query.code.toUpperCase() : '';
  let product;
  if (code) {
    if (!/^HL-[A-Z]{1,3}-\d{2,3}$/.test(code)) throw new HttpError(400, 'Invalid product code');
    product = await Product.findOneAndUpdate({ code }, { $push: { images: saved.url } }, { new: true });
    if (!product) throw new HttpError(404, 'Product not found');
  }
  res.status(201).json({ ...saved, product });
});

// Orders and subscribers hold visitors' personal data. The demo admin's password is public, so that role
// only ever gets the masked shape from lib/mask.js; only a real admin gets the documents as stored.
const isDemo = (req) => req.admin?.role !== 'admin';

admin.get('/orders', async (req, res) => {
  const orders = await Order.find().sort({ createdAt: -1 }).limit(100);
  res.json(isDemo(req) ? orders.map(maskOrder) : orders);
});

admin.get('/subscribers', async (req, res) => {
  const subscribers = await Subscriber.find().sort({ createdAt: -1 }).limit(500);
  res.json(isDemo(req) ? subscribers.map(maskSubscriber) : subscribers);
});
