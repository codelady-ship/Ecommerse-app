import { cn } from '@/admin/lib/utils.js';

/** The table scrolls sideways inside its own box on narrow screens, never the page. */
export function Table({ className, label, minWidth = 720, children, ...props }) {
  return (
    <div
      data-slot="table-container"
      role="region"
      aria-label={label}
      tabIndex={0}
      className={cn(
        'tw:relative tw:max-w-full tw:overflow-x-auto tw:overscroll-x-contain tw:rounded-[14px] tw:border tw:border-line tw:bg-white tw:focus-visible:outline-2 tw:focus-visible:outline-offset-2 tw:focus-visible:outline-cobalt',
        className,
      )}
      {...props}
    >
      <table data-slot="table" className="tw:w-full tw:text-left tw:text-[15px]" style={{ minWidth }}>
        {children}
      </table>
    </div>
  );
}
export function TableHeader({ className, ...props }) {
  return <thead data-slot="table-header" className={cn('tw:bg-wash', className)} {...props} />;
}
export function TableBody({ className, ...props }) {
  return <tbody data-slot="table-body" className={cn('tw:[&_tr:last-child]:border-b-0', className)} {...props} />;
}
export function TableRow({ className, ...props }) {
  return <tr data-slot="table-row" className={cn('tw:border-b tw:border-line tw:transition-colors tw:hover:bg-wash/60', className)} {...props} />;
}
export function TableHead({ className, numeric, ...props }) {
  return (
    <th
      data-slot="table-head"
      scope="col"
      className={cn(
        'tw:h-11 tw:border-b tw:border-line tw:px-4 tw:font-mono tw:text-[12px] tw:font-medium tw:tracking-[0.1em] tw:whitespace-nowrap tw:text-mute tw:uppercase',
        numeric ? 'tw:text-right' : 'tw:text-left',
        className,
      )}
      {...props}
    />
  );
}
export function TableCell({ className, numeric, ...props }) {
  return (
    <td
      data-slot="table-cell"
      className={cn('tw:h-14 tw:px-4 tw:py-1.5 tw:whitespace-nowrap', numeric && 'tw:text-right tw:tabular-nums', className)}
      {...props}
    />
  );
}
