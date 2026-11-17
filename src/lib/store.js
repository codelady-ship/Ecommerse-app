import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ALL } from '../data/catalog.js';
import { fetchCatalog, pullLists, pushBag, pushSaved } from './api.js';

// ---------- catalogue (bundled first, replaced by the API's copy when it answers) ----------
export const useCatalog = create((set) => ({
  products: ALL,
  source: 'bundled',
  load: async () => {
    const { products, source } = await fetchCatalog();
    set({ products, source });
  },
}));

export const findProduct = (code) =>
  useCatalog.getState().products.find((p) => p.code === String(code || '').toUpperCase());

// ---------- bag + saved (localStorage, mirrored to the API per anonymous session) ----------
export const useLists = create(
  persist(
    (set, get) => ({
      bag: [],
      saved: [],
      add: (code, size, qty = 1) => {
        const bag = [...get().bag];
        const i = bag.findIndex((l) => l.code === code && l.size === size);
        if (i >= 0) bag[i] = { ...bag[i], qty: Math.min(10, bag[i].qty + qty) };
        else bag.push({ code, size, qty });
        set({ bag });
      },
      setQty: (code, size, qty) =>
        set({
          bag: get()
            .bag.map((l) => (l.code === code && l.size === size ? { ...l, qty: Math.max(1, Math.min(10, qty)) } : l)),
        }),
      remove: (code, size) => set({ bag: get().bag.filter((l) => !(l.code === code && l.size === size)) }),
      clearBag: () => set({ bag: [] }),
      toggleSaved: (code) => {
        const saved = get().saved.includes(code) ? get().saved.filter((c) => c !== code) : [...get().saved, code];
        set({ saved });
        return saved.includes(code);
      },
    }),
    { name: 'hl-lists', version: 1 },
  ),
);

let syncTimer;
let lastBag = '';
let lastSaved = '';
export function startListSync() {
  pullLists().then((remote) => {
    const s = useLists.getState();
    if (remote && !s.bag.length && !s.saved.length && (remote.bag.length || remote.saved.length)) {
      useLists.setState({ bag: remote.bag, saved: remote.saved });
    }
  });
  return useLists.subscribe((s) => {
    clearTimeout(syncTimer);
    syncTimer = setTimeout(() => {
      const b = JSON.stringify(s.bag);
      const v = JSON.stringify(s.saved);
      if (b !== lastBag) pushBag(s.bag);
      if (v !== lastSaved) pushSaved(s.saved);
      lastBag = b;
      lastSaved = v;
    }, 600);
  });
}

// ---------- overlays + toast ----------
export const useUI = create((set) => ({
  overlay: null, // 'drawer' | 'search' | 'menu' | 'quick'
  drawerTab: 'bag',
  quickCode: null,
  toast: null,
  open: (overlay, extra = {}) => set({ overlay, ...extra }),
  close: () => set({ overlay: null }),
  showToast: (text) => {
    const id = Date.now();
    set({ toast: { id, text } });
    setTimeout(() => set((s) => (s.toast?.id === id ? { toast: null } : s)), 2600);
  },
}));

export const bagCount = (bag) => bag.reduce((n, l) => n + l.qty, 0);
export const bagTotal = (bag, products) =>
  bag.reduce((sum, l) => sum + (products.find((p) => p.code === l.code)?.price || 0) * l.qty, 0);
