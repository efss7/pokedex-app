import { useQuery } from '@tanstack/react-query';
import { getPokemonTypeNames } from '@services/pokemonService';
import type { PokemonTypeName } from '@constants/index';

/**
 * Hidrata os tipos de um pokémon sob demanda.
 *
 * Usado pelo card quando ele vem do índice leve (sem tipos) — ex.: resultados
 * de busca. Como o FlatList só renderiza os itens visíveis, apenas esses
 * disparam a requisição, que fica em cache para os próximos acessos.
 *
 * @param id - ID do pokémon.
 * @param enabled - Só busca quando os tipos ainda não são conhecidos.
 */
export const usePokemonCardTypes = (id: number, enabled: boolean) => {
  return useQuery({
    queryKey: ['pokemonTypes', id],
    queryFn: (): Promise<PokemonTypeName[]> => getPokemonTypeNames(id),
    enabled,
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60,
    retry: 1,
  });
};
