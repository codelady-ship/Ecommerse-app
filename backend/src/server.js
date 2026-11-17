import mongoose from 'mongoose';
import { assertRuntimeConfig, config } from './config.js';
import { createApp } from './app.js';
import { seedDatabase } from './seed.js';
import { Product } from './models/index.js';

assertRuntimeConfig();
await mongoose.connect(config.mongoUri, { serverSelectionTimeoutMS: 10_000 });

// First boot on an empty database: seed the catalogue so the API is useful straight away.
if ((await Product.estimatedDocumentCount()) === 0) {
  const r = await seedDatabase();
  console.log(`Empty database, seeded ${r.products} products.`);
}

const server = createApp().listen(config.port, () => console.log(`HUELINE API on :${config.port}`));

const shutdown = async () => {
  server.close();
  await mongoose.disconnect();
  process.exit(0);
};
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
