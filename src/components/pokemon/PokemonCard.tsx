import React, { useRef, useEffect } from 'react';
import { jsx as _jsx } from 'react/jsx-runtime';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import { useAppTheme } from '@theme/ThemeProvider';
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
 * Features:
 * - Fade-in na entrada
 * - Scale ao pressionar
 * - Simples e clean
 */
export const PokemonCard: React.FC<PokemonCardProps> = ({ pokemon, onPress }) => {
  const theme = useAppTheme();

  // Animações simples
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Fade-in na entrada
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  // Animação de press
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

  const handlePress = () => {
    onPress?.();
  };

  // Estilos animados
  const cardStyle = {
    opacity: fadeAnim,
    transform: [{ scale: scaleAnim }],
  };

  /**
   * Pega a cor do tipo primário do Pokémon
   */
  const primaryTypeColor = TYPE_COLORS[pokemon.types[0]] || theme.colors.primary;

  /**
   * Formata o ID com zeros à esquerda (#001, #025, #150)
   */
  const formattedId = `#${pokemon.id.toString().padStart(3, '0')}`;

  return (
    <TouchableOpacity
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
      style={styles.touchable}
    >
      <Animated.View
        style={[
          styles.card,
          { backgroundColor: theme.colors.surface },
          cardStyle,
        ]}
      >
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

      {/* Imagem do Pokémon */}
      <Image
        source={{ uri: pokemon.imageUrl }}
        style={styles.image}
        resizeMode="contain"
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
        {pokemon.types.map((type: string) => (
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
