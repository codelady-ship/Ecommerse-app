import 'dotenv/config';
import path from 'node:path';

const list = (v) => String(v || '').split(',').map((s) => s.trim()).filter(Boolean);

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 4000,
  mongoUri: process.env.MONGODB_URI || '',
  jwtSecret: process.env.JWT_SECRET || '',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '8h',
  corsOrigins: list(process.env.CORS_ORIGIN || 'http://localhost:5173,https://codelady-ship.github.io'),
  adminEmail: process.env.ADMIN_EMAIL || '',
  adminPassword: process.env.ADMIN_PASSWORD || '',
  // Public read-only demo admin seeded by `npm run seed`; DEMO_ADMIN=off skips it.
  demoAdmin: process.env.DEMO_ADMIN !== 'off',
  uploadDir: path.resolve(process.env.UPLOAD_DIR || 'uploads'),
  cloudinaryUrl: process.env.CLOUDINARY_URL || '',
  rateLimitPerMinute: Number(process.env.RATE_LIMIT_PER_MINUTE) || 120,
};

export function assertRuntimeConfig() {
  const missing = [];
  if (!config.mongoUri) missing.push('MONGODB_URI');
  if (!config.jwtSecret || config.jwtSecret.length < 32) missing.push('JWT_SECRET (32+ chars)');
  if (missing.length) {
    throw new Error(`Missing environment variables: ${missing.join(', ')}. Copy .env.example to .env.`);
  }
}
