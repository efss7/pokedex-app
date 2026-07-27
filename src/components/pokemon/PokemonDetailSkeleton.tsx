import React from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { useAppTheme } from '@theme/ThemeProvider';

const { width } = Dimensions.get('window');

/**
 * Skeleton da tela de detalhes.
 * Reproduz o layout (header + imagem, título, tipos, seções) enquanto os
 * dados carregam, dando sensação de velocidade em vez de um spinner vazio.
 */
export const PokemonDetailSkeleton = () => {
  const theme = useAppTheme();
  const pulse = React.useRef(new Animated.Value(0.3)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.3, duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, [pulse]);

  const Block = ({ style }: { style: object }) => (
    <Animated.View
      style={[{ backgroundColor: theme.colors.border, opacity: pulse }, style]}
    />
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header com imagem */}
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <Block style={styles.image} />
      </View>

      {/* Conteúdo */}
      <View style={styles.content}>
        <Block style={styles.id} />
        <Block style={styles.name} />
        <Block style={styles.genus} />

        <View style={styles.types}>
          <Block style={styles.typeChip} />
          <Block style={styles.typeChip} />
        </View>

        <Block style={styles.sectionTitle} />
        <Block style={styles.line} />
        <Block style={styles.line} />
        <Block style={[styles.line, { width: '60%' }]} />

        <View style={styles.infoGrid}>
          <Block style={styles.infoItem} />
          <Block style={styles.infoItem} />
          <Block style={styles.infoItem} />
        </View>

        <Block style={styles.sectionTitle} />
        <View style={styles.types}>
          <Block style={styles.pill} />
          <Block style={styles.pill} />
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
    width: width * 0.5,
    height: width * 0.5,
    borderRadius: (width * 0.5) / 2,
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
