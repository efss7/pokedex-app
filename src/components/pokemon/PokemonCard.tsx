import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@theme/ThemeProvider';
import { useFavoritesStore } from '@store/favoritesStore';
import { usePokemonCardTypes } from '@hooks/usePokemonCardTypes';
import type { SimplifiedPokemon } from '@/types/pokemon';
import { TYPE_COLORS } from '@constants';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2; // 2 colunas com padding

interface PokemonCardProps {
  pokemon: SimplifiedPokemon;
  onPress?: () => void;
}

/**
 * Card visual do Pokémon
 *
 * - Cache de imagem em disco (expo-image)
 * - Hidratação lazy de tipos quando o card vem do índice (busca)
 * - Memoizado para evitar re-renders desnecessários no FlatList
 */
const PokemonCardComponent: React.FC<PokemonCardProps> = ({ pokemon, onPress }) => {
  const theme = useAppTheme();
  const isFavorite = useFavoritesStore((state) => state.favorites.includes(pokemon.id));

  // Se o card veio do índice leve (sem tipos), busca-os sob demanda.
  const needsTypes = pokemon.types.length === 0;
  const { data: fetchedTypes } = usePokemonCardTypes(pokemon.id, needsTypes);
  const types = needsTypes ? fetchedTypes ?? [] : pokemon.types;

  // Animação de press (a de entrada agora é feita pelo expo-image transition)
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
      friction: 6,
      tension: 40,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 6,
      tension: 40,
    }).start();
  };

  const primaryTypeColor = TYPE_COLORS[types[0]] || theme.colors.primary;
  const formattedId = `#${pokemon.id.toString().padStart(3, '0')}`;

  return (
    <TouchableOpacity
      onPress={() => onPress?.()}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
      style={styles.touchable}
      accessibilityRole="button"
      accessibilityLabel={`Ver detalhes de ${pokemon.name}`}
    >
      <Animated.View
        style={[
          styles.card,
          { backgroundColor: theme.colors.surface },
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        {isFavorite && (
          <View style={styles.favoriteBadge}>
            <Ionicons name="heart" size={14} color="#FFFFFF" />
          </View>
        )}
        {/* Fundo colorido baseado no tipo */}
        <View
          style={[
            styles.typeBackground,
            { backgroundColor: primaryTypeColor + '20' }, // 20 = 12% opacity em hex
          ]}
        />

        {/* ID do Pokémon */}
        <Text style={[styles.id, { color: theme.colors.textSecondary }]}>
          {formattedId}
        </Text>

        {/* Imagem do Pokémon (cache em disco + fade-in) */}
        <Image
          source={pokemon.imageUrl}
          style={styles.image}
          contentFit="contain"
          transition={250}
          cachePolicy="memory-disk"
        />

        {/* Nome do Pokémon */}
        <Text
          style={[styles.name, { color: theme.colors.text }]}
          numberOfLines={1}
        >
          {pokemon.name}
        </Text>

        {/* Badges dos tipos */}
        <View style={styles.typesContainer}>
          {types.map((type: string) => (
            <View
              key={type}
              style={[
                styles.typeBadge,
                { backgroundColor: TYPE_COLORS[type] || theme.colors.primary },
              ]}
            >
              <Text style={styles.typeText}>{type}</Text>
            </View>
          ))}
        </View>

        {/* Padrão pokébola de fundo (decorativo) */}
        <View style={styles.pokeballPattern}>
          <View style={[styles.pokeballCircle, { borderColor: primaryTypeColor + '10' }]} />
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

/**
 * Memoizado: só re-renderiza se o pokémon (id/tipos) ou o handler mudarem.
 */
export const PokemonCard = React.memo(
  PokemonCardComponent,
  (prev, next) =>
    prev.pokemon.id === next.pokemon.id &&
    prev.pokemon.types.length === next.pokemon.types.length &&
    prev.onPress === next.onPress
);

const styles = StyleSheet.create({
  touchable: {
    flex: 1,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_WIDTH * 1.3, // Proporção 1:1.3
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
    overflow: 'hidden',
    // Sombra iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    // Sombra Android
    elevation: 4,
  },
  typeBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  favoriteBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    zIndex: 2,
  },
  id: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
  },
  image: {
    width: '100%',
    height: CARD_WIDTH * 0.6,
    marginVertical: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    textTransform: 'capitalize',
    marginBottom: 8,
  },
  typesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  typeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  // Padrão decorativo de pokébola no fundo
  pokeballPattern: {
    position: 'absolute',
    bottom: -30,
    right: -30,
    width: 100,
    height: 100,
    opacity: 0.05,
  },
  pokeballCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 15,
  },
});
