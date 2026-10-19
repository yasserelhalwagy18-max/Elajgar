'use client';

import { useSyncExternalStore } from 'react';

const emptySubscribe = () => () => {};

/**
 * Returns `false` during server rendering and the hydration pass, then `true`.
 *
 * Use this to gate rendering on client-only state (for example a store that is
 * persisted to localStorage). The server renders the "not yet" branch and the
 * client's first render matches it, so React never reports a hydration
 * mismatch.
 *
 * `useSyncExternalStore` is used rather than a `useEffect` + `setState` pair
 * because the effect approach triggers an extra render and is flagged by the
 * react-hooks lint rules.
 */
export function useMounted(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}
