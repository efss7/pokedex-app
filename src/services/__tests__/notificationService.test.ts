import * as Notifications from 'expo-notifications';
import { SchedulableTriggerInputTypes } from 'expo-notifications';
import * as Linking from 'expo-linking';
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

    datas.forEach((data) => {
      expect(data.getDay()).toBe(1); // segunda
      expect(data.getHours()).toBe(9);
    });

    // Espaçadas exatamente uma semana.
    datas.slice(1).forEach((data, i) => {
      const dias = Math.round((data.getTime() - datas[i].getTime()) / 86_400_000);
      expect(dias).toBe(7);
    });
  });

  // O tipo do trigger é a decisão de design central do módulo: um trigger
  // WEEKLY repetiria o MESMO conteúdo, ou seja, o mesmo pokémon para sempre.
  // Sem esta asserção, trocar DATE por WEEKLY passava despercebido.
  it('usa trigger de data avulsa, não um semanal que repetiria o mesmo pokémon', async () => {
    await scheduleWeeklyPokemon();

    const triggers = (Notifications.scheduleNotificationAsync as jest.Mock).mock.calls.map(
      ([arg]) => arg.trigger
    );

    triggers.forEach((trigger) => {
      expect(trigger.type).toBe(SchedulableTriggerInputTypes.DATE);
      expect(trigger.date).toBeInstanceOf(Date);
    });
  });

  // A guarda `cursor > now` só é exercida quando hoje é segunda — em 6 dos 7
  // dias da semana a asserção seria vazia. Relógio fixo para não depender do
  // calendário de quem roda.
  describe('primeira ocorrência quando hoje é segunda', () => {
    const SEGUNDA = 28; // 28/09/2026 é uma segunda-feira

    afterEach(() => jest.useRealTimers());

    it('inclui hoje se ainda não deu 9h', async () => {
      jest.useFakeTimers().setSystemTime(new Date(2026, 8, SEGUNDA, 8, 0));

      await scheduleWeeklyPokemon();

      const [primeira] = (Notifications.scheduleNotificationAsync as jest.Mock).mock.calls.map(
        ([arg]) => arg.trigger.date as Date
      );
      expect(primeira.getDate()).toBe(SEGUNDA);
    });

    it('pula para a semana seguinte se as 9h já passaram', async () => {
      jest.useFakeTimers().setSystemTime(new Date(2026, 8, SEGUNDA, 10, 0));

      await scheduleWeeklyPokemon();

      const [primeira] = (Notifications.scheduleNotificationAsync as jest.Mock).mock.calls.map(
        ([arg]) => arg.trigger.date as Date
      );
      expect(primeira.getDate()).toBe(5); // 05/10, a segunda seguinte
      expect(primeira.getMonth()).toBe(9);
    });
  });

  it('monta o deep link pelo Linking.createURL, não com o scheme cravado', async () => {
    await scheduleWeeklyPokemon();

    // Asserção sobre a CHAMADA, não sobre a string que o mock devolve: cravar
    // `mydex://` no fonte produziria a mesma string aqui e quebraria no Expo
    // Go, onde o scheme do app não está registrado.
    expect(Linking.createURL).toHaveBeenCalledTimes(8);
    (Linking.createURL as jest.Mock).mock.calls.forEach(([caminho]) => {
      expect(caminho).toMatch(/^\/pokemon\/\d+$/);
    });

    const conteudos = (Notifications.scheduleNotificationAsync as jest.Mock).mock.calls.map(
      ([arg]) => arg.content
    );
    conteudos.forEach((c) => expect(c.data.kind).toBe('weekly-pokemon'));
  });

  it('sorteia pokémons distintos, sem repetir semanas seguidas', async () => {
    // Math.random determinístico, com valores repetidos: sem o dedupe de
    // pickDistinct os repetidos viram pokémons iguais e o teste falha sempre.
    // Com o dedupe, os repetidos são descartados e sobram 8 distintos.
    const sequencia = [0.1, 0.1, 0.2, 0.2, 0.3, 0.3, 0.4, 0.4, 0.5, 0.6, 0.7, 0.8];
    let i = 0;
    jest.spyOn(Math, 'random').mockImplementation(() => sequencia[i++ % sequencia.length]);

    await scheduleWeeklyPokemon();

    const urls = (Notifications.scheduleNotificationAsync as jest.Mock).mock.calls.map(
      ([arg]) => arg.content.data.url
    );
    expect(new Set(urls).size).toBe(8);

    (Math.random as jest.Mock).mockRestore();
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
