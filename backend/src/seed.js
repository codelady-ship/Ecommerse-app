// Seeds categories, colours and products from src/data/catalog.json (upsert by code, so it is safe to re-run),
// and creates/updates the admin user from ADMIN_EMAIL + ADMIN_PASSWORD when both are set.
import { pathToFileURL } from 'node:url';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { config } from './config.js';
import { Admin, Category, Colour, Product } from './models/index.js';
import { PALETTE, STYLES, buildProducts } from './lib/catalog.js';

export async function seedDatabase({ adminEmail = config.adminEmail, adminPassword = config.adminPassword } = {}) {
  await Promise.all([Category.init(), Colour.init(), Product.init(), Admin.init()]);
  await Colour.bulkWrite(
    PALETTE.map((c) => ({ updateOne: { filter: { name: c.name }, update: { $set: c }, upsert: true } })),
  );
  await Category.bulkWrite(
    STYLES.map((s, order) => ({
      updateOne: {
        filter: { code: s.code },
        update: { $set: { code: s.code, label: s.label, tint: s.tint, cover: s.cover, order } },
        upsert: true,
      },
    })),
  );
  const products = buildProducts();
  await Product.bulkWrite(
    products.map((p) => ({ updateOne: { filter: { code: p.code }, update: { $set: p }, upsert: true } })),
  );
  let admin = null;
  if (adminEmail && adminPassword) {
    if (adminPassword.length < 10) throw new Error('ADMIN_PASSWORD must be at least 10 characters');
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    admin = await Admin.findOneAndUpdate(
      { email: adminEmail.toLowerCase() },
      { email: adminEmail.toLowerCase(), passwordHash },
      { upsert: true, new: true },
    );
  }
  return { colours: PALETTE.length, categories: STYLES.length, products: products.length, admin: Boolean(admin) };
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  if (!config.mongoUri) {
    console.error('Set MONGODB_URI first (copy .env.example to .env).');
    process.exit(1);
  }
  await mongoose.connect(config.mongoUri);
  const r = await seedDatabase();
  console.log(`Seeded ${r.products} products, ${r.categories} categories, ${r.colours} colours${r.admin ? ', admin user' : ''}.`);
  await mongoose.disconnect();
}
