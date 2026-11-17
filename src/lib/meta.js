import { useEffect } from 'react';

export const SITE = 'https://codelady-ship.github.io/Ecommerse-app';
const DEFAULT_IMAGE = `${SITE}/og-image.jpg`;

function setMeta(selector, attr, value) {
  const el = document.head.querySelector(selector);
  if (el) el.setAttribute(attr, value);
}

/** Per-route title, description, canonical and Open Graph tags (index.html holds the defaults). */
export function useDocumentMeta({ title, description, path = '/', image, noindex = false }) {
  useEffect(() => {
    document.title = title;
    const url = SITE + (path === '/' ? '/' : path);
    const img = image || DEFAULT_IMAGE;
    setMeta('meta[name="description"]', 'content', description);
    setMeta('link[rel="canonical"]', 'href', url);
    setMeta('meta[property="og:title"]', 'content', title);
    setMeta('meta[property="og:description"]', 'content', description);
    setMeta('meta[property="og:url"]', 'content', url);
    setMeta('meta[name="twitter:title"]', 'content', title);
    setMeta('meta[name="twitter:description"]', 'content', description);
    setMeta('meta[property="og:image"]', 'content', img);
    setMeta('meta[name="twitter:image"]', 'content', img);
    setMeta('meta[name="robots"]', 'content', noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large');
  }, [title, description, path, image, noindex]);
}

/**
 * Adds a JSON-LD block for the current route (removed again on unmount). Only describe what the page
 * actually shows: no ratings, reviews or offers, because HUELINE is fictional and sells nothing.
 */
export function useJsonLd(id, data) {
  const json = data ? JSON.stringify(data) : '';
  useEffect(() => {
    if (!json) return undefined;
    const el = document.createElement('script');
    el.type = 'application/ld+json';
    el.dataset.route = id;
    el.textContent = json;
    document.head.appendChild(el);
    return () => el.remove();
  }, [id, json]);
}

/** Absolute URL for a public path such as /Ecommerse-app/assets/x.webp. */
export const absolute = (p) => (p ? new URL(p, 'https://codelady-ship.github.io').href : undefined);
