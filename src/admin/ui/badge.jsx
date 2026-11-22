import { cva } from 'class-variance-authority';
import { cn } from '@/admin/lib/utils.js';

const badgeVariants = cva(
  'tw:inline-flex tw:h-6 tw:shrink-0 tw:items-center tw:gap-1.5 tw:rounded-full tw:px-2.5 tw:font-mono tw:text-[12px] tw:leading-none tw:font-medium tw:tracking-[0.06em] tw:whitespace-nowrap tw:uppercase',
  {
    variants: {
      variant: {
        ink: 'tw:bg-ink tw:text-white',
        outline: 'tw:border tw:border-line-strong tw:text-ink',
        muted: 'tw:bg-wash tw:text-mute',
        live: 'tw:bg-lagoon/10 tw:text-lagoon',
        demo: 'tw:bg-marigold/25 tw:text-ink',
        count: 'tw:h-5 tw:min-w-5 tw:justify-center tw:bg-wash tw:px-1.5 tw:tracking-normal tw:text-mute',
      },
    },
    defaultVariants: { variant: 'ink' },
  },
);

export function Badge({ className, variant, ...props }) {
  return <span data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />;
}
