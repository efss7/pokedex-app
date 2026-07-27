import { create } from 'zustand';
import { storageHelpers, storageKeys } from '@utils/storage';

interface FavoritesState {
  favorites: number[];
  hydrated: boolean;
  hydrate: () => Promise<void>;
  addFavorite: (pokemonId: number) => void;
  removeFavorite: (pokemonId: number) => void;
  toggleFavorite: (pokemonId: number) => void;
  isFavorite: (pokemonId: number) => boolean;
  clearFavorites: () => void;
}

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  favorites: [],
  hydrated: false,
  hydrate: async () => {
    if (get().hydrated) {
      return;
    }
    const stored = await storageHelpers.getObject<number[]>(storageKeys.FAVORITES);
    set((state) => ({
      favorites: state.favorites.length > 0
        ? state.favorites
        : Array.isArray(stored)
          ? stored
          : [],
      hydrated: true,
    }));
  },
  addFavorite: (pokemonId) => {
    const current = get().favorites;
    if (current.includes(pokemonId)) {
      return;
    }
    const updated = [...current, pokemonId];
    void storageHelpers.setObject(storageKeys.FAVORITES, updated);
    set({ favorites: updated });
  },
  removeFavorite: (pokemonId) => {
    const updated = get().favorites.filter((id) => id !== pokemonId);
    void storageHelpers.setObject(storageKeys.FAVORITES, updated);
    set({ favorites: updated });
  },
  toggleFavorite: (pokemonId) => {
    const { favorites, addFavorite, removeFavorite } = get();
    if (favorites.includes(pokemonId)) {
      removeFavorite(pokemonId);
      return;
    }
    addFavorite(pokemonId);
  },
  isFavorite: (pokemonId) => {
    return get().favorites.includes(pokemonId);
  },
  clearFavorites: () => {
    void storageHelpers.removeItem(storageKeys.FAVORITES);
    set({ favorites: [] });
  },
}));

void useFavoritesStore.getState().hydrate();
