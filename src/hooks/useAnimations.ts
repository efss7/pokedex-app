import { useEffect } from 'react';
import {
  useSharedValue,
  withTiming,
  withSpring,
  withDelay,
  useAnimatedStyle,
} from 'react-native-reanimated';

/**
 * Os hooks retornam um ESTILO ANIMADO (via useAnimatedStyle), pronto para ser
 * passado no `style` de um <Animated.View>. Isso evita ler `.value` de shared
 * values durante o render (o que o Reanimated alerta em modo estrito).
 */

/**
 * Animação de entrada suave (fade-in + slide-up).
 *
 * @example
 * const entrada = useAnimatedEntrance(200);
 * <Animated.View style={[styles.box, entrada]}>...</Animated.View>
 */
export const useAnimatedEntrance = (delay = 0, duration = 400) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration }));
    translateY.value = withDelay(delay, withTiming(0, { duration }));
  }, [delay, duration, opacity, translateY]);

  return useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));
};

/**
 * Animação de escala com bounce (para imagens/elementos de destaque).
 *
 * @example
 * const escala = useScaleBounce(100);
 * <Animated.Image style={[styles.image, escala]} />
 */
export const useScaleBounce = (delay = 0) => {
  const scale = useSharedValue(0);

  useEffect(() => {
    scale.value = withDelay(
      delay,
      withSpring(1, { damping: 10, stiffness: 100, mass: 0.5 })
    );
  }, [delay, scale]);

  return useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
};

/**
 * Animação de rotação suave.
 */
export const useRotateEntrance = (delay = 0) => {
  const rotate = useSharedValue(-10);

  useEffect(() => {
    rotate.value = withDelay(delay, withSpring(0, { damping: 8, stiffness: 80 }));
  }, [delay, rotate]);

  return useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotate.value}deg` }],
  }));
};

/**
 * Animação de entrada combinada (fade + slide + scale).
 */
export const useCombinedEntrance = (delay = 0) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(30);
  const scale = useSharedValue(0.9);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 500 }));
    translateY.value = withDelay(delay, withSpring(0, { damping: 12, stiffness: 100 }));
    scale.value = withDelay(delay, withSpring(1, { damping: 12, stiffness: 100 }));
  }, [delay, opacity, translateY, scale]);

  return useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
  }));
};
