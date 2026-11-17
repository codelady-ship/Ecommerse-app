import { useLayoutEffect, useRef, useState } from 'react';
import { Film } from '../components/Media.jsx';
import { Chars } from '../components/Text.jsx';
import { gsap } from '../lib/motion.js';
import { reducedMotion } from '../lib/format.js';

const FULL = 'inset(0% 0% 0% 0% round 0px 0px 0px 0px)';
const ARCH_WIDE = 'inset(13% 34% 9% 34% round 600px 600px 18px 18px)';
const ARCH_NARROW = 'inset(16% 18% 14% 18% round 600px 600px 18px 18px)';

/** Pinned hero: the film opens up on load, then narrows into an arch with two close-ups beside it. */
export default function Hero({ ready, onShop }) {
  const root = useRef(null);
  // The two close-up films only load and play once the pinned scroll is about to reveal them.
  const [closeOn, setCloseOn] = useState(false);

  // Hidden state before the loader hands over + pinned scroll timeline.
  useLayoutEffect(() => {
    if (reducedMotion()) return undefined;
    const ctx = gsap.context(() => {
      gsap.set('.hero-film', { clipPath: 'inset(18% 26% 18% 26% round 6px 6px 6px 6px)', scale: 1.08 });
      gsap.set('.ch', { yPercent: 115, rotate: 6 });
      gsap.set('.hero-in', { opacity: 0, y: 30 });

      const mm = gsap.matchMedia();
      mm.add({ wide: '(min-width: 700px)', narrow: '(max-width: 699px)' }, ({ conditions }) => {
        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: root.current,
            start: 'top top',
            end: '+=130%',
            scrub: 1,
            pin: true,
            anticipatePin: 1,
            onUpdate: (self) => setCloseOn(self.progress > 0.3 && self.isActive),
          },
        });
        tl.fromTo('.hero-media', { clipPath: FULL }, { clipPath: conditions.wide ? ARCH_WIDE : ARCH_NARROW, duration: 1 }, 0)
          .fromTo('.hero-film img, .hero-film video', { scale: 1.12 }, { scale: 1, duration: 1 }, 0)
          .fromTo(root.current, { backgroundColor: '#16141a' }, { backgroundColor: '#eceef2', duration: 0.6 }, 0.1)
          .to('.hl-1', { xPercent: -120, opacity: 0, duration: 0.7 }, 0)
          .to('.hl-3', { xPercent: 120, opacity: 0, duration: 0.7 }, 0)
          .to('.hl-2', { scale: 0.4, opacity: 0, duration: 0.6 }, 0.05)
          .fromTo(['.hero-eyebrow', '.hero-copy', '.hero-cta'], { opacity: 1, y: 0 }, { opacity: 0, y: -20, duration: 0.3, immediateRender: false }, 0)
          .fromTo('.hero-close-l', { yPercent: 120, rotate: 0, opacity: 0 }, { yPercent: 0, rotate: -5, opacity: 1, duration: 0.6, ease: 'power2.out' }, 0.55)
          .fromTo('.hero-close-r', { yPercent: 140, rotate: 0, opacity: 0 }, { yPercent: 0, rotate: 5, opacity: 1, duration: 0.6, ease: 'power2.out' }, 0.65)
          .fromTo('.hero-after', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.3 }, 0.9);
      });
    }, root);
    return () => ctx.revert();
  }, []);

  // Intro, played when the loader hands over.
  useLayoutEffect(() => {
    if (!ready || reducedMotion()) return undefined;
    const nav = document.querySelector('.nav');
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();
      tl.to('.hero-film', { clipPath: FULL, scale: 1, duration: 1.6, ease: 'expo.out' }, 0)
        .to('.ch', { yPercent: 0, rotate: 0, duration: 1.2, ease: 'expo.out', stagger: 0.025 }, 0.15)
        .to('.hero-in', { opacity: 1, y: 0, duration: 1, stagger: 0.08, ease: 'expo.out' }, 0.5)
        .from(nav, { yPercent: -100, opacity: 0, duration: 1, ease: 'expo.out' }, 0.4);
    }, root);
    return () => {
      ctx.kill();
      if (nav) gsap.set(nav, { clearProps: 'transform,opacity' });
    };
  }, [ready]);

  return (
    <div className="hero-wrap">
      <section className="hero" ref={root} id="top" aria-labelledby="hero-title">
        <div className="hero-media">
          <div className="hero-film">
            <Film name="hero-main" alt="A model in saturated colour on a painted street" eager color="#2b3fd6" />
          </div>
        </div>
        <div className="hero-close hero-close-l" aria-hidden="true">
          <Film name="hero-close-1" alt="" color="#c2378a" active={closeOn} />
        </div>
        <div className="hero-close hero-close-r" aria-hidden="true">
          <Film name="hero-close-2" alt="" color="#f0a21a" active={closeOn} />
        </div>

        <div className="hero-content">
          <p className="hero-eyebrow mono-label">
            <span className="hero-in">SS27 · Collection 04 · Saturation</span>
          </p>
          <h1 className="hero-title" id="hero-title" aria-label="Wear the colour out loud">
            <span className="hl hl-1 cond">
              <Chars text="WEAR THE" />
            </span>
            <span className="hl hl-2 display">
              <Chars text="colour" />
            </span>
            <span className="hl hl-3 cond">
              <Chars text="OUT LOUD" />
            </span>
          </h1>
        </div>
        <p className="hero-copy">
          <span className="hero-in">
            Six silhouettes. Twelve dyes. Mixed by hand in Bagru and cut in Jaipur, in runs of 48 pieces per colourway.
          </span>
        </p>
        <div className="hero-cta">
          <div className="hero-in hero-cta-in">
          <a
            className="pill magnetic"
            href="#shop"
            onClick={(e) => {
              e.preventDefault();
              onShop();
            }}
          >
            Shop the drop →
          </a>
          <span className="scroll-cue mono-label" aria-hidden="true">
            Scroll
          </span>
          </div>
        </div>
        <p className="hero-after">
          <span className="mono-label">Saturation SS27</span>
          Dyed in small lots, so no two runs of a colour are quite the same.
        </p>
      </section>
    </div>
  );
}
