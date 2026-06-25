import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { UserProfile } from '../types';

interface AuthState {
  isAuthenticated: boolean;
  userProfile: Partial<UserProfile> | null;
  setAuthenticated: (status: boolean) => void;
  updateUserProfile: (profileUpdates: Partial<UserProfile>) => void;
  setWizardStep: (step: number) => void;
  logout: () => void;
  logFood: (date: string, food: { id: string; name: string; calories: number; protein: number; carbs: number; fat: number }) => void;
  clearAndSetFoods: (date: string, foods: { id: string; name: string; calories: number; protein: number; carbs: number; fat: number }[]) => void;
  addWater: (date: string, amount: number) => void;
  logDailyMetrics: (date: string, metrics: { sleepHours?: number; sleepQuality?: 'poor' | 'fair' | 'good'; activityMinutes?: number }) => void;
  resetAll: () => void;
}

export const useStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      userProfile: null,
      setAuthenticated: (status) => set({ isAuthenticated: status }),
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
      logout: () => set({ isAuthenticated: false, userProfile: null }),
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
