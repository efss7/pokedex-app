import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface WeeklyPokemonState {
  /** Se o usuário ativou a notificação "Pokémon da semana". */
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
}

export const useWeeklyPokemonStore = create<WeeklyPokemonState>()(
  persist(
    (set) => ({
      enabled: false,
      setEnabled: (enabled) => set({ enabled }),
    }),
    {
      name: 'weekly-pokemon',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
