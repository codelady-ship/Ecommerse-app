import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Wordmark } from '../components/Text.jsx';
import { inr } from '../lib/format.js';
import { useDocumentMeta } from '../lib/meta.js';
import { useUI } from '../lib/store.js';
import {
  CODE_RE,
  DEMO_EMAIL,
  DEMO_PASSWORD,
  PALETTE,
  STYLES,
  adminCall,
  demoLogin,
  getSession,
  login,
  logout,
  resetSandbox,
} from '../lib/adminApi.js';

const toast = (text) => useUI.getState().showToast(text);
const date = (iso) =>
  iso ? new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(iso)) : '—';

export default function Admin() {
  useDocumentMeta({
    title: 'Admin · Hueline',
    description: 'HUELINE admin panel: products, demo orders and newsletter subscribers. Public demo login is read-only.',
    path: '/admin',
    noindex: true,
  });
  const [session, setSession] = useState(getSession);
  const onLogout = useCallback(() => {
    logout();
    setSession(null);
  }, []);
  return session ? (
    <Dashboard session={session} onSession={setSession} onLogout={onLogout} />
  ) : (
    <Login onSession={setSession} />
  );
}

function Login({ onSession }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const run = async (fn) => {
    setBusy(true);
    setError('');
    try {
      onSession(await fn());
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="section adm adm-login" aria-labelledby="adm-title">
      <p className="mono-label">
        <Wordmark /> · back office
      </p>
      <h1 id="adm-title" className="display">
        Ad<em>min</em>
      </h1>
      <form
        className="adm-login-form"
        onSubmit={(e) => {
          e.preventDefault();
          run(() => login(email, password));
        }}
      >
        <div className="field">
          <label htmlFor="adm-email">Email</label>
          <input id="adm-email" type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="adm-pass">Password</label>
          <input
            id="adm-pass"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <button type="submit" className="btn btn-ink btn-block" disabled={busy}>
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
        <button type="button" className="btn btn-line btn-block" disabled={busy} onClick={() => run(demoLogin)}>
          Demo admin
        </button>
        <p className="adm-hint">
          Demo login: <span translate="no">{DEMO_EMAIL}</span> / <span translate="no">{DEMO_PASSWORD}</span>. It is read-only and sees customer details masked.
        </p>
      </form>
      <Link className="link-btn mono-label" to="/">
        ← Back to the shop
      </Link>
    </section>
  );
}

const TABS = [
  { id: 'products', label: 'Products' },
  { id: 'orders', label: 'Orders' },
  { id: 'subscribers', label: 'Subscribers' },
];

function Dashboard({ session, onSession, onLogout }) {
  const [tab, setTab] = useState('products');
  const [data, setData] = useState({ products: null, orders: null, subscribers: null });
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setError('');
    try {
      const [products, orders, subscribers] = await Promise.all(
        ['products', 'orders', 'subscribers'].map((k) => adminCall(`/api/admin/${k}`)),
      );
      setData({ products, orders, subscribers });
    } catch (err) {
      if (err.status === 401) return onLogout();
      setError(err.message);
    } finally {
      onSession(getSession());
    }
  }, [onLogout, onSession]);

  useEffect(() => {
    load();
  }, [load]);

  /** Runs a write; a refused demo write shows the server's friendly message as a toast. */
  const write = async (path, opts, done) => {
    try {
      const r = await adminCall(path, opts);
      toast(done);
      await load();
      return r ?? true;
    } catch (err) {
      if (err.status === 401) onLogout();
      toast(err.demo ? err.message : `Not saved: ${err.message}`);
      return false;
    } finally {
      onSession(getSession());
    }
  };

  const isDemo = session.role === 'demo';
  return (
    <section className="adm" aria-labelledby="adm-dash-title">
      <header className="adm-top">
        <h1 id="adm-dash-title" className="adm-brand">
          <Wordmark /> <span className="mono-label">Admin</span>
        </h1>
        <p className="adm-who mono-label">
          <span translate="no">{session.email}</span>
          <span className="adm-role">{session.sandbox ? 'demo · sandbox' : isDemo ? 'demo · read-only' : 'admin'}</span>
        </p>
        <button type="button" className="btn btn-line adm-btn" onClick={onLogout}>
          Sign out
        </button>
      </header>

      {session.sandbox ? (
        <p className="adm-note" role="note">
          <strong>Demo mode — changes are not saved.</strong> The API is offline, so this panel runs on the bundled catalogue in your
          browser. Edits last until you close the tab.
          <button
            type="button"
            className="link-btn adm-reset"
            onClick={() => {
              resetSandbox();
              load();
              toast('Demo data reset');
            }}
          >
            Reset demo data
          </button>
        </p>
      ) : (
        isDemo && (
          <p className="adm-note" role="note">
            <strong>Demo admin — read-only.</strong> You are looking at the live API. The server refuses every change from this account and masks customers' names, emails, phones and addresses.
          </p>
        )
      )}

      <nav className="adm-tabs" aria-label="Admin sections">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`tab${tab === t.id ? ' is-on' : ''}`}
            aria-current={tab === t.id ? 'page' : undefined}
            onClick={() => setTab(t.id)}
          >
            {t.label}
            <span className="adm-count">{data[t.id]?.length ?? '…'}</span>
          </button>
        ))}
      </nav>

      {error && (
        <p className="form-error" role="alert">
          {error}{' '}
          <button type="button" className="link-btn" onClick={load}>
            Try again
          </button>
        </p>
      )}

      {tab === 'products' && <Products items={data.products} write={write} />}
      {tab === 'orders' && <Orders items={data.orders} />}
      {tab === 'subscribers' && <Subscribers items={data.subscribers} />}
    </section>
  );
}

const EMPTY = { code: '', name: '', fabric: '', price: '', stock: '48', style: STYLES[0].code, colour: PALETTE[0].name, active: true };

function Products({ items, write }) {
  const [q, setQ] = useState('');
  const [editing, setEditing] = useState(null); // null | 'new' | product code
  const [form, setForm] = useState(EMPTY);
  const [formError, setFormError] = useState('');
  const [confirm, setConfirm] = useState('');

  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!items || !t) return items;
    return items.filter((p) => `${p.code} ${p.name} ${p.colour} ${p.styleLabel}`.toLowerCase().includes(t));
  }, [items, q]);

  const open = (p) => {
    setFormError('');
    setEditing(p ? p.code : 'new');
    setForm(
      p
        ? { code: p.code, name: p.name, fabric: p.fabric, price: String(p.price), stock: String(p.stock ?? 48), style: p.style, colour: p.colour, active: p.active !== false }
        : EMPTY,
    );
    requestAnimationFrame(() => document.getElementById('adm-form')?.scrollIntoView({ block: 'nearest' }));
  };

  const submit = async (e) => {
    e.preventDefault();
    const isNew = editing === 'new';
    const code = form.code.trim().toUpperCase();
    if (isNew && !CODE_RE.test(code)) return setFormError('Code must look like HL-K-05.');
    if (form.name.trim().length < 2 || form.fabric.trim().length < 2) return setFormError('Name and fabric need 2+ characters.');
    const price = Number(form.price);
    const stock = Number(form.stock);
    if (!Number.isInteger(price) || price < 0 || !Number.isInteger(stock) || stock < 0)
      return setFormError('Price and stock must be whole numbers, 0 or more.');
    setFormError('');
    const body = { name: form.name.trim(), fabric: form.fabric.trim(), price, stock, style: form.style, colour: form.colour, active: form.active };
    const ok = isNew
      ? await write('/api/admin/products', { method: 'POST', body: { ...body, code } }, `${code} created`)
      : await write(`/api/admin/products/${editing}`, { method: 'PATCH', body }, `${editing} saved`);
    if (ok) setEditing(null);
  };

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  return (
    <div className="adm-panel">
      <div className="adm-toolbar">
        <label className="sr-only" htmlFor="adm-q">
          Search products
        </label>
        <input id="adm-q" className="adm-input" type="search" placeholder="Search code, name, colour…" value={q} onChange={(e) => setQ(e.target.value)} />
        <button type="button" className="btn btn-ink adm-btn" onClick={() => open(null)}>
          New product
        </button>
      </div>

      {editing && (
        <form id="adm-form" className="adm-form" onSubmit={submit} noValidate>
          <p className="mono-label wide">{editing === 'new' ? 'New product' : `Edit ${editing}`}</p>
          {editing === 'new' && (
            <div className="field">
              <label htmlFor="pf-code">Code</label>
              <input id="pf-code" placeholder="HL-K-05" value={form.code} onChange={set('code')} />
            </div>
          )}
          <div className="field">
            <label htmlFor="pf-name">Name</label>
            <input id="pf-name" value={form.name} onChange={set('name')} />
          </div>
          <div className="field">
            <label htmlFor="pf-fabric">Fabric</label>
            <input id="pf-fabric" value={form.fabric} onChange={set('fabric')} />
          </div>
          <div className="field">
            <label htmlFor="pf-price">Price (INR)</label>
            <input id="pf-price" inputMode="numeric" value={form.price} onChange={set('price')} />
          </div>
          <div className="field">
            <label htmlFor="pf-stock">Stock</label>
            <input id="pf-stock" inputMode="numeric" value={form.stock} onChange={set('stock')} />
          </div>
          <div className="field">
            <label htmlFor="pf-style">Style</label>
            <select id="pf-style" className="adm-input" value={form.style} onChange={set('style')}>
              {STYLES.map((s) => (
                <option key={s.code} value={s.code}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="pf-colour">Colour</label>
            <select id="pf-colour" className="adm-input" value={form.colour} onChange={set('colour')}>
              {PALETTE.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <label className="adm-check">
            <input type="checkbox" checked={form.active} onChange={set('active')} /> Visible in the shop
          </label>
          {formError && (
            <p className="form-error wide" role="alert">
              {formError}
            </p>
          )}
          <div className="adm-actions wide">
            <button type="submit" className="btn btn-ink adm-btn">
              Save
            </button>
            <button type="button" className="btn btn-line adm-btn" onClick={() => setEditing(null)}>
              Cancel
            </button>
          </div>
        </form>
      )}

      <Table empty="No products match." items={list} label="Products">
        <thead>
          <tr>
            <th scope="col">Code</th>
            <th scope="col">Name</th>
            <th scope="col">Style</th>
            <th scope="col">Colour</th>
            <th scope="col" className="num">
              Price
            </th>
            <th scope="col" className="num">
              Stock
            </th>
            <th scope="col">Shop</th>
            <th scope="col">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {list?.map((p) => (
            <tr key={p.code}>
              <td className="mono" translate="no">
                {p.code}
              </td>
              <td>{p.name}</td>
              <td>{p.styleLabel}</td>
              <td>
                <span className="adm-dot" style={{ background: p.colourHex }} aria-hidden="true" /> {p.colour}
              </td>
              <td className="num">{inr(p.price)}</td>
              <td className="num">{p.stock ?? '—'}</td>
              <td>{p.active === false ? 'Hidden' : 'Live'}</td>
              <td>
                <div className="adm-row-actions">
                  <button type="button" className="link-btn" onClick={() => open(p)} aria-label={`Edit ${p.code}`}>
                    Edit
                  </button>
                  {confirm === p.code ? (
                    <button
                      type="button"
                      className="link-btn adm-danger"
                      onClick={async () => {
                        setConfirm('');
                        await write(`/api/admin/products/${p.code}`, { method: 'DELETE' }, `${p.code} deleted`);
                      }}
                    >
                      Confirm delete
                    </button>
                  ) : (
                    <button type="button" className="link-btn" onClick={() => setConfirm(p.code)} aria-label={`Delete ${p.code}`}>
                      Delete
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}

function Orders({ items }) {
  return (
    <Table empty="No orders yet." items={items} label="Orders">
      <thead>
        <tr>
          <th scope="col">Order</th>
          <th scope="col">Placed</th>
          <th scope="col">Customer</th>
          <th scope="col">City</th>
          <th scope="col" className="num">
            Pieces
          </th>
          <th scope="col" className="num">
            Total
          </th>
          <th scope="col">Status</th>
        </tr>
      </thead>
      <tbody>
        {items?.map((o) => (
          <tr key={o.id || o.number}>
            <td className="mono" translate="no">
              {o.number}
            </td>
            <td>{date(o.createdAt)}</td>
            <td>{o.customer?.name}</td>
            <td>{o.customer?.city}</td>
            <td className="num">{o.items?.reduce((n, i) => n + (i.qty || 0), 0)}</td>
            <td className="num">{inr(o.total)}</td>
            <td>{o.status}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}

function Subscribers({ items }) {
  return (
    <Table empty="No subscribers yet." items={items} label="Newsletter subscribers">
      <thead>
        <tr>
          <th scope="col">Email</th>
          <th scope="col">Joined</th>
        </tr>
      </thead>
      <tbody>
        {items?.map((s) => (
          <tr key={s.id || s.email}>
            <td translate="no">{s.email}</td>
            <td>{date(s.createdAt)}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}

function Table({ items, empty, label, children }) {
  if (!items) return <p className="mono-label adm-empty">Loading…</p>;
  if (!items.length) return <p className="mono-label adm-empty">{empty}</p>;
  return (
    // The table scrolls inside its own box on narrow screens, never the page.
    <div className="adm-table-wrap" role="region" aria-label={label} tabIndex={0}>
      <table className="adm-table">{children}</table>
    </div>
  );
}
