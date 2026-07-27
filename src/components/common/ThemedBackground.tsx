import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

interface ThemedBackgroundProps {
  color: string;
  children?: React.ReactNode;
  height?: number;
}

/**
 * Componente de fundo temático com gradiente
 * Cria um gradiente baseado na cor do tipo do pokémon
 * 
 * @param color - Cor base (cor do tipo do pokémon)
 * @param children - Conteúdo a ser renderizado sobre o fundo
 * @param height - Altura customizada (padrão: 300)
 * 
 * @example
 * ```tsx
 * <ThemedBackground color="#F08030">
 *   <Image source={pokemon.image} />
 * </ThemedBackground>
 * ```
 */
export const ThemedBackground: React.FC<ThemedBackgroundProps> = ({
  color,
  children,
  height: customHeight = 300,
}) => {
  // Cria um gradiente mais claro para o topo
  const lighterColor = adjustColorBrightness(color, 30);
  const darkerColor = adjustColorBrightness(color, -20);

  return (
    <View style={[styles.container, { height: customHeight }]}>
      {/* Gradiente principal */}
      <LinearGradient
        colors={[lighterColor, color, darkerColor]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {/* Padrões decorativos */}
        <View style={styles.decorativeContainer}>
          {/* Círculo grande superior direito */}
          <View
            style={[
              styles.circle,
              styles.circleLarge,
              styles.circleTopRight,
              { backgroundColor: 'rgba(255, 255, 255, 0.1)' },
            ]}
          />

          {/* Círculo médio inferior esquerdo */}
          <View
            style={[
              styles.circle,
              styles.circleMedium,
              styles.circleBottomLeft,
              { backgroundColor: 'rgba(255, 255, 255, 0.08)' },
            ]}
          />

          {/* Círculo pequeno superior esquerdo */}
          <View
            style={[
              styles.circle,
              styles.circleSmall,
              styles.circleTopLeft,
              { backgroundColor: 'rgba(255, 255, 255, 0.12)' },
            ]}
          />

          {/* Pokébola decorativa */}
          <View style={styles.pokeballContainer}>
            <View
              style={[
                styles.pokeballCircle,
                { borderColor: 'rgba(255, 255, 255, 0.05)' },
              ]}
            />
            <View
              style={[
                styles.pokeballLine,
                { backgroundColor: 'rgba(255, 255, 255, 0.05)' },
              ]}
            />
            <View
              style={[
                styles.pokeballCenter,
                { 
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderColor: 'rgba(255, 255, 255, 0.05)',
                },
              ]}
            />
          </View>
        </View>

        {/* Conteúdo */}
        <View style={styles.content}>{children}</View>
      </LinearGradient>
    </View>
  );
};

/**
 * Ajusta o brilho de uma cor hexadecimal
 * @param color - Cor em formato hex (#RRGGBB)
 * @param amount - Quantidade a ajustar (-100 a 100)
 * @returns Cor ajustada em formato hex
 */
function adjustColorBrightness(color: string, amount: number): string {
  // Remove o # se existir
  const hex = color.replace('#', '');
  
  // Converte para RGB
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Ajusta cada componente
  const newR = Math.max(0, Math.min(255, r + amount));
  const newG = Math.max(0, Math.min(255, g + amount));
  const newB = Math.max(0, Math.min(255, b + amount));

  // Converte de volta para hex
  const newHex = [newR, newG, newB]
    .map((x) => x.toString(16).padStart(2, '0'))
    .join('');

  return `#${newHex}`;
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
    width: '100%',
  },
  decorativeContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    zIndex: 1,
  },
  // Círculos decorativos
  circle: {
    position: 'absolute',
    borderRadius: 1000,
  },
  circleLarge: {
    width: 250,
    height: 250,
  },
  circleMedium: {
    width: 180,
    height: 180,
  },
  circleSmall: {
    width: 100,
    height: 100,
  },
  circleTopRight: {
    top: -80,
    right: -60,
  },
  circleBottomLeft: {
    bottom: -50,
    left: -40,
  },
  circleTopLeft: {
    top: 100,
    left: -30,
  },
  // Pokébola decorativa
  pokeballContainer: {
    position: 'absolute',
    bottom: -100,
    right: -100,
    width: 250,
    height: 250,
  },
  pokeballCircle: {
    width: 250,
    height: 250,
    borderRadius: 125,
    borderWidth: 20,
  },
  pokeballLine: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: 10,
    marginTop: -5,
  },
  pokeballCenter: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 50,
    height: 50,
    borderRadius: 25,
    marginTop: -25,
    marginLeft: -25,
    borderWidth: 10,
  },
});
