import { useEffect, useRef } from 'react';
import ProductCard from '../components/ProductCard.jsx';
import { MaskLines } from '../components/Text.jsx';
import { STYLES } from '../data/catalog.js';
import { gsap } from '../lib/motion.js';
import { reducedMotion } from '../lib/format.js';
import { useCatalog } from '../lib/store.js';

const COPIES = 4;

/** One endless rail: drifts on its own, pauses on hover, drags, flings with momentum and loops. */
function Rail({ style, items, dir }) {
  const viewport = useRef(null);
  const track = useRef(null);

  useEffect(() => {
    const vp = viewport.current;
    const tr = track.current;
    const reduced = reducedMotion();
    let x = 0;
    let v = 0;
    let setW = 1;
    let hover = false;
    let visible = true;
    let drag = null;
    const speed = 0.45 * dir;

    const measure = () => {
      setW = tr.scrollWidth / COPIES || 1;
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(tr);
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(vp);

    const wrap = (n) => ((((n % setW) + setW) % setW) - setW);
    const tick = (_t, dt) => {
      if (!visible) return;
      const k = Math.min(3, dt / 16.67);
      if (!drag) {
        if (Math.abs(v) > 0.05) {
          x += v * k;
          v *= Math.pow(0.95, k);
        } else if (!hover && !reduced) {
          x -= speed * k;
        }
      }
      x = wrap(x);
      tr.style.transform = `translate3d(${x}px,0,0)`;
    };
    gsap.ticker.add(tick);

    const onDown = (e) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      drag = { start: e.clientX, last: e.clientX, t: performance.now(), moved: false, id: e.pointerId, startY: e.clientY };
      v = 0;
    };
    const onMove = (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      const dx = e.clientX - drag.last;
      if (!drag.moved) {
        if (Math.abs(e.clientX - drag.start) < 6) return;
        // let vertical swipes scroll the page on touch
        if (e.pointerType !== 'mouse' && Math.abs(e.clientY - drag.startY) > Math.abs(e.clientX - drag.start)) {
          drag = null;
          return;
        }
        drag.moved = true;
        vp.setPointerCapture(e.pointerId);
        vp.classList.add('is-dragging');
      }
      const now = performance.now();
      x += dx;
      v = (dx / Math.max(1, now - drag.t)) * 16.67;
      drag.last = e.clientX;
      drag.t = now;
    };
    const onUp = () => {
      if (drag?.moved) {
        const stop = (ev) => {
          ev.stopPropagation();
          ev.preventDefault();
        };
        vp.addEventListener('click', stop, { capture: true, once: true });
        setTimeout(() => vp.removeEventListener('click', stop, { capture: true }), 50);
      }
      vp.classList.remove('is-dragging');
      drag = null;
    };
    const onEnter = () => (hover = true);
    const onLeave = () => (hover = false);
    vp.addEventListener('pointerdown', onDown);
    vp.addEventListener('pointermove', onMove);
    vp.addEventListener('pointerup', onUp);
    vp.addEventListener('pointercancel', onUp);
    vp.addEventListener('mouseenter', onEnter);
    vp.addEventListener('mouseleave', onLeave);
    vp.addEventListener('focusin', onEnter);
    vp.addEventListener('focusout', onLeave);
    return () => {
      gsap.ticker.remove(tick);
      ro.disconnect();
      io.disconnect();
      vp.removeEventListener('pointerdown', onDown);
      vp.removeEventListener('pointermove', onMove);
      vp.removeEventListener('pointerup', onUp);
      vp.removeEventListener('pointercancel', onUp);
      vp.removeEventListener('mouseenter', onEnter);
      vp.removeEventListener('mouseleave', onLeave);
      vp.removeEventListener('focusin', onEnter);
      vp.removeEventListener('focusout', onLeave);
    };
  }, [dir, items.length]);

  return (
    <div className="rail" style={{ '--tint': style.tint }}>
      <div className="rail-head">
        <h3 className="rail-title cond">{style.label}</h3>
        <span className="mono-label">{items.length} pieces · drag</span>
      </div>
      <div className="rail-viewport" ref={viewport} data-cursor-label="Drag">
        <div className="rail-track" ref={track}>
          {Array.from({ length: COPIES }, (_, c) =>
            items.map((p) => (
              <div className="rail-cell" key={`${c}-${p.code}`} aria-hidden={c > 0 || undefined} inert={c > 0 || undefined}>
                <ProductCard p={p} />
              </div>
            )),
          )}
        </div>
      </div>
    </div>
  );
}

export default function Rails() {
  const products = useCatalog((s) => s.products);
  return (
    <section className="section rails" id="rails" aria-labelledby="rails-title">
      <div className="section-head">
        <p className="mono-label">03 · Style rails</p>
        <MaskLines id="rails-title" lines={['Pull a rail,', <em key="e">pick a piece</em>]} />
      </div>
      {STYLES.map((s, i) => {
        const items = products.filter((p) => p.style === s.code);
        return items.length ? <Rail key={s.code} style={s} items={items} dir={i % 2 ? -1 : 1} /> : null;
      })}
    </section>
  );
}
