import { create } from 'zustand';
import { UserProfile } from '../types';

interface AuthState {
  isAuthenticated: boolean;
  userProfile: Partial<UserProfile> | null;
  setAuthenticated: (status: boolean) => void;
  updateUserProfile: (profileUpdates: Partial<UserProfile>) => void;
  setWizardStep: (step: number) => void;
  logout: () => void;
}

export const useStore = create<AuthState>((set) => ({
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
  logout: () => set({ isAuthenticated: false, userProfile: null }),
}));
