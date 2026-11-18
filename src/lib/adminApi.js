// Admin client for /api/auth + /api/admin (bearer JWT kept in sessionStorage, so it works inside an iframe
// without third-party cookies). When the API is not configured or cannot be reached, the public demo login
// opens an in-browser sandbox built from the bundled catalogue: changes stay in this tab (sessionStorage).
import { PALETTE, STYLES, buildProducts } from '../../backend/src/lib/catalog.js';
import { FREE_SHIPPING_FROM, SHIPPING_FEE } from '../../backend/src/lib/delivery.js';

const BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
const TIMEOUT = 10000;
const SESSION_KEY = 'hl-admin';
const SANDBOX_KEY = 'hl-admin-sandbox';

// Public on purpose (same as backend/src/seed.js): the server lets this account read but never write.
export const DEMO_EMAIL = 'demo@hueline.az';
export const DEMO_PASSWORD = 'demo1234';
export const CODE_RE = /^HL-[A-Z]{1,3}-\d{2,3}$/;

export class AdminError extends Error {
  constructor(message, status = 0, extra = {}) {
    super(message);
    this.status = status;
    Object.assign(this, extra);
  }
}

const store = {
  get(key) {
    try {
      return JSON.parse(sessionStorage.getItem(key) || 'null');
    } catch {
      return null;
    }
  },
  set(key, value) {
    try {
      if (value == null) sessionStorage.removeItem(key);
      else sessionStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* storage blocked: the session lives only in memory for this page view */
    }
  },
};

let memSession = store.get(SESSION_KEY);
export const getSession = () => memSession;
function setSession(s) {
  memSession = s;
  store.set(SESSION_KEY, s);
}
export function logout() {
  setSession(null);
}

// ---------- live API ----------
async function http(path, { method = 'GET', body, token } = {}) {
  if (!BASE) throw new AdminError('API not configured', 0, { offline: true });
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT);
  let res;
  try {
    res = await fetch(BASE + path, {
      method,
      signal: ctrl.signal,
      headers: {
        ...(body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new AdminError('API unreachable', 0, { offline: true });
  } finally {
    clearTimeout(timer);
  }
  const data = res.status === 204 ? null : await res.json().catch(() => null);
  if (!res.ok) {
    const details = Array.isArray(data?.details) ? data.details.map((d) => d.message || d).join(', ') : '';
    throw new AdminError(details || data?.error || res.statusText, res.status, {
      demo: Boolean(data?.demo),
      offline: res.status >= 502,
    });
  }
  return data;
}

// ---------- in-browser sandbox ----------
const colourOf = (name) => PALETTE.find((c) => c.name.toLowerCase() === String(name).trim().toLowerCase());
const styleOf = (code) => STYLES.find((s) => s.code === String(code).trim().toUpperCase());

function freshSandbox() {
  const now = Date.now();
  const products = buildProducts().map((p) => ({ ...p, id: p.code, active: true, description: '' }));
  const pick = (i) => products[(i * 5) % products.length];
  const names = [
    ['Aarav Mehta', 'Mumbai', '400001'],
    ['Leela Rao', 'Bengaluru', '560001'],
    ['Nisha Kapoor', 'Delhi', '110001'],
    ['Kabir Sen', 'Kolkata', '700001'],
  ];
  const orders = names.map(([name, city, pincode], i) => {
    const items = [pick(i), pick(i + 2)].map((p, j) => ({
      code: p.code,
      name: p.name,
      colour: p.colour,
      size: ['S', 'M', 'L'][(i + j) % 3],
      qty: 1 + ((i + j) % 2),
      price: p.price,
    }));
    items.forEach((l) => (l.lineTotal = l.price * l.qty));
    const subtotal = items.reduce((s, l) => s + l.lineTotal, 0);
    const shipping = subtotal >= FREE_SHIPPING_FROM ? 0 : SHIPPING_FEE;
    return {
      id: `demo-${i + 1}`,
      number: `HL-DEMO-${String(1040 + i)}`,
      items,
      subtotal,
      shipping,
      total: subtotal + shipping,
      currency: 'INR',
      customer: { name, email: `${name.split(' ')[0].toLowerCase()}@example.com`, city, pincode },
      status: 'placed (demo)',
      createdAt: new Date(now - (i + 1) * 9 * 3600e3).toISOString(),
    };
  });
  const subscribers = ['studio', 'hello', 'dyes', 'press', 'lookbook'].map((n, i) => ({
    id: `sub-${i + 1}`,
    email: `${n}@example.com`,
    createdAt: new Date(now - (i + 1) * 26 * 3600e3).toISOString(),
  }));
  return { products, orders, subscribers };
}

let memSandbox = null;
function sandbox() {
  if (!memSandbox) memSandbox = store.get(SANDBOX_KEY) || freshSandbox();
  return memSandbox;
}
function saveSandbox() {
  store.set(SANDBOX_KEY, memSandbox);
}
export function resetSandbox() {
  memSandbox = freshSandbox();
  saveSandbox();
}

function sandboxProduct(input, existing) {
  const out = { ...existing };
  if (input.name != null) {
    if (String(input.name).trim().length < 2) throw new AdminError('Name needs 2+ characters', 400);
    out.name = String(input.name).trim();
  }
  if (input.fabric != null) {
    if (String(input.fabric).trim().length < 2) throw new AdminError('Fabric needs 2+ characters', 400);
    out.fabric = String(input.fabric).trim();
  }
  for (const k of ['price', 'stock']) {
    if (input[k] == null) continue;
    const n = Number(input[k]);
    if (!Number.isInteger(n) || n < 0) throw new AdminError(`${k[0].toUpperCase() + k.slice(1)} must be a whole number, 0 or more`, 400);
    out[k] = n;
  }
  if (input.style != null) {
    const s = styleOf(input.style);
    if (!s) throw new AdminError(`Unknown style "${input.style}"`, 400);
    Object.assign(out, { style: s.code, styleLabel: s.label, tint: s.tint });
  }
  if (input.colour != null) {
    const c = colourOf(input.colour);
    if (!c) throw new AdminError(`Unknown colour "${input.colour}"`, 400);
    Object.assign(out, { colour: c.name, colourHex: c.hex });
  }
  if (input.active != null) out.active = Boolean(input.active);
  return out;
}

function sandboxCall(path, method, body) {
  const db = sandbox();
  const m = path.match(/^\/api\/admin\/products(?:\/([^/]+))?$/);
  if (method === 'GET') {
    if (path === '/api/admin/products') return [...db.products].sort((a, b) => a.order - b.order);
    if (path === '/api/admin/orders') return db.orders;
    if (path === '/api/admin/subscribers') return db.subscribers;
  }
  if (m && method === 'POST') {
    const code = String(body.code || '').trim().toUpperCase();
    if (!CODE_RE.test(code)) throw new AdminError('Code must look like HL-K-05', 400);
    if (db.products.some((p) => p.code === code)) throw new AdminError('Already exists', 409);
    if (!body.style || !body.colour) throw new AdminError('Pick a style and a colour', 400);
    const p = sandboxProduct(body, {
      code,
      id: code,
      images: [],
      description: '',
      stock: 48,
      active: true,
      order: Math.max(0, ...db.products.map((x) => x.order)) + 1,
    });
    if (!p.name || !p.fabric || p.price == null) throw new AdminError('Name, fabric and price are required', 400);
    db.products.push(p);
    saveSandbox();
    return p;
  }
  if (m && m[1]) {
    const i = db.products.findIndex((p) => p.code === m[1].toUpperCase());
    if (i < 0) throw new AdminError('Product not found', 404);
    if (method === 'PATCH') {
      db.products[i] = sandboxProduct(body, db.products[i]);
      saveSandbox();
      return db.products[i];
    }
    if (method === 'DELETE') {
      db.products.splice(i, 1);
      saveSandbox();
      return null;
    }
  }
  throw new AdminError(`No sandbox route for ${method} ${path}`, 404);
}

// ---------- public API ----------
/** Signs in against the API. The demo login falls back to the sandbox when the API is offline. */
export async function login(email, password) {
  const isDemoLogin = email.trim().toLowerCase() === DEMO_EMAIL && password === DEMO_PASSWORD;
  try {
    const r = await http('/api/auth/login', { method: 'POST', body: { email, password } });
    const s = { token: r.token, email: r.admin.email, role: r.admin.role || 'admin', sandbox: false };
    setSession(s);
    return s;
  } catch (err) {
    if (!err.offline) throw err;
    if (!isDemoLogin) {
      throw new AdminError('The API is offline right now. Use “Demo admin” to explore the panel.', 0, { offline: true });
    }
    const s = { token: '', email: DEMO_EMAIL, role: 'demo', sandbox: true };
    setSession(s);
    return s;
  }
}

export const demoLogin = () => login(DEMO_EMAIL, DEMO_PASSWORD);

/** GET/POST/PATCH/DELETE under /api/admin with the current session (live API or sandbox). */
export async function adminCall(path, { method = 'GET', body } = {}) {
  const s = getSession();
  if (!s) throw new AdminError('Sign in first', 401);
  if (s.sandbox) return structuredClone(sandboxCall(path, method, body));
  try {
    return await http(path, { method, body, token: s.token });
  } catch (err) {
    if (err.status === 401) logout();
    // The demo account keeps working if the API goes away mid-visit.
    if (err.offline && s.role === 'demo') {
      setSession({ ...s, sandbox: true, token: '' });
      return structuredClone(sandboxCall(path, method, body));
    }
    throw err;
  }
}

export const apiConfigured = Boolean(BASE);
export { PALETTE, STYLES };
