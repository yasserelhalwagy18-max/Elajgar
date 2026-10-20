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
 */
export function useAuthGuard() {
  const router = useRouter();
  const isAuthenticated = useStore((state) => state.isAuthenticated);
  const hasHydrated = useStoreHydrated();

  useEffect(() => {
    if (!hasHydrated) return;
    if (!isAuthenticated) router.push('/login');
  }, [hasHydrated, isAuthenticated, router]);

  return { isAuthenticated, hasHydrated };
}

export default useAuthGuard;
