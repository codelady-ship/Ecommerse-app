import { DYES, STYLES } from '../data/catalog.js';

/** One line of condensed type that scrolls sideways forever (CSS animation, paused for reduced motion). */
export default function Ticker() {
  const words = [];
  STYLES.forEach((s, i) => {
    words.push({ t: s.label, c: s.tint });
    words.push({ t: DYES[i % DYES.length].name, c: DYES[i % DYES.length].bg });
  });
  const row = (hidden) => (
    <div className="ticker-row" aria-hidden={hidden || undefined}>
      {words.map((w, i) => (
        <span key={i} className="ticker-item">
          {w.t}
          <span className="ticker-dot" style={{ background: w.c }} />
        </span>
      ))}
    </div>
  );
  return (
    <div className="ticker" role="marquee" aria-label="Styles and dyes of the collection">
      <div className="ticker-track">
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}
