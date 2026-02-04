import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useAppTheme } from '@theme/ThemeProvider';

/**
 * Componente Skeleton - Placeholder animado durante carregamento
 * Mostra um "fantasma" do card para melhor UX
 */
export const PokemonCardSkeleton = () => {
  const theme = useAppTheme();
  
  // Animação de "pulso" - opacidade vai e volta
  const pulseAnim = React.useRef(new Animated.Value(0.3)).current;
  
  React.useEffect(() => {
    // Loop infinito da animação
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
      {/* Imagem placeholder */}
      <Animated.View 
        style={[
          styles.imageSkeleton, 
          { 
            backgroundColor: theme.colors.border,
            opacity: pulseAnim 
          }
        ]} 
      />
      
      {/* Nome placeholder */}
      <Animated.View 
        style={[
          styles.nameSkeleton, 
          { 
            backgroundColor: theme.colors.border,
            opacity: pulseAnim 
          }
        ]} 
      />
      
      {/* Tipos placeholder */}
      <View style={styles.typesContainer}>
        <Animated.View 
          style={[
            styles.typeSkeleton, 
            { 
              backgroundColor: theme.colors.border,
              opacity: pulseAnim 
            }
          ]} 
        />
        <Animated.View 
          style={[
            styles.typeSkeleton, 
            { 
              backgroundColor: theme.colors.border,
              opacity: pulseAnim 
            }
          ]} 
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '48%',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  imageSkeleton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12,
  },
  nameSkeleton: {
    width: '80%',
    height: 20,
    borderRadius: 4,
    marginBottom: 8,
  },
  typesContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  typeSkeleton: {
    width: 50,
    height: 24,
    borderRadius: 12,
  },
});
