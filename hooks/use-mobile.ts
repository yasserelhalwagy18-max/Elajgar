'use client';

import { useEffect, useState } from 'react';

const MOBILE_BREAKPOINT = 768;

/**
 * Tracks whether the viewport is narrower than `MOBILE_BREAKPOINT`.
 *
 * Uses `matchMedia` rather than a `resize` listener so it only fires when the
 * breakpoint is actually crossed.
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);

    const onChange = (event: MediaQueryListEvent | MediaQueryList) => {
      setIsMobile(event.matches);
    };

    onChange(mql);

    // `addEventListener` is not available on MediaQueryList in older Safari.
    if (mql.addEventListener) {
      mql.addEventListener('change', onChange);
      return () => mql.removeEventListener('change', onChange);
    }

    mql.addListener(onChange);
    return () => mql.removeListener(onChange);
  }, []);

  // Null means "not measured yet" - treat it as not mobile so the first render
  // matches the server.
  return isMobile ?? false;
}
