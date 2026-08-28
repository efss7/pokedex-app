import React from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@theme/ThemeProvider';
import { PokemonCard } from '@components/pokemon/PokemonCard';
import { useFavoritesStore } from '@store/favoritesStore';
import { usePokemonIndex } from '@hooks/usePokemonIndex';
import type { SimplifiedPokemon } from '@/types/pokemon';
import type { RootStackParamList } from '@navigation/AppNavigator';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Favorites'>;

export const FavoritesScreen = () => {
  const theme = useAppTheme();
  const navigation = useNavigation<NavigationProp>();
  const favorites = useFavoritesStore((state) => state.favorites);
  const [sortOption, setSortOption] = React.useState<'id-asc' | 'id-desc' | 'name-asc' | 'name-desc'>(
    'id-asc'
  );
  const [isSortOpen, setIsSortOpen] = React.useState(false);

  // Botão de ranking no header (só faz sentido com favoritos)
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () =>
        favorites.length > 0 ? (
          <TouchableOpacity
            onPress={() => navigation.navigate('Ranking')}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityRole="button"
            accessibilityLabel="Ranking dos favoritos"
            style={styles.rankingButton}
          >
            <Ionicons name="podium" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        ) : undefined,
    });
  }, [navigation, favorites.length]);

  // Mapeia os favoritos a partir do índice em memória (sem N requests).
  // Os tipos são hidratados sob demanda pelo próprio card.
  const { data: index, isLoading, error, refetch, isFetching } = usePokemonIndex(
    favorites.length > 0
  );

  const favoriteList = React.useMemo<SimplifiedPokemon[]>(() => {
    if (!index) return [];
    const byId = new Map(index.map((p) => [p.id, p]));
    return favorites
      .map((id) => byId.get(id))
      .filter((p): p is SimplifiedPokemon => Boolean(p));
  }, [index, favorites]);
  const sortOptions = [
    { value: 'id-asc', label: 'ID crescente' },
    { value: 'id-desc', label: 'ID decrescente' },
    { value: 'name-asc', label: 'Nome A-Z' },
    { value: 'name-desc', label: 'Nome Z-A' },
  ] as const;

  const sortedFavorites = React.useMemo(() => {
    const list = [...favoriteList];
    switch (sortOption) {
      case 'id-desc':
        return list.sort((a, b) => b.id - a.id);
      case 'name-asc':
        return list.sort((a, b) => a.name.localeCompare(b.name));
      case 'name-desc':
        return list.sort((a, b) => b.name.localeCompare(a.name));
      case 'id-asc':
      default:
        return list.sort((a, b) => a.id - b.id);
    }
  }, [favoriteList, sortOption]);

  const activeSortLabel = sortOptions.find((option) => option.value === sortOption)?.label ?? 'ID crescente';

  const renderItem = ({ item }: { item: SimplifiedPokemon }) => (
    <PokemonCard
      pokemon={item}
      onPress={() => {
        navigation.navigate('PokemonDetail', { pokemonId: item.id });
      }}
    />
  );

  if (error && !isLoading && favorites.length > 0) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: theme.colors.background }]}> 
        <Ionicons name="alert-circle-outline" size={20} color={theme.colors.error} style={styles.errorIcon} />
        <Text style={[styles.errorText, { color: theme.colors.error }]}> 
          Erro ao carregar favoritos
        </Text>
        <Text style={[styles.errorSubtext, { color: theme.colors.textSecondary }]}> 
          {(error as Error).message}
        </Text>
      </View>
    );
  }

  if (!isLoading && favorites.length === 0) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: theme.colors.background }]}> 
        <View style={styles.emptyIconCircle}>
          <Ionicons name="heart-outline" size={28} color={theme.colors.textSecondary} />
        </View>
        <Text style={[styles.emptyTitle, { color: theme.colors.text }]}> 
          Sua lista esta vazia
        </Text>
        <Text style={[styles.emptySubtext, { color: theme.colors.textSecondary }]}> 
          Toque no coracao em um Pokemon para adicionar aqui.
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}> 
      <FlatList
        data={sortedFavorites}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.headerContainer}>
            <View style={[styles.sortBar, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}> 
              <Text style={[styles.sortLabel, { color: theme.colors.textSecondary }]}>Ordenar por</Text>
              <TouchableOpacity
                onPress={() => setIsSortOpen((prev) => !prev)}
                style={styles.sortButton}
                activeOpacity={0.8}
              >
                <Text style={[styles.sortValue, { color: theme.colors.text }]}> 
                  {activeSortLabel}
                </Text>
                <Ionicons
                  name={isSortOpen ? 'chevron-up' : 'chevron-down'}
                  size={16}
                  color={theme.colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
            {isSortOpen && (
              <View style={[styles.sortMenu, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}> 
                {sortOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    onPress={() => {
                      setSortOption(option.value);
                      setIsSortOpen(false);
                    }}
                    style={styles.sortOption}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.sortOptionText,
                        { color: option.value === sortOption ? theme.colors.primary : theme.colors.text },
                      ]}
                    >
                      {option.label}
                    </Text>
                    {option.value === sortOption && (
                      <Ionicons name="checkmark" size={16} color={theme.colors.primary} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={isFetching}
            onRefresh={refetch}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  rankingButton: {
    paddingHorizontal: 16,
  },
  listContent: {
    padding: 16,
  },
  headerContainer: {
    marginBottom: 12,
  },
  sortBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  sortLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sortValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  sortMenu: {
    marginTop: 8,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  sortOptionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  row: {
    justifyContent: 'space-between',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.06)',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  errorIcon: {
    marginBottom: 8,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 6,
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
});
