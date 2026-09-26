import { Platform } from 'react-native';
import * as Linking from 'expo-linking';
import * as Notifications from 'expo-notifications';
import {
  getStateFromPath as getStateFromPathPadrao,
  getPathFromState as getPathFromStatePadrao,
} from '@react-navigation/native';
import type { LinkingOptions } from '@react-navigation/native';
import type { RootStackParamList } from './AppNavigator';
import { isSuportado as notificacoesSuportadas } from '@services/notificationService';
import appConfig from '../../app.json';

/**
 * O GitHub Pages serve um repositório de projeto sob um subcaminho
 * (/pokedex-app). O `experiments.baseUrl` do app.json prefixa o HTML e os
 * assets, mas o React Navigation no web lê `window.location.pathname` cru e não
 * conhece esse prefixo — sem tradução, `/pokedex-app/pokemon/25` não casa com
 * rota nenhuma e o `useLinking` reescreve a URL para fora do subcaminho logo na
 * montagem, quebrando reload e link compartilhado.
 *
 * Lido do app.json para as duas pontas não saírem de sincronia.
 */
const BASE_PATH = Platform.OS === 'web' ? appConfig.expo.experiments?.baseUrl ?? '' : '';

/**
 * Reanexa o prefixo nos `path` das rotas devolvidas pelo parser.
 *
 * Não é detalhe: no load inicial o `useLinking` do react-navigation reusa
 * `route.path` direto e **não** chama `getPathFromState`
 * (`useLinking.js:330-347`). Sem isto, o `history.replace` da montagem grava a
 * URL sem o subcaminho — o primeiro reload funciona, e o seguinte cai fora do
 * site. Sintoma exato que apareceu ao testar.
 */
const reporPrefixo = <T extends { routes?: { path?: string; state?: unknown }[] } | undefined>(
  state: T
): T => {
  if (!BASE_PATH || !state?.routes) return state;

  return {
    ...state,
    routes: state.routes.map((rota) => ({
      ...rota,
      ...(rota.path ? { path: BASE_PATH + rota.path } : {}),
      ...(rota.state ? { state: reporPrefixo(rota.state as never) } : {}),
    })),
  };
};

/** A notificação "Pokémon da semana" carrega o deep link em `data.url`. */
const urlFromNotification = (response: Notifications.NotificationResponse | null) => {
  const url = response?.notification.request.content.data?.url;
  return typeof url === 'string' ? url : null;
};

/**
 * Configuração de deep linking.
 *
 * Exemplos:
 *  - mydex://                → lista (Pokédex)
 *  - mydex://pokemon/25      → detalhes do Pikachu
 *  - mydex://favorites       → favoritos
 *  - mydex://account         → conta
 *
 * `Linking.createURL('/')` cobre tanto o scheme nativo (mydex://) quanto a URL
 * de desenvolvimento do Expo Go (exp://.../--/). `initialRouteName` garante que
 * a lista fique por baixo, então abrir um detalhe por link ainda tem "voltar".
 */
export const linking: LinkingOptions<RootStackParamList> = {
  prefixes: [Linking.createURL('/'), 'mydex://'],

  // Traduz entre a URL do navegador (com o subcaminho) e as rotas do app (sem).
  // No nativo BASE_PATH é vazio e as duas funções viram o comportamento padrão.
  getStateFromPath(path, options) {
    const semBase =
      BASE_PATH && path.startsWith(BASE_PATH) ? path.slice(BASE_PATH.length) || '/' : path;

    return reporPrefixo(getStateFromPathPadrao(semBase, options));
  },

  getPathFromState(state, options) {
    return BASE_PATH + getPathFromStatePadrao(state, options);
  },

  // App aberto pelo toque numa notificação (estava fechado).
  async getInitialURL() {
    const url = await Linking.getInitialURL();
    if (url) return url;

    // O módulo nativo guarda a última resposta pelo processo inteiro, então é
    // preciso consumi-la: sem o clear, uma remontagem do NavigationContainer
    // (recriação de Activity no Android, por exemplo) leria a mesma resposta e
    // reabriria uma rota que o usuário já tinha visitado.
    // No web não há módulo de notificação para consultar.
    if (!notificacoesSuportadas) return null;

    const fromNotification = urlFromNotification(Notifications.getLastNotificationResponse());
    if (fromNotification) Notifications.clearLastNotificationResponse();

    return fromNotification;
  },

  // App já aberto: reage tanto a deep links quanto ao toque em notificações.
  subscribe(listener) {
    const linkSubscription = Linking.addEventListener('url', ({ url }) => listener(url));

    if (!notificacoesSuportadas) {
      return () => linkSubscription.remove();
    }

    const notificationSubscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const url = urlFromNotification(response);
        if (url) listener(url);
      }
    );

    return () => {
      linkSubscription.remove();
      notificationSubscription.remove();
    };
  },

  config: {
    initialRouteName: 'PokemonList',
    screens: {
      PokemonList: '',
      Favorites: 'favorites',
      Account: 'account',
      Comparison: 'compare',
      Ranking: 'ranking',
      PokemonDetail: {
        path: 'pokemon/:pokemonId',
        parse: {
          pokemonId: (id: string) => Number(id),
        },
        stringify: {
          pokemonId: (id: number) => String(id),
        },
      },
    },
  },
};
