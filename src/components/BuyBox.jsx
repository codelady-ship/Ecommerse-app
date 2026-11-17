import { useEffect, useId, useRef, useState } from 'react';
import { SIZES, SIZE_CHART } from '../data/catalog.js';
import { inr } from '../lib/format.js';
import { useLists, useUI } from '../lib/store.js';

/** Size chips, size chart, "Add to bag" and "Save". Shared by the quick view and the product page. */
export default function BuyBox({ p, headingLevel = 1, showChart = true, children }) {
  const H = `h${headingLevel}`;
  const [size, setSize] = useState(null);
  const [error, setError] = useState('');
  const [added, setAdded] = useState(false);
  const [chart, setChart] = useState(false);
  const add = useLists((s) => s.add);
  const toggleSaved = useLists((s) => s.toggleSaved);
  const isSaved = useLists((s) => s.saved.includes(p.code));
  const { open, showToast } = useUI.getState();
  const timers = useRef([]);
  const id = useId();

  useEffect(() => {
    setSize(null);
    setError('');
    setAdded(false);
  }, [p.code]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const onAdd = () => {
    if (!size) {
      setError('Pick a size first.');
      return;
    }
    add(p.code, size, 1);
    setAdded(true);
    showToast(`Added to bag: ${p.name}, size ${size}`);
    timers.current.push(
      setTimeout(() => open('drawer', { drawerTab: 'bag' }), 650),
      setTimeout(() => setAdded(false), 1800),
    );
  };

  const onSave = () => {
    const now = toggleSaved(p.code);
    showToast(now ? `Saved: ${p.name}` : `Removed from saved: ${p.name}`);
  };

  return (
    <div className="buybox">
      <p className="mono-label">
        {p.styleLabel} · {p.colour}
      </p>
      <H className="buy-name">{p.name}</H>
      <p className="buy-fabric">{p.fabric}</p>
      <p className="buy-price">{inr(p.price)}</p>
      {children}
      <fieldset className="sizes">
        <legend className="mono-label">
          Size{size ? ` · ${size}` : ''}
          {showChart && (
            <button type="button" className="link-btn" aria-expanded={chart} aria-controls={`${id}-chart`} onClick={() => setChart((c) => !c)}>
              Size chart
            </button>
          )}
        </legend>
        <div className="chips" role="group" aria-label="Size">
          {SIZES.map((s) => (
            <button
              key={s}
              type="button"
              aria-pressed={size === s}
              className={`chip${size === s ? ' is-on' : ''}`}
              onClick={() => {
                setSize(s);
                setError('');
              }}
            >
              {s}
            </button>
          ))}
        </div>
        {showChart && chart && (
          <table className="size-chart" id={`${id}-chart`}>
            <caption className="mono-label">Body measurements, cm</caption>
            <thead>
              <tr>
                <th scope="col">Size</th>
                <th scope="col">Bust</th>
                <th scope="col">Waist</th>
                <th scope="col">Hip</th>
              </tr>
            </thead>
            <tbody>
              {SIZE_CHART.map(([s, b, w, h]) => (
                <tr key={s}>
                  <th scope="row">{s}</th>
                  <td>{b}</td>
                  <td>{w}</td>
                  <td>{h}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <p className="form-error" role="alert">
          {error}
        </p>
      </fieldset>
      <div className="buy-actions">
        <button type="button" className={`btn btn-ink magnetic${added ? ' is-done' : ''}`} onClick={onAdd}>
          {added ? 'Added ✓' : `Add to bag · ${inr(p.price)}`}
        </button>
        <button type="button" className={`btn btn-line${isSaved ? ' is-on' : ''}`} aria-pressed={isSaved} onClick={onSave}>
          {isSaved ? '♥ Saved' : '♡ Save'}
        </button>
      </div>
    </div>
  );
}
