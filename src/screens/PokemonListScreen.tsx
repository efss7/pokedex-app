import React from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { useAppTheme } from '@theme/ThemeProvider';
import { useThemeStore } from '@store/themeStore';
import { useAuthStore } from '@store/authStore';
import { PokemonCardSkeleton } from '@components/pokemon/PokemonCardSkeleton';
import { PokemonCard } from '@components/pokemon/PokemonCard';
import { TypeFilter } from '@components/pokemon/TypeFilter';
import { SearchBar } from '@components/pokemon/SearchBar';
import { ListFooter } from '@components/pokemon/ListFooter';
import { usePokemonListState } from '@hooks/usePokemonListState';
import type { SimplifiedPokemon } from '@/types/pokemon';
import type { RootStackParamList } from '@navigation/AppNavigator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'PokemonList'>;

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
  const navigation = useNavigation<NavigationProp>();
  const themePreference = useThemeStore((state) => state.preference);
  const cyclePreference = useThemeStore((state) => state.cyclePreference);
  const isAuthenticated = useAuthStore((state) => state.status === 'authenticated');

  const themeIcon =
    themePreference === 'system'
      ? 'phone-portrait-outline'
      : themePreference === 'dark'
      ? 'moon'
      : 'sunny';

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={cyclePreference}
            style={styles.headerButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityRole="button"
            accessibilityLabel={`Tema: ${themePreference}. Toque para alternar`}
          >
            <Ionicons name={themeIcon} size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('Favorites')}
            style={styles.headerButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityRole="button"
            accessibilityLabel="Ver favoritos"
          >
            <Ionicons name="heart" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('Account')}
            style={styles.headerButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityRole="button"
            accessibilityLabel="Conta"
          >
            <Ionicons
              name={isAuthenticated ? 'person-circle' : 'person-circle-outline'}
              size={22}
              color="#FFFFFF"
            />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, cyclePreference, themeIcon, themePreference, isAuthenticated]);

  // Hook customizado que gerencia todo o estado complexo
  const {
    searchTerm,
    setSearchTerm,
    selectedType,
    setSelectedType,
    data: filteredData,
    isLoading,
    isRefreshing,
    isFetchingNextPage,
    isFetched,
    error,
    handleRefresh,
    handleLoadMore,
    isSearching,
    isTypeFilter,
    hasReachedEnd,
  } = usePokemonListState();

  /**
   * Renderiza cada item da lista
   */
  const renderItem = ({ item }: { item: SimplifiedPokemon }) => (
    <PokemonCard
      pokemon={item}
      onPress={() => {
        navigation.navigate('PokemonDetail', { pokemonId: item.id });
      }}
    />
  );

  /**
   * Renderiza loading/mensagem no fim da lista
   */
  const renderFooter = () => (
    <ListFooter
      isLoading={isFetchingNextPage}
      isTypeFilter={isTypeFilter}
      hasReachedEnd={hasReachedEnd}
      itemCount={filteredData.length}
    />
  );

  /**
   * Renderiza mensagem quando não há resultados
   */
  const renderEmptyComponent = () => {
    // Não mostrar nada enquanto não terminou o fetch ou está carregando
    if (!isFetched || isLoading) return null;

    // Não mostrar se tem dados na lista
    if (filteredData.length > 0) return null;

    // Só mostrar se tem um filtro ativo (busca ou tipo)
    const hasActiveFilter = searchTerm.trim() || isTypeFilter;
    if (!hasActiveFilter) return null;

    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="search" size={44} color={theme.colors.textSecondary} style={styles.emptyIcon} />
        <Text style={[styles.emptyText, { color: theme.colors.text }]}>
          Nenhum pokémon encontrado
        </Text>
        <Text style={[styles.emptySubtext, { color: theme.colors.textSecondary }]}>
          {searchTerm.trim() && isTypeFilter
            ? `Nenhum pokémon do tipo "${selectedType}" corresponde a "${searchTerm}"`
            : searchTerm.trim()
            ? `Nenhum resultado para "${searchTerm}"`
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
        <View style={styles.errorRow}>
          <MaterialIcons name="error-outline" size={20} color={theme.colors.error} style={styles.errorIcon} />
          <Text style={[styles.errorText, { color: theme.colors.error }]}>
            Erro ao carregar pokémons
          </Text>
        </View>
        <Text style={[styles.errorSubtext, { color: theme.colors.textSecondary }]}>
          {error.message}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Barra de busca (componente isolado: não re-renderiza a lista) */}
      <SearchBar onChangeTerm={setSearchTerm} loading={isSearching && isLoading} />

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
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }

        // Infinite scroll (desabilita durante busca)
        onEndReached={isSearching ? undefined : handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={isSearching ? null : renderFooter}

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
  emptyIcon: {
    marginBottom: 12,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  errorIcon: {
    marginRight: 8,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  headerButton: {
    paddingHorizontal: 8,
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
