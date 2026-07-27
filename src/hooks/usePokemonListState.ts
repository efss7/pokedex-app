import { useMemo, useState } from 'react';
import { usePokemonListInfinite } from './usePokemonList';
import { usePokemonByTypeInfinite } from './usePokemonByType';
import { usePokemonIndex } from './usePokemonIndex';
import type { SimplifiedPokemon } from '@/types/pokemon';

/**
 * Estado da lista de pokémons: busca, filtro por tipo e paginação.
 *
 * São três modos, mutuamente exclusivos:
 *  - Busca por nome/ID → filtra o ÍNDICE em memória (1 request, instantâneo).
 *  - Filtro por tipo    → scroll infinito da lista daquele tipo.
 *  - Padrão             → scroll infinito da lista geral.
 *
 * A paginação e o acúmulo de páginas ficam a cargo do TanStack Query
 * (useInfiniteQuery), o que elimina o controle manual de página/acúmulo.
 */
export const usePokemonListState = () => {
  // O termo já vem "assentado" (debounced) do <SearchBar>.
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const search = searchTerm.trim().toLowerCase();

  const isSearching = search.length > 0;
  const isTypeFilter = Boolean(selectedType && selectedType !== 'all');

  // --- Fontes de dados (cada uma só ativa no seu modo) ---
  const listQuery = usePokemonListInfinite(!isSearching && !isTypeFilter);
  const typeQuery = usePokemonByTypeInfinite(selectedType, isTypeFilter && !isSearching);
  const indexQuery = usePokemonIndex(isSearching);

  // Escolhe a query "ativa" para os flags de estado.
  const activeInfinite = isTypeFilter ? typeQuery : listQuery;

  // --- Dados exibidos ---
  const data = useMemo<SimplifiedPokemon[]>(() => {
    if (isSearching) {
      const source = indexQuery.data ?? [];
      return source.filter(
        (p) => p.name.toLowerCase().includes(search) || p.id.toString().includes(search)
      );
    }
    return (activeInfinite.data?.pages.flat() ?? []) as SimplifiedPokemon[];
  }, [isSearching, indexQuery.data, activeInfinite.data, search]);

  // --- Flags de estado ---
  const isLoading = isSearching ? indexQuery.isLoading : activeInfinite.isLoading;
  const isRefreshing = isSearching ? indexQuery.isFetching : activeInfinite.isRefetching;
  const isFetchingNextPage = isSearching ? false : activeInfinite.isFetchingNextPage;
  const isFetched = isSearching ? indexQuery.isFetched : activeInfinite.isFetched;
  const error = isSearching ? indexQuery.error : activeInfinite.error;
  const hasReachedEnd = isSearching ? true : !activeInfinite.hasNextPage;

  // --- Ações ---
  const handleRefresh = () => {
    if (isSearching) {
      indexQuery.refetch();
    } else if (isTypeFilter) {
      typeQuery.refetch();
    } else {
      listQuery.refetch();
    }
  };

  const handleLoadMore = () => {
    if (isSearching) return;
    if (activeInfinite.hasNextPage && !activeInfinite.isFetchingNextPage) {
      activeInfinite.fetchNextPage();
    }
  };

  return {
    // Estado
    searchTerm,
    setSearchTerm,
    selectedType,
    setSelectedType,

    // Dados
    data,
    isLoading,
    isRefreshing,
    isFetchingNextPage,
    isFetched,
    error,

    // Ações
    handleRefresh,
    handleLoadMore,

    // Metadados
    isSearching,
    isTypeFilter,
    hasReachedEnd,
  };
};
