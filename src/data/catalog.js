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

// Intrinsic size [width, height] of every photo, so each <img> gets width/height attributes and the
// browser reserves its box before the file arrives (no layout shift). Update it when a photo changes.
export const ASSET_DIMS = {
  atelier: [960, 1440], 'dye-cobalt': [960, 640], 'dye-lagoon': [960, 641], 'dye-marigold': [960, 1280],
  'dye-orchid': [960, 641], 'hero-poster': [960, 640], 'look-01': [960, 1280], 'look-02': [960, 1440],
  'look-03': [960, 640], 'look-04': [960, 720], 'look-05': [960, 640], 'look-06': [960, 640],
  'mood-denim': [960, 640], 'mood-evening': [960, 1410], 'mood-resort': [960, 641], 'mood-street': [960, 640],
  'p-d-03': [960, 733], 'p-d-04': [960, 641], 'p-e-02': [960, 640], 'p-e-04': [960, 1440],
  'p-k-02': [960, 1440], 'p-k-03': [960, 640], 'p-k-04': [960, 1440], 'p-r-02': [960, 1440],
  'p-r-03': [960, 640], 'p-r-04': [960, 1454], 'p-s-03': [960, 822], 'p-s-04': [960, 640],
  'p-t-02': [960, 640], 'p-t-03': [960, 640], 'p-t-04': [960, 640],
};

// VIDEOS: film slots the design can play. Each slot in LOCAL_VIDEOS is a free Pexels clip (Pexels
// License, credited in docs/CREDITS.md) stored as public/assets/<name>.<ext>, 3 MB or less. Only the
// listed formats are requested. Visitors who prefer reduced motion always get the poster photo instead.
export const VIDEOS = ['hero-main', 'hero-close-1', 'hero-close-2', 'dye-yard'];
const LOCAL_VIDEOS = {
  'hero-main': ['mp4'],
  'hero-close-1': ['mp4'],
  'hero-close-2': ['mp4'],
  'dye-yard': ['mp4'],
};

// What each clip shows (the video's accessible name; the poster photo keeps its own alt text).
export const VIDEO_ALT = {
  'hero-main': 'A woman in a bright orange top walking across a city square',
  'hero-close-1': 'A woman in a pink and navy embroidered lehenga turning slowly',
  'hero-close-2': 'A woman in an orange wrap dress smiling on a sunny hilltop',
  'dye-yard': 'Colourful clothes on hangers along a boutique rail',
};

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
  hasVideo: (name) => Boolean(LOCAL_VIDEOS[name]?.length),
};

/** URL for an asset name, an uploaded image path (/uploads/..) or an https URL; null when missing. */
export function src(name) {
  if (!name) return null;
  if (/^https:\/\//.test(name)) return name;
  if (name.startsWith('/uploads/')) return API ? API + name : null;
  return ASSET_SET.has(name) ? `${BASE}assets/${name}.webp` : null;
}

export const videoSrc = (name, ext) => (LOCAL_VIDEOS[name]?.includes(ext) ? `${BASE}assets/${name}.${ext}` : null);

/** [width, height] of a bundled photo; null for uploads, remote URLs and missing names. */
export const dimsOf = (name) => (name && ASSET_SET.has(name) ? ASSET_DIMS[name] || null : null);

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
