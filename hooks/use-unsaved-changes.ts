'use client';

import { useEffect } from 'react';

/**
 * Warn before the tab is closed or reloaded while there are unsaved changes.
 *
 * `beforeunload` only covers leaving the site - navigation inside the app is
 * the router's business, not the browser's.
 */
export function useUnsavedChangesWarning(dirty: boolean) {
  useEffect(() => {
    if (!dirty) return;

    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      // Chrome shows its own message and ignores this text, but other
      // browsers still require returnValue to show a prompt at all.
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);
}
