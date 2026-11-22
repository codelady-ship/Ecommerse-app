import * as SelectPrimitive from '@radix-ui/react-select';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@/admin/lib/utils.js';
import { usePortalContainer } from '@/admin/lib/portal.js';
import { ScrollPause } from './scroll-pause.jsx';

export const Select = SelectPrimitive.Root;
export const SelectValue = SelectPrimitive.Value;

export function SelectTrigger({ className, children, ...props }) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      className={cn(
        'tw:flex tw:h-11 tw:w-full tw:min-w-0 tw:cursor-pointer tw:items-center tw:justify-between tw:gap-2 tw:rounded-[10px] tw:border tw:border-line-strong tw:bg-white tw:px-3.5 tw:text-left tw:font-ui tw:text-[16px] tw:text-ink tw:transition-[border-color] tw:duration-200 tw:md:text-[15px]',
        'tw:hover:border-ink tw:focus-visible:border-cobalt tw:focus-visible:outline-2 tw:focus-visible:outline-offset-1 tw:focus-visible:outline-cobalt tw:data-[state=open]:border-cobalt',
        'tw:[&>span]:flex tw:[&>span]:min-w-0 tw:[&>span]:items-center tw:[&>span]:gap-2 tw:[&>span]:truncate',
        className,
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDown className="tw:size-4 tw:shrink-0 tw:text-mute" aria-hidden="true" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

/** Popper-positioned list: flips and shrinks to the space the frame really has, and scrolls inside itself. */
export function SelectContent({ className, children, ...props }) {
  const container = usePortalContainer();
  return (
    <SelectPrimitive.Portal container={container}>
      <SelectPrimitive.Content
        data-slot="select-content"
        data-lenis-prevent=""
        position="popper"
        sideOffset={6}
        collisionPadding={8}
        className={cn(
          'tw:relative tw:z-[120] tw:max-h-[min(var(--radix-select-content-available-height),320px)] tw:w-[var(--radix-select-trigger-width)] tw:min-w-[180px] tw:overflow-hidden tw:rounded-xl tw:border tw:border-line tw:bg-white tw:text-ink tw:shadow-[0_16px_40px_-12px_rgba(22,20,26,0.35)] tw:data-[state=open]:animate-hl-fade-in',
          className,
        )}
        {...props}
      >
        <ScrollPause />
        <SelectPrimitive.Viewport className="tw:p-1.5">{children}</SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

export function SelectItem({ className, children, ...props }) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        'tw:relative tw:flex tw:min-h-11 tw:w-full tw:cursor-pointer tw:items-center tw:rounded-lg tw:py-2 tw:pr-9 tw:pl-3 tw:font-ui tw:text-[15px] tw:outline-none tw:select-none tw:data-[highlighted]:bg-wash tw:data-[state=checked]:font-semibold',
        className,
      )}
      {...props}
    >
      <SelectPrimitive.ItemText>
        <span className="tw:flex tw:items-center tw:gap-2">{children}</span>
      </SelectPrimitive.ItemText>
      <span className="tw:absolute tw:right-3 tw:flex tw:size-4 tw:items-center tw:justify-center">
        <SelectPrimitive.ItemIndicator>
          <Check className="tw:size-4 tw:text-cobalt" aria-hidden="true" />
        </SelectPrimitive.ItemIndicator>
      </span>
    </SelectPrimitive.Item>
  );
}
