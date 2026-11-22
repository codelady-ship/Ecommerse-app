import { useSyncExternalStore } from 'react';
import * as ToastPrimitive from '@radix-ui/react-toast';
import { Check, CircleAlert, Lock } from 'lucide-react';
import { cn } from '@/admin/lib/utils.js';
import { dismissToast, getToasts, subscribeToasts } from '@/admin/lib/toast.js';

const ICONS = { success: Check, error: CircleAlert, locked: Lock };
const TONES = {
  success: 'tw:bg-white tw:text-lagoon',
  error: 'tw:bg-white tw:text-danger',
  locked: 'tw:bg-marigold tw:text-ink',
};

/** In-page toasts (Radix Toast): bottom-centre on phones, bottom-right from 640px. */
export function Toaster() {
  const toasts = useSyncExternalStore(subscribeToasts, getToasts);
  return (
    <ToastPrimitive.Provider duration={4000} swipeDirection="right" label="Notification">
      {toasts.map((t) => {
        const Icon = ICONS[t.variant] || Check;
        return (
          <ToastPrimitive.Root
            key={t.id}
            data-slot="toast"
            data-variant={t.variant}
            onOpenChange={(open) => !open && dismissToast(t.id)}
            className="tw:pointer-events-auto tw:flex tw:w-full tw:items-center tw:sm:w-auto tw:sm:max-w-full tw:gap-3 tw:rounded-2xl tw:bg-ink tw:py-3 tw:pr-5 tw:pl-3 tw:text-white tw:shadow-[0_16px_40px_-12px_rgba(22,20,26,0.5)] tw:data-[state=open]:animate-hl-rise-in tw:data-[state=closed]:animate-hl-fade-out tw:data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] tw:data-[swipe=end]:animate-hl-fade-out"
          >
            <span className={cn('tw:flex tw:size-7 tw:shrink-0 tw:items-center tw:justify-center tw:rounded-full', TONES[t.variant] || TONES.success)} aria-hidden="true">
              <Icon className="tw:size-4" strokeWidth={2.5} />
            </span>
            <ToastPrimitive.Description className="tw:min-w-0 tw:text-[15px] tw:leading-snug tw:font-medium">{t.text}</ToastPrimitive.Description>
          </ToastPrimitive.Root>
        );
      })}
      <ToastPrimitive.Viewport
        data-slot="toast-viewport"
        className="tw:pointer-events-none tw:fixed tw:inset-x-0 tw:bottom-0 tw:z-[130] tw:m-0 tw:flex tw:list-none tw:flex-col tw:gap-2 tw:p-4 tw:outline-none tw:sm:left-auto tw:sm:w-[440px] tw:sm:items-end tw:sm:p-6"
      />
    </ToastPrimitive.Provider>
  );
}
