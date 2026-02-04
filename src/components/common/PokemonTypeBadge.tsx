import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAppTheme } from '@theme/ThemeProvider';

interface PokemonTypeBadgeProps {
  type: string;
  size?: 'small' | 'medium' | 'large';
}

/**
 * Badge reutilizável para exibir tipo de pokémon
 */
export const PokemonTypeBadge: React.FC<PokemonTypeBadgeProps> = ({ type, size = 'medium' }) => {
  const theme = useAppTheme();

  const TYPE_COLORS: Record<string, string> = {
    normal: '#A8A878',
    fire: '#F08030',
    water: '#6890F0',
    electric: '#F8D030',
    grass: '#78C850',
    ice: '#98D8D8',
    fighting: '#C03028',
    poison: '#A040A0',
    ground: '#E0C068',
    flying: '#A890F0',
    psychic: '#F85888',
    bug: '#A8B820',
    rock: '#B8A038',
    ghost: '#705898',
    dragon: '#7038F8',
    dark: '#705848',
    steel: '#B8B8D0',
    fairy: '#EE99AC',
  };

  const sizeStyles = {
    small: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
    medium: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
    large: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  };

  const fontSizes = {
    small: 10,
    medium: 11,
    large: 12,
  };

  return (
    <View
      style={[
        styles.badge,
        sizeStyles[size],
        { backgroundColor: TYPE_COLORS[type] || theme.colors.primary },
      ]}
    >
      <Text style={[styles.text, { fontSize: fontSizes[size] }]}>
        {type}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#FFFFFF',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
});
