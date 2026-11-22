import { useScrollPause } from '@/admin/lib/portal.js';

/** Rendered inside an open dialog or select: pauses the page's smooth scroll for as long as it is mounted. */
export function ScrollPause() {
  useScrollPause();
  return null;
}
