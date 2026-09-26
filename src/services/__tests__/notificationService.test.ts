import * as Notifications from 'expo-notifications';
import {
  scheduleWeeklyPokemon,
  cancelWeeklyPokemon,
  countWeeklyPokemon,
  refreshWeeklyPokemon,
  ensureNotificationPermission,
} from '@services/notificationService';
import { getPokemonIndex } from '@services/pokemonService';
import { queryClient } from '@services/queryClient';

jest.mock('@services/pokemonService', () => ({
  getPokemonIndex: jest.fn(),
}));

const INDICE = Array.from({ length: 30 }, (_, i) => ({
  id: i + 1,
  name: `pokemon-${i + 1}`,
  image: '',
  imageUrl: '',
  types: [],
}));

/** Notificação agendada como o expo-notifications a devolve. */
const agendada = (id: string, kind = 'weekly-pokemon') => ({
  identifier: id,
  content: { data: { kind, url: 'mydex://pokemon/1' } },
});

beforeEach(() => {
  jest.clearAllMocks();
  queryClient.clear();
  (getPokemonIndex as jest.Mock).mockResolvedValue(INDICE);
  (Notifications.getAllScheduledNotificationsAsync as jest.Mock).mockResolvedValue([]);
});

describe('ensureNotificationPermission', () => {
  it('não pede de novo quando já está concedida', async () => {
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ granted: true });

    await expect(ensureNotificationPermission()).resolves.toBe(true);
    expect(Notifications.requestPermissionsAsync).not.toHaveBeenCalled();
  });

  it('retorna false sem pedir quando o usuário já negou de vez', async () => {
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
      granted: false,
      canAskAgain: false,
    });

    await expect(ensureNotificationPermission()).resolves.toBe(false);
    expect(Notifications.requestPermissionsAsync).not.toHaveBeenCalled();
  });
});

describe('scheduleWeeklyPokemon', () => {
  it('agenda 8 segundas futuras às 9h, uma por semana', async () => {
    const total = await scheduleWeeklyPokemon();
    expect(total).toBe(8);

    const chamadas = (Notifications.scheduleNotificationAsync as jest.Mock).mock.calls;
    expect(chamadas).toHaveLength(8);

    const datas = chamadas.map(([arg]) => arg.trigger.date as Date);
    const agora = new Date();

    datas.forEach((data) => {
      expect(data.getDay()).toBe(1); // segunda
      expect(data.getHours()).toBe(9);
      expect(data.getTime()).toBeGreaterThan(agora.getTime());
    });

    // Espaçadas exatamente uma semana.
    datas.slice(1).forEach((data, i) => {
      const dias = Math.round((data.getTime() - datas[i].getTime()) / 86_400_000);
      expect(dias).toBe(7);
    });
  });

  it('sorteia pokémons distintos e embute o deep link de cada um', async () => {
    await scheduleWeeklyPokemon();

    const conteudos = (Notifications.scheduleNotificationAsync as jest.Mock).mock.calls.map(
      ([arg]) => arg.content
    );

    const urls = conteudos.map((c) => c.data.url);
    expect(new Set(urls).size).toBe(urls.length);
    urls.forEach((url) => expect(url).toMatch(/^mydex:\/\/pokemon\/\d+$/));
    conteudos.forEach((c) => expect(c.data.kind).toBe('weekly-pokemon'));
  });

  // Regressão: cancelar antes de buscar deixava o usuário com ZERO notificações
  // quando a rede falhava, e o toggle seguia marcado como ligado.
  it('não cancela a fila existente se a busca do índice falhar', async () => {
    (Notifications.getAllScheduledNotificationsAsync as jest.Mock).mockResolvedValue([
      agendada('existente-1'),
    ]);
    (getPokemonIndex as jest.Mock).mockRejectedValue(new Error('offline'));

    await expect(scheduleWeeklyPokemon()).rejects.toThrow('offline');

    expect(Notifications.cancelScheduledNotificationAsync).not.toHaveBeenCalled();
    expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
  });
});

describe('cancelWeeklyPokemon', () => {
  it('cancela só as notificações desta feature', async () => {
    (Notifications.getAllScheduledNotificationsAsync as jest.Mock).mockResolvedValue([
      agendada('minha-1'),
      agendada('de-terceiro', 'outra-feature'),
      agendada('minha-2'),
    ]);

    await cancelWeeklyPokemon();

    const canceladas = (Notifications.cancelScheduledNotificationAsync as jest.Mock).mock.calls.flat();
    expect(canceladas).toEqual(['minha-1', 'minha-2']);
  });
});

describe('countWeeklyPokemon / refreshWeeklyPokemon', () => {
  it('conta só as desta feature', async () => {
    (Notifications.getAllScheduledNotificationsAsync as jest.Mock).mockResolvedValue([
      agendada('a'),
      agendada('b', 'outra-feature'),
    ]);

    await expect(countWeeklyPokemon()).resolves.toBe(1);
  });

  it('não reagenda enquanto a fila ainda tem folga', async () => {
    (Notifications.getAllScheduledNotificationsAsync as jest.Mock).mockResolvedValue([
      agendada('a'),
      agendada('b'),
    ]);

    await refreshWeeklyPokemon();

    expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
  });

  it('repõe a fila quando ela está secando', async () => {
    (Notifications.getAllScheduledNotificationsAsync as jest.Mock).mockResolvedValue([
      agendada('ultima'),
    ]);

    await refreshWeeklyPokemon();

    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(8);
  });
});
