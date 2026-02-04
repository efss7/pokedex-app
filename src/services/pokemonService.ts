import { pokemonApi } from './api';
import type { 
  PokemonListResponse, 
  Pokemon, 
  PokemonTypeResponse,
  SimplifiedPokemon,
} from '../types/pokemon';

/**
 * Serviço para interagir com a PokeAPI
 * Documentação: https://pokeapi.co/docs/v2
 */

/**
 * Busca lista paginada de pokémons
 * @param limit - Quantidade de pokémons por página (padrão: 20)
 * @param offset - Índice inicial (padrão: 0)
 * @returns Lista de pokémons com info de paginação
 */
export const getPokemonList = async (
  limit = 20, 
  offset = 0
): Promise<PokemonListResponse> => {
  const response = await pokemonApi.get<PokemonListResponse>('/pokemon', {
    params: { limit, offset },
  });
  return response.data;
};

/**
 * Busca detalhes completos de um pokémon específico
 * @param idOrName - ID numérico ou nome do pokémon
 * @returns Dados completos do pokémon
 */
export const getPokemonDetails = async (
  idOrName: string | number
): Promise<Pokemon> => {
  const response = await pokemonApi.get<Pokemon>(`/pokemon/${idOrName}`);
  return response.data;
};

/**
 * Busca pokémons de um tipo específico
 * @param type - Nome do tipo (ex: 'fire', 'water', 'grass')
 * @returns Lista de pokémons daquele tipo
 */
export const getPokemonByType = async (
  type: string
): Promise<PokemonTypeResponse> => {
  const response = await pokemonApi.get<PokemonTypeResponse>(`/type/${type}`);
  return response.data;
};

/**
 * Extrai o ID do pokémon a partir da URL da PokeAPI
 * Exemplo: "https://pokeapi.co/api/v2/pokemon/1/" -> 1
 * @param url - URL retornada pela API
 * @returns ID numérico do pokémon
 */
export const getPokemonIdFromUrl = (url: string): number => {
  const parts = url.split('/').filter(Boolean);
  return parseInt(parts[parts.length - 1], 10);
};

/**
 * Converte Pokemon completo para versão simplificada
 * @param pokemon - Dados completos do pokémon
 * @returns Versão simplificada para uso em cards
 */
export const simplifyPokemon = (pokemon: Pokemon): SimplifiedPokemon => {
  return {
    id: pokemon.id,
    name: pokemon.name,
    image: pokemon.sprites.other['official-artwork'].front_default,
    imageUrl: pokemon.sprites.other['official-artwork'].front_default,
    types: pokemon.types.map((t) => t.type.name),
  };
};
