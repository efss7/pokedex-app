import * as Linking from 'expo-linking';
import type { LinkingOptions } from '@react-navigation/native';
import type { RootStackParamList } from './AppNavigator';

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
