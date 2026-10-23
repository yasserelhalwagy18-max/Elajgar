'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useStore } from '@/lib/store';

const SAVE_DEBOUNCE_MS = 1500;

/**
 * Profile fields the server accepts a write for (see `buildProfileUpdate` in
 * `/api/user`). Only these travel in a push, plus the two JSON blobs and the
 * daily-log rows - a field nothing can write never ships.
 */
const SYNCABLE_PROFILE_KEYS = [
  'fullName',
  'age',
  'gender',
  'height',
  'weight',
  'activityLevel',
  'jobTitle',
  'underlyingDiseases',
  'medications',
  'termsAccepted',
  'currentWizardStep',
  'nutritionGoal',
] as const;

const SYNCABLE_JSON_KEYS = ['painZones', 'questionnaireAnswers'] as const;

/** JSON text for a value, with the caller's `null` folded to a stable form. */
function json(value: unknown): string {
  try {
    return JSON.stringify(value ?? null);
  } catch {
    // Unserialisable junk reads as "always different" and gets sent again.
    return '<unserializable>';
  }
}

/**
 * Build the payload that changes the server.
 *
 * The server writes only what a payload contains - a field or a daily-log
 * date left out of it keeps the value it already has - so a payload holding
 * just the fields and rows that changed since the last acknowledged sync
 * cannot clobber whatever another device wrote in the meantime. That turns
 * the old "last writer wins, and the writer takes everything" sync into a
 * per-field rule without changing the wire contract.
 *
 * Returns null when nothing has changed and there is nothing to push.
 */
export function buildSyncPayload(
  profile: Record<string, unknown> | null,
  snapshot: Record<string, unknown> | null,
  unsyncedLogDates: readonly string[],
): Record<string, unknown> | null {
  if (!profile) return null;

  const payload: Record<string, unknown> = {};

  for (const key of [...SYNCABLE_PROFILE_KEYS, ...SYNCABLE_JSON_KEYS]) {
    if (json(profile[key]) !== json(snapshot?.[key])) {
      payload[key] = profile[key];
    }
  }

  // Daily-log rows travel by their own bookkeeping - the store's
  // `unsyncedLogDates` marks exactly the rows created or changed since the
  // last acknowledged push - plus any row whose content still differs from
  // the synced snapshot, which catches an edit that landed while a push was
  // already in flight.
  const pending = new Set(unsyncedLogDates);
  const snapshotLogs = new Map<string, string>(
    (Array.isArray(snapshot?.dailyLogs) ? snapshot?.dailyLogs : []).map(
      (log: { date: string }) => [log.date, json(log)],
    ),
  );
  const changedLogs = (Array.isArray(profile.dailyLogs) ? profile.dailyLogs : []).filter(
    (log: { date: string }) => pending.has(log.date) || snapshotLogs.get(log.date) !== json(log),
  );
  if (changedLogs.length > 0) {
    payload.dailyLogs = changedLogs;
  }

  return Object.keys(payload).length > 0 ? payload : null;
}

/**
 * Fold a successfully pushed payload into the synced snapshot, so the next
 * push diffs against a description of what the server now holds. It reads
 * the captured payload, never the live profile: an edit made while the
 * request was in flight must stay pending and push again.
 */
function composeSyncedSnapshot(
  snapshot: Record<string, unknown> | null,
  payload: Record<string, unknown>,
): Record<string, unknown> {
  const merged: Record<string, unknown> = { ...snapshot, ...payload };

  if (Array.isArray(payload.dailyLogs)) {
    const sent = new Set(
      (payload.dailyLogs as { date: string }[]).map((log) => log.date),
    );
    const carried = (Array.isArray(merged.dailyLogs) ? merged.dailyLogs : []).filter(
      (log) => !sent.has((log as { date: string }).date),
    );
    merged.dailyLogs = [
      ...carried,
      ...(payload.dailyLogs as unknown[]),
    ];
  }

  return merged;
}

/**
 * Keeps the server copy of the user's profile in sync with the local store.
 *
 * While the user is editing, this hook pushes a debounced diff to
 * `/api/user` whenever the profile changes - only the fields and daily-log
 * rows that actually changed since the last acknowledged push, so a second
 * device cannot be overwritten by stale values this one never touched. It
 * also pulls the server copy once on mount so a user signing in on a second
 * device sees their existing data.
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
  /** The profile copy known to match the server, kept as parsed JSON. */
  const syncedSnapshotRef = useRef<Record<string, unknown> | null>(null);

  const push = useCallback(() => {
    const state = useStore.getState();
    const payload = buildSyncPayload(
      state.userProfile as Record<string, unknown> | null,
      syncedSnapshotRef.current,
      state.unsyncedLogDates,
    );
    if (payload === null) return;

    void saveUserToServer(
      payload as Parameters<typeof saveUserToServer>[0],
    ).then((ok) => {
      // Only mark as synced on success, so a failed request is retried on
      // the next change - the snapshot moves only for rows that reached
      // the server.
      if (ok) {
        syncedSnapshotRef.current = composeSyncedSnapshot(
          syncedSnapshotRef.current,
          payload,
        );
      }
    });
  }, [saveUserToServer]);

  // Pull the server copy once, after the store has hydrated.
  useEffect(() => {
    if (!isAuthenticated || hasLoadedRef.current) return;
    hasLoadedRef.current = true;

    void fetchUserFromServer().finally(() => {
      // Whatever the pull produced - merged with the locally pending rows -
      // is by definition in step with the server, so it becomes the
      // baseline every later push diffs against.
      syncedSnapshotRef.current =
        useStore.getState().userProfile as Record<string, unknown> | null;
      setIsLoaded(true);
    });
  }, [isAuthenticated, fetchUserFromServer]);

  // Push local changes to the server, debounced.
  // Nothing is pushed before the initial pull has finished; the push itself
  // is a diff - it stays empty (and sends nothing) while nothing has really
  // changed since the last acknowledged sync.
  useEffect(() => {
    if (!isAuthenticated || !userProfile || !isLoaded) return;

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(push, SAVE_DEBOUNCE_MS);

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [isAuthenticated, userProfile, isLoaded, push]);

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
