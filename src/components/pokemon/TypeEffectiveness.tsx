import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useAppTheme } from '@theme/ThemeProvider';
import { useTypeEffectiveness, TypeMatchup } from '@hooks/useTypeEffectiveness';
import { TYPE_COLORS } from '@constants/index';

interface TypeEffectivenessProps {
  types: string[];
}

/** Formata o multiplicador (2 → "2×", 0.5 → "½×", 0.25 → "¼×", 0 → "0×"). */
const formatMultiplier = (m: number): string => {
  if (m === 0.25) return '¼×';
  if (m === 0.5) return '½×';
  if (m === 0) return '0×';
  return `${m}×`;
};

/**
 * Chip de tipo com o multiplicador de dano.
 */
const MatchupChip: React.FC<{ type: string; multiplier: number }> = ({ type, multiplier }) => (
  <View style={[styles.chip, { backgroundColor: TYPE_COLORS[type] || '#888' }]}>
    <Text style={styles.chipType}>{type}</Text>
    <Text style={styles.chipMultiplier}>{formatMultiplier(multiplier)}</Text>
  </View>
);

/**
 * Exibe fraquezas, resistências e imunidades do pokémon com base nos tipos.
 */
export const TypeEffectiveness: React.FC<TypeEffectivenessProps> = ({ types }) => {
  const theme = useAppTheme();
  const { data, isLoading, error } = useTypeEffectiveness(types);

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={theme.colors.primary} />
      </View>
    );
  }

  if (error || !data) return null;

  const rows: { label: string; items: TypeMatchup[] }[] = [
    { label: 'Fraco contra', items: data.weaknesses },
    { label: 'Resistente a', items: data.resistances },
    {
      label: 'Imune a',
      items: data.immunities.map((type) => ({ type, multiplier: 0 })),
    },
  ].filter((row) => row.items.length > 0);

  if (rows.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.colors.text }]}>
        Fraquezas e resistências
      </Text>
      {rows.map((row) => (
        <View key={row.label} style={styles.row}>
          <Text style={[styles.rowLabel, { color: theme.colors.textSecondary }]}>
            {row.label}
          </Text>
          <View style={styles.chips}>
            {row.items.map((item) => (
              <MatchupChip key={item.type} type={item.type} multiplier={item.multiplier} />
            ))}
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  loading: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  row: {
    marginBottom: 14,
  },
  rowLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    gap: 6,
  },
  chipType: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  chipMultiplier: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
});
