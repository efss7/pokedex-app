import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useQueries } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAppTheme } from '@theme/ThemeProvider';
import { useFavoritesStore } from '@store/favoritesStore';
import { getPokemonDetails } from '@services/pokemonService';
import { STAT_NAMES, STAT_COLORS } from '@constants/index';
import type { Pokemon } from '@/types/pokemon';
import type { RootStackParamList } from '@navigation/AppNavigator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Ranking'>;

type StatKey =
  | 'total'
  | 'hp'
  | 'attack'
  | 'defense'
  | 'special-attack'
  | 'special-defense'
  | 'speed';

const STAT_OPTIONS: { key: StatKey; label: string }[] = [
  { key: 'total', label: 'Total' },
  { key: 'hp', label: STAT_NAMES.hp },
  { key: 'attack', label: STAT_NAMES.attack },
  { key: 'defense', label: STAT_NAMES.defense },
  { key: 'special-attack', label: STAT_NAMES['special-attack'] },
  { key: 'special-defense', label: STAT_NAMES['special-defense'] },
  { key: 'speed', label: STAT_NAMES.speed },
];

const MEDALS: Record<number, string> = { 0: '#FFD700', 1: '#C0C0C0', 2: '#CD7F32' };

const getStatValue = (pokemon: Pokemon, key: StatKey): number => {
  if (key === 'total') return pokemon.stats.reduce((sum, s) => sum + s.base_stat, 0);
  return pokemon.stats.find((s) => s.stat.name === key)?.base_stat ?? 0;
};

/**
 * Ranking dos favoritos, ordenável por stat. Busca os detalhes só dos
 * favoritos (conjunto pequeno) — nada de varrer a dex inteira.
 */
export const RankingScreen = () => {
  const theme = useAppTheme();
  const navigation = useNavigation<NavigationProp>();
  const favorites = useFavoritesStore((state) => state.favorites);
  const [sortStat, setSortStat] = React.useState<StatKey>('total');

  const results = useQueries({
    queries: favorites.map((id) => ({
      queryKey: ['pokemon', id],
      queryFn: () => getPokemonDetails(id),
      staleTime: 1000 * 60 * 15,
      gcTime: 1000 * 60 * 30,
    })),
  });

  const loaded = results
    .map((r) => r.data)
    .filter((p): p is Pokemon => Boolean(p));
  const isLoading = results.some((r) => r.isLoading) && loaded.length === 0;

  const ranked = React.useMemo(() => {
    return [...loaded]
      .map((p) => ({ pokemon: p, value: getStatValue(p, sortStat) }))
      .sort((a, b) => b.value - a.value);
  }, [loaded, sortStat]);

  const maxValue = ranked.length > 0 ? ranked[0].value : 1;

  // Vazio (sem favoritos)
  if (favorites.length === 0) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: theme.colors.background }]}>
        <Ionicons name="podium-outline" size={48} color={theme.colors.textSecondary} />
        <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>Sem favoritos ainda</Text>
        <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
          Adicione pokémons aos favoritos para ver o ranking por atributo.
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Seletor de stat */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.statChips}
        style={styles.statChipsBar}
      >
        {STAT_OPTIONS.map((opt) => {
          const active = opt.key === sortStat;
          return (
            <TouchableOpacity
              key={opt.key}
              onPress={() => setSortStat(opt.key)}
              activeOpacity={0.8}
              style={[
                styles.chip,
                {
                  backgroundColor: active ? theme.colors.primary : theme.colors.surface,
                  borderColor: active ? theme.colors.primary : theme.colors.border,
                },
              ]}
            >
              <Text style={[styles.chipText, { color: active ? '#FFFFFF' : theme.colors.text }]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>
            Carregando favoritos...
          </Text>
        </View>
      ) : (
        <FlatList
          data={ranked}
          keyExtractor={(item) => item.pokemon.id.toString()}
          contentContainerStyle={styles.list}
          renderItem={({ item, index }) => {
            const barColor =
              sortStat === 'total' ? theme.colors.primary : STAT_COLORS[sortStat] || theme.colors.primary;
            return (
              <TouchableOpacity
                style={[styles.row, { backgroundColor: theme.colors.surface }]}
                activeOpacity={0.8}
                onPress={() => navigation.navigate('PokemonDetail', { pokemonId: item.pokemon.id })}
              >
                <Text style={[styles.rank, { color: MEDALS[index] || theme.colors.textSecondary }]}>
                  {index + 1}
                </Text>
                <Image
                  source={item.pokemon.sprites.other['official-artwork'].front_default}
                  style={styles.image}
                  contentFit="contain"
                  cachePolicy="memory-disk"
                />
                <View style={styles.info}>
                  <Text style={[styles.name, { color: theme.colors.text }]} numberOfLines={1}>
                    {item.pokemon.name}
                  </Text>
                  <View style={[styles.barTrack, { backgroundColor: theme.colors.border }]}>
                    <View
                      style={[
                        styles.barFill,
                        { width: `${(item.value / maxValue) * 100}%`, backgroundColor: barColor },
                      ]}
                    />
                  </View>
                </View>
                <Text style={[styles.value, { color: theme.colors.text }]}>{item.value}</Text>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    gap: 8,
  },
  loadingText: { fontSize: 14, marginTop: 8 },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginTop: 8 },
  emptyText: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  statChipsBar: {
    flexGrow: 0,
  },
  statChips: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: { fontSize: 14, fontWeight: '600' },
  list: { padding: 16, paddingTop: 4 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
    gap: 10,
  },
  rank: {
    width: 28,
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
  image: { width: 48, height: 48 },
  info: { flex: 1, gap: 6 },
  name: {
    fontSize: 15,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  barTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
  },
  value: {
    width: 44,
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'right',
  },
});
