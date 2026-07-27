import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { getFullPokemonDetails } from '@services/pokemonService';
import type { PokemonDetails } from '../types/pokemon';

/**
 * Hook para buscar TODOS os detalhes de um pokémon
 * Usado na tela de detalhes
 * 
 * Busca em paralelo:
 * - Dados básicos do pokémon
 * - Dados da espécie (descrição, stats extras)
 * - Cadeia evolutiva
 * 
 * @param idOrName - ID ou nome do pokémon
 * @param enabled - Se false, não faz a requisição (útil para lazy loading)
 * 
 * @returns {object} Objeto com:
 *  - data: PokemonDetails completo (pokemon + species + evolutionChain + description + genus)
 *  - isLoading: true enquanto carrega
 *  - error: objeto de erro se houver falha
 *  - refetch: função para recarregar
 * 
 * @example
 * ```tsx
 * const { data: details, isLoading } = usePokemonDetails(25); // Pikachu
 * 
 * if (isLoading) return <Loading />;
 * 
 * return (
 *   <View>
 *     <Text>{details.pokemon.name}</Text>
 *     <Text>{details.description}</Text>
 *     <Text>{details.genus}</Text>
 *     {details.evolutionChain && <EvolutionChain data={details.evolutionChain} />}
 *   </View>
 * );
 * ```
 */
export const usePokemonDetails = (idOrName: string | number, enabled = true) => {
  return useQuery({
    queryKey: ['pokemonDetails', idOrName],
    queryFn: (): Promise<PokemonDetails> => getFullPokemonDetails(idOrName),
    
    // Mantém os dados anteriores enquanto carrega outro pokémon
    // (transição suave na navegação anterior/próximo).
    placeholderData: keepPreviousData,

    // Configurações de cache
    staleTime: 1000 * 60 * 15, // 15 minutos (detalhes não mudam com frequência)
    gcTime: 1000 * 60 * 30, // 30 minutos no cache
    retry: 2, // Tenta 2 vezes se falhar
    enabled, // Só faz requisição se enabled for true
  });
};
