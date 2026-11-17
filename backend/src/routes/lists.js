// Bag and Saved lists, keyed by an anonymous session id (a UUID the browser keeps in localStorage).
import { Router } from 'express';
import { z } from 'zod';
import { List, Product } from '../models/index.js';
import { HttpError, validate } from '../middleware/index.js';

const r = Router();

export const sessionId = z.string().uuid('sessionId must be a UUID');
const code = z.string().toUpperCase().regex(/^HL-[A-Z]{1,3}-\d{2,3}$/);
const size = z.enum(['XS', 'S', 'M', 'L', 'XL']);
export const line = z.object({ code, size, qty: z.coerce.number().int().min(1).max(10).default(1) });
const sid = validate({ params: z.object({ sid: sessionId }) });

async function existingCodes(codes) {
  const found = await Product.find({ code: { $in: [...new Set(codes)] }, active: true }).select('code');
  return new Set(found.map((p) => p.code));
}

/** Merge duplicate lines (same code + size) and drop unknown products. */
async function cleanBag(items) {
  const known = await existingCodes(items.map((i) => i.code));
  const map = new Map();
  for (const it of items) {
    if (!known.has(it.code)) continue;
    const k = `${it.code}|${it.size}`;
    const prev = map.get(k);
    map.set(k, { ...it, qty: Math.min(10, (prev?.qty || 0) + it.qty) });
  }
  return [...map.values()];
}

const view = (doc) => ({ sessionId: doc.sessionId, bag: doc.bag, saved: doc.saved, updatedAt: doc.updatedAt });

async function getOrCreate(sessionId) {
  return List.findOneAndUpdate({ sessionId }, { $setOnInsert: { sessionId } }, { upsert: true, new: true });
}

r.get('/:sid', sid, async (req, res) => {
  res.json(view(await getOrCreate(req.valid.params.sid)));
});

// Replace the whole bag (the client keeps its own copy and syncs it).
r.put('/:sid/bag', sid, validate({ body: z.object({ items: z.array(line).max(50) }) }), async (req, res) => {
  const bag = await cleanBag(req.valid.body.items);
  const doc = await List.findOneAndUpdate({ sessionId: req.valid.params.sid }, { bag }, { upsert: true, new: true });
  res.json(view(doc));
});

r.post('/:sid/bag', sid, validate({ body: line }), async (req, res) => {
  const doc = await getOrCreate(req.valid.params.sid);
  const bag = await cleanBag([...doc.bag.map((l) => l.toObject()), req.valid.body]);
  if (!bag.some((l) => l.code === req.valid.body.code)) throw new HttpError(404, 'Product not found');
  doc.bag = bag;
  await doc.save();
  res.status(201).json(view(doc));
});

r.delete('/:sid/bag/:code/:size', validate({ params: z.object({ sid: sessionId, code, size }) }), async (req, res) => {
  const { sid: s, code: c, size: z2 } = req.valid.params;
  const doc = await List.findOneAndUpdate(
    { sessionId: s },
    { $pull: { bag: { code: c, size: z2 } } },
    { new: true, upsert: true },
  );
  res.json(view(doc));
});

r.put('/:sid/saved', sid, validate({ body: z.object({ codes: z.array(code).max(100) }) }), async (req, res) => {
  const known = await existingCodes(req.valid.body.codes);
  const saved = [...new Set(req.valid.body.codes)].filter((c) => known.has(c));
  const doc = await List.findOneAndUpdate({ sessionId: req.valid.params.sid }, { saved }, { upsert: true, new: true });
  res.json(view(doc));
});

r.post('/:sid/saved', sid, validate({ body: z.object({ code }) }), async (req, res) => {
  const known = await existingCodes([req.valid.body.code]);
  if (!known.size) throw new HttpError(404, 'Product not found');
  const doc = await List.findOneAndUpdate(
    { sessionId: req.valid.params.sid },
    { $addToSet: { saved: req.valid.body.code } },
    { upsert: true, new: true },
  );
  res.status(201).json(view(doc));
});

r.delete('/:sid/saved/:code', validate({ params: z.object({ sid: sessionId, code }) }), async (req, res) => {
  const doc = await List.findOneAndUpdate(
    { sessionId: req.valid.params.sid },
    { $pull: { saved: req.valid.params.code } },
    { new: true, upsert: true },
  );
  res.json(view(doc));
});

export default r;
