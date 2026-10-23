import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { UserProfile } from '../types';
import { migrateZoneKey } from './body-regions';

type DailyLog = NonNullable<UserProfile['dailyLogs']>[number];

/**
 * Add a date to the pending set without holding duplicates.
 */
const withUnsyncedDate = (dateKeys: readonly string[], date: string): string[] =>
  dateKeys.includes(date) ? [...dateKeys] : [...dateKeys, date];

/**
 * Merge the server's daily logs into the local copy.
 *
 * The debounced save means an edit can still be device-only when the sync
 * runs, and a pull that blindly replaced `dailyLogs` wiped it - losing
 * health-journal entries offline or on a quickly closed tab. The rules:
 *
 * - a row only this device knows about always survives;
 * - a row holding unsynced edits beats the server's staler copy of it;
 * - everything else comes from the server, the source of truth.
 *
 * It also reports the resulting pending set: every device-only row is
 * waiting to sync, whatever the caller's own bookkeeping said.
 */
function mergeDailyLogs(
  serverLogs: DailyLog[] | undefined,
  localLogs: DailyLog[] | undefined,
  pendingDateKeys: readonly string[],
): { logs: DailyLog[]; pendingDateKeys: string[] } {
  const logs = localLogs ?? [];
  const server = serverLogs ?? [];
  const serverDates = new Set(server.map((log) => log.date));
  const pending = new Set(pendingDateKeys);

  // Locally held rows are seeded first, so device-only rows are not dropped.
  const byDate = new Map(logs.map((log) => [log.date, log]));
  for (const log of server) {
    // Server rows win - unless this device holds unsynced changes for the
    // date, which makes the local row the newer one.
    if (!byDate.has(log.date) || !pending.has(log.date)) {
      byDate.set(log.date, log);
    }
  }
  for (const log of logs) {
    if (!serverDates.has(log.date)) pending.add(log.date);
  }

  return { logs: [...byDate.values()], pendingDateKeys: [...pending] };
}

interface AuthState {
  isAuthenticated: boolean;
  userProfile: Partial<UserProfile> | null;
  setAuthenticated: (status: boolean) => void;
  /**
   * Start a session for a phone number.
   *
   * The profile is replaced rather than merged: the persisted store still
   * holds the previous user's data, and merging it into the new session
   * would show - and then upload - somebody else's profile.
   */
  signIn: (phoneNumber: string) => void;
  updateUserProfile: (profileUpdates: Partial<UserProfile>) => void;
  setWizardStep: (step: number) => void;
  toggleRegion: (regionId: string) => void;
  /**
   * Sign the user out.
   *
   * The session lives in an HTTP-only cookie, so clearing the local store is
   * not enough - the server would still consider the user signed in. The
   * cookie is cleared before this resolves, so the caller can send the user
   * to the login screen only once the server agrees they are signed out.
   */
  logout: () => Promise<void>;
  logFood: (date: string, food: { id: string; name: string; calories: number; protein: number; carbs: number; fat: number }) => void;
  /**
   * Take one logged food back out of a day.
   *
   * Logging a food used to be one-way: the item vanished from the search
   * results and there was no list of what had been eaten, so a mistake
   * could not be corrected.
   */
  removeFood: (date: string, foodId: string) => void;
  /**
   * Put an undone delete back where it was.
   *
   * The trash button is small and thumbs are big, so deleting logs a
   * same-duration undo in the toast - this is its payload side. It splices
   * the item back at its original index rather than appending, so the list
   * looks exactly like it did before the delete.
   */
  restoreFood: (date: string, food: { id: string; name: string; calories: number; protein: number; carbs: number; fat: number }, foodIndex: number) => void;
  clearAndSetFoods: (date: string, foods: { id: string; name: string; calories: number; protein: number; carbs: number; fat: number }[]) => void;
  addWater: (date: string, amount: number, max?: number) => void;
  /**
   * Take glasses of water back out.
   *
   * «یک لیوان» used to be one-way: a mispressed 44px button added 250 ml
   * and the only way back was editing logs manually. Floors at 0 - there
   * is no such thing as negative hydration.
   */
  removeWater: (date: string, amount: number) => void;
  logDailyMetrics: (date: string, metrics: { sleepHours?: number; sleepQuality?: 'poor' | 'fair' | 'good'; activityMinutes?: number; weight?: number; painIntensity?: number }) => void;
  resetAll: () => void;
  fetchUserFromServer: () => Promise<void>;
  /**
   * Ask the server whether the session cookie is still good.
   *
   * The cookie lives in the browser and the profile lives in local storage,
   * so the two can get out of step: clearing the site data leaves the cookie
   * behind, and the cookie expires while the stored profile stays. The
   * server is the only one that knows.
   *
   * Returns true when the caller is signed in, false when the server says
   * they are not, and null when the server could not be reached. The last
   * one must not be read as "signed out" - the cookie may still be good, and
   * sending the user to the login screen would bounce them straight back.
   */
  syncSession: () => Promise<boolean | null>;
  /**
   * Push a profile snapshot to the server.
   *
   * With no argument the whole local profile is sent. The caller may pass a
   * partial payload instead - the diff-push in `use-profile-sync` does - and
   * the server then writes only the fields and daily-log rows it carries,
   * leaving everything else untouched for the device that changed it.
   */
  saveUserToServer: (profile?: Partial<UserProfile>) => Promise<boolean>;
  /**
   * The dates whose daily-log row exists, in its latest form, only on this
   * device: created here, or changed after the last acknowledged push. The
   * debounced save normally empties it within about 1.5 seconds, and the
   * merge rules of `mergeDailyLogs` keep those rows alive in the meantime.
   */
  unsyncedLogDates: string[];
}

export const useStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      userProfile: null,
      unsyncedLogDates: [],
      setAuthenticated: (status) => set({ isAuthenticated: status }),
      signIn: (phoneNumber) =>
        set({
          isAuthenticated: true,
          // The previous user's profile is dropped, not merged - and so are
          // the rows they left waiting to sync.
          userProfile: { phoneNumber },
          unsyncedLogDates: [],
        }),
      updateUserProfile: (profileUpdates) =>
        set((state) => ({
          userProfile: {
            ...state.userProfile,
            ...profileUpdates,
          },
        })),
      setWizardStep: (step) =>
        set((state) => ({
          userProfile: {
            ...state.userProfile,
            currentWizardStep: step,
          },
        })),
      toggleRegion: (regionId) =>
        set((state) => {
          const profile = state.userProfile || {};
          const zones = profile.painZones || [];
          const exists = zones.find((z) => z.zone === regionId);

          let newZones;
          if (exists) {
            newZones = zones.filter((z) => z.zone !== regionId);
          } else {
            newZones = [...zones, { zone: regionId, intensity: 5, type: 'مبهم' }];
          }

          return {
            userProfile: {
              ...profile,
              painZones: newZones,
            },
          };
        }),
      logFood: (date, food) =>
        set((state) => {
          const profile = state.userProfile || {};
          const logs = profile.dailyLogs || [];
          const existingLogIndex = logs.findIndex((l) => l.date === date);

          let newLogs = [...logs];
          if (existingLogIndex >= 0) {
            newLogs[existingLogIndex] = {
              ...newLogs[existingLogIndex],
              foods: [...newLogs[existingLogIndex].foods, food],
            };
          } else {
            newLogs.push({
              date,
              foods: [food],
              waterIntake: 0,
            });
          }

          return {
            userProfile: {
              ...profile,
              dailyLogs: newLogs,
            },
            // This row is device-only until the next debounced push lands.
            unsyncedLogDates: withUnsyncedDate(state.unsyncedLogDates, date),
          };
        }),
      removeFood: (date, foodId) =>
        set((state) => {
          const profile = state.userProfile || {};
          const logs = profile.dailyLogs || [];
          const log = logs.find((l) => l.date === date);
          if (!log) return state;

          return {
            userProfile: {
              ...profile,
              dailyLogs: logs.map((l) =>
                l.date === date
                  ? { ...l, foods: l.foods.filter((food) => food.id !== foodId) }
                  : l
              ),
            },
            // The deletion is device-only until the next debounced push.
            unsyncedLogDates: withUnsyncedDate(state.unsyncedLogDates, date),
          };
        }),
      restoreFood: (date, food, foodIndex) =>
        set((state) => {
          const profile = state.userProfile || {};
          const logs = profile.dailyLogs || [];
          const existingLogIndex = logs.findIndex((l) => l.date === date);

          let newLogs = [...logs];
          if (existingLogIndex >= 0) {
            // If the same item was logged again while the undo toast was
            // still on screen, splicing it back would duplicate it - back
            // out instead of corrupting the log.
            if (newLogs[existingLogIndex].foods.some((entry) => entry.id === food.id)) return state;

            const foods = [...newLogs[existingLogIndex].foods];
            const clampedIndex = Math.min(Math.max(foodIndex, 0), foods.length);
            foods.splice(clampedIndex, 0, food);
            newLogs[existingLogIndex] = {
              ...newLogs[existingLogIndex],
              foods,
            };
          } else {
            // The whole day's row disappeared in between (e.g. a sync arrived
            // with nothing that date) - the undone item re-seeds it.
            newLogs.push({
              date,
              foods: [food],
              waterIntake: 0,
            });
          }

          return {
            userProfile: {
              ...profile,
              dailyLogs: newLogs,
            },
            // This row is device-only until the next debounced push lands.
            unsyncedLogDates: withUnsyncedDate(state.unsyncedLogDates, date),
          };
        }),
      clearAndSetFoods: (date, foods) =>
        set((state) => {
          const profile = state.userProfile || {};
          const logs = profile.dailyLogs || [];
          const existingLogIndex = logs.findIndex((l) => l.date === date);

          let newLogs = [...logs];
          if (existingLogIndex >= 0) {
            newLogs[existingLogIndex] = {
              ...newLogs[existingLogIndex],
              foods: [...foods],
            };
          } else {
            newLogs.push({
              date,
              foods: [...foods],
              waterIntake: 0,
            });
          }

          return {
            userProfile: {
              ...profile,
              dailyLogs: newLogs,
            },
            // This row is device-only until the next debounced push lands.
            unsyncedLogDates: withUnsyncedDate(state.unsyncedLogDates, date),
          };
        }),
      addWater: (date, amount, max) =>
        set((state) => {
          const profile = state.userProfile || {};
          const logs = profile.dailyLogs || [];
          const existingLogIndex = logs.findIndex((l) => l.date === date);

          let newLogs = [...logs];
          if (existingLogIndex >= 0) {
            // `max` is the day's glass grid ceiling. It is also enforced here,
            // not only in the screen's button, so a burst of taps arriving in
            // one task - each seeing the same stale render - cannot overflow
            // the target the grid is drawn for.
            const current = newLogs[existingLogIndex].waterIntake || 0;
            const next = max === undefined ? current + amount : Math.min(current + amount, max);
            if (next === current) return state;
            newLogs[existingLogIndex] = {
              ...newLogs[existingLogIndex],
              waterIntake: next,
            };
          } else {
            newLogs.push({
              date,
              foods: [],
              waterIntake: max === undefined ? amount : Math.min(amount, max),
            });
          }

          return {
            userProfile: {
              ...profile,
              dailyLogs: newLogs,
            },
            // This row is device-only until the next debounced push lands.
            unsyncedLogDates: withUnsyncedDate(state.unsyncedLogDates, date),
          };
        }),
      removeWater: (date, amount) =>
        set((state) => {
          const profile = state.userProfile || {};
          const logs = profile.dailyLogs || [];
          const existingLogIndex = logs.findIndex((l) => l.date === date);
          if (existingLogIndex < 0) return state;

          const current = logs[existingLogIndex].waterIntake || 0;
          const next = Math.max(0, current - amount);
          // Already at (or past) zero: nothing to take back.
          if (next === current) return state;

          const newLogs = [...logs];
          newLogs[existingLogIndex] = {
            ...newLogs[existingLogIndex],
            waterIntake: next,
          };

          return {
            userProfile: {
              ...profile,
              dailyLogs: newLogs,
            },
            // This row is device-only until the next debounced push lands.
            unsyncedLogDates: withUnsyncedDate(state.unsyncedLogDates, date),
          };
        }),
      logDailyMetrics: (date, metrics) =>
        set((state) => {
          const profile = state.userProfile || {};
          const logs = profile.dailyLogs || [];
          const existingLogIndex = logs.findIndex((l) => l.date === date);

          let newLogs = [...logs];
          if (existingLogIndex >= 0) {
            newLogs[existingLogIndex] = {
              ...newLogs[existingLogIndex],
              ...metrics,
            };
          } else {
            newLogs.push({
              date,
              foods: [],
              waterIntake: 0,
              ...metrics,
            });
          }

          return {
            userProfile: {
              ...profile,
              dailyLogs: newLogs,
            },
            // This row is device-only until the next debounced push lands.
            unsyncedLogDates: withUnsyncedDate(state.unsyncedLogDates, date),
          };
        }),
      logout: async () => {
        set({ isAuthenticated: false, userProfile: null, unsyncedLogDates: [] });
        // The session lives in an HTTP-only cookie, so clearing the local
        // store is not enough - the server would still consider the user
        // signed in.
        try {
          await fetch('/api/auth/logout', { method: 'POST' });
        } catch (error) {
          console.error('Failed to clear the server session:', error);
        }
      },
      fetchUserFromServer: async () => {
        try {
          // The server identifies the caller from the session cookie, so no
          // phone number is sent.
          const res = await fetch('/api/user', { cache: 'no-store' });
          if (!res.ok) {
            console.error('Failed to fetch user from server:', res.status);
            return;
          }
          const data = await res.json();
          set((state) => {
            // The server is the source of truth for everything it holds -
            // but the daily-log rows it knows nothing about, or holds a
            // staler copy of, are kept by mergeDailyLogs so a pull can never
            // wipe what has not synced yet.
            const { logs: dailyLogs, pendingDateKeys } = mergeDailyLogs(
              data.dailyLogs,
              state.userProfile?.dailyLogs,
              state.unsyncedLogDates,
            );
            return {
              userProfile: {
                ...state.userProfile,
                ...data,
                dailyLogs,
              },
              unsyncedLogDates: pendingDateKeys,
            };
          });
        } catch (error) {
          console.error('Failed to fetch user from server:', error);
        }
      },
      syncSession: async () => {
        try {
          const res = await fetch('/api/user', { cache: 'no-store' });

          // The server refuses the request, so there is no session.
          if (res.status === 401) {
            set({ isAuthenticated: false, userProfile: null });
            return false;
          }

          // The server could not answer. The session is neither confirmed
          // nor refused.
          if (!res.ok) return null;

          const data = await res.json();
          set((state) => {
            // The merge rules are the same as the initial pull: whatever
            // the server is missing but this device holds waits to sync.
            const { logs: dailyLogs, pendingDateKeys } = mergeDailyLogs(
              data.dailyLogs,
              state.userProfile?.dailyLogs,
              state.unsyncedLogDates,
            );
            return {
              isAuthenticated: true,
              userProfile: {
                ...state.userProfile,
                ...data,
                dailyLogs,
              },
              unsyncedLogDates: pendingDateKeys,
            };
          });
          return true;
        } catch (error) {
          console.error('Failed to sync the session:', error);
          return null;
        }
      },
      saveUserToServer: async (profile) => {
        try {
          const payload = profile ?? get().userProfile;
          if (!payload) return false;

          const res = await fetch('/api/user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
          if (!res.ok) {
            console.error('Failed to save user to server:', res.status, await res.text());
            return false;
          }

          // The server just accepted this payload, so every date it carried
          // is now synced. Only those dates are cleared: an edit made while
          // the request was in flight stays pending until its own push.
          const payloadDates = new Set(payload.dailyLogs?.map((log) => log.date) ?? []);
          set((state) => ({
            unsyncedLogDates: state.unsyncedLogDates.filter((key) => !payloadDates.has(key)),
          }));
          return true;
        } catch (error) {
          console.error('Error saving user to server:', error);
          return false;
        }
      },
      resetAll: () => {
        set({ isAuthenticated: false, userProfile: null, unsyncedLogDates: [] });
        if (typeof window !== 'undefined') {
          localStorage.removeItem('alajgar-storage');
        }
      },
    }),
    {
      name: 'alajgar-storage',
      // v1 keys pain zones by region id; v0 keyed them by the visible label,
      // which is duplicated across the front and back sides of the body map.
      version: 1,
      storage: createJSONStorage(() => localStorage),
      migrate: (persistedState) => {
        const state = persistedState as { userProfile?: Partial<UserProfile> } | null;
        const zones = state?.userProfile?.painZones;
        if (state?.userProfile && Array.isArray(zones)) {
          state.userProfile = {
            ...state.userProfile,
            painZones: zones.map((zone) => ({ ...zone, zone: migrateZoneKey(zone.zone) })),
          };
        }
        return state as AuthState;
      },
    }
  )
);
