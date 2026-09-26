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
import { useWeeklyPokemonStore } from '@store/weeklyPokemonStore';
import { refreshWeeklyPokemon } from '@services/notificationService';

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

    // A fila da notificação semanal é finita (8 semanas): recompõe quando vai
    // secando. O store é persistido e hidrata de forma assíncrona, então não dá
    // para ler `enabled` de imediato.
    const refreshWeekly = () => {
      if (!useWeeklyPokemonStore.getState().enabled) return;
      // Sem rede no boot não tem o que fazer — tenta de novo na próxima abertura.
      void refreshWeeklyPokemon().catch(() => {});
    };

    let unsubscribeHydration: (() => void) | undefined;
    if (useWeeklyPokemonStore.persist.hasHydrated()) {
      refreshWeekly();
    } else {
      unsubscribeHydration = useWeeklyPokemonStore.persist.onFinishHydration(refreshWeekly);
    }

    return () => {
      unsubscribe();
      unsubscribeHydration?.();
    };
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
