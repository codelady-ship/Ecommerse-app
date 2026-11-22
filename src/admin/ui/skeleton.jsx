import { cn } from '@/admin/lib/utils.js';

export function Skeleton({ className, ...props }) {
  return <span data-slot="skeleton" aria-hidden="true" className={cn('tw:block tw:h-3.5 tw:animate-hl-pulse tw:rounded-full tw:bg-line', className)} {...props} />;
}
