import { useEffect, useRef } from 'react';
import { gsap } from '../lib/motion.js';
import { isTouch, reducedMotion } from '../lib/format.js';

/**
 * Custom cursor: a ring and a dot. Grows over links and buttons, takes the item's dye colour (--cc)
 * over [data-cursor="color"] and shows data-cursor-label. Also gives .magnetic buttons a small pull.
 * Hidden on touch devices.
 */
export default function Cursor() {
  const ring = useRef(null);
  const dot = useRef(null);
  const label = useRef(null);

  useEffect(() => {
    if (isTouch()) return undefined;
    document.documentElement.classList.add('has-cursor');
    const r = ring.current;
    const d = dot.current;
    const rx = gsap.quickTo(r, 'x', { duration: 0.45, ease: 'power3.out' });
    const ry = gsap.quickTo(r, 'y', { duration: 0.45, ease: 'power3.out' });
    const dx = gsap.quickTo(d, 'x', { duration: 0.08, ease: 'power3.out' });
    const dy = gsap.quickTo(d, 'y', { duration: 0.08, ease: 'power3.out' });
    let magnet = null;

    const onMove = (e) => {
      rx(e.clientX);
      ry(e.clientY);
      dx(e.clientX);
      dy(e.clientY);
      r.classList.add('is-on');
      d.classList.add('is-on');
      const t = e.target instanceof Element ? e.target : null;
      const colorEl = t?.closest('[data-cursor="color"]');
      const hot = t?.closest('a, button, [data-product], input, select, label, [data-cursor]');
      r.classList.toggle('is-hot', Boolean(hot));
      r.style.setProperty('--cc', colorEl ? getComputedStyle(colorEl).getPropertyValue('--cc') || '' : '');
      r.classList.toggle('is-color', Boolean(colorEl));
      const text = t?.closest('[data-cursor-label]')?.getAttribute('data-cursor-label') || '';
      if (label.current.textContent !== text) label.current.textContent = text;
      r.classList.toggle('has-label', Boolean(text));

      const m = reducedMotion() ? null : t?.closest('.magnetic');
      if (magnet && magnet !== m) gsap.to(magnet, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, .4)' });
      magnet = m;
      if (m) {
        const b = m.getBoundingClientRect();
        gsap.to(m, { x: (e.clientX - (b.left + b.width / 2)) * 0.28, y: (e.clientY - (b.top + b.height / 2)) * 0.36, duration: 0.4, ease: 'power3.out' });
      }
    };
    const onLeave = () => {
      r.classList.remove('is-on');
      d.classList.remove('is-on');
    };
    const onDown = () => r.classList.add('is-down');
    const onUp = () => r.classList.remove('is-down');
    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerleave', onLeave);
    window.addEventListener('pointerdown', onDown);
    window.addEventListener('pointerup', onUp);
    return () => {
      document.documentElement.classList.remove('has-cursor');
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
    };
  }, []);

  return (
    <div className="cursor" aria-hidden="true">
      <div className="cursor-ring" ref={ring}>
        <span ref={label} className="cursor-label" />
      </div>
      <div className="cursor-dot" ref={dot} />
    </div>
  );
}
