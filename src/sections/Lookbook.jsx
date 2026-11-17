import { useLayoutEffect, useRef } from 'react';
import { Img } from '../components/Media.jsx';
import { gsap } from '../lib/motion.js';
import { reducedMotion } from '../lib/format.js';

const LOOKS = [
  { img: 'look-01', code: 'HL-T-01', title: 'Cobalt, double-faced', copy: 'The wrap overcoat goes into the indigo vat three times; the third dip pushes it from navy into cobalt.', tint: '#2b3fd6' },
  { img: 'look-02', code: 'HL-E-01', title: 'Orchid on the bias', copy: 'Nineteen-momme mulberry silk cut on the bias so the lac-and-madder pink moves when you do.', tint: '#c2378a' },
  { img: 'look-03', code: 'HL-K-01', title: 'Marigold, knitted', copy: 'Lambswool dyed with marigold petals from the temple markets, then knitted into a cardigan set.', tint: '#f0a21a' },
  { img: 'look-04', code: 'HL-S-02', title: 'Lagoon fleece', copy: 'Indigo laid over a pomegranate base turns brushed fleece the colour of shallow water.', tint: '#13807a' },
  { img: 'look-05', code: 'HL-R-01', title: 'Hand-block resort', copy: 'Six days of block printing for one run of shirt dresses in Bagru poppy.', tint: '#e46d2f' },
  { img: 'look-06', code: 'HL-D-01', title: 'Indigo, overdyed', copy: 'A trucker jacket dipped in indigo, then overdyed cobalt at the seams and pockets.', tint: '#3a4a7a' },
];

/** Pinned section that scrolls sideways through six full-height looks (vertical stack on phones). */
export default function Lookbook() {
  const root = useRef(null);
  const track = useRef(null);

  useLayoutEffect(() => {
    if (reducedMotion()) return undefined;
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add('(min-width: 700px)', () => {
        const distance = () => track.current.scrollWidth - window.innerWidth;
        const scroller = gsap.to(track.current, {
          x: () => -distance(),
          ease: 'none',
          scrollTrigger: {
            trigger: root.current,
            start: 'top top',
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
            anticipatePin: 1,
          },
        });
        gsap.utils.toArray('.look').forEach((panel) => {
          const st = { trigger: panel, containerAnimation: scroller, start: 'left 85%', end: 'left 30%', scrub: true };
          gsap.fromTo(panel.querySelector('.look-frame'), { clipPath: 'inset(0% 0% 0% 100%)' }, { clipPath: 'inset(0% 0% 0% 0%)', ease: 'none', scrollTrigger: st });
          gsap.fromTo(panel.querySelector('.look-frame img, .look-frame .dye-block'), { scale: 1.3 }, { scale: 1, ease: 'none', scrollTrigger: st });
          gsap.from(panel.querySelectorAll('.look-num, .look-title, .look-copy'), {
            y: 60,
            opacity: 0,
            stagger: 0.08,
            ease: 'none',
            scrollTrigger: { ...st, start: 'left 90%', end: 'left 50%' },
          });
        });
      });
      mm.add('(max-width: 699px)', () => {
        gsap.utils.toArray('.look-frame').forEach((f) =>
          gsap.fromTo(f, { clipPath: 'inset(0% 0% 0% 100%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.2, ease: 'expo.inOut', scrollTrigger: { trigger: f, start: 'top 80%', once: true } }),
        );
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <div className="lookbook-wrap">
      <section className="lookbook" id="lookbook" ref={root} aria-labelledby="lookbook-title">
        <div className="look-track" ref={track}>
          <div className="look look-intro">
            <p className="mono-label">04 · Lookbook</p>
            <h2 id="lookbook-title" className="look-head">
              Six looks, <em>one dye bath</em>
            </h2>
            <p className="look-copy">Scroll sideways through the collection as it was shot in Jaipur.</p>
          </div>
          {LOOKS.map((l, i) => (
            <article className="look" key={l.img} style={{ '--tint': l.tint }}>
              <div className="look-text">
                <span className="look-num cond" aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="look-title">{l.title}</h3>
                <p className="look-copy">{l.copy}</p>
                <button type="button" className="link-arrow" data-product={l.code}>
                  Shop this look →
                </button>
              </div>
              <div className="look-frame">
                <Img name={l.img} alt={`Look ${i + 1}: ${l.title}`} color={l.tint} />
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
