import { lightColors, darkColors } from './colors';
import { spacing, borderRadius, fontSize, fontWeight } from './spacing';

export type Theme = {
  dark: boolean;
  colors: typeof lightColors;
  spacing: typeof spacing;
  borderRadius: typeof borderRadius;
  fontSize: typeof fontSize;
  fontWeight: typeof fontWeight;
};

export const lightTheme: Theme = {
  dark: false,
  colors: lightColors,
  spacing,
  borderRadius,
  fontSize,
  fontWeight,
};

export const darkTheme: Theme = {
  dark: true,
  colors: darkColors,
  spacing,
  borderRadius,
  fontSize,
  fontWeight,
};

export { lightColors, darkColors, spacing, borderRadius, fontSize, fontWeight };
