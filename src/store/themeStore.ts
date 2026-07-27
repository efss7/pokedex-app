import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemePreference = 'light' | 'dark' | 'system';

interface ThemeState {
  /** Preferência escolhida pelo usuário. 'system' segue o tema do aparelho. */
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
  /** Alterna entre system → light → dark → system. */
  cyclePreference: () => void;
}

const ORDER: ThemePreference[] = ['system', 'light', 'dark'];

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      preference: 'system',
      setPreference: (preference) => set({ preference }),
      cyclePreference: () => {
        const index = ORDER.indexOf(get().preference);
        set({ preference: ORDER[(index + 1) % ORDER.length] });
      },
    }),
    {
      name: 'theme-preference',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
