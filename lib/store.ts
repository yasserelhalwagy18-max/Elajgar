import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { UserProfile } from '../types';

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
  clearAndSetFoods: (date: string, foods: { id: string; name: string; calories: number; protein: number; carbs: number; fat: number }[]) => void;
  addWater: (date: string, amount: number) => void;
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
  saveUserToServer: (profile?: Partial<UserProfile>) => Promise<boolean>;
  /**
   * Whether the local profile is in sync with the server. Drives the save
   * indicator: a user must never have to guess whether their data was saved.
   */
  saveState: SaveState;
}

export type SaveState = 'idle' | 'saving' | 'saved' | 'error';

export const useStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      userProfile: null,
      saveState: 'idle' as SaveState,
      setAuthenticated: (status) => set({ isAuthenticated: status }),
      signIn: (phoneNumber) =>
        set({
          isAuthenticated: true,
          // The previous user's profile is dropped, not merged.
          userProfile: { phoneNumber },
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
          };
        }),
      addWater: (date, amount) =>
        set((state) => {
          const profile = state.userProfile || {};
          const logs = profile.dailyLogs || [];
          const existingLogIndex = logs.findIndex((l) => l.date === date);

          let newLogs = [...logs];
          if (existingLogIndex >= 0) {
            newLogs[existingLogIndex] = {
              ...newLogs[existingLogIndex],
              waterIntake: newLogs[existingLogIndex].waterIntake + amount,
            };
          } else {
            newLogs.push({
              date,
              foods: [],
              waterIntake: amount,
            });
          }

          return {
            userProfile: {
              ...profile,
              dailyLogs: newLogs,
            },
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
          };
        }),
      logout: async () => {
        set({ isAuthenticated: false, userProfile: null });
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
          set((state) => ({
            userProfile: {
              ...state.userProfile,
              ...data,
              // The server is the source of truth for persisted fields, but
              // keep any local-only fields (daily logs that have not been
              // synced yet) that the server does not know about.
              dailyLogs: data.dailyLogs?.length ? data.dailyLogs : state.userProfile?.dailyLogs,
            },
          }));
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
          set((state) => ({
            isAuthenticated: true,
            userProfile: {
              ...state.userProfile,
              ...data,
              dailyLogs: data.dailyLogs?.length ? data.dailyLogs : state.userProfile?.dailyLogs,
            },
          }));
          return true;
        } catch (error) {
          console.error('Failed to sync the session:', error);
          return null;
        }
      },
      saveUserToServer: async (profile) => {
        set({ saveState: 'saving' });
        try {
          const payload = profile ?? get().userProfile;
          if (!payload) {
            set({ saveState: 'idle' });
            return false;
          }

          const res = await fetch('/api/user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
          if (!res.ok) {
            console.error('Failed to save user to server:', res.status, await res.text());
            set({ saveState: 'error' });
            return false;
          }
          set({ saveState: 'saved' });
          return true;
        } catch (error) {
          console.error('Error saving user to server:', error);
          set({ saveState: 'error' });
          return false;
        }
      },
      resetAll: () => {
        set({ isAuthenticated: false, userProfile: null });
        if (typeof window !== 'undefined') {
          localStorage.removeItem('alajgar-storage');
        }
      },
    }),
    {
      name: 'alajgar-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
