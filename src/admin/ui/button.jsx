import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import { cn } from '@/admin/lib/utils.js';

// HUELINE buttons: pill, IBM Plex Mono caps. Cobalt is the brand accent for primary actions and focus.
const buttonVariants = cva(
  'tw:inline-flex tw:shrink-0 tw:cursor-pointer tw:items-center tw:justify-center tw:gap-2 tw:rounded-full tw:font-mono tw:text-[12px] tw:leading-none tw:font-medium tw:tracking-[0.1em] tw:whitespace-nowrap tw:uppercase tw:no-underline tw:transition-colors tw:duration-200 tw:select-none tw:focus-visible:outline-2 tw:focus-visible:outline-offset-2 tw:focus-visible:outline-cobalt tw:disabled:cursor-not-allowed tw:disabled:opacity-55 tw:[&_svg]:size-4 tw:[&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'tw:bg-cobalt tw:text-white tw:hover:bg-cobalt-deep',
        ink: 'tw:bg-ink tw:text-white tw:hover:bg-cobalt',
        outline: 'tw:border tw:border-ink/30 tw:bg-white tw:text-ink tw:hover:border-ink tw:hover:bg-ink tw:hover:text-white',
        ghost: 'tw:text-ink tw:hover:bg-wash',
        danger: 'tw:bg-danger tw:text-white tw:hover:bg-danger-deep',
        'ghost-danger': 'tw:text-danger tw:hover:bg-danger/8',
        link: 'tw:rounded-md tw:text-ink tw:underline tw:underline-offset-4 tw:hover:text-cobalt',
      },
      size: {
        default: 'tw:h-11 tw:px-5',
        sm: 'tw:h-11 tw:px-3.5',
        lg: 'tw:h-12 tw:px-6',
        icon: 'tw:size-11',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
);

export function Button({ className, variant, size, asChild = false, type = 'button', ...props }) {
  const Comp = asChild ? Slot : 'button';
  return <Comp data-slot="button" type={asChild ? undefined : type} className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
