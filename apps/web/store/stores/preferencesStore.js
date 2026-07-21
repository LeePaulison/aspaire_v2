import { create } from "zustand";

export const usePreferencesStore = create((set) => ({
  preferences: null,
  setPreferences: (preferences) => set({ preferences }),
}));
