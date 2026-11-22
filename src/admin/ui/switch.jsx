import * as SwitchPrimitive from '@radix-ui/react-switch';
import { cn } from '@/admin/lib/utils.js';

/** The button is 44px tall for touch; the visible track sits inside it. */
export function Switch({ className, ...props }) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        'tw:group tw:inline-flex tw:h-11 tw:w-12 tw:shrink-0 tw:cursor-pointer tw:items-center tw:rounded-full tw:focus-visible:outline-2 tw:focus-visible:-outline-offset-4 tw:focus-visible:outline-cobalt tw:disabled:cursor-not-allowed tw:disabled:opacity-55',
        className,
      )}
      {...props}
    >
      <span className="tw:flex tw:h-7 tw:w-12 tw:items-center tw:rounded-full tw:bg-line-strong tw:p-0.5 tw:transition-colors tw:duration-200 tw:group-data-[state=checked]:bg-cobalt">
        <SwitchPrimitive.Thumb className="tw:block tw:size-6 tw:rounded-full tw:bg-white tw:shadow-sm tw:transition-transform tw:duration-200 tw:data-[state=checked]:translate-x-5" />
      </span>
    </SwitchPrimitive.Root>
  );
}
