import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog';
import { cn } from '@/admin/lib/utils.js';
import { usePortalContainer } from '@/admin/lib/portal.js';
import { contentClass, descriptionClass, overlayClass, titleClass } from './dialog-classes.js';
import { ScrollPause } from './scroll-pause.jsx';

// The in-page replacement for window.confirm(): the panel runs inside a sandboxed iframe without allow-modals.
export const AlertDialog = AlertDialogPrimitive.Root;
export const AlertDialogAction = AlertDialogPrimitive.Action;
export const AlertDialogCancel = AlertDialogPrimitive.Cancel;

export function AlertDialogContent({ className, children, ...props }) {
  const container = usePortalContainer();
  return (
    <AlertDialogPrimitive.Portal container={container}>
      <AlertDialogPrimitive.Overlay data-slot="alert-dialog-overlay" data-lenis-prevent="" className={overlayClass} />
      <AlertDialogPrimitive.Content data-slot="alert-dialog-content" data-lenis-prevent="" className={cn(contentClass, 'tw:max-w-[440px]', className)} {...props}>
        <ScrollPause />
        {children}
      </AlertDialogPrimitive.Content>
    </AlertDialogPrimitive.Portal>
  );
}
export function AlertDialogHeader({ className, ...props }) {
  return <div data-slot="alert-dialog-header" className={cn('tw:grid tw:gap-2', className)} {...props} />;
}
export function AlertDialogFooter({ className, ...props }) {
  return <div data-slot="alert-dialog-footer" className={cn('tw:flex tw:flex-col-reverse tw:gap-2.5 tw:sm:flex-row tw:sm:justify-end', className)} {...props} />;
}
export function AlertDialogTitle({ className, ...props }) {
  return <AlertDialogPrimitive.Title data-slot="alert-dialog-title" className={cn(titleClass, className)} {...props} />;
}
export function AlertDialogDescription({ className, ...props }) {
  return <AlertDialogPrimitive.Description data-slot="alert-dialog-description" className={cn(descriptionClass, className)} {...props} />;
}
