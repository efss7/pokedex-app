import { useQuery } from '@tanstack/react-query';
import { getPokemonIndex } from '@services/pokemonService';
import type { SimplifiedPokemon } from '../types/pokemon';

/**
 * Índice leve com TODOS os pokémons (id, nome, imagem).
 *
 * Faz uma única requisição e mantém em cache por bastante tempo. É a base
 * da busca por nome (filtro em memória) e da tela de favoritos.
 *
 * @param enabled - Só busca quando necessário (ex.: ao iniciar uma busca).
 */
export const usePokemonIndex = (enabled = true) => {
  return useQuery({
    queryKey: ['pokemonIndex'],
    queryFn: (): Promise<SimplifiedPokemon[]> => getPokemonIndex(),
    enabled,
    staleTime: 1000 * 60 * 60, // 1 hora — a lista de pokémons quase não muda
    gcTime: 1000 * 60 * 60 * 2,
    retry: 2,
  });
};
