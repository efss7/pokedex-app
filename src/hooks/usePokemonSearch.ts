import { useQuery } from '@tanstack/react-query';
import { getPokemonList, getPokemonDetails, getPokemonIdFromUrl, simplifyPokemon } from '@services/pokemonService';
import type { SimplifiedPokemon } from '../types/pokemon';

/**
 * Hook para buscar TODOS os pokémons de uma vez
 * Usado quando usuário faz busca por nome
 * 
 * @param enabled - Se a query deve executar
 * 
 * @returns {object} Objeto com todos os pokémons
 */
export const usePokemonSearch = (enabled = true) => {
  return useQuery({
    queryKey: ['pokemonSearch'],
    enabled,
    queryFn: async (): Promise<SimplifiedPokemon[]> => {
      try {
        // Busca 1000 pokémons de uma vez (PokeAPI tem ~1025 atualmente)
        const listResponse = await getPokemonList(1000, 0);
        
        // Busca detalhes em paralelo
        const pokemonDetails = await Promise.all(
          listResponse.results.map(async (item) => {
            const id = getPokemonIdFromUrl(item.url);
            const details = await getPokemonDetails(id);
            return simplifyPokemon(details);
          })
        );
        
        // Ordena por ID
        return pokemonDetails.sort((a, b) => a.id - b.id);
      } catch (err) {
        throw err;
      }
    },
    
    staleTime: 1000 * 60 * 30, // Cache por 30 minutos
    gcTime: 1000 * 60 * 60, // Mantém por 1 hora
    retry: 2,
  });
};
