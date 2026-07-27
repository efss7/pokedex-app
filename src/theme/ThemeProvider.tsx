import React, { createContext, useContext, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { useThemeStore } from '@store/themeStore';
import { lightTheme, darkTheme, Theme } from '@theme/index';

const ThemeContext = createContext<Theme>(lightTheme);

export const useAppTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useAppTheme must be used within ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const preference = useThemeStore((state) => state.preference);
  const systemScheme = useColorScheme(); // 'light' | 'dark' | null

  const resolvedMode =
    preference === 'system' ? systemScheme ?? 'light' : preference;
  const theme = resolvedMode === 'dark' ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
  );
};
