import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useAppTheme } from '@theme/ThemeProvider';

interface LoadingScreenProps {
  message?: string;
}

/**
 * Tela de carregamento reutilizável
 */
export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = 'Carregando...',
}) => {
  const theme = useAppTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
      <Text style={[styles.text, { color: theme.colors.textSecondary }]}>
        {message}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  text: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '500',
  },
});
