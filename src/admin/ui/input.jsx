import { cn } from '@/admin/lib/utils.js';

export function Input({ className, type = 'text', ...props }) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        // 16px on touch widths so iOS does not zoom the page on focus
        'tw:h-11 tw:w-full tw:min-w-0 tw:appearance-none tw:rounded-[10px] tw:border tw:border-line-strong tw:bg-white tw:px-3.5 tw:font-ui tw:text-[16px] tw:text-ink tw:transition-[border-color,box-shadow] tw:duration-200 tw:md:text-[15px]',
        'tw:hover:border-ink tw:focus-visible:border-cobalt tw:focus-visible:outline-2 tw:focus-visible:outline-offset-1 tw:focus-visible:outline-cobalt',
        'tw:aria-invalid:border-danger tw:disabled:cursor-not-allowed tw:disabled:opacity-55',
        className,
      )}
      {...props}
    />
  );
}
