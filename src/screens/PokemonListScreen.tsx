import React from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  RefreshControl,
  TextInput,
} from 'react-native';
import { useAppTheme } from '@theme/ThemeProvider';
import { PokemonCardSkeleton } from '@components/pokemon/PokemonCardSkeleton';
import { PokemonCard } from '@components/pokemon/PokemonCard';
import { TypeFilter } from '@components/pokemon/TypeFilter';
import { ListFooter } from '@components/pokemon/ListFooter';
import { usePokemonListState } from '@hooks/usePokemonListState';
import type { SimplifiedPokemon } from '@/types/pokemon';

// Tipo para items do FlatList (pokemon ou skeleton)
type ListItem = SimplifiedPokemon | { id: string; isLoading: true };

// Type guard para verificar se é skeleton
const isSkeletonItem = (item: ListItem): item is { id: string; isLoading: true } => {
  return 'isLoading' in item && item.isLoading === true;
};

/**
 * Tela principal - Lista de Pokémons
 * 
 * Features:
 * - Lista paginada com FlatList
 * - Infinite scroll (carrega mais ao chegar no fim)
 * - Pull to refresh
 * - Skeleton loading
 * - Otimização de performance
 */
export const PokemonListScreen = () => {
  const theme = useAppTheme();
  
  // Hook customizado que gerencia todo o estado complexo
  const {
    searchText,
    setSearchText,
    selectedType,
    setSelectedType,
    filteredData,
    isLoading,
    isFetching,
    isFetched,
    error,
    handleRefresh,
    handleLoadMore,
    isTypeFilter,
    hasReachedEndOfType,
    page,
    typePage,
  } = usePokemonListState();

  /**
   * Renderiza cada item da lista
   */
  const renderItem = ({ item }: { item: SimplifiedPokemon }) => (
    <PokemonCard
      pokemon={item}
      onPress={() => {
        // TODO: Navegar para tela de detalhes
      }}
    />
  );

  /**
   * Renderiza loading/mensagem no fim da lista
   */
  const renderFooter = () => (
    <ListFooter
      isLoading={isFetching}
      isTypeFilter={isTypeFilter}
      hasReachedEnd={hasReachedEndOfType}
      itemCount={filteredData.length}
    />
  );

  /**
   * Renderiza mensagem quando não há resultados
   */
  const renderEmptyComponent = () => {
    // Não mostrar nada enquanto não terminou o fetch ou está buscando novos dados
    if (!isFetched || isFetching) return null;

    // Não mostrar se tem dados na lista
    if (filteredData.length > 0) return null;

    // Só mostrar se tem um filtro ativo (busca ou tipo)
    const hasActiveFilter = searchText.trim() || isTypeFilter;
    if (!hasActiveFilter) return null;

    return (
      <View style={styles.emptyContainer}>
        <Text style={[styles.emptyEmoji]}>🔍</Text>
        <Text style={[styles.emptyText, { color: theme.colors.text }]}>
          Nenhum pokémon encontrado
        </Text>
        <Text style={[styles.emptySubtext, { color: theme.colors.textSecondary }]}>
          {searchText.trim() && isTypeFilter
            ? `Nenhum pokémon do tipo "${selectedType}" corresponde a "${searchText}"`
            : searchText.trim()
            ? `Nenhum resultado para "${searchText}"`
            : `Nenhum pokémon do tipo "${selectedType}"`}
        </Text>
      </View>
    );
  };

  /**
   * Renderiza mensagem de erro
   */
  if (error && !isLoading && filteredData.length === 0) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.errorText, { color: theme.colors.error }]}>
          ❌ Erro ao carregar pokémons
        </Text>
        <Text style={[styles.errorSubtext, { color: theme.colors.textSecondary }]}>
          {error.message}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Barra de busca */}
      <View style={[styles.searchContainer, { backgroundColor: theme.colors.background }]}>
        <TextInput
          style={[
            styles.searchInput,
            {
              backgroundColor: theme.colors.surface,
              color: theme.colors.text,
              borderColor: theme.colors.border,
            },
          ]}
          placeholder="Buscar pokémon por nome ou ID..."
          placeholderTextColor={theme.colors.textSecondary}
          value={searchText}
          onChangeText={setSearchText}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {/* {(searchText.length > 0 || isTypeFilter) && (
          <Text style={[styles.resultCount, { color: theme.colors.textSecondary }]}>
            {filteredData.length} resultado{filteredData.length !== 1 ? 's' : ''}
          </Text>
        )} */}
      </View>

      {/* Filtro por tipo */}
      <TypeFilter
        selectedType={selectedType}
        onSelectType={setSelectedType}
      />

      <FlatList<ListItem>
        data={isLoading && !filteredData.length ? Array.from({ length: 6 }, (_, i) => ({ id: `skeleton-${i}`, isLoading: true as const })) : filteredData}
        renderItem={({item}) => isSkeletonItem(item) ? <PokemonCardSkeleton /> : renderItem({item})}
        keyExtractor={(item) => isSkeletonItem(item) ? item.id : item.id.toString()}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        scrollEnabled={!isLoading || filteredData.length > 0}
        ListEmptyComponent={renderEmptyComponent}
        
        // Pull to refresh
        refreshControl={
          <RefreshControl
            refreshing={isFetching && (isTypeFilter ? typePage === 0 : page === 0)}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
        
        // Infinite scroll (desabilita durante busca)
        onEndReached={searchText.trim() ? undefined : handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={searchText.trim() ? null : renderFooter}
        
        // Performance
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        initialNumToRender={10}
        windowSize={10}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  searchContainer: {
    padding: 16,
    paddingBottom: 8,
  },
  searchInput: {
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
  },
  resultCount: {
    marginTop: 8,
    fontSize: 14,
    textAlign: 'center',
  },
  listContent: {
    padding: 16,
  },
  row: {
    justifyContent: 'space-between',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
});