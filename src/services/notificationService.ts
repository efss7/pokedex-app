import * as Notifications from 'expo-notifications';
import { SchedulableTriggerInputTypes } from 'expo-notifications';
import * as Linking from 'expo-linking';
import { getPokemonIndex } from '@services/pokemonService';
import type { SimplifiedPokemon } from '@/types/pokemon';

/**
 * Notificação local "Pokémon da semana".
 *
 * Uma notificação que repete (trigger WEEKLY) teria conteúdo fixo — o mesmo
 * pokémon para sempre. Por isso agendamos N ocorrências avulsas (trigger DATE),
 * cada uma com o seu pokémon, e recompomos a fila quando ela vai secando
 * (`refreshWeeklyPokemon`, chamado no boot).
 */

/** Marca as notificações desta feature, para não cancelar as de terceiros. */
const MARKER = 'weekly-pokemon';
const WEEKS_AHEAD = 8;
/** Segunda-feira (Date.getDay(): 0 = domingo) às 09:00. */
const WEEKDAY = 1;
const HOUR = 9;
/** Abaixo disto, a fila é reagendada no próximo boot. */
const REFRESH_THRESHOLD = 2;

// Mostra a notificação mesmo com o app em primeiro plano.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/** As próximas `count` segundas às 09:00, a partir de agora. */
const nextOccurrences = (count: number): Date[] => {
  const now = new Date();
  const cursor = new Date();
  cursor.setHours(HOUR, 0, 0, 0);

  const dates: Date[] = [];
  while (dates.length < count) {
    if (cursor.getDay() === WEEKDAY && cursor > now) {
      dates.push(new Date(cursor));
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return dates;
};

/** `count` pokémons distintos, sorteados do índice. */
const pickDistinct = (pool: SimplifiedPokemon[], count: number): SimplifiedPokemon[] => {
  const picked: SimplifiedPokemon[] = [];
  const used = new Set<number>();

  while (picked.length < count && used.size < pool.length) {
    const candidate = pool[Math.floor(Math.random() * pool.length)];
    if (used.has(candidate.id)) continue;
    used.add(candidate.id);
    picked.push(candidate);
  }
  return picked;
};

const capitalize = (name: string) => name.charAt(0).toUpperCase() + name.slice(1);

/**
 * Pede a permissão de notificações. Retorna false se o usuário negou (e, nesse
 * caso, só dá para reverter nos ajustes do sistema).
 */
export const ensureNotificationPermission = async (): Promise<boolean> => {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (!current.canAskAgain) return false;

  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
};

/** Quantas notificações desta feature ainda estão na fila. */
export const countWeeklyPokemon = async (): Promise<number> => {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  return scheduled.filter((n) => n.content.data?.kind === MARKER).length;
};

/** Cancela as notificações desta feature (não mexe em outras). */
export const cancelWeeklyPokemon = async (): Promise<void> => {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    scheduled
      .filter((n) => n.content.data?.kind === MARKER)
      .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier))
  );
};

/**
 * Reagenda a fila do zero: sorteia um pokémon por semana e agenda as próximas
 * `WEEKS_AHEAD` ocorrências. Precisa de rede (usa o índice da PokeAPI).
 */
export const scheduleWeeklyPokemon = async (): Promise<number> => {
  await cancelWeeklyPokemon();

  const index = await getPokemonIndex();
  const dates = nextOccurrences(WEEKS_AHEAD);
  const picks = pickDistinct(index, dates.length);

  await Promise.all(
    picks.map((pokemon, i) =>
      Notifications.scheduleNotificationAsync({
        content: {
          title: 'Pokémon da semana',
          body: `Esta semana: ${capitalize(pokemon.name)}. Toque para ver os detalhes.`,
          // Lido pelo linking do navigator (ver navigation/linking.ts).
          // `createURL` resolve para mydex:// na build e para exp://.../-- no
          // Expo Go, onde o scheme do app não está registrado.
          data: { kind: MARKER, url: Linking.createURL(`/pokemon/${pokemon.id}`) },
        },
        trigger: { type: SchedulableTriggerInputTypes.DATE, date: dates[i] },
      })
    )
  );

  return picks.length;
};

/** Recompõe a fila no boot, se ela já estiver quase vazia. */
export const refreshWeeklyPokemon = async (): Promise<void> => {
  if ((await countWeeklyPokemon()) >= REFRESH_THRESHOLD) return;
  await scheduleWeeklyPokemon();
};
