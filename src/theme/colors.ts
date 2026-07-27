/**
 * Cores da interface (UI).
 *
 * As cores dos TIPOS de pokémon vivem em `@constants` (TYPE_COLORS) — fonte
 * única de verdade, reutilizada por cards, badges e telas. Não duplicar aqui.
 */

export const lightColors = {
  primary: '#DC0A2D',
  secondary: '#EFEFEF',
  background: '#FFFFFF',
  surface: '#F2F2F2',
  text: '#212121',
  textSecondary: '#666666',
  border: '#E0E0E0',
  error: '#F44336',
  success: '#4CAF50',
  warning: '#FF9800',
  info: '#2196F3',
};

export const darkColors: typeof lightColors = {
  primary: '#DC0A2D',
  secondary: '#2C2C2C',
  background: '#121212',
  surface: '#1E1E1E',
  text: '#FFFFFF',
  textSecondary: '#B0B0B0',
  border: '#2C2C2C',
  error: '#CF6679',
  success: '#81C784',
  warning: '#FFB74D',
  info: '#64B5F6',
};
