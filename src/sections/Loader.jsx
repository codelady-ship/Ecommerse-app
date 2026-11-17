import { useLayoutEffect, useRef, useState } from 'react';
import { gsap, lockScroll } from '../lib/motion.js';

const BANDS = ['var(--cobalt)', 'var(--marigold)', 'var(--orchid)', 'var(--lagoon)', 'var(--ink)'];

/** Five dye bands rise, a counter runs 000 → 100, then the bands lift away from the centre outwards. */
export default function Loader({ onHandover }) {
  const root = useRef(null);
  const count = useRef(null);
  const [done, setDone] = useState(false);

  useLayoutEffect(() => {
    lockScroll(true);
    let handed = false;
    let unlocked = false;
    const handover = () => {
      if (!handed) {
        handed = true;
        onHandover();
      }
    };
    const ctx = gsap.context(() => {
      const bands = gsap.utils.toArray('.ld-band');
      const n = { v: 0 };
      const tl = gsap.timeline({
        onComplete: () => {
          unlocked = true;
          lockScroll(false);
          setDone(true);
        },
      });
      tl.from(bands, { scaleY: 0, transformOrigin: '50% 100%', duration: 1.2, ease: 'expo.inOut', stagger: 0.08 }, 0)
        .to(n, {
          v: 100,
          duration: 1.8,
          ease: 'power2.inOut',
          onUpdate: () => {
            if (count.current) count.current.textContent = String(Math.round(n.v)).padStart(3, '0');
          },
        }, 0)
        .to('.ld-count', { opacity: 0, y: -20, duration: 0.35, ease: 'power2.in' }, 1.85)
        .to(bands, { yPercent: -100, duration: 1.1, ease: 'expo.inOut', stagger: { each: 0.07, from: 'center' } }, 2.05)
        .add(handover, '-=0.85');
    }, root);
    return () => {
      ctx.revert();
      if (!unlocked) lockScroll(false);
    };
  }, [onHandover]);

  if (done) return null;
  return (
    <div className="loader" ref={root} aria-hidden="true">
      {BANDS.map((c, i) => (
        <span key={i} className="ld-band" style={{ background: c }} />
      ))}
      <span className="ld-count mono" ref={count}>
        000
      </span>
    </div>
  );
}
