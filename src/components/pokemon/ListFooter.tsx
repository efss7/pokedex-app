import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useAppTheme } from '@theme/ThemeProvider';

interface ListFooterProps {
  isLoading: boolean;
  isTypeFilter: boolean;
  hasReachedEnd: boolean;
  itemCount: number;
}

/**
 * Footer da lista de pokémons
 * Mostra loading ou mensagem de fim da lista
 */
export const ListFooter: React.FC<ListFooterProps> = ({
  isLoading,
  isTypeFilter,
  hasReachedEnd,
  itemCount,
}) => {
  const theme = useAppTheme();

  // Comportamento do filtro por tipo - mostrar fim da lista
  if (isTypeFilter && hasReachedEnd) {
    return (
      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
          ✓ Você chegou ao final da lista
        </Text>
        <Text style={[styles.footerSubtext, { color: theme.colors.textSecondary }]}>
          {itemCount} pokémons carregados
        </Text>
      </View>
    );
  }

  // Não mostra nada se não estiver carregando
  if (!isLoading) return null;

  // Loading indicator
  return (
    <View style={styles.footer}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
      <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
        Carregando mais pokémons...
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  footerText: {
    marginTop: 8,
    fontSize: 14,
  },
  footerSubtext: {
    marginTop: 4,
    fontSize: 12,
    fontStyle: 'italic',
  },
});
