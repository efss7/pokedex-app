import { useSyncExternalStore } from 'react';
import { onlineManager } from '@tanstack/react-query';

/**
 * Conectividade reativa, lendo o mesmo `onlineManager` que o TanStack Query usa
 * para pausar as queries (a fonte é o NetInfo, ligado em `services/queryClient`).
 * Serve para a UI explicar a ausência de dados: sem rede e sem cache, a query
 * fica `paused` — não é loading nem erro, então a tela ficaria muda.
 */
export const useIsOnline = () =>
  useSyncExternalStore(
    (onChange) => onlineManager.subscribe(onChange),
    () => onlineManager.isOnline()
  );
