/**
 * Tipos TypeScript para a PokeAPI
 * Documentação: https://pokeapi.co/docs/v2
 */

import { PokemonTypeName } from '@constants/index';

// ============================================
// LISTA DE POKÉMONS
// ============================================

export interface PokemonListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: PokemonListItem[];
}

export interface PokemonListItem {
  name: string;
  url: string;
}

// ============================================
// DETALHES DO POKÉMON
// ============================================

export interface Pokemon {
  id: number;
  name: string;
  height: number; // em decímetros (10 = 1 metro)
  weight: number; // em hectogramas (10 = 1 kg)
  base_experience: number;
  sprites: {
    front_default: string;
    front_shiny: string | null;
    other: {
      'official-artwork': {
        front_default: string;
        front_shiny: string;
      };
      home: {
        front_default: string;
        front_shiny: string;
      };
    };
  };
  types: PokemonType[];
  stats: PokemonStat[];
  abilities: PokemonAbility[];
  species: {
    name: string;
    url: string;
  };
}

export interface PokemonType {
  slot: number; // 1 = tipo principal, 2 = secundário
  type: {
    name: PokemonTypeName;
    url: string;
  };
}

export interface PokemonStat {
  base_stat: number;
  effort: number;
  stat: {
    name: 'hp' | 'attack' | 'defense' | 'special-attack' | 'special-defense' | 'speed';
    url: string;
  };
}

export interface PokemonAbility {
  ability: {
    name: string;
    url: string;
  };
  is_hidden: boolean;
  slot: number;
}

// ============================================
// TIPOS (FIRE, WATER, GRASS, etc.)
// ============================================

export interface PokemonTypeResponse {
  id: number;
  name: PokemonTypeName;
  pokemon: Array<{
    pokemon: PokemonListItem;
    slot: number;
  }>;
}

// ============================================
// VERSÃO SIMPLIFICADA (para listas/cards)
// ============================================

/**
 * Pokémon simplificado para uso em cards
 * Reduz uso de memória em listas grandes
 */
export interface SimplifiedPokemon {
  id: number;
  name: string;
  image: string;
  imageUrl: string; // URL da imagem oficial
  types: PokemonTypeName[];
}

