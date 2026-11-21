import mongoose from 'mongoose';

const { Schema, model } = mongoose;

// Every request value is validated by zod (plain strings/numbers) before it reaches a query,
// so operator injection is not possible; filters are built server-side.
mongoose.set('strictQuery', true);

const json = {
  versionKey: false,
  transform: (_doc, ret) => {
    ret.id = String(ret._id);
    delete ret._id;
    return ret;
  },
};

const CategorySchema = new Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, match: /^[A-Z]{1,3}$/ },
    label: { type: String, required: true, trim: true },
    tint: { type: String, required: true, match: /^#[0-9a-fA-F]{6}$/ },
    cover: { type: String, default: '' },
    order: { type: Number, default: 0 },
  },
  { toJSON: json },
);

const ColourSchema = new Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    hex: { type: String, required: true, match: /^#[0-9a-fA-F]{6}$/ },
  },
  { toJSON: json },
);

const ProductSchema = new Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, match: /^HL-[A-Z]{1,3}-\d{2,3}$/ },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    fabric: { type: String, required: true, trim: true, maxlength: 120 },
    price: { type: Number, required: true, min: 0 },
    colour: { type: String, required: true },
    colourHex: { type: String, required: true },
    style: { type: String, required: true, uppercase: true, index: true },
    styleLabel: { type: String, required: true },
    tint: { type: String, required: true },
    images: { type: [String], default: [] },
    description: { type: String, default: '', maxlength: 2000 },
    stock: { type: Number, default: 48, min: 0 },
    order: { type: Number, default: 0, index: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true, toJSON: json },
);

const LineSchema = new Schema(
  {
    code: { type: String, required: true },
    size: { type: String, required: true, enum: ['XS', 'S', 'M', 'L', 'XL'] },
    qty: { type: Number, required: true, min: 1, max: 10 },
  },
  { _id: false },
);

// One document per anonymous browser session (uuid kept in localStorage).
const ListSchema = new Schema(
  {
    sessionId: { type: String, required: true, unique: true },
    bag: { type: [LineSchema], default: [] },
    saved: { type: [String], default: [] },
  },
  { timestamps: true, toJSON: json },
);

const OrderSchema = new Schema(
  {
    number: { type: String, required: true, unique: true },
    sessionId: { type: String, required: true, index: true },
    items: [
      {
        _id: false,
        code: String,
        name: String,
        colour: String,
        size: String,
        qty: Number,
        price: Number,
        lineTotal: Number,
      },
    ],
    subtotal: Number,
    shipping: Number,
    total: Number,
    currency: { type: String, default: 'INR' },
    customer: {
      name: String,
      email: String,
      phone: String,
      address: String,
      city: String,
      pincode: String,
    },
    delivery: { date: String, label: String, zone: String },
    status: { type: String, default: 'placed (demo)' },
  },
  { timestamps: true, toJSON: json },
);

const SubscriberSchema = new Schema(
  { email: { type: String, required: true, unique: true, lowercase: true, trim: true } },
  { timestamps: true, toJSON: json },
);

const AdminSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    // 'demo' = the public portfolio login: it reads the catalogue and masked orders/subscribers (lib/mask.js), every write is refused with a 403.
    role: { type: String, enum: ['admin', 'demo'], default: 'admin' },
  },
  { timestamps: true, toJSON: { ...json, transform: (d, r) => (delete r.passwordHash, json.transform(d, r)) } },
);

export const Category = model('Category', CategorySchema);
export const Colour = model('Colour', ColourSchema);
export const Product = model('Product', ProductSchema);
export const List = model('List', ListSchema);
export const Order = model('Order', OrderSchema);
export const Subscriber = model('Subscriber', SubscriberSchema);
export const Admin = model('Admin', AdminSchema);
