// HUELINE catalogue for the React app.
// The raw data lives in backend/src/data/catalog.json and is shared with the API seed script, so the
// static GitHub Pages build and the database always start from the same 24 pieces.
import { PALETTE, STYLES, buildProducts } from '../../backend/src/lib/catalog.js';

export { PALETTE, STYLES };

// ASSETS: every photo that exists in public/assets (as <name>.webp). To re-skin the site, drop new
// photos into public/assets with these names, or add a name here and reference it from catalog.json.
// Nothing outside this list is ever requested; any other slot falls back to a dye-colour block.
export const ASSETS = [
  'hero-poster', 'look-01', 'look-02', 'look-03', 'look-04', 'look-05', 'look-06',
  'mood-street', 'mood-evening', 'mood-resort', 'mood-denim',
  'dye-cobalt', 'dye-marigold', 'dye-orchid', 'dye-lagoon', 'atelier',
  'p-t-02', 'p-t-03', 'p-t-04', 'p-s-03', 'p-s-04', 'p-e-02', 'p-e-04',
  'p-k-02', 'p-k-03', 'p-k-04', 'p-r-02', 'p-r-03', 'p-r-04', 'p-d-03', 'p-d-04',
];

// VIDEOS: film slots the design can play. No licensed clips ship with the repo, so LOCAL_VIDEOS is
// empty and every film shows its poster photo instead. To enable one, put <name>.webm and <name>.mp4
// (each 3 MB or less) in public/assets and add the name to LOCAL_VIDEOS.
export const VIDEOS = ['hero-main', 'hero-close-1', 'hero-close-2', 'dye-yard'];
const LOCAL_VIDEOS = new Set([]);

// Poster / fallback photo for each film slot.
export const POSTERS = {
  'hero-main': 'hero-poster',
  'hero-close-1': 'look-02',
  'hero-close-2': 'look-03',
  'dye-yard': 'look-05',
};

const ASSET_SET = new Set(ASSETS);
const BASE = import.meta.env.BASE_URL;
const API = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

export const LOCAL = {
  has: (name) => ASSET_SET.has(name),
  hasVideo: (name) => LOCAL_VIDEOS.has(name),
};

/** URL for an asset name, an uploaded image path (/uploads/..) or an https URL; null when missing. */
export function src(name) {
  if (!name) return null;
  if (/^https:\/\//.test(name)) return name;
  if (name.startsWith('/uploads/')) return API ? API + name : null;
  return ASSET_SET.has(name) ? `${BASE}assets/${name}.webp` : null;
}

export const videoSrc = (name, ext) => (LOCAL.hasVideo(name) ? `${BASE}assets/${name}.${ext}` : null);

// ALL: flat product list (code HL-<style>-<nn>, name, fabric, price, colour, colourHex, style, tint, images).
export const ALL = buildProducts();
export const byCode = (code, list = ALL) => list.find((p) => p.code === String(code || '').toUpperCase());
export const colourHex = (name) => (PALETTE.find((c) => c.name === name) || {}).hex || '#16141a';
export const styleOf = (code) => STYLES.find((s) => s.code === code);

// Views per product: every full frame, then an upper and a lower detail cropped from the main frame.
export function views(p) {
  const main = p.images[0];
  return [
    ...p.images.map((name, i) => ({ name, pos: '50% 40%', zoom: 1, label: i === 0 ? 'Full look' : `View ${i + 1}` })),
    { name: main, pos: '50% 22%', zoom: 1.7, label: 'Upper detail' },
    { name: main, pos: '50% 82%', zoom: 1.7, label: 'Lower detail' },
  ];
}

// The four dyes of the colour story. Change a dye's hex in catalog.json's palette to re-tint the site.
export const DYES = [
  { name: 'Cobalt', bg: '#2b3fd6', fg: '#ffffff', ref: 'HL-04/01', recipe: 'Indigo vat, 3 dips', photo: 'dye-cobalt', alt: 'Thread, scissors and a tape measure on cobalt-blue cloth', product: 'HL-T-01', notes: { Base: 'Double-faced cashmere', Fix: 'Air oxidised between dips', Fastness: '4-5 wash, 4 light' } },
  { name: 'Marigold', bg: '#f0a21a', fg: '#16141a', ref: 'HL-04/02', recipe: 'Tagetes petals, alum', photo: 'dye-marigold', alt: 'Folded fabrics in orange, blue and sand', product: 'HL-K-01', notes: { Base: 'Lambswool', Fix: 'Alum mordant, 12%', Fastness: '4 wash, 3-4 light' } },
  { name: 'Orchid', bg: '#c2378a', fg: '#ffffff', ref: 'HL-04/03', recipe: 'Lac + madder', photo: 'dye-orchid', alt: 'Magenta silk printed with small dark motifs', product: 'HL-E-01', notes: { Base: 'Mulberry silk, 19 momme', Fix: 'Tannin then alum', Fastness: '4 wash, 4 light' } },
  { name: 'Lagoon', bg: '#13807a', fg: '#ffffff', ref: 'HL-04/04', recipe: 'Indigo over pomegranate', photo: 'dye-lagoon', alt: 'Washed blue-green painted texture', product: 'HL-S-02', notes: { Base: 'Brushed fleece', Fix: 'Iron afterbath', Fastness: '4-5 wash, 4 light' } },
];

export const SIZES = ['XS', 'S', 'M', 'L', 'XL'];
export const SIZE_CHART = [
  ['XS', 80, 62, 88],
  ['S', 84, 66, 92],
  ['M', 88, 70, 96],
  ['L', 94, 76, 102],
  ['XL', 100, 82, 108],
];

if (typeof window !== 'undefined') {
  window.HL = { ALL, byCode, PALETTE, STYLES, ASSETS, VIDEOS, DYES, src, LOCAL };
}
