import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { ThemeProvider } from '@theme/ThemeProvider';
import { ErrorBoundary } from '@components/common/ErrorBoundary';
import { queryClient, asyncStoragePersister } from '@services/queryClient';
import { AppNavigator } from '@navigation/AppNavigator';
import { useAuthStore } from '@store/authStore';
import { useFavoritesStore } from '@store/favoritesStore';

export default function App() {
  React.useEffect(() => {
    // Ao logar (loading/deslogado → autenticado), mescla os favoritos com a nuvem.
    const unsubscribe = useAuthStore.subscribe((state, prev) => {
      if (state.status === 'authenticated' && prev.status !== 'authenticated') {
        void useFavoritesStore.getState().syncWithCloud();
      }
    });

    // Restaura a sessão salva e passa a ouvir mudanças de autenticação.
    useAuthStore.getState().initialize();

    return unsubscribe;
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <PersistQueryClientProvider
          client={queryClient}
          persistOptions={{
            persister: asyncStoragePersister,
            maxAge: 1000 * 60 * 60 * 24, // descarta o cache persistido após 24h
            buster: 'v1', // troque para invalidar o cache antigo
          }}
          onSuccess={() => {
            // [DEBUG] prova que o cache foi restaurado do disco no boot.
            const count = queryClient.getQueryCache().getAll().length;
            console.log(`[persist] cache restaurado do disco: ${count} queries`);
          }}
        >
          <ThemeProvider>
            <ErrorBoundary>
              <AppNavigator />
            </ErrorBoundary>
          </ThemeProvider>
        </PersistQueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
