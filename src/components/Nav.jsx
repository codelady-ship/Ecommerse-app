import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Wordmark } from './Text.jsx';
import { MobileMenu } from './Overlays.jsx';
import { NAV_LINKS, useSectionNav } from '../lib/nav.js';
import { bagCount, useLists, useUI } from '../lib/store.js';

export default function Nav() {
  const { pathname } = useLocation();
  const goTo = useSectionNav();
  const bag = useLists((s) => bagCount(s.bag));
  const saved = useLists((s) => s.saved.length);
  const open = useUI((s) => s.open);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [pathname]);

  const overHero = pathname === '/' && !scrolled;

  return (
    <>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <header className={`nav${overHero ? ' is-over' : ''}${scrolled ? ' is-scrolled' : ''}`}>
        <Link to="/" className="nav-brand" aria-label="HUELINE home">
          <Wordmark />
        </Link>
        <nav aria-label="Sections" className="nav-links">
          {NAV_LINKS.map((l) => (
            <a
              key={l.id}
              href={`#${l.id}`}
              onClick={(e) => {
                e.preventDefault();
                goTo(l.id);
              }}
            >
              {l.label}
            </a>
          ))}
        </nav>
        <div className="nav-actions">
          <button type="button" className="nav-btn" onClick={() => open('search')}>
            Search
          </button>
          <button type="button" className="nav-btn hide-sm" onClick={() => open('drawer', { drawerTab: 'saved' })}>
            Saved <span className="count">{saved}</span>
          </button>
          <button type="button" className="nav-btn" onClick={() => open('drawer', { drawerTab: 'bag' })} aria-label={`Bag, ${bag} items`}>
            Bag <span className="count badge" key={bag}>{bag}</span>
          </button>
          <button type="button" className="nav-btn show-sm" onClick={() => open('menu')} aria-label="Open menu">
            Menu
          </button>
        </div>
      </header>
      <MobileMenu links={[...NAV_LINKS]} onNav={goTo} />
    </>
  );
}
