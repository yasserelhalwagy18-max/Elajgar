'use client';

import { useEffect, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';

/**
 * True once the persisted store has been read back from localStorage.
 *
 * Zustand restores the saved session asynchronously, so on the very first
 * render the store still holds its default (signed out) values. Any guard
 * that reads `isAuthenticated` before this flips sees "signed out" and
 * bounces an authenticated user back to the login screen.
 *
 * `useSyncExternalStore` is used for the same reason as in `useMounted`: it
 * subscribes to the store without an extra render, and it is not flagged by
 * the react-hooks lint rules.
 */
export function useStoreHydrated(): boolean {
  return useSyncExternalStore(
    (onStoreChange) => useStore.subscribe(onStoreChange),
    () => useStore.persist.hasHydrated(),
    () => false
  );
}

/**
 * Guard a page behind the authentication check.
 *
 * The redirect only happens once the persisted store has rehydrated.
 *
 * The store and the session cookie can get out of step - clearing the site
 * data leaves the cookie behind, and the cookie outlives the stored profile
 * - so the server is asked before the user is sent to the login screen. The
 * server is the only one that knows which of the two is telling the truth.
 */
export function useAuthGuard() {
  const router = useRouter();
  const isAuthenticated = useStore((state) => state.isAuthenticated);
  const hasHydrated = useStoreHydrated();
  const syncSession = useStore((state) => state.syncSession);

  useEffect(() => {
    if (!hasHydrated) return;
    if (isAuthenticated) return;

    void syncSession().then((signedIn) => {
      // `null` means the server could not be reached. Sending the user to
      // the login screen then would send them straight back, because the
      // cookie may still be good.
      if (signedIn === false) router.push('/login');
    });
  }, [hasHydrated, isAuthenticated, router, syncSession]);

  return { isAuthenticated, hasHydrated };
}

export default useAuthGuard;
