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
    const unsubscribe = useAuthStore.subscribe((state, prev) => {
      // Ao logar (loading/deslogado → autenticado), mescla os favoritos com a nuvem.
      if (state.status === 'authenticated' && prev.status !== 'authenticated') {
        void useFavoritesStore.getState().syncWithCloud();
      }

      // Ao sair, descarta a lista local — ela é da conta que saiu e já está na
      // nuvem. Sem isso, o próximo usuário a logar neste aparelho mesclaria os
      // favoritos do anterior e os enviaria para a conta dele.
      if (prev.status === 'authenticated' && state.status === 'unauthenticated') {
        useFavoritesStore.getState().clearFavorites();
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
