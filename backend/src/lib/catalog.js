// Shared by the API (seed script) and the React app (offline/demo fallback).
// catalog.json is the single source of truth: edit it, then run `npm run seed` in backend/.
import data from '../data/catalog.json' with { type: 'json' };

export const PALETTE = data.palette;
export const STYLES = data.styles;

const hexOf = (name) => (PALETTE.find((c) => c.name === name) || {}).hex || '#16141a';

/** Expand the compact STYLES rows into flat product objects (HL-<style>-<two-digit index>). */
export function buildProducts(styles = STYLES) {
  const out = [];
  let order = 0;
  for (const s of styles) {
    s.items.forEach(([name, fabric, price, colour, images], i) => {
      out.push({
        code: `HL-${s.code}-${String(i + 1).padStart(2, '0')}`,
        name,
        fabric,
        price,
        colour,
        colourHex: hexOf(colour),
        style: s.code,
        styleLabel: s.label,
        tint: s.tint,
        images,
        order: order++,
        stock: 48,
      });
    });
  }
  return out;
}
