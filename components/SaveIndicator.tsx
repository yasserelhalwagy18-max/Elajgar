'use client';

import { AlertCircle, Check, Loader2 } from 'lucide-react';
import { useStore } from '@/lib/store';

/**
 * Shows whether the profile is saved to the server.
 *
 * Saving is debounced and happens in the background, so without this a user
 * cannot tell a saved change from a lost one. On failure the indicator offers
 * a retry instead of failing silently.
 */
export function SaveIndicator() {
  const saveState = useStore((state) => state.saveState);
  const saveUserToServer = useStore((state) => state.saveUserToServer);

  if (saveState === 'idle') return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-20 start-4 z-50 card rounded-full px-3 py-1.5 shadow-md bg-surface flex items-center gap-1.5 text-xs font-medium"
    >
      {saveState === 'saving' && (
        <span className="flex items-center gap-1.5 text-on-surface-variant">
          <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
          در حال ذخیره...
        </span>
      )}
      {saveState === 'saved' && (
        <span className="flex items-center gap-1.5 text-success">
          <Check className="w-4 h-4" aria-hidden />
          ذخیره شد
        </span>
      )}
      {saveState === 'error' && (
        <span className="flex items-center gap-1.5 text-error">
          <AlertCircle className="w-4 h-4" aria-hidden />
          ذخیره نشد
          <button
            type="button"
            onClick={() => void saveUserToServer()}
            className="underline underline-offset-2 font-bold"
          >
            تلاش مجدد
          </button>
        </span>
      )}
    </div>
  );
}

export default SaveIndicator;
