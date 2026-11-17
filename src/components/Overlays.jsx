import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Img } from './Media.jsx';
import BuyBox from './BuyBox.jsx';
import { views } from '../data/catalog.js';
import { inr, plural } from '../lib/format.js';
import { lockScroll } from '../lib/motion.js';
import { bagCount, bagTotal, useCatalog, useLists, useUI } from '../lib/store.js';
import { FREE_SHIPPING_FROM } from '../../backend/src/lib/delivery.js';

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';

/** Shared open/close behaviour: scroll lock, focus in, Tab trap, Escape, focus return. */
function useOverlay(isOpen, panelRef, onClose, initialFocus) {
  useEffect(() => {
    if (!isOpen) return undefined;
    const returnTo = document.activeElement;
    lockScroll(true);
    const panel = panelRef.current;
    const t = setTimeout(() => {
      const target = (initialFocus && panel.querySelector(initialFocus)) || panel.querySelector(FOCUSABLE) || panel;
      target.focus({ preventScroll: true });
    }, 40);
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      } else if (e.key === 'Tab') {
        const items = [...panel.querySelectorAll(FOCUSABLE)].filter((el) => el.offsetParent !== null);
        if (!items.length) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      clearTimeout(t);
      document.removeEventListener('keydown', onKey);
      lockScroll(false);
      if (returnTo && document.contains(returnTo)) returnTo.focus({ preventScroll: true });
    };
  }, [isOpen, panelRef, onClose, initialFocus]);
}

function Backdrop({ show, onClick }) {
  return <div className={`backdrop${show ? ' is-open' : ''}`} onClick={onClick} aria-hidden="true" />;
}

// ---------------------------------------------------------------- drawer (Bag + Saved)
export function Drawer() {
  const isOpen = useUI((s) => s.overlay === 'drawer');
  const tab = useUI((s) => s.drawerTab);
  const close = useUI((s) => s.close);
  const products = useCatalog((s) => s.products);
  const { bag, saved, setQty, remove, toggleSaved } = useLists();
  const navigate = useNavigate();
  const ref = useRef(null);
  useOverlay(isOpen, ref, close);
  const find = (code) => products.find((p) => p.code === code);
  const subtotal = bagTotal(bag, products);
  const left = Math.max(0, FREE_SHIPPING_FROM - subtotal);
  const setTab = (t) => useUI.setState({ drawerTab: t });

  return (
    <>
      <Backdrop show={isOpen} onClick={close} />
      <aside
        ref={ref}
        className={`drawer${isOpen ? ' is-open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Bag and saved pieces"
        inert={!isOpen}
        tabIndex={-1}
      >
        <header className="drawer-head">
          <div className="tabs" role="tablist" aria-label="Lists">
            <button type="button" role="tab" id="tab-bag" aria-selected={tab === 'bag'} aria-controls="panel-bag" onClick={() => setTab('bag')}>
              Bag ({bagCount(bag)})
            </button>
            <button type="button" role="tab" id="tab-saved" aria-selected={tab === 'saved'} aria-controls="panel-saved" onClick={() => setTab('saved')}>
              Saved ({saved.length})
            </button>
          </div>
          <button type="button" className="icon-btn" onClick={close} aria-label="Close">
            ✕
          </button>
        </header>

        <div className="drawer-body" role="tabpanel" id={tab === 'bag' ? 'panel-bag' : 'panel-saved'} aria-labelledby={`tab-${tab}`}>
          {tab === 'bag' &&
            (bag.length ? (
              <ul className="lines">
                {bag.map((l) => {
                  const p = find(l.code);
                  if (!p) return null;
                  return (
                    <li className="line" key={`${l.code}-${l.size}`}>
                      <Img name={p.images[0]} alt={p.name} color={p.colourHex} className="line-img" />
                      <div className="line-info">
                        <p className="line-name">{p.name}</p>
                        <p className="mono-label">
                          {p.colour} · Size {l.size}
                        </p>
                        <div className="qty" role="group" aria-label={`Quantity for ${p.name}`}>
                          <button type="button" onClick={() => setQty(l.code, l.size, l.qty - 1)} aria-label="One fewer" disabled={l.qty <= 1}>
                            −
                          </button>
                          <span aria-live="polite">{l.qty}</span>
                          <button type="button" onClick={() => setQty(l.code, l.size, l.qty + 1)} aria-label="One more" disabled={l.qty >= 10}>
                            +
                          </button>
                        </div>
                      </div>
                      <div className="line-end">
                        <p>{inr(p.price * l.qty)}</p>
                        <button type="button" className="link-btn" onClick={() => remove(l.code, l.size)}>
                          Remove
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="empty">Your bag is empty. Pick a piece from the shop and choose a size.</p>
            ))}

          {tab === 'saved' &&
            (saved.length ? (
              <ul className="lines">
                {saved.map((code) => {
                  const p = find(code);
                  if (!p) return null;
                  return (
                    <li className="line" key={code}>
                      <Img name={p.images[0]} alt={p.name} color={p.colourHex} className="line-img" />
                      <div className="line-info">
                        <p className="line-name">{p.name}</p>
                        <p className="mono-label">
                          {p.styleLabel} · {p.colour}
                        </p>
                        <p>{inr(p.price)}</p>
                      </div>
                      <div className="line-end">
                        <button type="button" className="link-btn" onClick={() => useUI.getState().open('quick', { quickCode: code })}>
                          Choose size
                        </button>
                        <button type="button" className="link-btn" onClick={() => toggleSaved(code)}>
                          Remove
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="empty">Nothing saved yet. Tap ♡ Save on any piece to keep it here.</p>
            ))}
        </div>

        {tab === 'bag' && bag.length > 0 && (
          <footer className="drawer-foot">
            <div className="ship-meter" aria-hidden="true">
              <span style={{ width: `${Math.min(100, (subtotal / FREE_SHIPPING_FROM) * 100)}%` }} />
            </div>
            <p className="mono-label">{left ? `${inr(left)} away from free shipping` : 'Free shipping unlocked'}</p>
            <p className="subtotal">
              <span>Subtotal</span>
              <strong>{inr(subtotal)}</strong>
            </p>
            <button
              type="button"
              className="btn btn-ink btn-block magnetic"
              onClick={() => {
                close();
                navigate('/checkout');
              }}
            >
              Checkout (demo)
            </button>
          </footer>
        )}
      </aside>
    </>
  );
}

// ---------------------------------------------------------------- search
export function Search() {
  const isOpen = useUI((s) => s.overlay === 'search');
  const close = useUI((s) => s.close);
  const products = useCatalog((s) => s.products);
  const [q, setQ] = useState('');
  const ref = useRef(null);
  useOverlay(isOpen, ref, close, 'input');
  useEffect(() => {
    if (!isOpen) setQ('');
  }, [isOpen]);

  const results = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return [];
    return products.filter((p) =>
      [p.name, p.fabric, p.colour, p.styleLabel, p.code].some((v) => String(v).toLowerCase().includes(t)),
    );
  }, [q, products]);

  return (
    <>
      <Backdrop show={isOpen} onClick={close} />
      <div ref={ref} className={`search${isOpen ? ' is-open' : ''}`} role="dialog" aria-modal="true" aria-label="Search" inert={!isOpen} tabIndex={-1}>
        <div className="search-bar">
          <label htmlFor="search-input" className="mono-label">
            Search the collection
          </label>
          <input
            id="search-input"
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Silk, cobalt, denim…"
            autoComplete="off"
            aria-describedby="search-count"
          />
          <button type="button" className="icon-btn" onClick={close} aria-label="Close search">
            ✕
          </button>
        </div>
        <p id="search-count" className="mono-label search-count" aria-live="polite">
          {q.trim() ? plural(results.length, 'piece') + ` for “${q.trim()}”` : 'Try a dye, a fabric or a style'}
        </p>
        <ul className="search-results">
          {results.map((p) => (
            <li key={p.code}>
              <button type="button" className="search-hit" data-product={p.code} data-cursor="color" style={{ '--cc': p.colourHex }}>
                <Img name={p.images[0]} alt="" color={p.colourHex} className="search-img" />
                <span>
                  <span className="search-name">{p.name}</span>
                  <span className="mono-label">
                    {p.styleLabel} · {p.colour} · {inr(p.price)}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

// ---------------------------------------------------------------- quick view
export function QuickView() {
  const isOpen = useUI((s) => s.overlay === 'quick');
  const code = useUI((s) => s.quickCode);
  const close = useUI((s) => s.close);
  const p = useCatalog((s) => s.products.find((x) => x.code === code));
  const [view, setView] = useState(0);
  const ref = useRef(null);
  useOverlay(isOpen, ref, close);
  useEffect(() => setView(0), [code]);
  const vs = p ? views(p) : [];

  return (
    <>
      <Backdrop show={isOpen} onClick={close} />
      <div
        ref={ref}
        className={`quick${isOpen ? ' is-open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={p ? `Quick view: ${p.name}` : 'Quick view'}
        inert={!isOpen}
        tabIndex={-1}
        style={p ? { '--accent': p.colourHex } : undefined}
      >
        <button type="button" className="icon-btn quick-close" onClick={close} aria-label="Close quick view">
          ✕
        </button>
        {p && (
          <div className="quick-grid">
            <div className="quick-gallery">
              <div className="quick-main">
                <Img name={vs[view].name} alt={`${p.name}, ${vs[view].label}`} color={p.colourHex} pos={vs[view].pos} zoom={vs[view].zoom} />
              </div>
              <div className="thumbs" role="group" aria-label="Views">
                {vs.map((v, i) => (
                  <button key={i} type="button" className={`thumb${i === view ? ' is-on' : ''}`} aria-pressed={i === view} aria-label={v.label} onClick={() => setView(i)}>
                    <Img name={v.name} alt="" color={p.colourHex} pos={v.pos} zoom={v.zoom} />
                  </button>
                ))}
              </div>
            </div>
            <div className="quick-buy">
              <BuyBox p={p} headingLevel={2} showChart={false} />
              <Link className="link-arrow" to={`/product?code=${p.code}`} onClick={close}>
                Full details, delivery check and size chart →
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// ---------------------------------------------------------------- mobile menu
export function MobileMenu({ links, onNav }) {
  const isOpen = useUI((s) => s.overlay === 'menu');
  const close = useUI((s) => s.close);
  const ref = useRef(null);
  useOverlay(isOpen, ref, close);
  return (
    <div ref={ref} className={`menu${isOpen ? ' is-open' : ''}`} role="dialog" aria-modal="true" aria-label="Menu" inert={!isOpen} tabIndex={-1}>
      <button type="button" className="icon-btn menu-close" onClick={close} aria-label="Close menu">
        ✕
      </button>
      <nav aria-label="Mobile">
        <ul>
          {links.map((l) => (
            <li key={l.id}>
              <a
                href={`#${l.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  close();
                  setTimeout(() => onNav(l.id), 60);
                }}
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

// ---------------------------------------------------------------- toast
export function Toast() {
  const toast = useUI((s) => s.toast);
  return (
    <div className="toast-wrap" role="status" aria-live="polite">
      {toast && (
        <p className="toast" key={toast.id}>
          {toast.text}
        </p>
      )}
    </div>
  );
}
