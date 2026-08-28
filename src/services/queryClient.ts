import { QueryClient } from '@tanstack/react-query';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5, // 5 minutos "fresco"
      // 24h: o cache precisa viver tempo suficiente para ser persistido e
      // restaurado (offline-first). staleTime continua controlando o refetch.
      gcTime: 1000 * 60 * 60 * 24,
      refetchOnWindowFocus: false,
    },
  },
});

/**
 * Persiste o cache do TanStack Query no AsyncStorage. Ao reabrir o app (mesmo
 * offline), os dados já vistos são restaurados. Ver PersistQueryClientProvider
 * em App.tsx.
 */
export const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: 'POKEDEX_QUERY_CACHE',
});
