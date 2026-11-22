import * as LabelPrimitive from '@radix-ui/react-label';
import { cn } from '@/admin/lib/utils.js';

export function Label({ className, ...props }) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn('tw:font-mono tw:text-[12px] tw:leading-none tw:font-medium tw:tracking-[0.1em] tw:text-ink tw:uppercase', className)}
      {...props}
    />
  );
}
