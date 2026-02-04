import { useQuery } from '@tanstack/react-query';
import {
	getPokemonByType,
	getPokemonDetails,
	getPokemonIdFromUrl,
	simplifyPokemon,
} from '@services/pokemonService';
import type { SimplifiedPokemon } from '../types/pokemon';

/**
 * Hook para buscar pokémons de um tipo com paginação
 *
 * @param type - Nome do tipo (ex: 'fire', 'water')
 * @param limit - Quantidade de pokémons por página (padrão: 20)
 * @param offset - Índice inicial (padrão: 0)
 * @param enabled - Se a query deve executar
 */
export const usePokemonByType = (
	type?: string | null,
	limit = 20,
	offset = 0,
	enabled = true
) => {
	return useQuery({
		queryKey: ['pokemonByType', type, limit, offset],
		enabled: Boolean(type && type !== 'all') && enabled,
		queryFn: async (): Promise<SimplifiedPokemon[]> => {
			if (!type || type === 'all') return [];

			try {
			const response = await getPokemonByType(type);

			// Aplicar offset e limit manualmente
			const sliced = response.pokemon.slice(offset, offset + limit);

			const pokemonDetails = await Promise.all(
				sliced.map(async (item) => {
					const id = getPokemonIdFromUrl(item.pokemon.url);
					const details = await getPokemonDetails(id);
					return simplifyPokemon(details);
				})
			);

			return pokemonDetails.sort((a, b) => a.id - b.id);
			} catch (err) {
				console.error('usePokemonByType: Error', err);
				throw err;
			}
		},
		staleTime: 1000 * 60 * 10,
		gcTime: 1000 * 60 * 15,
		retry: 2,
	});
};
