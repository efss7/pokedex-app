import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useAppTheme } from '@theme/ThemeProvider';
import { StatsRadar } from './StatsRadar';
import { STAT_NAMES, STAT_COLORS, MAX_STAT_VALUE } from '../../constants';
import type { PokemonStat } from '@/types/pokemon';

interface PokemonStatsProps {
  stats: PokemonStat[];
  /** Cor de destaque do radar (cor do tipo primário). */
  color?: string;
}

/**
 * Componente que exibe os stats do pokémon com barras animadas
 * 
 * Features:
 * - Barras de progresso coloridas para cada stat
 * - Animação suave ao montar
 * - Labels em português
 * - Valores numéricos e porcentagem visual
 * - Cores específicas para cada stat
 * 
 * @example
 * ```tsx
 * <PokemonStats stats={pokemon.stats} />
 * ```
 */
export const PokemonStats: React.FC<PokemonStatsProps> = ({ stats, color }) => {
  const theme = useAppTheme();
  const radarColor = color ?? theme.colors.primary;

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.colors.text }]}>
        Estatísticas Base
      </Text>

      {/* Radar (visão geral do "shape" do pokémon) */}
      {stats.length >= 3 && <StatsRadar stats={stats} color={radarColor} />}

      <View style={styles.statsContainer}>
        {stats.map((stat) => (
          <StatBar
            key={stat.stat.name}
            name={stat.stat.name}
            value={stat.base_stat}
          />
        ))}
      </View>

      {/* Total de stats */}
      <View style={styles.totalContainer}>
        <Text style={[styles.totalLabel, { color: theme.colors.textSecondary }]}>
          Total:
        </Text>
        <Text style={[styles.totalValue, { color: theme.colors.text }]}>
          {stats.reduce((sum, stat) => sum + stat.base_stat, 0)}
        </Text>
      </View>
    </View>
  );
};

/**
 * Componente interno para renderizar cada barra de stat individual
 */
interface StatBarProps {
  name: string;
  value: number;
}

const StatBar: React.FC<StatBarProps> = ({ name, value }) => {
  const theme = useAppTheme();
  const animatedWidth = useRef(new Animated.Value(0)).current;

  // Calcula a porcentagem (0-100) baseada no valor máximo teórico
  const percentage = Math.min((value / MAX_STAT_VALUE) * 100, 100);

  // Animação ao montar
  useEffect(() => {
    Animated.timing(animatedWidth, {
      toValue: percentage,
      duration: 800,
      delay: 100,
      useNativeDriver: false, // Width não suporta native driver
    }).start();
  }, [percentage, animatedWidth]);

  // Interpola para a largura em porcentagem
  const width = animatedWidth.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  const statLabel = STAT_NAMES[name] || name;
  const statColor = STAT_COLORS[name] || theme.colors.primary;

  return (
    <View style={styles.statRow}>
      {/* Label do stat */}
      <Text style={[styles.statLabel, { color: theme.colors.text }]}>
        {statLabel}
      </Text>

      {/* Valor numérico */}
      <Text style={[styles.statValue, { color: theme.colors.textSecondary }]}>
        {value}
      </Text>

      {/* Barra de progresso */}
      <View style={styles.barContainer}>
        <View
          style={[
            styles.barBackground,
            { backgroundColor: theme.colors.border },
          ]}
        >
          <Animated.View
            style={[
              styles.barFill,
              {
                width,
                backgroundColor: statColor,
              },
            ]}
          />
        </View>
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
  statsContainer: {
    gap: 12,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '600',
    width: 80,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
    width: 35,
    textAlign: 'right',
  },
  barContainer: {
    flex: 1,
  },
  barBackground: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
    gap: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '700',
  },
});
