import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Img } from '../components/Media.jsx';
import { placeOrder } from '../lib/api.js';
import { inr } from '../lib/format.js';
import { useDocumentMeta } from '../lib/meta.js';
import { bagTotal, useCatalog, useLists } from '../lib/store.js';
import { FREE_SHIPPING_FROM, SHIPPING_FEE } from '../../backend/src/lib/delivery.js';

const FIELDS = [
  { name: 'name', label: 'Full name', auto: 'name', test: (v) => v.trim().length >= 2, msg: 'Enter your name.' },
  { name: 'email', label: 'Email', type: 'email', auto: 'email', test: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()), msg: 'Enter a valid email.' },
  { name: 'phone', label: 'Phone', type: 'tel', auto: 'tel', test: (v) => /^[+\d][\d\s-]{6,16}$/.test(v.trim()), msg: 'Enter a valid phone number.' },
  { name: 'address', label: 'Address', auto: 'street-address', test: (v) => v.trim().length >= 5, msg: 'Enter your street address.' },
  { name: 'city', label: 'City', auto: 'address-level2', test: (v) => v.trim().length >= 2, msg: 'Enter your city.' },
  { name: 'pincode', label: 'Pincode', auto: 'postal-code', mode: 'numeric', test: (v) => /^[1-9]\d{5}$/.test(v.trim()), msg: 'Enter a 6-digit pincode.' },
];

export default function Checkout() {
  useDocumentMeta({
    title: 'Demo checkout · Hueline',
    description:
      'Demo checkout for the HUELINE Saturation SS27 portfolio shop. Fill in the form to see a demo order confirmation; no payment is taken and nothing ships.',
    path: '/checkout',
    noindex: true,
  });
  const products = useCatalog((s) => s.products);
  const { bag, clearBag } = useLists();
  const [form, setForm] = useState(() => Object.fromEntries(FIELDS.map((f) => [f.name, ''])));
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle');
  const [order, setOrder] = useState(null);
  const [serverError, setServerError] = useState('');

  const subtotal = bagTotal(bag, products);
  const shipping = subtotal >= FREE_SHIPPING_FROM ? 0 : SHIPPING_FEE;

  const onSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    FIELDS.forEach((f) => !f.test(form[f.name]) && (errs[f.name] = f.msg));
    setErrors(errs);
    if (Object.keys(errs).length) {
      document.getElementById(`co-${Object.keys(errs)[0]}`)?.focus();
      return;
    }
    setStatus('busy');
    setServerError('');
    try {
      const o = await placeOrder(bag, Object.fromEntries(Object.entries(form).map(([k, v]) => [k, v.trim()])), products);
      setOrder(o);
      clearBag();
      setStatus('done');
      window.scrollTo(0, 0);
    } catch (err) {
      setServerError(err.details?.map?.((d) => d.message || d).join(', ') || err.message);
      setStatus('idle');
    }
  };

  if (order) {
    return (
      <section className="section checkout done" aria-labelledby="co-done">
        <p className="mono-label" role="status">
          Demo order {order.number} · no payment taken
        </p>
        <h1 id="co-done" className="display">
          Thank you, <em>{order.customer.name.split(' ')[0]}</em>.
        </h1>
        <p className="lede">
          This was a demo order{order.demo ? ' (the API was offline, so it stayed in your browser)' : ' saved by the HUELINE API'}. Nothing was
          charged and nothing will ship.
        </p>
        <dl className="co-summary">
          <div>
            <dt className="mono-label">Total</dt>
            <dd>{inr(order.total)}</dd>
          </div>
          <div>
            <dt className="mono-label">Delivery</dt>
            <dd>{order.delivery.label}</dd>
          </div>
          <div>
            <dt className="mono-label">Pieces</dt>
            <dd>{order.items.reduce((n, i) => n + i.qty, 0)}</dd>
          </div>
        </dl>
        <Link className="btn btn-ink" to="/">
          Back to the collection
        </Link>
      </section>
    );
  }

  if (!bag.length) {
    return (
      <section className="section checkout" aria-labelledby="co-empty">
        <h1 id="co-empty" className="display">
          Your bag is <em>empty</em>.
        </h1>
        <Link className="btn btn-ink" to="/#shop">
          Shop the drop
        </Link>
      </section>
    );
  }

  return (
    <section className="section checkout" aria-labelledby="co-title">
      <p className="mono-label">Demo checkout · no payment is taken</p>
      <h1 id="co-title" className="display">
        Check<em>out</em>
      </h1>
      <div className="co-grid">
        <form className="co-form" onSubmit={onSubmit} noValidate>
          {FIELDS.map((f) => (
            <div className={`field${f.name === 'address' ? ' wide' : ''}`} key={f.name}>
              <label htmlFor={`co-${f.name}`}>{f.label}</label>
              <input
                id={`co-${f.name}`}
                name={f.name}
                type={f.type || 'text'}
                inputMode={f.mode}
                autoComplete={f.auto}
                value={form[f.name]}
                onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                aria-invalid={Boolean(errors[f.name])}
                aria-describedby={errors[f.name] ? `co-${f.name}-err` : undefined}
              />
              {errors[f.name] && (
                <p className="form-error" id={`co-${f.name}-err`}>
                  {errors[f.name]}
                </p>
              )}
            </div>
          ))}
          {serverError && (
            <p className="form-error wide" role="alert">
              {serverError}
            </p>
          )}
          <button type="submit" className="btn btn-ink btn-block magnetic wide" disabled={status === 'busy'}>
            {status === 'busy' ? 'Placing order…' : `Place demo order · ${inr(subtotal + shipping)}`}
          </button>
        </form>
        <aside className="co-bag" aria-label="Order summary">
          <ul className="lines">
            {bag.map((l) => {
              const p = products.find((x) => x.code === l.code);
              if (!p) return null;
              return (
                <li className="line" key={`${l.code}-${l.size}`}>
                  <Img name={p.images[0]} alt="" color={p.colourHex} className="line-img" />
                  <div className="line-info">
                    <p className="line-name">{p.name}</p>
                    <p className="mono-label">
                      {p.colour} · {l.size} · ×{l.qty}
                    </p>
                  </div>
                  <p className="line-end">{inr(p.price * l.qty)}</p>
                </li>
              );
            })}
          </ul>
          <p className="subtotal">
            <span>Subtotal</span>
            <span>{inr(subtotal)}</span>
          </p>
          <p className="subtotal">
            <span>Shipping</span>
            <span>{shipping ? inr(shipping) : 'Free'}</span>
          </p>
          <p className="subtotal total">
            <span>Total</span>
            <strong>{inr(subtotal + shipping)}</strong>
          </p>
        </aside>
      </div>
    </section>
  );
}
