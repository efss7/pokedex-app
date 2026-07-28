import { create } from 'zustand';
import { storageHelpers, storageKeys } from '@utils/storage';
import { isSupabaseConfigured } from '@services/supabase';
import { useAuthStore } from '@store/authStore';
import {
  getRemoteFavoriteIds,
  addRemoteFavorites,
  addRemoteFavorite,
  removeRemoteFavorite,
} from '@services/favoritesService';

interface FavoritesState {
  favorites: number[];
  hydrated: boolean;
  syncing: boolean;
  hydrate: () => Promise<void>;
  addFavorite: (pokemonId: number) => void;
  removeFavorite: (pokemonId: number) => void;
  toggleFavorite: (pokemonId: number) => void;
  isFavorite: (pokemonId: number) => boolean;
  clearFavorites: () => void;
  /** Mescla favoritos locais e da nuvem quando o usuário loga. */
  syncWithCloud: () => Promise<void>;
}

/** Usuário logado (ou null) — usado para decidir se espelha na nuvem. */
const currentUser = () => {
  const { status, user } = useAuthStore.getState();
  return status === 'authenticated' && user && isSupabaseConfigured ? user : null;
};

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  favorites: [],
  hydrated: false,
  syncing: false,

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

    const user = currentUser();
    if (user) {
      void addRemoteFavorite(user.id, pokemonId).catch((e) =>
        console.warn('favorites: falha ao adicionar na nuvem', e)
      );
    }
  },

  removeFavorite: (pokemonId) => {
    const updated = get().favorites.filter((id) => id !== pokemonId);
    void storageHelpers.setObject(storageKeys.FAVORITES, updated);
    set({ favorites: updated });

    if (currentUser()) {
      void removeRemoteFavorite(pokemonId).catch((e) =>
        console.warn('favorites: falha ao remover na nuvem', e)
      );
    }
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

  syncWithCloud: async () => {
    const user = currentUser();
    if (!user || get().syncing) return;

    set({ syncing: true });
    try {
      const remote = await getRemoteFavoriteIds();
      const local = get().favorites;

      // Merge sem perda: união de local + nuvem.
      const merged = Array.from(new Set([...remote, ...local])).sort((a, b) => a - b);

      // Sobe os que existiam só localmente.
      const onlyLocal = merged.filter((id) => !remote.includes(id));
      await addRemoteFavorites(user.id, onlyLocal);

      void storageHelpers.setObject(storageKeys.FAVORITES, merged);
      set({ favorites: merged });
    } catch (e) {
      console.warn('favorites: sync com a nuvem falhou', e);
    } finally {
      set({ syncing: false });
    }
  },
}));

void useFavoritesStore.getState().hydrate();
