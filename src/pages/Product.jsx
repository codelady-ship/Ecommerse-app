import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Img } from '../components/Media.jsx';
import BuyBox from '../components/BuyBox.jsx';
import ProductCard from '../components/ProductCard.jsx';
import { SIZES, src, views } from '../data/catalog.js';
import { deliveryEstimate } from '../lib/api.js';
import { inr } from '../lib/format.js';
import { gsap, revealWithin, scrollToId } from '../lib/motion.js';
import { absolute, SITE, useDocumentMeta, useJsonLd } from '../lib/meta.js';
import { bagTotal, useCatalog, useLists } from '../lib/store.js';
import { FREE_SHIPPING_FROM } from '../../backend/src/lib/delivery.js';

const PIN_KEY = 'hl-pincode';

function ZoomView({ v, p, index }) {
  const [zoom, setZoom] = useState(false);
  const [origin, setOrigin] = useState('50% 50%');
  const ref = useRef(null);
  const onMove = (e) => {
    const b = ref.current.getBoundingClientRect();
    setOrigin(`${(((e.clientX - b.left) / b.width) * 100).toFixed(1)}% ${(((e.clientY - b.top) / b.height) * 100).toFixed(1)}%`);
  };
  return (
    <button
      ref={ref}
      type="button"
      id={`view-${index}`}
      className={`pg-view${zoom ? ' is-zoomed' : ''}`}
      aria-pressed={zoom}
      aria-label={`${v.label}. ${zoom ? 'Click to zoom out' : 'Click to zoom in'}`}
      data-cursor-label={zoom ? 'Close' : 'Zoom'}
      onClick={(e) => {
        onMove(e);
        setZoom((z) => !z);
      }}
      onPointerMove={zoom ? onMove : undefined}
      onKeyDown={(e) => e.key === 'Escape' && zoom && (e.stopPropagation(), setZoom(false))}
      onBlur={() => setZoom(false)}
    >
      <span className="pg-zoom" style={{ transform: zoom ? 'scale(2.2)' : 'scale(1)', transformOrigin: origin }}>
        <Img name={v.name} alt={`${p.name}, ${v.label.toLowerCase()}`} color={p.colourHex} pos={v.pos} zoom={v.zoom} eager={index === 0} priority={index === 0} />
      </span>
    </button>
  );
}

function DeliveryCheck({ subtotal }) {
  const [pin, setPin] = useState(() => {
    try {
      return localStorage.getItem(PIN_KEY) || '';
    } catch {
      return '';
    }
  });
  const [res, setRes] = useState(null);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const check = async (value = pin) => {
    if (!/^[1-9]\d{5}$/.test(value)) {
      setErr('Enter a 6-digit pincode.');
      setRes(null);
      return;
    }
    setBusy(true);
    setErr('');
    const r = await deliveryEstimate(value, subtotal);
    setBusy(false);
    if (!r) {
      setErr('Enter a 6-digit pincode.');
      return;
    }
    setRes(r);
    try {
      localStorage.setItem(PIN_KEY, value);
    } catch {
      /* private mode */
    }
  };

  useEffect(() => {
    if (/^[1-9]\d{5}$/.test(pin)) check(pin);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <form
      className="delivery"
      id="delivery"
      onSubmit={(e) => {
        e.preventDefault();
        check();
      }}
      noValidate
    >
      <label htmlFor="pincode" className="mono-label">
        Check delivery
      </label>
      <div className="delivery-row">
        <input
          id="pincode"
          inputMode="numeric"
          autoComplete="postal-code"
          maxLength={6}
          placeholder="6-digit pincode"
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
          aria-invalid={Boolean(err)}
          aria-describedby="delivery-out"
        />
        <button type="submit" className="btn btn-line" disabled={busy}>
          {busy ? 'Checking…' : 'Check'}
        </button>
      </div>
      <div id="delivery-out" className="delivery-out" role="status">
        {err && <p className="form-error">{err}</p>}
        {res && (
          <>
            <p className="delivery-date">{res.label}</p>
            <p className="mono-label">
              {res.zone} · {res.workingDays} working days, Sundays skipped
            </p>
          </>
        )}
        <p className="delivery-note">
          {subtotal >= FREE_SHIPPING_FROM
            ? 'With this piece, your bag ships free.'
            : `Free shipping on orders over ${inr(FREE_SHIPPING_FROM)}.`}
        </p>
      </div>
    </form>
  );
}

export default function Product() {
  const [params] = useSearchParams();
  const code = (params.get('code') || 'HL-T-01').toUpperCase();
  const products = useCatalog((s) => s.products);
  const bag = useLists((s) => s.bag);
  const p = products.find((x) => x.code === code);
  const navigate = useNavigate();
  const { hash } = useLocation();
  const root = useRef(null);
  const [accent, setAccent] = useState(null);

  useDocumentMeta({
    title: p ? `${p.name} · Hueline SS27` : 'Piece not found · Hueline',
    description: p
      ? `${p.name} in ${p.colour}, ${p.fabric.toLowerCase()}. Hand-dyed ${p.styleLabel.toLowerCase()} from the HUELINE Saturation SS27 lookbook, a fictional portfolio demo shop.`
      : 'This piece is not in the HUELINE Saturation SS27 collection.',
    path: `/product?code=${code}`,
    image: p ? absolute(src(p.images[0])) : undefined,
    noindex: !p,
  });

  // Structured data for what this page shows: the piece (no offers or ratings: HUELINE sells nothing)
  // and the breadcrumb trail above the gallery.
  useJsonLd(
    'product',
    p && {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Product',
          name: p.name,
          sku: p.code,
          description: `${p.name} in ${p.colour}, ${p.fabric}. Available in sizes ${SIZES.join(', ')}.`,
          color: p.colour,
          material: p.fabric,
          category: p.styleLabel,
          size: SIZES,
          image: views(p)
            .filter((v) => v.zoom === 1)
            .map((v) => absolute(src(v.name)))
            .filter(Boolean),
          brand: { '@type': 'Brand', name: 'HUELINE' },
          url: `${SITE}/product?code=${p.code}`,
        },
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE}/` },
            { '@type': 'ListItem', position: 2, name: p.styleLabel, item: `${SITE}/#shop` },
            { '@type': 'ListItem', position: 3, name: p.name },
          ],
        },
      ],
    },
  );

  useEffect(() => setAccent(null), [code]);
  useEffect(() => {
    if (hash) setTimeout(() => scrollToId(hash.slice(1)), 200);
  }, [hash]);

  useLayoutEffect(() => {
    if (!root.current) return undefined;
    const ctx = gsap.context(() => revealWithin(root.current), root);
    return () => ctx.revert();
  }, [code]);

  if (!p) {
    return (
      <section className="section notfound">
        <h1 className="display">That piece is not in the collection.</h1>
        <p>
          No product has the code <code>{code}</code>. <Link to="/#shop">Back to the shop →</Link>
        </p>
      </section>
    );
  }

  const vs = views(p);
  const siblings = products.filter((x) => x.style === p.style);
  const colours = [p, ...siblings.filter((x) => x.code !== p.code && x.colour !== p.colour)].filter(
    (x, i, arr) => arr.findIndex((y) => y.colour === x.colour) === i,
  );
  const related = siblings.filter((x) => x.code !== p.code);

  return (
    <div ref={root} className="product-page" style={{ '--accent': accent || p.colourHex }}>
      <nav className="crumbs mono-label" aria-label="Breadcrumb">
        <Link to="/">Home</Link> / <Link to="/#shop">{p.styleLabel}</Link> / <span aria-current="page">{p.name}</span>
      </nav>
      <div className="pg-grid">
        <div className="pg-gallery">
          <ul className="pg-thumbs" aria-label="Jump to view">
            {vs.map((v, i) => (
              <li key={i}>
                <button type="button" className="thumb" onClick={() => scrollToId(`view-${i}`)} aria-label={`Show ${v.label.toLowerCase()}`}>
                  <Img name={v.name} alt="" color={p.colourHex} pos={v.pos} zoom={v.zoom} />
                </button>
              </li>
            ))}
          </ul>
          <div className="pg-views">
            {vs.map((v, i) => (
              <ZoomView key={`${p.code}-${i}`} v={v} p={p} index={i} />
            ))}
          </div>
        </div>
        <div className="pg-info">
          <BuyBox p={p}>
            <div className="colours">
              <p className="mono-label">
                Colour · {(colours.find((c) => c.colourHex === accent) || p).colour}
              </p>
              <div className="swatch-row" role="group" aria-label="Colourways in this style">
                {colours.map((c) => (
                  <button
                    key={c.code}
                    type="button"
                    className={`swatch-dot${c.code === p.code ? ' is-on' : ''}`}
                    style={{ '--sw': c.colourHex }}
                    aria-label={c.code === p.code ? `${c.colour} (this piece)` : `${c.colour}: ${c.name}`}
                    aria-current={c.code === p.code || undefined}
                    onMouseEnter={() => setAccent(c.colourHex)}
                    onMouseLeave={() => setAccent(null)}
                    onFocus={() => setAccent(c.colourHex)}
                    onBlur={() => setAccent(null)}
                    onClick={() => c.code !== p.code && navigate(`/product?code=${c.code}`)}
                  />
                ))}
              </div>
            </div>
          </BuyBox>
          <DeliveryCheck subtotal={bagTotal(bag, products) + p.price} />
          <div className="details">
            <details open>
              <summary>Fabric</summary>
              <p>
                {p.fabric}. Dyed by hand in small lots in Bagru, so the shade can vary slightly from the photo and from one run
                to the next.
              </p>
            </details>
            <details>
              <summary>Care</summary>
              <p>Cold hand wash or dry clean. Wash dark dyes separately for the first three washes. Dry in shade; natural dyes fade in strong sun.</p>
            </details>
            <details>
              <summary>Fit</summary>
              <p>True to size with an easy fit through the body. The model is 175 cm and wears size S. See the size chart above.</p>
            </details>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="section related" aria-labelledby="related-title">
          <h2 id="related-title" className="mask-lines" data-mask="">
            <span className="ml">
              <span className="ml-i">
                You might <em>also like</em>
              </span>
            </span>
          </h2>
          <div className="shop-grid">
            {related.map((r) => (
              <ProductCard key={r.code} p={r} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
