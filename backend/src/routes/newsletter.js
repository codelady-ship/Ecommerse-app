import { Router } from 'express';
import { z } from 'zod';
import { Subscriber } from '../models/index.js';
import { validate } from '../middleware/index.js';

const r = Router();

r.post('/', validate({ body: z.object({ email: z.string().trim().toLowerCase().email('Enter a valid email').max(120) }) }), async (req, res) => {
  const { email } = req.valid.body;
  const existing = await Subscriber.findOne({ email });
  if (existing) return res.status(200).json({ ok: true, already: true });
  await Subscriber.create({ email });
  res.status(201).json({ ok: true });
});

export default r;
