import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Wordmark } from './Text.jsx';
import { NAV_LINKS, useSectionNav } from '../lib/nav.js';
import { STYLES } from '../data/catalog.js';
import { subscribe } from '../lib/api.js';
import { useUI } from '../lib/store.js';

export default function Footer() {
  const goTo = useSectionNav();
  const [email, setEmail] = useState('');
  const [state, setState] = useState({ status: 'idle', msg: '' });

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) {
      setState({ status: 'error', msg: 'Enter a valid email address.' });
      return;
    }
    setState({ status: 'busy', msg: 'Sending…' });
    try {
      const r = await subscribe(email.trim());
      setState({
        status: 'ok',
        msg: r.demo
          ? 'Thanks! (Demo mode: the API is offline, so nothing was stored.)'
          : r.already
            ? 'You are already on the list.'
            : 'Thanks, you are on the list for the next drop.',
      });
      setEmail('');
    } catch (err) {
      setState({ status: 'error', msg: err.message || 'Could not sign you up.' });
    }
  };

  return (
    <footer className="footer" id="footer">
      <div className="footer-top">
        <div className="footer-news">
          <h2 className="mono-label">Newsletter</h2>
          <p className="footer-lead">One email per drop: new dyes, run sizes and when a colourway closes.</p>
          <form className="news-form" onSubmit={onSubmit} noValidate>
            <label htmlFor="news-email" className="sr-only">
              Email address
            </label>
            <input
              id="news-email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={state.status === 'error'}
              aria-describedby="news-msg"
            />
            <button type="submit" className="btn btn-paper magnetic" disabled={state.status === 'busy'}>
              Sign up
            </button>
          </form>
          <p id="news-msg" className={`news-msg is-${state.status}`} role="status">
            {state.msg}
          </p>
        </div>
        <nav className="footer-cols" aria-label="Footer">
          <div>
            <h2 className="mono-label">Explore</h2>
            <ul>
              {NAV_LINKS.map((l) => (
                <li key={l.id}>
                  <a
                    href={`#${l.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      goTo(l.id);
                    }}
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="mono-label">Styles</h2>
            <ul>
              {STYLES.map((s) => (
                <li key={s.code}>
                  <Link to={`/product?code=HL-${s.code}-01`}>{s.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="mono-label">Help</h2>
            <ul>
              <li>
                <button type="button" className="link-btn" onClick={() => useUI.getState().open('drawer', { drawerTab: 'bag' })}>
                  Your bag
                </button>
              </li>
              <li>
                <Link to="/product?code=HL-T-01#delivery">Delivery estimates</Link>
              </li>
              <li>
                <a href="https://github.com/codelady-ship/Ecommerse-app" target="_blank" rel="noreferrer">
                  Source code
                </a>
              </li>
            </ul>
          </div>
        </nav>
      </div>
      <p className="footer-mark" aria-hidden="true">
        <Wordmark />
      </p>
      <div className="footer-small">
        <p>
          <strong>Portfolio demo project.</strong> HUELINE is a fictional label made to show front-end and API work. Nothing here
          is for sale, no payments are taken and no orders are shipped. Photos: CC0 from StockSnap (see docs/CREDITS.md).
        </p>
        <p>© {new Date().getFullYear()} codelady-ship · Built with React, GSAP, Lenis, Express and MongoDB</p>
      </div>
    </footer>
  );
}
