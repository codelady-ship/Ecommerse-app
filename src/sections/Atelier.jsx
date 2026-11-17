import { useLayoutEffect, useRef } from 'react';
import { Img } from '../components/Media.jsx';
import { MaskLines, Words } from '../components/Text.jsx';
import { gsap } from '../lib/motion.js';
import { reducedMotion } from '../lib/format.js';

const STATS = [
  { n: 19, label: 'Momme weight of our mulberry silk' },
  { n: 48, label: 'Pieces cut per colourway, then the dye lot closes' },
  { n: 6, label: 'Days for one hand-block print run' },
];

export default function Atelier() {
  const root = useRef(null);

  useLayoutEffect(() => {
    if (reducedMotion()) return undefined;
    const ctx = gsap.context(() => {
      gsap.utils.toArray('.stat-n').forEach((el) => {
        const end = Number(el.dataset.n);
        const o = { v: 0 };
        el.textContent = '0';
        gsap.to(o, {
          v: end,
          duration: 1.6,
          ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 90%', once: true },
          onUpdate: () => (el.textContent = String(Math.round(o.v))),
        });
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section className="section atelier" id="atelier" ref={root} aria-labelledby="atelier-title">
      <div className="atelier-grid">
        <div className="atelier-photo" data-reveal="img">
          <Img name="atelier" alt="A sewing machine with block-printed cotton in the atelier" color="#3b1f3a" />
        </div>
        <div className="atelier-text">
          <p className="mono-label">07 · Atelier</p>
          <MaskLines
            id="atelier-title"
            lines={['Slow colour,', 'made by people', 'who have done it', <em key="e">for four generations.</em>]}
          />
          <Words
            className="lede"
            text="Our printers in Bagru carve their own teak blocks and mix every dye from plants, minerals and lac. We cut in Jaipur, in small runs, and close a colourway when its dye lot runs out."
          />
          <ul className="stats">
            {STATS.map((s) => (
              <li key={s.n}>
                <span className="stat-n cond" data-n={s.n}>
                  {s.n}
                </span>
                <span className="stat-l">{s.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
