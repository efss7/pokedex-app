import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Polygon, Line, Circle, Text as SvgText, G } from 'react-native-svg';
import { useAppTheme } from '@theme/ThemeProvider';
import { STAT_NAMES } from '@constants/index';
import type { PokemonStat } from '@/types/pokemon';

interface StatsRadarProps {
  stats: PokemonStat[];
  /** Cor de destaque (normalmente a cor do tipo primário). */
  color: string;
  size?: number;
}

// Valor de referência para o topo do radar. A maioria dos stats fica abaixo
// disso; valores maiores são "estourados" (clamp) no vértice externo.
const RADAR_MAX = 200;
const LEVELS = [0.25, 0.5, 0.75, 1];

/**
 * Radar (hexágono) de stats — o visual clássico de Pokédex.
 * Desenhado com react-native-svg, sem dependências extras.
 */
export const StatsRadar: React.FC<StatsRadarProps> = ({ stats, color, size = 240 }) => {
  const theme = useAppTheme();

  const center = size / 2;
  const radius = size / 2 - 34; // espaço para os rótulos
  const count = stats.length;

  // Ângulo do i-ésimo eixo (começa no topo, sentido horário).
  const angleFor = (i: number) => (-90 + (360 / count) * i) * (Math.PI / 180);

  const pointAt = (i: number, ratio: number) => {
    const angle = angleFor(i);
    return {
      x: center + radius * ratio * Math.cos(angle),
      y: center + radius * ratio * Math.sin(angle),
    };
  };

  // Polígono dos dados.
  const dataPoints = stats
    .map((stat, i) => {
      const ratio = Math.min(stat.base_stat / RADAR_MAX, 1);
      const { x, y } = pointAt(i, ratio);
      return `${x},${y}`;
    })
    .join(' ');

  // Polígonos de grade (hexágonos concêntricos).
  const gridPolygon = (level: number) =>
    stats
      .map((_, i) => {
        const { x, y } = pointAt(i, level);
        return `${x},${y}`;
      })
      .join(' ');

  return (
    <View style={styles.container}>
      <Svg width={size} height={size}>
        {/* Grade */}
        {LEVELS.map((level) => (
          <Polygon
            key={level}
            points={gridPolygon(level)}
            fill="none"
            stroke={theme.colors.border}
            strokeWidth={1}
          />
        ))}

        {/* Eixos + rótulos */}
        {stats.map((stat, i) => {
          const outer = pointAt(i, 1);
          const label = pointAt(i, 1.18);
          const statLabel = STAT_NAMES[stat.stat.name] ?? stat.stat.name;
          return (
            <G key={stat.stat.name}>
              <Line
                x1={center}
                y1={center}
                x2={outer.x}
                y2={outer.y}
                stroke={theme.colors.border}
                strokeWidth={1}
              />
              <SvgText
                x={label.x}
                y={label.y}
                fill={theme.colors.textSecondary}
                fontSize={10}
                fontWeight="600"
                textAnchor="middle"
                alignmentBaseline="middle"
              >
                {statLabel}
              </SvgText>
            </G>
          );
        })}

        {/* Polígono dos dados */}
        <Polygon
          points={dataPoints}
          fill={color + '55'}
          stroke={color}
          strokeWidth={2}
        />

        {/* Vértices */}
        {stats.map((stat, i) => {
          const ratio = Math.min(stat.base_stat / RADAR_MAX, 1);
          const { x, y } = pointAt(i, ratio);
          return <Circle key={stat.stat.name} cx={x} cy={y} r={3} fill={color} />;
        })}
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 8,
  },
});
