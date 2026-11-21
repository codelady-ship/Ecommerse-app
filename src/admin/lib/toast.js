// Tiny toast store for the admin panel (rendered by ui/toaster.jsx).
let toasts = [];
let nextId = 1;
const listeners = new Set();
const emit = () => listeners.forEach((l) => l());

export const getToasts = () => toasts;
export function subscribeToasts(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
export function dismissToast(id) {
  toasts = toasts.filter((t) => t.id !== id);
  emit();
}
/** variant: 'success' | 'error' | 'locked' (a write the read-only demo account was refused). */
export function toast(text, variant = 'success') {
  // one at a time, like the shop's toast: a new message replaces the previous one
  toasts = [{ id: nextId++, text, variant }];
  emit();
}
