import { pokemonApi } from './api';
import type { 
  PokemonListResponse, 
  Pokemon, 
  PokemonTypeResponse,
  SimplifiedPokemon,
  PokemonSpecies,
  EvolutionChain,
  PokemonDetails,
} from '../types/pokemon';
import type { PokemonTypeName } from '@constants/index';
import { MAX_POKEMON_ID } from '@constants/index';

/**
 * Serviço para interagir com a PokeAPI
 * Documentação: https://pokeapi.co/docs/v2
 */

/**
 * URL da arte oficial (official-artwork) derivada apenas do ID.
 * Evita ter que buscar os detalhes de um pokémon só para exibir a imagem.
 */
const OFFICIAL_ARTWORK_BASE =
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork';

export const getOfficialArtworkUrl = (id: number): string =>
  `${OFFICIAL_ARTWORK_BASE}/${id}.png`;

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
 * Relações de dano de um tipo (para calcular fraquezas/resistências).
 */
export interface TypeDamageRelations {
  double_damage_from: { name: PokemonTypeName; url: string }[];
  half_damage_from: { name: PokemonTypeName; url: string }[];
  no_damage_from: { name: PokemonTypeName; url: string }[];
}

/**
 * Busca as relações de dano de um tipo (quanto dano ele RECEBE de cada tipo).
 * @param type - Nome do tipo (ex: 'fire')
 */
export const getTypeDamageRelations = async (
  type: string
): Promise<TypeDamageRelations> => {
  const response = await pokemonApi.get<{ damage_relations: TypeDamageRelations }>(
    `/type/${type}`
  );
  const dr = response.data.damage_relations;
  return {
    double_damage_from: dr.double_damage_from,
    half_damage_from: dr.half_damage_from,
    no_damage_from: dr.no_damage_from,
  };
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
  const image =
    pokemon.sprites.other['official-artwork'].front_default ||
    getOfficialArtworkUrl(pokemon.id);
  return {
    id: pokemon.id,
    name: pokemon.name,
    image,
    imageUrl: image,
    types: pokemon.types.map((t) => t.type.name),
  };
};

/**
 * Índice leve de TODOS os pokémons: id, nome e imagem (derivada do id).
 *
 * Faz UMA única requisição (`/pokemon?limit=…`) que retorna apenas nome+URL.
 * Não busca detalhes — os tipos, quando necessários, são hidratados sob
 * demanda no card (apenas para os itens visíveis).
 *
 * É a espinha dorsal da busca por nome e da tela de favoritos: em vez de
 * disparar centenas de requests, filtramos/mapeamos este array em memória.
 */
export const getPokemonIndex = async (): Promise<SimplifiedPokemon[]> => {
  const response = await getPokemonList(20000, 0);
  return response.results
    .map((item) => {
      const id = getPokemonIdFromUrl(item.url);
      const imageUrl = getOfficialArtworkUrl(id);
      return {
        id,
        name: item.name,
        image: imageUrl,
        imageUrl,
        types: [] as PokemonTypeName[],
      };
    })
    // Ignora formas alternativas (ids 10000+), que não têm espécie/artwork.
    .filter((p) => p.id <= MAX_POKEMON_ID);
};

/**
 * Busca apenas os NOMES dos tipos de um pokémon (para hidratação lazy do card).
 * @param idOrName - ID ou nome do pokémon
 */
export const getPokemonTypeNames = async (
  idOrName: string | number
): Promise<PokemonTypeName[]> => {
  const details = await getPokemonDetails(idOrName);
  return details.types.map((t) => t.type.name);
};

/**
 * Busca dados da espécie do pokémon
 * @param idOrName - ID numérico ou nome do pokémon
 * @returns Dados da espécie (descrição, evolução, etc.)
 */
export const getPokemonSpecies = async (
  idOrName: string | number
): Promise<PokemonSpecies> => {
  const response = await pokemonApi.get<PokemonSpecies>(`/pokemon-species/${idOrName}`);
  return response.data;
};

/**
 * Busca cadeia evolutiva do pokémon
 * @param evolutionChainUrl - URL da cadeia evolutiva (vem de species.evolution_chain.url)
 * @returns Dados da cadeia evolutiva
 */
export const getEvolutionChain = async (
  evolutionChainUrl: string
): Promise<EvolutionChain> => {
  // A URL já vem completa da API, precisa extrair só o path
  const url = evolutionChainUrl.replace('https://pokeapi.co/api/v2/', '');
  const response = await pokemonApi.get<EvolutionChain>(url);
  return response.data;
};

/**
 * Extrai a descrição em português do pokémon
 * @param species - Dados da espécie
 * @returns Descrição em PT-BR ou em inglês como fallback
 */
export const getDescription = (species: PokemonSpecies): string => {
  // Buscar descrição em português
  const ptEntry = species.flavor_text_entries.find(
    (entry) => entry.language.name === 'pt-BR' || entry.language.name === 'pt'
  );
  
  if (ptEntry) {
    // Remover quebras de linha e espaços extras
    return ptEntry.flavor_text.replace(/\f/g, ' ').replace(/\n/g, ' ').trim();
  }
  
  // Fallback para inglês
  const enEntry = species.flavor_text_entries.find(
    (entry) => entry.language.name === 'en'
  );
  
  return enEntry?.flavor_text.replace(/\f/g, ' ').replace(/\n/g, ' ').trim() || 'Descrição não disponível';
};

/**
 * Extrai o "gênero" (categoria) do pokémon em português
 * @param species - Dados da espécie
 * @returns Categoria em PT-BR (ex: "Pokémon Semente")
 */
export const getGenus = (species: PokemonSpecies): string => {
  // Buscar genus em português
  const ptGenus = species.genera.find(
    (g) => g.language.name === 'pt-BR' || g.language.name === 'pt'
  );
  
  if (ptGenus) {
    return ptGenus.genus;
  }
  
  // Fallback para inglês
  const enGenus = species.genera.find(
    (g) => g.language.name === 'en'
  );
  
  return enGenus?.genus || 'Pokémon';
};

/**
 * Busca TODOS os dados necessários para a tela de detalhes
 * @param idOrName - ID numérico ou nome do pokémon
 * @returns Objeto com pokemon, species, evolutionChain, description e genus
 */
export const getFullPokemonDetails = async (
  idOrName: string | number
): Promise<PokemonDetails> => {
  try {
    // 1+2. Dados básicos e da espécie são independentes → buscar em paralelo
    const [pokemon, species] = await Promise.all([
      getPokemonDetails(idOrName),
      getPokemonSpecies(idOrName),
    ]);

    // 3. Buscar cadeia evolutiva (se existir)
    let evolutionChain: EvolutionChain | null = null;
    if (species.evolution_chain?.url) {
      try {
        evolutionChain = await getEvolutionChain(species.evolution_chain.url);
      } catch (err) {
        console.warn('Erro ao buscar cadeia evolutiva:', err);
      }
    }
    
    // 4. Extrair descrição e genus
    const description = getDescription(species);
    const genus = getGenus(species);
    
    return {
      pokemon,
      species,
      evolutionChain,
      description,
      genus,
    };
  } catch (err) {
    console.error('Erro ao buscar detalhes completos do pokémon:', err);
    throw err;
  }
};
