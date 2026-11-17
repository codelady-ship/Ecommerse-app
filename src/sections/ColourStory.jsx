import { useLayoutEffect, useRef, useState } from 'react';
import { Img } from '../components/Media.jsx';
import { DYES } from '../data/catalog.js';
import { gsap, ScrollTrigger } from '../lib/motion.js';
import { inr, reducedMotion } from '../lib/format.js';
import { useCatalog } from '../lib/store.js';

/** Four dye swatches; as each crosses the middle of the screen the whole section repaints in that dye. */
export default function ColourStory() {
  const root = useRef(null);
  const products = useCatalog((s) => s.products);
  const [active, setActive] = useState(0);

  useLayoutEffect(() => {
    const reduced = reducedMotion();
    const d = reduced ? 0 : 1;
    let current = -1;
    const ctx = gsap.context(() => {
      const names = gsap.utils.toArray('.cs-name');
      gsap.set(names, { yPercent: 110 });
      const paint = (i, dir) => {
        if (i === current) return;
        const prev = current;
        current = i;
        setActive(i);
        gsap.to(root.current, { '--sbg': DYES[i].bg, '--sfg': DYES[i].fg, duration: 0.7 * d, ease: 'power2.out', overwrite: 'auto' });
        if (prev >= 0) gsap.to(names[prev], { yPercent: dir > 0 ? -110 : 110, duration: 0.8 * d, ease: 'expo.inOut', overwrite: 'auto' });
        gsap.fromTo(names[i], { yPercent: dir > 0 ? 110 : -110 }, { yPercent: 0, duration: 0.8 * d, ease: 'expo.inOut', overwrite: 'auto' });
      };
      gsap.utils.toArray('.swatch').forEach((el, i) => {
        ScrollTrigger.create({
          trigger: el,
          start: 'top center',
          end: 'bottom center',
          onEnter: () => paint(i, 1),
          onEnterBack: () => paint(i, -1),
        });
      });
      paint(0, 1);
    }, root);
    return () => ctx.revert();
  }, []);

  const dye = DYES[active];

  return (
    <section className="colour" id="colour" ref={root} aria-labelledby="colour-title">
      <div className="cs-grid">
        <div className="cs-sticky">
          <p className="mono-label">05 · Colour story</p>
          <h2 id="colour-title" className="cs-title">
            One <em>dye pot.</em>
          </h2>
          <div className="cs-names" aria-live="polite">
            {DYES.map((d, i) => (
              <span key={d.name} className="cs-name cond" aria-hidden={i !== active}>
                {d.name}
              </span>
            ))}
          </div>
          <p className="cs-ref mono-label">
            Ref {dye.ref} · {dye.recipe}
          </p>
        </div>
        <ol className="swatches">
          {DYES.map((d) => {
            const p = products.find((x) => x.code === d.product);
            return (
              <li key={d.name} className="swatch" style={{ background: d.bg, color: d.fg, '--cc': d.bg }}>
                <div className="swatch-top">
                  <span className="cond swatch-name">{d.name}</span>
                  <span className="mono-label">{d.ref}</span>
                </div>
                <div className="swatch-photo">
                  <Img name={d.photo} alt={d.alt} color={d.bg} />
                </div>
                <p className="swatch-recipe">{d.recipe}</p>
                <dl className="notes">
                  {Object.entries(d.notes).map(([k, v]) => (
                    <div key={k}>
                      <dt className="mono-label">{k}</dt>
                      <dd>{v}</dd>
                    </div>
                  ))}
                </dl>
                {p && (
                  <button type="button" className="swatch-product" data-product={p.code} data-cursor="color" style={{ '--cc': d.fg }}>
                    <span className="mono-label">Dyed in {d.name}</span>
                    <span className="swatch-pname">{p.name}</span>
                    <span>{inr(p.price)} →</span>
                  </button>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
