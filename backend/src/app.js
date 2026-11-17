import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import { config } from './config.js';
import catalog from './routes/catalog.js';
import lists from './routes/lists.js';
import orders from './routes/orders.js';
import newsletter from './routes/newsletter.js';
import { admin, auth } from './routes/admin.js';
import { errorHandler, notFound } from './middleware/index.js';

export function createApp(opts = {}) {
  const app = express();
  app.set('trust proxy', 1); // Render sits behind one proxy; needed for per-IP rate limits
  app.disable('x-powered-by');

  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  const origins = opts.corsOrigins || config.corsOrigins;
  app.use(
    cors({
      origin: (origin, cb) => cb(null, !origin || origins.includes(origin)),
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      maxAge: 600,
    }),
  );
  app.use(express.json({ limit: '100kb' }));

  const limit = (max, windowMs = 60_000) =>
    rateLimit({ windowMs, limit: max, standardHeaders: 'draft-7', legacyHeaders: false, message: { error: 'Too many requests, slow down.' } });
  app.use('/api', limit(opts.rateLimitPerMinute || config.rateLimitPerMinute));

  app.get('/api/health', (_req, res) =>
    res.json({ ok: true, db: mongoose.connection.readyState === 1 ? 'up' : 'down', time: new Date().toISOString() }),
  );
  app.use('/api', catalog);
  app.use('/api/lists', lists);
  app.use('/api/orders', limit(20), orders);
  app.use('/api/newsletter', limit(10), newsletter);
  app.use('/api/auth', limit(10, 15 * 60_000), auth);
  app.use('/api/admin', admin);
  app.use('/uploads', express.static(config.uploadDir, { maxAge: '30d', fallthrough: false }));

  app.get('/', (_req, res) => res.json({ name: 'HUELINE demo API', docs: 'See backend/README.md', health: '/api/health' }));
  app.use(notFound);
  app.use(errorHandler);
  return app;
}
