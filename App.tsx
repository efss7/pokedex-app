import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@theme/ThemeProvider';
import { ErrorBoundary } from '@components/common/ErrorBoundary';
import { queryClient } from '@services/queryClient';
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
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <ErrorBoundary>
              <AppNavigator />
            </ErrorBoundary>
          </ThemeProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
