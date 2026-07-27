import { useInfiniteQuery } from '@tanstack/react-query';
import {
  getPokemonByType,
  getPokemonDetails,
  getPokemonIdFromUrl,
  simplifyPokemon,
} from '@services/pokemonService';
import { queryClient } from '@services/queryClient';
import type { SimplifiedPokemon, PokemonTypeResponse } from '../types/pokemon';
import { ITEMS_PER_PAGE, MAX_POKEMON_ID } from '@constants/index';

/**
 * Busca (e cacheia) a lista completa de pokémons de um tipo — apenas nome+URL,
 * sem detalhes. Reutilizada entre páginas via `queryClient.fetchQuery`, então
 * o request pesado do endpoint `/type` acontece só uma vez por tipo.
 */
const fetchTypeRoster = (type: string): Promise<PokemonTypeResponse> =>
  queryClient.fetchQuery({
    queryKey: ['typeRoster', type],
    queryFn: () => getPokemonByType(type),
    staleTime: 1000 * 60 * 30,
  });

const fetchTypePage = async (
  type: string,
  offset: number
): Promise<SimplifiedPokemon[]> => {
  const roster = await fetchTypeRoster(type);
  // Remove formas alternativas (ids 10000+) antes de paginar.
  const validRoster = roster.pokemon.filter(
    (item) => getPokemonIdFromUrl(item.pokemon.url) <= MAX_POKEMON_ID
  );
  const slice = validRoster.slice(offset, offset + ITEMS_PER_PAGE);
  const details = await Promise.all(
    slice.map(async (item) => {
      const id = getPokemonIdFromUrl(item.pokemon.url);
      return simplifyPokemon(await getPokemonDetails(id));
    })
  );
  return details.sort((a, b) => a.id - b.id);
};

/**
 * Lista paginada (scroll infinito) de pokémons de um tipo específico.
 *
 * @param type - Nome do tipo (ex.: 'fire'); ignora 'all'/null.
 * @param enabled - Se a query deve executar.
 */
export const usePokemonByTypeInfinite = (
  type?: string | null,
  enabled = true
) => {
  const activeType = type && type !== 'all' ? type : null;
  return useInfiniteQuery({
    queryKey: ['pokemonByType', 'infinite', activeType],
    enabled: Boolean(activeType) && enabled,
    initialPageParam: 0,
    queryFn: ({ pageParam }) => fetchTypePage(activeType as string, pageParam),
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length < ITEMS_PER_PAGE ? undefined : allPages.length * ITEMS_PER_PAGE,
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 15,
    retry: 2,
  });
};
