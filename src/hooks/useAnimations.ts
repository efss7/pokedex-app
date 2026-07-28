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

