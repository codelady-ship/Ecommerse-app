import { useEffect } from 'react';

const SITE = 'https://codelady-ship.github.io/Ecommerse-app';

function setMeta(selector, attr, value) {
  const el = document.head.querySelector(selector);
  if (el) el.setAttribute(attr, value);
}

/** Per-route title, description, canonical and Open Graph tags (index.html holds the defaults). */
export function useDocumentMeta({ title, description, path = '/', image }) {
  useEffect(() => {
    document.title = title;
    const url = SITE + (path === '/' ? '/' : path);
    setMeta('meta[name="description"]', 'content', description);
    setMeta('link[rel="canonical"]', 'href', url);
    setMeta('meta[property="og:title"]', 'content', title);
    setMeta('meta[property="og:description"]', 'content', description);
    setMeta('meta[property="og:url"]', 'content', url);
    setMeta('meta[name="twitter:title"]', 'content', title);
    setMeta('meta[name="twitter:description"]', 'content', description);
    if (image) {
      setMeta('meta[property="og:image"]', 'content', image);
      setMeta('meta[name="twitter:image"]', 'content', image);
    }
  }, [title, description, path, image]);
}
