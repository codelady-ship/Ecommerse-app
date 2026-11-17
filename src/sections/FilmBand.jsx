import { useLayoutEffect, useRef, useState } from 'react';
import { Film } from '../components/Media.jsx';
import { gsap, ScrollTrigger } from '../lib/motion.js';
import { reducedMotion } from '../lib/format.js';

/** The dye-yard film in a frame that widens and settles as it scrolls through; plays only on screen. */
export default function FilmBand() {
  const root = useRef(null);
  const [onScreen, setOnScreen] = useState(false);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({ trigger: root.current, start: 'top bottom', end: 'bottom top', onToggle: (s) => setOnScreen(s.isActive) });
      if (reducedMotion()) return;
      const st = { trigger: root.current, start: 'top bottom', end: 'center center', scrub: true };
      gsap.fromTo('.film-frame', { clipPath: 'inset(0% 6% 0% 6% round 28px)' }, { clipPath: 'inset(0% 0% 0% 0% round 18px)', ease: 'none', scrollTrigger: st });
      gsap.fromTo('.film-frame img, .film-frame video', { scale: 1.18 }, { scale: 1, ease: 'none', scrollTrigger: { ...st, end: 'bottom top' } });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section className="film-band" ref={root} aria-label="The dye yard">
      <div className="film-frame">
        <Film name="dye-yard" alt="Two women in printed cotton dresses walking through a sunlit field" active={onScreen} color="#e46d2f" />
        <p className="film-caption">
          <span className="mono-label">Bagru, Rajasthan</span>
          <span className="display">Where the colour dries</span>
        </p>
      </div>
    </section>
  );
}
