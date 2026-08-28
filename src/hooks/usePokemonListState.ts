import { useMemo, useState } from 'react';
import { usePokemonListInfinite } from './usePokemonList';
import { usePokemonByTypeInfinite } from './usePokemonByType';
import { usePokemonIndex } from './usePokemonIndex';
import { useAbilityRosterIds, useTypeRosterIds } from './useFilterData';
import { GENERATIONS } from '@constants/index';
import type { SimplifiedPokemon } from '@/types/pokemon';

/**
 * Estado da lista: busca, filtro por tipo, filtros avançados (geração +
 * habilidade) e paginação.
 *
 * Dois caminhos:
 *  - Infinito (scroll): quando NÃO há busca nem filtro avançado — lista geral
 *    ou lista de um tipo (useInfiniteQuery, tipos já hidratados).
 *  - Índice (em memória): quando há busca OU filtro avançado — filtra o índice
 *    por tipo/habilidade (rosters de IDs), geração (faixa de ID) e texto. Os
 *    tipos dos cards são hidratados sob demanda.
 */
export const usePokemonListState = () => {
  // O termo já vem "assentado" (debounced) do <SearchBar>.
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedGeneration, setSelectedGeneration] = useState<number | null>(null);
  const [selectedAbility, setSelectedAbility] = useState<string | null>(null);

  const search = searchTerm.trim().toLowerCase();
  const isSearching = search.length > 0;
  const isTypeFilter = Boolean(selectedType && selectedType !== 'all');
  const isAdvanced = selectedGeneration !== null || selectedAbility !== null;

  // Caminho "índice" cobre busca e/ou filtros avançados (combináveis com tipo).
  const useIndexPath = isSearching || isAdvanced;

  // --- Fontes de dados ---
  const listQuery = usePokemonListInfinite(!useIndexPath && !isTypeFilter);
  const typeQuery = usePokemonByTypeInfinite(selectedType, !useIndexPath && isTypeFilter);
  const indexQuery = usePokemonIndex(useIndexPath);
  const abilityRoster = useAbilityRosterIds(selectedAbility, Boolean(selectedAbility));
  const typeRoster = useTypeRosterIds(selectedType, useIndexPath && isTypeFilter);

  const activeInfinite = isTypeFilter ? typeQuery : listQuery;

  // --- Dados exibidos ---
  const data = useMemo<SimplifiedPokemon[]>(() => {
    if (!useIndexPath) {
      return (activeInfinite.data?.pages.flat() ?? []) as SimplifiedPokemon[];
    }

    let entries = indexQuery.data ?? [];

    if (isTypeFilter) {
      const ids = new Set(typeRoster.data ?? []);
      entries = entries.filter((p) => ids.has(p.id));
    }
    if (selectedAbility) {
      const ids = new Set(abilityRoster.data ?? []);
      entries = entries.filter((p) => ids.has(p.id));
    }
    if (selectedGeneration !== null) {
      const gen = GENERATIONS.find((g) => g.id === selectedGeneration);
      if (gen) entries = entries.filter((p) => p.id >= gen.range[0] && p.id <= gen.range[1]);
    }
    if (isSearching) {
      entries = entries.filter(
        (p) => p.name.toLowerCase().includes(search) || p.id.toString().includes(search)
      );
    }
    return entries;
  }, [
    useIndexPath,
    activeInfinite.data,
    indexQuery.data,
    isTypeFilter,
    typeRoster.data,
    selectedAbility,
    abilityRoster.data,
    selectedGeneration,
    isSearching,
    search,
  ]);

  // --- Flags de estado ---
  const indexLoading =
    indexQuery.isLoading ||
    (isTypeFilter && typeRoster.isLoading) ||
    (Boolean(selectedAbility) && abilityRoster.isLoading);
  const indexFetching =
    indexQuery.isFetching || typeRoster.isFetching || abilityRoster.isFetching;

  const isLoading = useIndexPath ? indexLoading : activeInfinite.isLoading;
  const isRefreshing = useIndexPath ? indexFetching : activeInfinite.isRefetching;
  const isFetchingNextPage = useIndexPath ? false : activeInfinite.isFetchingNextPage;
  const isFetched = useIndexPath ? indexQuery.isFetched : activeInfinite.isFetched;
  const error = useIndexPath
    ? indexQuery.error || abilityRoster.error || typeRoster.error
    : activeInfinite.error;
  const hasReachedEnd = useIndexPath ? true : !activeInfinite.hasNextPage;

  // --- Ações ---
  const handleRefresh = () => {
    if (useIndexPath) {
      indexQuery.refetch();
      if (selectedAbility) abilityRoster.refetch();
      if (isTypeFilter) typeRoster.refetch();
    } else if (isTypeFilter) {
      typeQuery.refetch();
    } else {
      listQuery.refetch();
    }
  };

  const handleLoadMore = () => {
    if (useIndexPath) return;
    if (activeInfinite.hasNextPage && !activeInfinite.isFetchingNextPage) {
      activeInfinite.fetchNextPage();
    }
  };

  const clearAdvancedFilters = () => {
    setSelectedGeneration(null);
    setSelectedAbility(null);
  };

  const advancedCount = (selectedGeneration !== null ? 1 : 0) + (selectedAbility ? 1 : 0);

  return {
    // Estado
    searchTerm,
    setSearchTerm,
    selectedType,
    setSelectedType,
    selectedGeneration,
    setSelectedGeneration,
    selectedAbility,
    setSelectedAbility,

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
    clearAdvancedFilters,

    // Metadados
    isSearching,
    isTypeFilter,
    isAdvanced,
    isClientFiltered: useIndexPath,
    hasReachedEnd,
    advancedCount,
  };
};
