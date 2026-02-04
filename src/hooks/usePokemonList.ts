import { useQuery } from '@tanstack/react-query';
import { getPokemonList, getPokemonDetails, getPokemonIdFromUrl, simplifyPokemon } from '@services/pokemonService';
import type { SimplifiedPokemon } from '../types/pokemon';

/**
 * Hook para buscar lista de pokémons com paginação
 * 
 * @param limit - Quantidade de pokémons por página (padrão: 20)
 * @param offset - Índice inicial para paginação (padrão: 0)
 * 
 * @returns {object} Objeto com:
 *  - data: Array de pokémons simplificados
 *  - isLoading: true enquanto carrega
 *  - error: objeto de erro se houver falha
 *  - refetch: função para recarregar
 * 
 * @example
 * ```tsx
 * const { data, isLoading } = usePokemonList(20, 0);
 * 
 * if (isLoading) return <Loading />;
 * return <PokemonCard pokemon={data[0]} />;
 * ```
 */
export const usePokemonList = (limit = 20, offset = 0, enabled = true) => {
  return useQuery({
    // QueryKey: identificador único para cache
    // Se limit/offset mudar, faz nova requisição
    queryKey: ['pokemonList', limit, offset],
    
    // QueryFn: função que busca os dados
    enabled,
    queryFn: async (): Promise<SimplifiedPokemon[]> => {
      try {
        // 1. Busca a lista básica (só nomes e URLs)
        const listResponse = await getPokemonList(limit, offset);
        
        // 2. Para cada item, busca os detalhes completos
        // Fazemos em paralelo com Promise.all para ser mais rápido
        const pokemonDetails = await Promise.all(
          listResponse.results.map(async (item) => {
            const id = getPokemonIdFromUrl(item.url);
            const details = await getPokemonDetails(id);
            
            // 3. Transforma em versão simplificada usando a função helper
            return simplifyPokemon(details);
          })
        );
        
        return pokemonDetails;
      } catch (err) {
        throw err;
      }
    },
    
    // Configurações de cache e revalidação
    staleTime: 1000 * 60 * 5, // Dados ficam "frescos" por 5 minutos
    gcTime: 1000 * 60 * 10, // Cache é mantido por 10 minutos
    retry: 2, // Tenta 2 vezes se falhar
  });
};
