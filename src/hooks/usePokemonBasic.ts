import { useQuery } from '@tanstack/react-query';
import { getPokemonDetails } from '@services/pokemonService';
import type { Pokemon } from '../types/pokemon';

/**
 * Busca os dados básicos de um pokémon (endpoint /pokemon): stats, tipos,
 * sprites, altura e peso. Leve — não busca espécie/evolução.
 *
 * @param id - ID do pokémon (ou undefined para desabilitar).
 */
export const usePokemonBasic = (id?: number) => {
  return useQuery({
    queryKey: ['pokemon', id],
    queryFn: (): Promise<Pokemon> => getPokemonDetails(id as number),
    enabled: typeof id === 'number',
    staleTime: 1000 * 60 * 15,
    gcTime: 1000 * 60 * 30,
    retry: 2,
  });
};
