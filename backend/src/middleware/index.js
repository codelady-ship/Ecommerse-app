import jwt from 'jsonwebtoken';
import { ZodError } from 'zod';
import { config } from '../config.js';

export class HttpError extends Error {
  constructor(status, message, details, extra) {
    super(message);
    this.status = status;
    this.details = details;
    this.extra = extra;
  }
}

/** validate({ body, query, params }) with zod schemas; parsed values replace req.valid.* */
export const validate = (schemas) => (req, _res, next) => {
  req.valid = req.valid || {};
  for (const key of ['params', 'query', 'body']) {
    if (!schemas[key]) continue;
    const r = schemas[key].safeParse(req[key] ?? {});
    if (!r.success) {
      return next(
        new HttpError(400, 'Validation failed', r.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message }))),
      );
    }
    req.valid[key] = r.data;
  }
  next();
};

export function requireAdmin(req, _res, next) {
  const h = req.get('authorization') || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : '';
  if (!token) return next(new HttpError(401, 'Missing bearer token'));
  try {
    const payload = jwt.verify(token, config.jwtSecret, { algorithms: ['HS256'] });
    if (payload.role !== 'admin' && payload.role !== 'demo') throw new Error('not admin');
    req.admin = payload;
    next();
  } catch {
    next(new HttpError(401, 'Invalid or expired token'));
  }
}

export const DEMO_READ_ONLY = 'Demo admin is read-only: changes are not saved.';

/** The public demo admin may read everything but never write. Real admins pass straight through. */
export function blockDemoWrites(req, _res, next) {
  if (req.admin?.role === 'demo' && !['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next(new HttpError(403, DEMO_READ_ONLY, undefined, { demo: true }));
  }
  next();
}

export const notFound = (req, _res, next) => next(new HttpError(404, `No route for ${req.method} ${req.path}`));

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, _req, res, _next) {
  let status = err.status || err.statusCode || 500;
  let body = { error: err.message || 'Server error' };
  if (err instanceof ZodError) {
    status = 400;
    body = { error: 'Validation failed', details: err.issues };
  } else if (err.details) {
    body.details = err.details;
  } else if (err.extra) {
    Object.assign(body, err.extra);
  } else if (err.code === 11000) {
    status = 409;
    body = { error: 'Already exists' };
  } else if (err.name === 'ValidationError' || err.name === 'CastError') {
    status = 400;
  } else if (err.code === 'LIMIT_FILE_SIZE') {
    status = 413;
  } else if (err.type === 'entity.parse.failed') {
    status = 400;
    body = { error: 'Malformed JSON' };
  }
  if (status >= 500) {
    if (config.env !== 'test') console.error(err);
    body = { error: 'Server error' };
  }
  res.status(status).json(body);
}
