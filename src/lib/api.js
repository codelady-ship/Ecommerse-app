// Talks to the HUELINE API (VITE_API_BASE_URL). Every call has an 8 s timeout. When the API is not
// configured or cannot be reached, the app switches to demo mode for the rest of the visit and uses the
// bundled catalogue, local delivery rules and localStorage instead, so the GitHub Pages build always works.
import { ALL } from '../data/catalog.js';
import { estimateDelivery } from '../../backend/src/lib/delivery.js';

const BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
const TIMEOUT = 8000;
let offline = !BASE;

export const isDemo = () => offline;

export class ApiError extends Error {
  constructor(message, status, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

async function request(path, { method = 'GET', body } = {}) {
  if (offline) throw new ApiError('Demo mode', 0);
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT);
  try {
    const res = await fetch(BASE + path, {
      method,
      signal: ctrl.signal,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = res.status === 204 ? null : await res.json().catch(() => null);
    if (!res.ok) {
      if (res.status >= 500) offline = true;
      throw new ApiError(data?.error || res.statusText, res.status, data?.details);
    }
    return data;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    offline = true; // network error or timeout: stop waiting on the API for this visit
    throw new ApiError('API unreachable, using demo data', 0);
  } finally {
    clearTimeout(timer);
  }
}

// ---------- session id for bag/saved ----------
const SID_KEY = 'hl-session';
export function sessionId() {
  try {
    let id = localStorage.getItem(SID_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(SID_KEY, id);
    }
    return id;
  } catch {
    return '00000000-0000-4000-8000-000000000000';
  }
}

// ---------- catalogue ----------
export async function fetchCatalog() {
  try {
    const data = await request('/api/products?limit=100');
    if (Array.isArray(data?.items) && data.items.length) return { products: data.items, source: 'api' };
  } catch {
    /* fall through to bundled data */
  }
  return { products: ALL, source: 'demo' };
}

export async function deliveryEstimate(pincode, subtotal = 0) {
  try {
    return await request(`/api/delivery?pincode=${encodeURIComponent(pincode)}&subtotal=${subtotal}`);
  } catch (err) {
    if (err.status === 400) return null;
    return estimateDelivery(pincode, subtotal);
  }
}

// ---------- lists ----------
export async function pushBag(items) {
  try {
    await request(`/api/lists/${sessionId()}/bag`, { method: 'PUT', body: { items } });
  } catch {
    /* localStorage already holds the bag */
  }
}

export async function pushSaved(codes) {
  try {
    await request(`/api/lists/${sessionId()}/saved`, { method: 'PUT', body: { codes } });
  } catch {
    /* localStorage already holds the list */
  }
}

export async function pullLists() {
  try {
    return await request(`/api/lists/${sessionId()}`);
  } catch {
    return null;
  }
}

// ---------- checkout ----------
export async function placeOrder(items, customer, products) {
  try {
    return await request('/api/orders', { method: 'POST', body: { sessionId: sessionId(), items, customer } });
  } catch (err) {
    if (err.status && err.status < 500) throw err;
    // Demo order, computed locally. Nothing is sent anywhere.
    const lines = items.map((i) => {
      const p = products.find((x) => x.code === i.code);
      return { ...i, name: p?.name, colour: p?.colour, price: p?.price || 0, lineTotal: (p?.price || 0) * i.qty };
    });
    const subtotal = lines.reduce((s, l) => s + l.lineTotal, 0);
    const d = estimateDelivery(customer.pincode, subtotal);
    return {
      number: `HL-DEMO-${Date.now().toString(36).toUpperCase()}`,
      items: lines,
      subtotal,
      shipping: d.shippingFee,
      total: subtotal + d.shippingFee,
      customer,
      delivery: { date: d.date, label: d.label, zone: d.zone },
      status: 'placed (offline demo)',
      demo: true,
    };
  }
}

export async function subscribe(email) {
  try {
    return await request('/api/newsletter', { method: 'POST', body: { email } });
  } catch (err) {
    if (err.status === 400) throw err;
    return { ok: true, demo: true };
  }
}
