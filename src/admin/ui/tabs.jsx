import * as TabsPrimitive from '@radix-ui/react-tabs';
import { cn } from '@/admin/lib/utils.js';

export function Tabs({ className, ...props }) {
  return <TabsPrimitive.Root data-slot="tabs" className={cn('tw:grid tw:min-w-0 tw:grid-cols-[minmax(0,1fr)] tw:gap-5', className)} {...props} />;
}
/** Underlined tabs on a hairline; the row scrolls sideways by itself if it ever runs out of room. */
export function TabsList({ className, ...props }) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn('tw:flex tw:max-w-full tw:overflow-x-auto tw:border-b tw:border-line tw:sm:gap-3', className)}
      {...props}
    />
  );
}
export function TabsTrigger({ className, ...props }) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        'tw:relative tw:inline-flex tw:h-12 tw:shrink-0 tw:cursor-pointer tw:items-center tw:gap-1.5 tw:border-b-2 tw:sm:gap-2 tw:border-transparent tw:px-2 tw:font-mono tw:text-[12px] tw:font-medium tw:tracking-[0.06em] tw:sm:tracking-[0.1em] tw:whitespace-nowrap tw:text-mute tw:uppercase tw:transition-colors tw:duration-200 tw:sm:px-3',
        'tw:hover:text-ink tw:focus-visible:rounded-md tw:focus-visible:outline-2 tw:focus-visible:-outline-offset-2 tw:focus-visible:outline-cobalt',
        'tw:data-[state=active]:border-cobalt tw:data-[state=active]:text-ink',
        className,
      )}
      {...props}
    />
  );
}
export function TabsContent({ className, ...props }) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn('tw:min-w-0 tw:rounded-[14px] tw:focus-visible:outline-2 tw:focus-visible:outline-offset-4 tw:focus-visible:outline-cobalt', className)}
      {...props}
    />
  );
}
