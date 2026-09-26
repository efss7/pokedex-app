/* eslint-disable no-undef */

// Módulos nativos que não existem no ambiente do Jest. Os mocks de
// AsyncStorage e NetInfo são os oficiais, publicados pelas próprias libs.
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock('@react-native-community/netinfo', () =>
  require('@react-native-community/netinfo/jest/netinfo-mock')
);

jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));

// expo-notifications toca o módulo nativo já no import (setNotificationHandler),
// então precisa de mock mesmo em teste que não exercita notificação.
jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  getPermissionsAsync: jest.fn(async () => ({ granted: true, canAskAgain: true })),
  requestPermissionsAsync: jest.fn(async () => ({ granted: true, canAskAgain: true })),
  scheduleNotificationAsync: jest.fn(async () => 'notification-id'),
  cancelScheduledNotificationAsync: jest.fn(async () => undefined),
  getAllScheduledNotificationsAsync: jest.fn(async () => []),
  getLastNotificationResponse: jest.fn(() => null),
  clearLastNotificationResponse: jest.fn(),
  addNotificationResponseReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  SchedulableTriggerInputTypes: { DATE: 'date', WEEKLY: 'weekly', TIME_INTERVAL: 'timeInterval' },
}));

jest.mock('expo-linking', () => ({
  createURL: (path) => `mydex://${String(path).replace(/^\//, '')}`,
  getInitialURL: jest.fn(async () => null),
  addEventListener: jest.fn(() => ({ remove: jest.fn() })),
}));

// Os ícones puxam expo-font → expo-asset, que o npm não hoistou para a raiz e
// que nada acrescenta ao teste. Viram Text com o nome do ícone, o que ainda
// permite asserção por testID quando a tela usa um.
jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  const { Text } = require('react-native');

  const criarIcone = (conjunto) => {
    const Icone = ({ name, testID, ...rest }) =>
      React.createElement(Text, { ...rest, testID: testID ?? `${conjunto}-${name}` }, name);
    Icone.displayName = conjunto;
    return Icone;
  };

  return {
    Ionicons: criarIcone('Ionicons'),
    MaterialIcons: criarIcone('MaterialIcons'),
  };
});

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
}));

// O queryClient do app tem `retry: 2`. Em teste isso faz cada caminho de erro
// esperar o backoff (segundos) e ainda deixa timers vivos, impedindo o Jest de
// encerrar. Aqui o comportamento de retry não é o que está sob teste.
const { queryClient } = require('./src/services/queryClient');
queryClient.setDefaultOptions({ queries: { retry: false, gcTime: 0 } });

afterEach(() => {
  queryClient.clear();
});

// Avisos esperados em teste (caminhos de erro que o código loga de propósito,
// e o act() das animações de entrada). O resto passa normalmente, senão um
// aviso legítimo de regressão passaria despercebido.
const AVISOS_ESPERADOS = ['not wrapped in act', 'favorites: sync com a nuvem falhou'];
const warnOriginal = console.warn;

jest.spyOn(console, 'warn').mockImplementation((...args) => {
  const texto = String(args[0] ?? '');
  if (AVISOS_ESPERADOS.some((esperado) => texto.includes(esperado))) return;
  warnOriginal(...args);
});
