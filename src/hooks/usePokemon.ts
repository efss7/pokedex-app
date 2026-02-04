import { useQuery } from '@tanstack/react-query';
import { getPokemonDetails } from '@services/pokemonService';
import type { Pokemon } from '../types/pokemon';

/**
 * Hook para buscar detalhes de um pokémon específico
 * 
 * @param idOrName - ID ou nome do pokémon (ex: 1 ou "bulbasaur")
 * @param enabled - Se false, não faz a requisição (útil para lazy loading)
 * 
 * @returns {object} Objeto com:
 *  - data: Dados completos do pokémon
 *  - isLoading: true enquanto carrega
 *  - error: objeto de erro se houver falha
 * 
 * @example
 * ```tsx
 * const { data: pokemon, isLoading } = usePokemon(1);
 * 
 * if (isLoading) return <Loading />;
 * return <Text>{pokemon.name}</Text>;
 * ```
 */
export const usePokemon = (idOrName: string | number, enabled = true) => {
  return useQuery({
    queryKey: ['pokemon', idOrName],
    queryFn: (): Promise<Pokemon> => getPokemonDetails(idOrName),
    staleTime: 1000 * 60 * 10, // 10 minutos (detalhes mudam menos)
    gcTime: 1000 * 60 * 30, // 30 minutos no cache
    enabled, // Só faz requisição se enabled for true
  });
};
