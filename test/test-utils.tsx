import React, { ReactElement, ReactNode } from 'react';
import { render, RenderOptions } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@theme/ThemeProvider';

/**
 * Render com os providers que as telas esperam. Cada teste recebe um
 * QueryClient próprio, sem retry, para que um teste não veja o cache do outro.
 */
const criarQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0, staleTime: 0 },
    },
  });

/** O `render` do RNTL 14 é assíncrono — precisa de await. */
export const renderComProviders = async (ui: ReactElement, options?: RenderOptions) => {
  const queryClient = criarQueryClient();

  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>{children}</ThemeProvider>
    </QueryClientProvider>
  );

  return { queryClient, ...(await render(ui, { wrapper: Wrapper, ...options })) };
};

export * from '@testing-library/react-native';
