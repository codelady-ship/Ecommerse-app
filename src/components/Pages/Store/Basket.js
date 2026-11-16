import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Cart store. Persisted to localStorage under the "basket" key, so the cart survives reloads.
const UseBasket = create(
  persist(
    (set) => ({
      basket: [],

      // Add a product, or increase its count if it is already in the cart.
      addToBasket: (product, qty = 1) =>
        set((state) => {
          const existing = state.basket.find((p) => p.id === product.id);
          if (existing) {
            return {
              basket: state.basket.map((p) =>
                p.id === product.id ? { ...p, count: p.count + qty } : p
              ),
            };
          }
          const { id, title, slug, price, images } = product;
          return { basket: [{ id, title, slug, price, image: images[0], count: qty }, ...state.basket] };
        }),

      // op is "+" or "-"; the count never goes below 1 (use removeProduct to delete).
      changeCount: (id, op) =>
        set((state) => ({
          basket: state.basket.map((p) => {
            if (p.id !== id) return p;
            const count = op === '+' ? p.count + 1 : Math.max(1, p.count - 1);
            return { ...p, count };
          }),
        })),

      removeProduct: (id) =>
        set((state) => ({ basket: state.basket.filter((p) => p.id !== id) })),

      clearBasket: () => set({ basket: [] }),
    }),
    {
      name: 'basket',
      storage: createJSONStorage(() => localStorage),
      // The old version stored a plain array; ignore it instead of crashing.
      version: 1,
      migrate: () => ({ basket: [] }),
    }
  )
);

export const basketCount = (basket) => basket.reduce((sum, p) => sum + p.count, 0);
export const basketTotal = (basket) => basket.reduce((sum, p) => sum + p.count * p.price, 0);

export default UseBasket;
