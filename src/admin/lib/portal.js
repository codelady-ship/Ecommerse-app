import { createContext, useContext, useEffect } from 'react';
import { getLenis } from '../../lib/motion.js';

/**
 * Radix portals render into a node inside the admin root instead of <body>, so dialogs, selects and
 * toasts keep the .hl-admin scope (fonts, tokens) and never leave the panel.
 */
export const PortalContext = createContext(null);
export const usePortalContainer = () => useContext(PortalContext) || undefined;

let locks = 0;
/** Pauses the shop's smooth scroll (Lenis) while a dialog or a select is open; nested layers are counted. */
export function useScrollPause() {
  useEffect(() => {
    locks += 1;
    getLenis()?.stop();
    return () => {
      locks = Math.max(0, locks - 1);
      if (!locks) getLenis()?.start();
    };
  }, []);
}
