import { Suspense, lazy, useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import Nav from './components/Nav.jsx';
import Footer from './components/Footer.jsx';
import Cursor from './components/Cursor.jsx';
import { Drawer, QuickView, Search, Toast } from './components/Overlays.jsx';
import Home from './pages/Home.jsx';
import Product from './pages/Product.jsx';
import Checkout from './pages/Checkout.jsx';
import NotFound from './pages/NotFound.jsx';
import { initLenis, ScrollTrigger, scrollToTop } from './lib/motion.js';
import { startListSync, useCatalog, useUI } from './lib/store.js';

// The admin panel (Tailwind + shadcn/ui with its own stylesheet) is a separate chunk: shop pages never load it.
const Admin = lazy(() => import('./pages/Admin.jsx'));

export default function App() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    initLenis();
    useCatalog.getState().load();
    const stop = startListSync();
    // Any [data-product] element opens the quick view.
    const onClick = (e) => {
      const el = e.target instanceof Element ? e.target.closest('[data-product]') : null;
      if (!el || e.defaultPrevented) return;
      e.preventDefault();
      useUI.getState().open('quick', { quickCode: el.getAttribute('data-product') });
    };
    document.addEventListener('click', onClick);
    return () => {
      stop();
      document.removeEventListener('click', onClick);
    };
  }, []);

  useEffect(() => {
    scrollToTop();
    useUI.getState().close();
    const t = setTimeout(() => ScrollTrigger.refresh(), 300);
    return () => clearTimeout(t);
  }, [pathname, search]);

  // The admin panel stands alone (no shop nav, footer or custom cursor), so it also fits an iframe.
  if (/^\/admin\/?$/.test(pathname)) {
    return (
      <main id="main" tabIndex={-1}>
        <Suspense fallback={<div style={{ position: 'fixed', inset: 0, background: '#fff' }} role="status" aria-label="Loading…" />}>
          <Admin />
        </Suspense>
      </main>
    );
  }

  return (
    <>
      <Nav />
      <main id="main" tabIndex={-1}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/product" element={<Product />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <Drawer />
      <Search />
      <QuickView />
      <Toast />
      <Cursor />
    </>
  );
}
