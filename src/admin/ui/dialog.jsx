import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/admin/lib/utils.js';
import { usePortalContainer } from '@/admin/lib/portal.js';
import { contentClass, descriptionClass, overlayClass, titleClass } from './dialog-classes.js';
import { ScrollPause } from './scroll-pause.jsx';

export const Dialog = DialogPrimitive.Root;
export const DialogClose = DialogPrimitive.Close;

export function DialogContent({ className, children, ...props }) {
  const container = usePortalContainer();
  return (
    <DialogPrimitive.Portal container={container}>
      <DialogPrimitive.Overlay data-slot="dialog-overlay" data-lenis-prevent="" className={overlayClass} />
      <DialogPrimitive.Content data-slot="dialog-content" data-lenis-prevent="" className={cn(contentClass, 'tw:max-w-[600px]', className)} {...props}>
        <ScrollPause />
        {children}
        <DialogPrimitive.Close
          data-slot="dialog-close"
          className="tw:absolute tw:top-2 tw:right-2 tw:inline-flex tw:size-11 tw:cursor-pointer tw:items-center tw:justify-center tw:rounded-full tw:text-mute tw:transition-colors tw:hover:bg-wash tw:hover:text-ink tw:focus-visible:outline-2 tw:focus-visible:outline-offset-0 tw:focus-visible:outline-cobalt tw:sm:top-3 tw:sm:right-3"
        >
          <X className="tw:size-5" aria-hidden="true" />
          <span className="tw:sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}
export function DialogHeader({ className, ...props }) {
  return <div data-slot="dialog-header" className={cn('tw:grid tw:gap-1.5 tw:pr-10', className)} {...props} />;
}
export function DialogFooter({ className, ...props }) {
  return <div data-slot="dialog-footer" className={cn('tw:flex tw:flex-col-reverse tw:gap-2.5 tw:sm:flex-row tw:sm:justify-end', className)} {...props} />;
}
export function DialogTitle({ className, ...props }) {
  return <DialogPrimitive.Title data-slot="dialog-title" className={cn(titleClass, className)} {...props} />;
}
export function DialogDescription({ className, ...props }) {
  return <DialogPrimitive.Description data-slot="dialog-description" className={cn(descriptionClass, className)} {...props} />;
}
