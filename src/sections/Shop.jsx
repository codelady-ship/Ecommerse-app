import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import ProductCard from '../components/ProductCard.jsx';
import { MaskLines } from '../components/Text.jsx';
import { STYLES } from '../data/catalog.js';
import { Flip, gsap } from '../lib/motion.js';
import { reducedMotion } from '../lib/format.js';
import { useCatalog } from '../lib/store.js';

const SORTS = {
  featured: { label: 'Featured', fn: (a, b) => a.order - b.order },
  'price-asc': { label: 'Price low–high', fn: (a, b) => a.price - b.price || a.order - b.order },
  'price-desc': { label: 'Price high–low', fn: (a, b) => b.price - a.price || a.order - b.order },
  name: { label: 'A–Z', fn: (a, b) => a.name.localeCompare(b.name) },
};
const PAGE = 12;

/**
 * Shop the drop. Every change re-orders the real DOM nodes (keyed cards) and animates them with
 * GSAP Flip. Hidden cards stay in the DOM with display:none so Flip can fade them out and back in.
 */
export default function Shop({ style, setStyle }) {
  const products = useCatalog((s) => s.products);
  const [sort, setSort] = useState('featured');
  const [all, setAll] = useState(false);
  const grid = useRef(null);
  const flipState = useRef(null);

  const sorted = useMemo(() => [...products].sort(SORTS[sort].fn), [products, sort]);
  const matching = sorted.filter((p) => style === 'ALL' || p.style === style);
  const shown = new Set(matching.slice(0, all ? matching.length : PAGE).map((p) => p.code));

  const capture = () => {
    flipState.current = Flip.getState(grid.current.querySelectorAll('.card'), { props: 'opacity' });
  };
  const change = (fn) => {
    capture();
    fn();
  };

  useLayoutEffect(() => {
    const state = flipState.current;
    if (!state) return;
    flipState.current = null;
    const d = reducedMotion() ? 0 : 0.8;
    Flip.from(state, {
      targets: grid.current.querySelectorAll('.card'),
      duration: d,
      ease: 'expo.inOut',
      stagger: d ? 0.02 : 0,
      absolute: true,
      scale: true,
      nested: true,
      onEnter: (els) => gsap.fromTo(els, { opacity: 0, scale: 0.85 }, { opacity: 1, scale: 1, duration: d * 0.8, ease: 'expo.out', delay: d * 0.25 }),
      onLeave: (els) => gsap.to(els, { opacity: 0, scale: 0.85, duration: d * 0.5, ease: 'power2.in' }),
    });
  }, [style, sort, all]);

  // External style changes (from the arches) also animate.
  const lastStyle = useRef(style);
  if (lastStyle.current !== style && grid.current && !flipState.current) {
    capture();
  }
  lastStyle.current = style;

  return (
    <section className="section shop" id="shop" aria-labelledby="shop-title">
      <div className="section-head">
        <p className="mono-label">06 · Shop</p>
        <MaskLines id="shop-title" lines={['Shop the', <em key="e">drop</em>]} />
      </div>
      <div className="shop-bar">
        <div className="tabs" role="group" aria-label="Filter by style">
          <button type="button" className={`tab${style === 'ALL' ? ' is-on' : ''}`} aria-pressed={style === 'ALL'} onClick={() => change(() => setStyle('ALL'))}>
            All
          </button>
          {STYLES.map((s) => (
            <button
              key={s.code}
              type="button"
              className={`tab${style === s.code ? ' is-on' : ''}`}
              aria-pressed={style === s.code}
              onClick={() => change(() => setStyle(s.code))}
            >
              <span className="dot" style={{ background: s.tint }} aria-hidden="true" />
              {s.label}
            </button>
          ))}
        </div>
        <div className="shop-tools">
          <label className="mono-label" htmlFor="shop-sort">
            Sort
          </label>
          <select id="shop-sort" value={sort} onChange={(e) => change(() => setSort(e.target.value))}>
            {Object.entries(SORTS).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <p className="mono-label shop-count" aria-live="polite">
        Showing {shown.size} of {matching.length} pieces
      </p>
      <div className="shop-grid" ref={grid}>
        {sorted.map((p) => (
          <ProductCard key={p.code} p={p} hidden={!shown.has(p.code)} />
        ))}
      </div>
      {matching.length > PAGE && (
        <div className="shop-more">
          <button type="button" className="btn btn-line magnetic" aria-expanded={all} onClick={() => change(() => setAll((a) => !a))}>
            {all ? `Show ${PAGE} pieces` : `Show all ${matching.length} pieces`}
          </button>
        </div>
      )}
    </section>
  );
}
