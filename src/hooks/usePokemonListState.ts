import { useState, useEffect, useMemo } from 'react';
import { usePokemonList } from './usePokemonList';
import { usePokemonByType } from './usePokemonByType';
import { usePokemonSearch } from './usePokemonSearch';
import { useDebounce } from './useDebounce';
import type { SimplifiedPokemon } from '@/types/pokemon';
import { ITEMS_PER_PAGE } from '@constants';

/**
 * Hook customizado que gerencia todo o estado complexo da lista de pokémons
 * Encapsula lógica de paginação, busca, filtro por tipo e acúmulo de dados
 * 
 * @returns Estado e funções para gerenciar a lista de pokémons
 */
export const usePokemonListState = () => {
  // Estado da paginação
  const [page, setPage] = useState(0);
  const [typePage, setTypePage] = useState(0);
  // Cache de dados acumulados por tipo (não apaga quando muda)
  const [accumulatedDataByType, setAccumulatedDataByType] = useState<Record<string, SimplifiedPokemon[]>>({});
  const [hasReachedEndByType, setHasReachedEndByType] = useState<Record<string, boolean>>({});
  
  // Estado da busca
  const [searchText, setSearchText] = useState('');
  const debouncedSearch = useDebounce(searchText, 500);
  
  // Estado do filtro de tipo
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const isTypeFilter = Boolean(selectedType && selectedType !== 'all');
  
  // Dados acumulados do tipo SELECIONADO (usa cache)
  const accumulatedTypeData = selectedType ? (accumulatedDataByType[selectedType] || []) : [];
  const hasReachedEndOfType = selectedType ? (hasReachedEndByType[selectedType] || false) : false;
  
  // Hooks de dados
  const {
    data: listData,
    isLoading: isLoadingList,
    isFetched: isFetchedList,
    error: listError,
    refetch: refetchList,
    isFetching: isFetchingList,
  } = usePokemonList(
    ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
    !isTypeFilter && !debouncedSearch.trim()
  );

  const {
    data: typeData,
    isLoading: isLoadingType,
    isFetched: isFetchedType,
    error: typeError,
    refetch: refetchType,
    isFetching: isFetchingType,
  } = usePokemonByType(selectedType, ITEMS_PER_PAGE, typePage * ITEMS_PER_PAGE, isTypeFilter);

  const {
    data: searchData,
    isLoading: isLoadingSearch,
    isFetched: isFetchedSearch,
    error: searchError,
    refetch: refetchSearch,
    isFetching: isFetchingSearch,
  } = usePokemonSearch(Boolean(debouncedSearch.trim() && !isTypeFilter));

  // Acumular dados do tipo ao invés de substituir
  useEffect(() => {
    if (!selectedType || !isTypeFilter) return;
    
    if (typeData && typeData.length > 0) {
      setAccumulatedDataByType(prev => {
        const current = prev[selectedType] || [];
        // Evitar duplicatas combinando e removendo IDs duplicados
        const combined = [...current, ...typeData];
        const unique = Array.from(new Map(combined.map(p => [p.id, p])).values());
        return {
          ...prev,
          [selectedType]: unique.sort((a, b) => a.id - b.id),
        };
      });
      
      // Se recebeu menos itens que o limite, chegou ao fim
      if (typeData.length < ITEMS_PER_PAGE) {
        setHasReachedEndByType(prev => ({
          ...prev,
          [selectedType]: true,
        }));
      }
    } else if (typeData && typeData.length === 0 && typePage === 0) {
      // Se a primeira página está vazia, chegou ao fim (tipo sem pokémons)
      setHasReachedEndByType(prev => ({
        ...prev,
        [selectedType]: true,
      }));
    }
  }, [typeData, typePage, selectedType, isTypeFilter]);

  // Limpar apenas o typePage (não os dados acumulados) quando muda o tipo
  useEffect(() => {
    setTypePage(0);
  }, [selectedType]);

  // Determinar dados, loading e erro com base no estado atual
  const data = useMemo(() => {
    // Se tem tipo E busca, filtrar nos dados do tipo (não fazer busca global)
    if (isTypeFilter && debouncedSearch.trim()) {
      return accumulatedTypeData;
    }
    // Se só tem busca (sem tipo), usar todos os pokémons
    if (debouncedSearch.trim()) {
      return searchData;
    }
    // Se só tem tipo, usar dados do tipo
    if (isTypeFilter) {
      return accumulatedTypeData;
    }
    // Senão, lista geral
    return listData;
  }, [debouncedSearch, isTypeFilter, searchData, accumulatedTypeData, listData]);

  const isLoading = useMemo(() => {
    if (isTypeFilter && debouncedSearch.trim()) return isLoadingType;
    if (debouncedSearch.trim()) return isLoadingSearch;
    if (isTypeFilter) return isLoadingType;
    return isLoadingList;
  }, [debouncedSearch, isTypeFilter, isLoadingSearch, isLoadingType, isLoadingList]);

  const isFetching = useMemo(() => {
    if (isTypeFilter && debouncedSearch.trim()) return isFetchingType;
    if (debouncedSearch.trim()) return isFetchingSearch;
    if (isTypeFilter) return isFetchingType;
    return isFetchingList;
  }, [debouncedSearch, isTypeFilter, isFetchingSearch, isFetchingType, isFetchingList]);

  const isFetched = useMemo(() => {
    if (isTypeFilter && debouncedSearch.trim()) {
      // Para tipo + busca, verificar se tem dados acumulados ou se terminou sem encontrar
      return isFetchedType && (accumulatedTypeData.length > 0 || hasReachedEndOfType);
    }
    if (debouncedSearch.trim()) {
      return isFetchedSearch;
    }
    if (isTypeFilter) {
      // Para tipo, verificar se tem dados acumulados ou se terminou sem encontrar
      return isFetchedType && (accumulatedTypeData.length > 0 || hasReachedEndOfType);
    }
    return isFetchedList;
  }, [debouncedSearch, isTypeFilter, isFetchedSearch, isFetchedType, isFetchedList, accumulatedTypeData.length, hasReachedEndOfType]);

  const error = useMemo(() => {
    if (isTypeFilter && debouncedSearch.trim()) return typeError;
    if (debouncedSearch.trim()) return searchError;
    if (isTypeFilter) return typeError;
    return listError;
  }, [debouncedSearch, isTypeFilter, searchError, typeError, listError]);

  /**
   * Filtra pokémons localmente com base na busca
   */
  const filteredData = useMemo(() => {
    if (!data) return [];
    
    if (debouncedSearch.trim()) {
      const searchLower = debouncedSearch.toLowerCase();
      return data.filter((pokemon) =>
        pokemon.name.toLowerCase().includes(searchLower) ||
        pokemon.id.toString().includes(searchLower)
      );
    }
    
    return data;
  }, [data, debouncedSearch]);

  /**
   * Recarrega dados mantendo o filtro atual
   */
  const handleRefresh = () => {
    setPage(0);
    setTypePage(0);
    setSearchText('');
    
    if (isTypeFilter) {
      // Limpa dados do tipo específico
      setAccumulatedDataByType(prev => ({
        ...prev,
        [selectedType!]: [],
      }));
      setHasReachedEndByType(prev => ({
        ...prev,
        [selectedType!]: false,
      }));
      refetchType();
    } else {
      refetchList();
    }
  };

  /**
   * Carrega próxima página
   */
  const handleLoadMore = () => {
    if (!isFetching) {
      if (isTypeFilter) {
        if (!hasReachedEndOfType) {
          setTypePage(prev => prev + 1);
        }
      } else {
        setPage(prev => prev + 1);
      }
    }
  };

  return {
    // Estado
    searchText,
    setSearchText,
    selectedType,
    setSelectedType,
    
    // Dados
    filteredData,
    isLoading,
    isFetching,
    isFetched,
    error,
    
    // Ações
    handleRefresh,
    handleLoadMore,
    
    // Metadados
    isTypeFilter,
    hasReachedEndOfType,
    page,
    typePage,
  };
};
