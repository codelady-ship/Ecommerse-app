import { useLayoutEffect, useRef } from 'react';
import { Img } from '../components/Media.jsx';
import { MaskLines, Words } from '../components/Text.jsx';
import { STYLES } from '../data/catalog.js';
import { gsap } from '../lib/motion.js';
import { reducedMotion } from '../lib/format.js';
import { useCatalog } from '../lib/store.js';

const DRIFT = [-50, 40, -80, 30, -40, 60];

/** Six tall arches, one per style, that wipe up and then drift at their own speed. */
export default function StylesGallery({ onStyle }) {
  const root = useRef(null);
  const products = useCatalog((s) => s.products);

  useLayoutEffect(() => {
    if (reducedMotion()) return undefined;
    const ctx = gsap.context(() => {
      const arches = gsap.utils.toArray('.arch');
      gsap.fromTo(
        arches,
        { clipPath: 'inset(100% 0% 0% 0%)' },
        {
          clipPath: 'inset(0% 0% 0% 0%)',
          duration: 1.4,
          ease: 'expo.inOut',
          stagger: 0.1,
          scrollTrigger: { trigger: '.arches', start: 'top 80%', once: true },
        },
      );
      gsap.from('.arch img, .arch .dye-block', {
        scale: 1.4,
        duration: 2,
        ease: 'expo.out',
        stagger: 0.1,
        scrollTrigger: { trigger: '.arches', start: 'top 80%', once: true },
      });
      arches.forEach((a, i) => {
        gsap.to(a.parentElement, {
          y: DRIFT[i % DRIFT.length],
          ease: 'none',
          scrollTrigger: { trigger: '.arches', start: 'top bottom', end: 'bottom top', scrub: true },
        });
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section className="section styles" id="styles" ref={root} aria-labelledby="styles-title">
      <div className="section-head">
        <p className="mono-label">01 · Six styles</p>
        <MaskLines id="styles-title" lines={['Every style,', <em key="e">moving</em>, 'in one dye bath']} />
        <Words
          className="lede"
          text="Tailoring to denim, each silhouette is cut in four colourways from the same twelve dyes, so any piece sits next to any other."
        />
      </div>
      <ul className="arches">
        {STYLES.map((s) => {
          const n = products.filter((p) => p.style === s.code).length;
          return (
            <li key={s.code} className="arch-item">
              <button
                type="button"
                className="arch-btn"
                onClick={() => onStyle(s.code)}
                data-cursor="color"
                data-cursor-label="Shop"
                style={{ '--cc': s.tint }}
                aria-label={`Shop ${s.label}, ${n} pieces`}
              >
                <span className="arch">
                  <Img name={s.cover} alt="" color={s.tint} />
                </span>
                <span className="arch-cap">
                  <span className="arch-name">{s.label}</span>
                  <span className="mono-label">
                    {String(n).padStart(2, '0')} pieces
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
