import * as Linking from 'expo-linking';
import * as Notifications from 'expo-notifications';
import type { LinkingOptions } from '@react-navigation/native';
import type { RootStackParamList } from './AppNavigator';
import { isSuportado as notificacoesSuportadas } from '@services/notificationService';

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
