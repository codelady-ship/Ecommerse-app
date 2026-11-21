// Shared by dialog.jsx and alert-dialog.jsx.
export const overlayClass =
  'tw:fixed tw:inset-0 tw:z-[110] tw:bg-ink/45 tw:data-[state=open]:animate-hl-fade-in tw:data-[state=closed]:animate-hl-fade-out';
// In-page dialog: fixed to the viewport of whatever frame the panel is in, never taller than it.
export const contentClass =
  'tw:fixed tw:top-1/2 tw:left-1/2 tw:z-[111] tw:grid tw:max-h-[calc(100dvh-24px)] tw:w-[calc(100%-24px)] tw:-translate-x-1/2 tw:-translate-y-1/2 tw:gap-5 tw:overflow-y-auto tw:overscroll-contain tw:rounded-2xl tw:bg-white tw:p-5 tw:text-ink tw:shadow-[0_24px_64px_-16px_rgba(22,20,26,0.45)] tw:outline-none tw:sm:p-7 tw:data-[state=open]:animate-hl-pop-in tw:data-[state=closed]:animate-hl-pop-out';
export const titleClass = 'tw:font-ui tw:text-[22px] tw:leading-tight tw:font-bold tw:tracking-[-0.01em] tw:text-ink';
export const descriptionClass = 'tw:text-[15px] tw:leading-snug tw:text-mute';
