import { Router } from 'express';
import { z } from 'zod';
import { Category, Colour, Product } from '../models/index.js';
import { HttpError, validate } from '../middleware/index.js';
import { estimateDelivery } from '../lib/delivery.js';

const r = Router();

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const SORTS = {
  featured: { order: 1 },
  'price-asc': { price: 1, order: 1 },
  'price-desc': { price: -1, order: 1 },
  name: { name: 1 },
};

export const productQuery = z.object({
  q: z.string().trim().max(60).optional(),
  style: z.string().trim().toUpperCase().regex(/^[A-Z]{1,3}$/).optional(),
  colour: z.string().trim().max(30).optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  sort: z.enum(['featured', 'price-asc', 'price-desc', 'name']).default('featured'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(24),
});

export function buildFilter({ q, style, colour, minPrice, maxPrice }) {
  const f = { active: true };
  if (style) f.style = style;
  if (colour) f.colour = new RegExp(`^${escapeRe(colour)}$`, 'i');
  if (minPrice != null || maxPrice != null) {
    f.price = {};
    if (minPrice != null) f.price.$gte = minPrice;
    if (maxPrice != null) f.price.$lte = maxPrice;
  }
  if (q) {
    const re = new RegExp(escapeRe(q), 'i');
    f.$or = [{ name: re }, { fabric: re }, { colour: re }, { styleLabel: re }, { code: re }];
  }
  return f;
}

async function listProducts(params) {
  const filter = buildFilter(params);
  const { page, limit, sort } = params;
  const [items, total] = await Promise.all([
    Product.find(filter).sort(SORTS[sort]).skip((page - 1) * limit).limit(limit),
    Product.countDocuments(filter),
  ]);
  return { items, total, page, pages: Math.max(1, Math.ceil(total / limit)), limit, sort };
}

r.get('/categories', async (_req, res) => {
  const cats = await Category.find().sort({ order: 1 });
  const counts = await Product.aggregate([{ $match: { active: true } }, { $group: { _id: '$style', n: { $sum: 1 } } }]);
  const byCode = Object.fromEntries(counts.map((c) => [c._id, c.n]));
  res.json(cats.map((c) => ({ ...c.toJSON(), count: byCode[c.code] || 0 })));
});

r.get('/colours', async (_req, res) => {
  res.json(await Colour.find().sort({ name: 1 }));
});

r.get('/products', validate({ query: productQuery }), async (req, res) => {
  res.json(await listProducts(req.valid.query));
});

// Lightweight search for the search overlay (name, fabric, colour, style, code).
r.get(
  '/search',
  validate({ query: z.object({ q: z.string().trim().min(1).max(60), limit: z.coerce.number().int().min(1).max(24).default(8) }) }),
  async (req, res) => {
    const { q, limit } = req.valid.query;
    res.json(await listProducts({ q, limit, page: 1, sort: 'featured' }));
  },
);

r.get(
  '/products/:code',
  validate({ params: z.object({ code: z.string().toUpperCase().regex(/^HL-[A-Z]{1,3}-\d{2,3}$/) }) }),
  async (req, res) => {
    const p = await Product.findOne({ code: req.valid.params.code, active: true });
    if (!p) throw new HttpError(404, 'Product not found');
    const related = await Product.find({ style: p.style, code: { $ne: p.code }, active: true }).sort({ order: 1 }).limit(4);
    res.json({ product: p, related });
  },
);

r.get(
  '/delivery',
  validate({
    query: z.object({
      pincode: z.string().regex(/^[1-9]\d{5}$/, 'Enter a 6-digit pincode'),
      subtotal: z.coerce.number().min(0).default(0),
    }),
  }),
  (req, res) => {
    const { pincode, subtotal } = req.valid.query;
    res.json(estimateDelivery(pincode, subtotal));
  },
);

export default r;
