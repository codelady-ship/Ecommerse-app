import { clsx } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

// The admin's Tailwind utilities carry the `tw:` prefix (see admin.css), so they cannot touch the shop.
const twMerge = extendTailwindMerge({ prefix: 'tw' });

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
