import React from 'react';
import { View, StyleSheet, Animated, useWindowDimensions } from 'react-native';
import { useAppTheme } from '@theme/ThemeProvider';

/**
 * Bloco cinza pulsante. Fica no escopo do módulo, e não dentro do skeleton:
 * um componente declarado dentro de outro é recriado a cada render do pai,
 * o que remonta o subtree inteiro e reinicia a animação.
 */
const Block = ({
  style,
  color,
  opacity,
}: {
  style: object;
  color: string;
  opacity: Animated.Value;
}) => <Animated.View style={[{ backgroundColor: color, opacity }, style]} />;

/**
 * Skeleton da tela de detalhes.
 * Reproduz o layout (header + imagem, título, tipos, seções) enquanto os
 * dados carregam, dando sensação de velocidade em vez de um spinner vazio.
 */
export const PokemonDetailSkeleton = () => {
  const theme = useAppTheme();
  const { width: larguraJanela } = useWindowDimensions();
  const tamanhoArte = Math.min(larguraJanela * 0.5, 280);
  const pulse = React.useRef(new Animated.Value(0.3)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.3, duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, [pulse]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header com imagem */}
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <Block
          color={theme.colors.border}
          opacity={pulse}
          style={[styles.image, { width: tamanhoArte, height: tamanhoArte, borderRadius: tamanhoArte / 2 }]}
        />
      </View>

      {/* Conteúdo */}
      <View style={styles.content}>
        <Block color={theme.colors.border} opacity={pulse} style={styles.id} />
        <Block color={theme.colors.border} opacity={pulse} style={styles.name} />
        <Block color={theme.colors.border} opacity={pulse} style={styles.genus} />

        <View style={styles.types}>
          <Block color={theme.colors.border} opacity={pulse} style={styles.typeChip} />
          <Block color={theme.colors.border} opacity={pulse} style={styles.typeChip} />
        </View>

        <Block color={theme.colors.border} opacity={pulse} style={styles.sectionTitle} />
        <Block color={theme.colors.border} opacity={pulse} style={styles.line} />
        <Block color={theme.colors.border} opacity={pulse} style={styles.line} />
        <Block color={theme.colors.border} opacity={pulse} style={[styles.line, { width: '60%' }]} />

        <View style={styles.infoGrid}>
          <Block color={theme.colors.border} opacity={pulse} style={styles.infoItem} />
          <Block color={theme.colors.border} opacity={pulse} style={styles.infoItem} />
          <Block color={theme.colors.border} opacity={pulse} style={styles.infoItem} />
        </View>

        <Block color={theme.colors.border} opacity={pulse} style={styles.sectionTitle} />
        <View style={styles.types}>
          <Block color={theme.colors.border} opacity={pulse} style={styles.pill} />
          <Block color={theme.colors.border} opacity={pulse} style={styles.pill} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 320,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    // width, height e borderRadius vêm do componente (useWindowDimensions).
  },
  content: {
    padding: 20,
    marginTop: -50,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    alignItems: 'center',
  },
  id: {
    width: 60,
    height: 16,
    borderRadius: 4,
    marginBottom: 8,
  },
  name: {
    width: 180,
    height: 30,
    borderRadius: 6,
    marginBottom: 8,
  },
  genus: {
    width: 120,
    height: 16,
    borderRadius: 4,
    marginBottom: 20,
  },
  types: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  typeChip: {
    width: 80,
    height: 28,
    borderRadius: 14,
  },
  sectionTitle: {
    alignSelf: 'flex-start',
    width: 140,
    height: 22,
    borderRadius: 6,
    marginBottom: 14,
  },
  line: {
    alignSelf: 'stretch',
    height: 14,
    borderRadius: 4,
    marginBottom: 10,
  },
  infoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignSelf: 'stretch',
    marginVertical: 20,
    gap: 12,
  },
  infoItem: {
    flex: 1,
    height: 56,
    borderRadius: 8,
  },
  pill: {
    width: 110,
    height: 32,
    borderRadius: 16,
  },
});
