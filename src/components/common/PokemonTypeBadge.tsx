import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAppTheme } from '@theme/ThemeProvider';
import { TYPE_COLORS } from '@constants';

interface PokemonTypeBadgeProps {
  type: string;
  size?: 'small' | 'medium' | 'large';
}

/**
 * Badge reutilizável para exibir tipo de pokémon
 */
export const PokemonTypeBadge: React.FC<PokemonTypeBadgeProps> = ({ type, size = 'medium' }) => {
  const theme = useAppTheme();

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
