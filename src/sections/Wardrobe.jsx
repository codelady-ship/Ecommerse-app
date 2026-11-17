import { useEffect, useMemo, useRef, useState } from 'react';
import { Img } from '../components/Media.jsx';
import { MaskLines } from '../components/Text.jsx';
import { STYLES } from '../data/catalog.js';
import { gsap, getLenis } from '../lib/motion.js';
import { inr, reducedMotion } from '../lib/format.js';
import { useCatalog } from '../lib/store.js';

const N = 14;
const STEP = 360 / N;

/** Interleave styles (T1, S1, E1 …) so the "All" ring mixes every style. */
function mixed(products) {
  const byStyle = STYLES.map((s) => products.filter((p) => p.style === s.code));
  const out = [];
  for (let i = 0; out.length < products.length; i++) {
    byStyle.forEach((list) => list[i] && out.push(list[i]));
    if (i > 50) break;
  }
  return out;
}

/** The viewer stands inside a cylinder of 14 garment cards: it drifts, follows scroll and drags. */
export default function Wardrobe() {
  const products = useCatalog((s) => s.products);
  const [tab, setTab] = useState('ALL');
  const [front, setFront] = useState(0);
  const stage = useRef(null);
  const ring = useRef(null);
  const cards = useRef([]);

  const items = useMemo(() => {
    const list = tab === 'ALL' ? mixed(products) : products.filter((p) => p.style === tab);
    if (!list.length) return [];
    return Array.from({ length: N }, (_, i) => list[i % list.length]);
  }, [products, tab]);

  useEffect(() => {
    const el = stage.current;
    const reduced = reducedMotion();
    let rot = 0;
    let target = 0;
    let R = 500;
    let current = -1;
    let visible = true;
    let drag = null; // { x, moved, id }

    const measure = () => {
      const w = cards.current[0]?.offsetWidth || 220;
      R = (w / 2 / Math.tan(Math.PI / N)) * 1.12;
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { rootMargin: '100px' });
    io.observe(el);

    const tick = () => {
      if (!visible) return;
      if (!drag?.moved && !reduced) target -= 0.035;
      const lenis = getLenis();
      if (lenis && !drag) target -= lenis.velocity * 0.05;
      rot += (target - rot) * 0.085;
      ring.current.style.transform = `translateZ(${R * 0.55}px) rotateY(${rot}deg)`;
      let best = 999;
      let bi = 0;
      cards.current.forEach((c, i) => {
        if (!c) return;
        c.style.transform = `rotateY(${i * STEP}deg) translateZ(${-R}px)`;
        const a = ((((i * STEP + rot) % 360) + 540) % 360) - 180;
        const abs = Math.abs(a);
        const o = abs <= 58 ? 1 : abs >= 84 ? 0 : 1 - (abs - 58) / 26;
        c.style.opacity = o;
        c.style.visibility = o <= 0.01 ? 'hidden' : 'visible';
        c.style.setProperty('--shade', (Math.min(1, abs / 84) * 0.6).toFixed(3));
        if (abs < best) {
          best = abs;
          bi = i;
        }
      });
      if (bi !== current) {
        current = bi;
        setFront(bi);
      }
    };
    gsap.ticker.add(tick);

    const onDown = (e) => {
      if (e.button !== 0) return;
      drag = { x: e.clientX, start: e.clientX, moved: false, id: e.pointerId };
    };
    const onMove = (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      if (!drag.moved && Math.abs(e.clientX - drag.start) > 6) {
        drag.moved = true;
        el.setPointerCapture(e.pointerId);
        el.classList.add('is-dragging');
      }
      if (drag.moved) target += (e.clientX - drag.x) * 0.14;
      drag.x = e.clientX;
    };
    const onUp = () => {
      if (drag?.moved) {
        // swallow the click that follows a drag so it does not open the quick view
        const stop = (ev) => {
          ev.stopPropagation();
          ev.preventDefault();
        };
        el.addEventListener('click', stop, { capture: true, once: true });
        setTimeout(() => el.removeEventListener('click', stop, { capture: true }), 50);
      }
      el.classList.remove('is-dragging');
      drag = null;
    };
    const onKey = (e) => {
      if (e.key === 'ArrowLeft') target += STEP;
      if (e.key === 'ArrowRight') target -= STEP;
    };
    el.addEventListener('pointerdown', onDown);
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerup', onUp);
    el.addEventListener('pointercancel', onUp);
    el.addEventListener('keydown', onKey);
    return () => {
      gsap.ticker.remove(tick);
      ro.disconnect();
      io.disconnect();
      el.removeEventListener('pointerdown', onDown);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerup', onUp);
      el.removeEventListener('pointercancel', onUp);
      el.removeEventListener('keydown', onKey);
    };
  }, []);

  const p = items[front];

  return (
    <section className="section wardrobe" id="wardrobe" aria-labelledby="wardrobe-title">
      <div className="section-head center">
        <p className="mono-label">02 · Drag to turn</p>
        <MaskLines id="wardrobe-title" lines={['The wardrobe,', <em key="e">in the round</em>]} />
      </div>
      <div className="tabs ring-tabs" role="group" aria-label="Fill the ring with a style">
        <button type="button" className={`tab${tab === 'ALL' ? ' is-on' : ''}`} aria-pressed={tab === 'ALL'} onClick={() => setTab('ALL')}>
          All
        </button>
        {STYLES.map((s) => (
          <button
            key={s.code}
            type="button"
            className={`tab${tab === s.code ? ' is-on' : ''}`}
            aria-pressed={tab === s.code}
            style={{ '--tint': s.tint }}
            onClick={() => setTab(s.code)}
          >
            <span className="dot" style={{ background: s.tint }} aria-hidden="true" />
            {s.label}
          </button>
        ))}
      </div>
      <div
        className="ring-stage"
        ref={stage}
        tabIndex={0}
        aria-label="Garment ring. Drag, or use the left and right arrow keys, to turn it. Click a card for a quick view."
        data-cursor-label="Drag"
      >
        <div className="ring" ref={ring}>
          {items.map((it, i) => (
            <div
              key={`${tab}-${i}`}
              ref={(el) => (cards.current[i] = el)}
              className="ring-card"
              data-product={it.code}
              data-cursor="color"
              style={{ '--cc': it.colourHex }}
            >
              <Img name={it.images[0]} alt={it.name} color={it.colourHex} />
            </div>
          ))}
        </div>
      </div>
      {p && (
        <div className="ring-cap" aria-live="polite" key={p.code + tab}>
          <p className="mono-label">
            {p.styleLabel} · {p.colour}
          </p>
          <p className="ring-name">{p.name}</p>
          <p className="ring-meta">
            {p.fabric} · {inr(p.price)}
          </p>
        </div>
      )}
    </section>
  );
}
