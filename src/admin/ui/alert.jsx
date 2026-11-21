import { cva } from 'class-variance-authority';
import { cn } from '@/admin/lib/utils.js';

const alertVariants = cva('tw:relative tw:rounded-xl tw:border tw:px-4 tw:py-3.5 tw:text-[15px] tw:leading-snug tw:text-ink', {
  variants: {
    variant: {
      default: 'tw:border-line tw:bg-white',
      // the marigold dye marks everything "demo"
      demo: 'tw:border-marigold/70 tw:border-l-[6px] tw:border-l-marigold tw:bg-marigold/8',
      danger: 'tw:border-danger/40 tw:border-l-[6px] tw:border-l-danger tw:bg-danger/5',
    },
  },
  defaultVariants: { variant: 'default' },
});

export function Alert({ className, variant, role = 'note', ...props }) {
  return <div data-slot="alert" role={role} className={cn(alertVariants({ variant }), className)} {...props} />;
}
export function AlertTitle({ className, ...props }) {
  return <strong data-slot="alert-title" className={cn('tw:font-semibold', className)} {...props} />;
}
