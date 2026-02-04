import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAppTheme } from '@theme/ThemeProvider';

interface ErrorScreenProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  showRetry?: boolean;
}

/**
 * Tela de erro reutilizável
 */
export const ErrorScreen: React.FC<ErrorScreenProps> = ({
  title = '❌ Algo deu errado',
  message = 'Ocorreu um erro ao carregar os dados. Tente novamente.',
  onRetry,
  showRetry = true,
}) => {
  const theme = useAppTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.error }]}>
        {title}
      </Text>
      <Text style={[styles.message, { color: theme.colors.textSecondary }]}>
        {message}
      </Text>

      {showRetry && onRetry && (
        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.colors.primary }]}
          onPress={onRetry}
        >
          <Text style={styles.buttonText}>Tentar Novamente</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
});
