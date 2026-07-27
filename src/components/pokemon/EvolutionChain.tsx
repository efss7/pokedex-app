import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Image } from 'expo-image';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAppTheme } from '@theme/ThemeProvider';
import type { EvolutionChain as EvolutionChainType } from '@/types/pokemon';
import type { RootStackParamList } from '@navigation/AppNavigator';
import { parseEvolutionChain, SimplifiedEvolution } from '@utils/evolutionHelper';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface PokemonEvolutionChainProps {
  evolutionChain: EvolutionChainType;
  currentPokemonId: number;
}

/**
 * Componente que exibe a cadeia evolutiva do pokémon
 * 
 * Features:
 * - Mostra todas as evoluções em linha horizontal
 * - Setas indicando a progressão
 * - Condições de evolução (nível, item, etc.)
 * - Destaque para o pokémon atual
 * - Navegação ao clicar em uma evolução
 * - Scroll horizontal se houver muitas evoluções
 * 
 * @example
 * ```tsx
 * <PokemonEvolutionChain 
 *   evolutionChain={details.evolutionChain} 
 *   currentPokemonId={pokemon.id}
 * />
 * ```
 */
export const PokemonEvolutionChain: React.FC<PokemonEvolutionChainProps> = ({
  evolutionChain,
  currentPokemonId,
}) => {
  const theme = useAppTheme();
  const navigation = useNavigation<NavigationProp>();

  // Parsear a cadeia evolutiva complexa para array simples
  const evolutions = parseEvolutionChain(evolutionChain);

  // Se só tem 1 evolução, não precisa exibir
  if (evolutions.length <= 1) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
          Este pokémon não possui evoluções
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.colors.text }]}>
        Evoluções
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {evolutions.map((evolution, index) => {
          const isCurrentPokemon = evolution.id === currentPokemonId;
          const isLastEvolution = index === evolutions.length - 1;

          return (
            <React.Fragment key={evolution.id}>
              {/* Card da evolução */}
              <TouchableOpacity
                style={[
                  styles.evolutionCard,
                  {
                    backgroundColor: isCurrentPokemon 
                      ? theme.colors.primary + '20' 
                      : theme.colors.surface,
                    borderColor: isCurrentPokemon 
                      ? theme.colors.primary 
                      : theme.colors.border,
                  },
                ]}
                onPress={() => {
                  if (evolution.id !== currentPokemonId) {
                    navigation.push('PokemonDetail', { pokemonId: evolution.id });
                  }
                }}
                activeOpacity={0.7}
              >
                <Image
                  source={evolution.imageUrl}
                  style={styles.image}
                  contentFit="contain"
                  transition={200}
                  cachePolicy="memory-disk"
                />
                <Text
                  style={[
                    styles.name,
                    { 
                      color: theme.colors.text,
                      fontWeight: isCurrentPokemon ? '700' : '600',
                    },
                  ]}
                >
                  {evolution.name}
                </Text>
                <Text style={[styles.id, { color: theme.colors.textSecondary }]}>
                  #{evolution.id.toString().padStart(3, '0')}
                </Text>
              </TouchableOpacity>

              {/* Seta e condição de evolução (não exibir após o último) */}
              {!isLastEvolution && (
                <View style={styles.arrowContainer}>
                  {/* Seta */}
                  <Text style={[styles.arrow, { color: theme.colors.textSecondary }]}>
                    →
                  </Text>
                  
                  {/* Condição de evolução */}
                  {evolutions[index + 1].condition && (
                    <View
                      style={[
                        styles.conditionBadge,
                        { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
                      ]}
                    >
                      <Text
                        style={[styles.conditionText, { color: theme.colors.textSecondary }]}
                        numberOfLines={2}
                      >
                        {evolutions[index + 1].condition}
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </React.Fragment>
          );
        })}
      </ScrollView>

      {/* Legenda */}
      <View style={styles.legend}>
        <View style={[styles.legendItem, { borderColor: theme.colors.primary }]}>
          <View />
        </View>
        <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>
          Atual
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  scrollContent: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  evolutionCard: {
    width: 120,
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: 80,
    height: 80,
    marginBottom: 8,
  },
  name: {
    fontSize: 14,
    textTransform: 'capitalize',
    textAlign: 'center',
    marginBottom: 4,
  },
  id: {
    fontSize: 12,
  },
  arrowContainer: {
    width: 80,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  arrow: {
    fontSize: 32,
    fontWeight: '700',
  },
  conditionBadge: {
    marginTop: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    maxWidth: 80,
  },
  conditionText: {
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 14,
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 8,
  },
  legendItem: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
  },
  legendText: {
    fontSize: 12,
  },
  emptyContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
});
