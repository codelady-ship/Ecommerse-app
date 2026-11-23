// Writes a copy of dist/index.html for every known SPA route, so GitHub Pages answers those URLs with
// HTTP 200 (it serves /checkout from checkout.html or checkout/index.html) instead of falling through to
// 404.html with status 404. Each copy gets that route's own <title>, description, canonical and robots,
// so crawlers and link previews that do not run JavaScript still see the right page. 404.html stays as the
// fallback for unknown paths and is marked as "not found".
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE = 'https://codelady-ship.github.io/Ecommerse-app';
const dist = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const html = readFileSync(join(dist, 'index.html'), 'utf8');

const escape = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

/** Swaps the default head tags of index.html for a route's own values. `canonical: null` drops canonical + og:url. */
function page({ title, description, canonical, noindex }) {
  let out = html
    .replace(/<title>[^<]*<\/title>/, `<title>${escape(title)}</title>`)
    .replace(/(<meta (?:name="description"|property="og:description"|name="twitter:description") content=")[^"]*"/g, `$1${escape(description)}"`)
    .replace(/(<meta (?:property="og:title"|name="twitter:title") content=")[^"]*"/g, `$1${escape(title)}"`);
  if (canonical === null) {
    out = out.replace(/\s*<link rel="canonical"[^>]*>/, '').replace(/\s*<meta property="og:url"[^>]*>/, '');
  } else {
    out = out
      .replace(/(<link rel="canonical" href=")[^"]*"/, `$1${canonical}"`)
      .replace(/(<meta property="og:url" content=")[^"]*"/, `$1${canonical}"`);
  }
  if (noindex) out = out.replace(/(<meta name="robots" content=")[^"]*"/, '$1noindex, follow"');
  return out;
}

const ROUTES = {
  // One shell for all 24 pieces (/product?code=HL-T-01): GitHub Pages ignores the query string, so the
  // piece's own title, canonical and image are set in the browser by useDocumentMeta. No static canonical
  // here, or every piece would point at the same URL.
  product: page({
    title: 'Piece · Hueline SS27',
    description:
      'A hand-dyed piece from the HUELINE Saturation SS27 lookbook, a fictional portfolio demo shop: photos, colour, fabric, sizes and a delivery estimate. No real payments.',
    canonical: null,
  }),
  checkout: page({
    title: 'Demo checkout · Hueline',
    description:
      'Demo checkout for the HUELINE Saturation SS27 portfolio shop. Fill in the form to see a demo order confirmation; no payment is taken and nothing ships.',
    canonical: `${SITE}/checkout`,
    noindex: true,
  }),
  admin: page({
    title: 'Admin · Hueline',
    description: 'HUELINE admin panel: products, demo orders and newsletter subscribers. Public demo login is read-only.',
    canonical: `${SITE}/admin`,
    noindex: true,
  }),
};

for (const [route, body] of Object.entries(ROUTES)) {
  writeFileSync(join(dist, `${route}.html`), body); // /checkout
  mkdirSync(join(dist, route), { recursive: true });
  writeFileSync(join(dist, route, 'index.html'), body); // /checkout/
}

writeFileSync(
  join(dist, '404.html'),
  page({ title: 'Page not found · Hueline', description: 'This page does not exist.', canonical: null, noindex: true }),
);

console.log(`postbuild: ${Object.keys(ROUTES).map((r) => `/${r}`).join(', ')} + 404.html`);
