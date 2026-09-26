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
  // jest.fn para os testes poderem assertar a CHAMADA — cravar o scheme no
  // fonte produziria a mesma string de saída e passaria despercebido.
  createURL: jest.fn((path) => `mydex://${String(path).replace(/^\//, '')}`),
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

// Desliga só o retry: com o `retry: 2` do app, cada caminho de erro espera o
// backoff (segundos) e ainda deixa timers vivos, impedindo o Jest de encerrar.
// `setDefaultOptions` SUBSTITUI o objeto inteiro, então o resto da config de
// produção (staleTime, gcTime de 24h do offline-first, refetchOnWindowFocus)
// precisa ser repassado à mão — senão os testes rodam contra uma configuração
// que não é a do app.
const { queryClient } = require('./src/services/queryClient');
const defaultsDoApp = queryClient.getDefaultOptions();

queryClient.setDefaultOptions({
  ...defaultsDoApp,
  queries: { ...defaultsDoApp.queries, retry: false },
});

afterEach(() => {
  queryClient.clear();
});

// Nada de filtro global de console aqui. A versão anterior silenciava
// `favorites: sync com a nuvem falhou` em TODA a suíte — inclusive dentro do
// teste desse módulo —, então uma regressão que fizesse todo sync lançar
// deixava a suíte verde e muda. Quem espera um aviso silencia localmente.
// (O aviso de act() do React também não passa por aqui: ele sai por
// console.error, não console.warn.)
