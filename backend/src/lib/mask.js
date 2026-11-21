// What the public demo admin (role "demo") is allowed to see of visitors' personal data.
// Its password is published on purpose, so nothing here may let a stranger identify or contact a customer.
// Everything is rebuilt from an allow-list: a field added to a model later stays hidden until it is listed here.

const plain = (doc) => (typeof doc?.toJSON === 'function' ? doc.toJSON() : doc) || {};

/** "Real Visitor" -> "R*** V***" */
export function maskName(v) {
  const words = String(v || '').trim().split(/\s+/).filter(Boolean);
  return words.map((w) => `${[...w][0].toUpperCase()}***`).join(' ') || '***';
}

/** "real.visitor@gmail.test" -> "r***@g***.test" (the domain is masked too: a private domain can be a surname) */
export function maskEmail(v) {
  const s = String(v || '').trim().toLowerCase();
  const at = s.lastIndexOf('@');
  if (at < 1) return '***';
  const domain = s.slice(at + 1);
  const dot = domain.lastIndexOf('.');
  const tld = dot > 0 ? domain.slice(dot) : '';
  return `${s[0]}***@${domain[0] || ''}***${tld}`;
}

/** "+91 98765 43210" -> "*** *** **10" */
export function maskPhone(v) {
  const digits = String(v || '').replace(/\D/g, '');
  return digits.length >= 6 ? `*** *** **${digits.slice(-2)}` : '***';
}

export const HIDDEN = '(hidden in demo)';

/** Order as the demo admin sees it: no session id (it opens the public order lookup), no contact details. */
export function maskOrder(doc) {
  const o = plain(doc);
  const c = o.customer || {};
  return {
    id: o.id,
    number: o.number,
    items: o.items,
    subtotal: o.subtotal,
    shipping: o.shipping,
    total: o.total,
    currency: o.currency,
    customer: {
      name: maskName(c.name),
      email: maskEmail(c.email),
      phone: maskPhone(c.phone),
      address: HIDDEN,
      city: c.city,
      pincode: '******',
    },
    delivery: o.delivery,
    status: o.status,
    createdAt: o.createdAt,
    updatedAt: o.updatedAt,
    masked: true,
  };
}

export function maskSubscriber(doc) {
  const s = plain(doc);
  return { id: s.id, email: maskEmail(s.email), createdAt: s.createdAt, updatedAt: s.updatedAt, masked: true };
}
