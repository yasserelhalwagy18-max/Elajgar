'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useStore } from '@/lib/store';

const SAVE_DEBOUNCE_MS = 1500;

/**
 * Keeps the server copy of the user's profile in sync with the local store.
 *
 * The store is the source of truth while the user is editing; this hook pushes
 * a debounced snapshot to `/api/user` whenever the profile changes. It also
 * pulls the server copy once on mount so a user signing in on a second device
 * sees their existing data.
 *
 * `isLoaded` turns true once the initial pull has finished (successfully or
 * not). Gate form rendering on it: a form whose state is seeded from the
 * profile must not mount before the profile has arrived, otherwise the seed
 * happens against an empty profile.
 *
 * Mount it once, in a layout that wraps every authenticated page.
 */
export function useProfileSync(): { isLoaded: boolean } {
  const isAuthenticated = useStore((state) => state.isAuthenticated);
  const userProfile = useStore((state) => state.userProfile);
  const fetchUserFromServer = useStore((state) => state.fetchUserFromServer);
  const saveUserToServer = useStore((state) => state.saveUserToServer);

  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasLoadedRef = useRef(false);
  const [isLoaded, setIsLoaded] = useState(false);
  /** JSON of the last payload known to be in sync with the server. */
  const lastSyncedRef = useRef<string | null>(null);

  const serialize = useCallback((profile: unknown) => {
    try {
      return JSON.stringify(profile ?? null);
    } catch {
      return null;
    }
  }, []);

  const push = useCallback(() => {
    const profile = useStore.getState().userProfile;
    const payload = serialize(profile);
    if (payload === null || payload === lastSyncedRef.current) return;

    void saveUserToServer().then((ok) => {
      // Only mark as synced on success, so a failed request is retried on the
      // next change.
      if (ok) lastSyncedRef.current = payload;
    });
  }, [saveUserToServer, serialize]);

  // Pull the server copy once, after the store has hydrated.
  useEffect(() => {
    if (!isAuthenticated || hasLoadedRef.current) return;
    hasLoadedRef.current = true;

    void fetchUserFromServer().finally(() => {
      setIsLoaded(true);
    });
  }, [isAuthenticated, fetchUserFromServer]);

  // Push local changes to the server, debounced.
  useEffect(() => {
    if (!isAuthenticated || !userProfile) return;

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(push, SAVE_DEBOUNCE_MS);

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [isAuthenticated, userProfile, push]);

  // Flush pending changes when the tab is hidden or closed.
  useEffect(() => {
    const flush = () => {
      if (!isAuthenticated) return;
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      push();
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') flush();
    };

    window.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('pagehide', flush);
    return () => {
      window.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('pagehide', flush);
    };
  }, [isAuthenticated, push]);

  return { isLoaded };
}
