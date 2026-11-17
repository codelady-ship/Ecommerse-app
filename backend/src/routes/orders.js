// Demo checkout: prices are re-read from the database, nothing is charged.
import crypto from 'node:crypto';
import { Router } from 'express';
import { z } from 'zod';
import { List, Order, Product } from '../models/index.js';
import { HttpError, validate } from '../middleware/index.js';
import { estimateDelivery } from '../lib/delivery.js';
import { line, sessionId } from './lists.js';

const r = Router();

const customer = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().toLowerCase().email().max(120),
  phone: z.string().trim().regex(/^[+\d][\d\s-]{6,16}$/, 'Enter a valid phone number'),
  address: z.string().trim().min(5).max(200),
  city: z.string().trim().min(2).max(60),
  pincode: z.string().trim().regex(/^[1-9]\d{5}$/, 'Enter a 6-digit pincode'),
});

const orderBody = z.object({ sessionId, items: z.array(line).min(1).max(50), customer });

const orderNumber = () => `HL-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;

r.post('/', validate({ body: orderBody }), async (req, res) => {
  const { sessionId: sid, items, customer: c } = req.valid.body;
  const products = await Product.find({ code: { $in: items.map((i) => i.code) }, active: true });
  const byCode = new Map(products.map((p) => [p.code, p]));
  const missing = items.filter((i) => !byCode.has(i.code)).map((i) => i.code);
  if (missing.length) throw new HttpError(400, 'Some items are no longer available', missing);

  const lines = items.map((i) => {
    const p = byCode.get(i.code);
    return { code: p.code, name: p.name, colour: p.colour, size: i.size, qty: i.qty, price: p.price, lineTotal: p.price * i.qty };
  });
  const subtotal = lines.reduce((s, l) => s + l.lineTotal, 0);
  const delivery = estimateDelivery(c.pincode, subtotal);
  const order = await Order.create({
    number: orderNumber(),
    sessionId: sid,
    items: lines,
    subtotal,
    shipping: delivery.shippingFee,
    total: subtotal + delivery.shippingFee,
    customer: c,
    delivery: { date: delivery.date, label: delivery.label, zone: delivery.zone },
  });
  await List.updateOne({ sessionId: sid }, { bag: [] });
  res.status(201).json(order);
});

r.get(
  '/:number',
  validate({ params: z.object({ number: z.string().max(40) }), query: z.object({ sessionId }) }),
  async (req, res) => {
    const order = await Order.findOne({ number: req.valid.params.number, sessionId: req.valid.query.sessionId });
    if (!order) throw new HttpError(404, 'Order not found');
    res.json(order);
  },
);

export default r;
