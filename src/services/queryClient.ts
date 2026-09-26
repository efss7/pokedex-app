import { QueryClient, onlineManager } from '@tanstack/react-query';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

/**
 * No React Native o TanStack Query não detecta conectividade sozinho (ele
 * depende de eventos `online`/`offline` do browser, que não existem aqui).
 * Sem isto ele se considera sempre online: offline as queries disparam, gastam
 * os retries e falham, em vez de pausar e servir o cache na hora. Ligando o
 * NetInfo, elas ficam `paused` sem rede e refazem sozinhas quando ela volta.
 */
onlineManager.setEventListener((setOnline) =>
  NetInfo.addEventListener((state) => {
    setOnline(Boolean(state.isConnected));
  })
);

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
