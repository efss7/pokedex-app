import { useInfiniteQuery } from '@tanstack/react-query';
import {
  getPokemonList,
  getPokemonDetails,
  getPokemonIdFromUrl,
  simplifyPokemon,
} from '@services/pokemonService';
import type { SimplifiedPokemon } from '../types/pokemon';
import { ITEMS_PER_PAGE, MAX_POKEMON_ID } from '@constants/index';

/**
 * Busca uma página da lista geral e hidrata os detalhes (tipos + imagem).
 * Ignora formas alternativas (ids 10000+), que não têm espécie/artwork.
 */
const fetchListPage = async (offset: number): Promise<SimplifiedPokemon[]> => {
  const listResponse = await getPokemonList(ITEMS_PER_PAGE, offset);
  const validItems = listResponse.results.filter(
    (item) => getPokemonIdFromUrl(item.url) <= MAX_POKEMON_ID
  );
  const details = await Promise.all(
    validItems.map(async (item) => {
      const id = getPokemonIdFromUrl(item.url);
      return simplifyPokemon(await getPokemonDetails(id));
    })
  );
  return details;
};

/**
 * Lista paginada de pokémons com scroll infinito.
 *
 * Substitui o antigo controle manual de página + acúmulo em `useEffect`.
 * O TanStack Query cuida de paginação, cache e acúmulo das páginas.
 *
 * @example
 * const { data, fetchNextPage, hasNextPage } = usePokemonListInfinite();
 * const pokemons = data?.pages.flat() ?? [];
 */
export const usePokemonListInfinite = (enabled = true) => {
  return useInfiniteQuery({
    queryKey: ['pokemonList', 'infinite'],
    enabled,
    initialPageParam: 0,
    queryFn: ({ pageParam }) => fetchListPage(pageParam),
    // Para quando a página veio incompleta (fim/formas filtradas) ou quando o
    // próximo offset já passaria do último pokémon válido.
    getNextPageParam: (lastPage, allPages) => {
      const nextOffset = allPages.length * ITEMS_PER_PAGE;
      if (lastPage.length < ITEMS_PER_PAGE || nextOffset >= MAX_POKEMON_ID) {
        return undefined;
      }
      return nextOffset;
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    retry: 2,
  });
};
