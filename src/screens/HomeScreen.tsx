import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAppTheme } from '@theme/ThemeProvider';

export const HomeScreen = () => {
  const theme = useAppTheme();

  useEffect(() => {
    // HomeScreen mounted
  }, [theme]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>
        Home Screen
      </Text>
      <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
        Pokedex App - Setup completo!
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
});
