import React from 'react';
import { View, Text, StyleSheet, Switch, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@theme/ThemeProvider';
import { useWeeklyPokemonStore } from '@store/weeklyPokemonStore';
import {
  ensureNotificationPermission,
  scheduleWeeklyPokemon,
  cancelWeeklyPokemon,
  isSuportado,
} from '@services/notificationService';

/**
 * Liga/desliga a notificação local semanal. Agendar precisa de rede (sorteia os
 * pokémons do índice da PokeAPI), então o toggle só vira depois que o
 * agendamento conclui — assim o estado salvo nunca mente sobre a fila real.
 */
export const WeeklyPokemonToggle = () => {
  const theme = useAppTheme();
  const enabled = useWeeklyPokemonStore((state) => state.enabled);
  const setEnabled = useWeeklyPokemonStore((state) => state.setEnabled);

  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Some no web: notificação local agendada não existe no browser, e um toggle
  // que não faz nada é pior que toggle nenhum.
  const oculto = !isSuportado;

  const handleToggle = async (next: boolean) => {
    setError(null);
    setBusy(true);
    try {
      if (next) {
        if (!(await ensureNotificationPermission())) {
          setError('Permissão negada. Libere as notificações nos ajustes do sistema.');
          return;
        }
        await scheduleWeeklyPokemon();
      } else {
        await cancelWeeklyPokemon();
      }
      setEnabled(next);
    } catch {
      setError('Não foi possível agendar agora. Verifique sua conexão e tente de novo.');
    } finally {
      setBusy(false);
    }
  };

  if (oculto) return null;

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
      <View style={styles.row}>
        <Ionicons name="notifications-outline" size={22} color={theme.colors.primary} />
        <View style={styles.texts}>
          <Text style={[styles.title, { color: theme.colors.text }]}>Pokémon da semana</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            Uma notificação toda segunda, às 9h, com um pokémon sorteado.
          </Text>
        </View>
        {busy ? (
          <ActivityIndicator color={theme.colors.primary} style={styles.switch} />
        ) : (
          <Switch
            value={enabled}
            onValueChange={handleToggle}
            trackColor={{ true: theme.colors.primary, false: theme.colors.border }}
            style={styles.switch}
          />
        )}
      </View>

      {error ? <Text style={[styles.error, { color: theme.colors.error }]}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginTop: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  texts: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  switch: {
    marginLeft: 4,
  },
  error: {
    fontSize: 13,
    marginTop: 10,
    lineHeight: 18,
  },
});
