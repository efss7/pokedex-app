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

// ============================================
// ESPÉCIE DO POKÉMON (descrições, evoluções)
// ============================================

export interface PokemonSpecies {
  id: number;
  name: string;
  order: number;
  gender_rate: number;
  capture_rate: number;
  base_happiness: number;
  is_baby: boolean;
  is_legendary: boolean;
  is_mythical: boolean;
  hatch_counter: number;
  has_gender_differences: boolean;
  forms_switchable: boolean;
  growth_rate: {
    name: string;
    url: string;
  };
  pokedex_numbers: Array<{
    entry_number: number;
    pokedex: {
      name: string;
      url: string;
    };
  }>;
  egg_groups: Array<{
    name: string;
    url: string;
  }>;
  color: {
    name: string;
    url: string;
  };
  shape: {
    name: string;
    url: string;
  };
  evolves_from_species: {
    name: string;
    url: string;
  } | null;
  evolution_chain: {
    url: string;
  };
  habitat: {
    name: string;
    url: string;
  } | null;
  generation: {
    name: string;
    url: string;
  };
  names: Array<{
    name: string;
    language: {
      name: string;
      url: string;
    };
  }>;
  flavor_text_entries: Array<{
    flavor_text: string;
    language: {
      name: string;
      url: string;
    };
    version: {
      name: string;
      url: string;
    };
  }>;
  form_descriptions: Array<{
    description: string;
    language: {
      name: string;
      url: string;
    };
  }>;
  genera: Array<{
    genus: string;
    language: {
      name: string;
      url: string;
    };
  }>;
  varieties: Array<{
    is_default: boolean;
    pokemon: {
      name: string;
      url: string;
    };
  }>;
}

// ============================================
// CADEIA EVOLUTIVA
// ============================================

export interface EvolutionChain {
  id: number;
  baby_trigger_item: {
    name: string;
    url: string;
  } | null;
  chain: ChainLink;
}

export interface ChainLink {
  is_baby: boolean;
  species: {
    name: string;
    url: string;
  };
  evolution_details: EvolutionDetail[];
  evolves_to: ChainLink[];
}

export interface EvolutionDetail {
  item: {
    name: string;
    url: string;
  } | null;
  trigger: {
    name: string;
    url: string;
  };
  gender: number | null;
  held_item: {
    name: string;
    url: string;
  } | null;
  known_move: {
    name: string;
    url: string;
  } | null;
  known_move_type: {
    name: string;
    url: string;
  } | null;
  location: {
    name: string;
    url: string;
  } | null;
  min_level: number | null;
  min_happiness: number | null;
  min_beauty: number | null;
  min_affection: number | null;
  needs_overworld_rain: boolean;
  party_species: {
    name: string;
    url: string;
  } | null;
  party_type: {
    name: string;
    url: string;
  } | null;
  relative_physical_stats: number | null;
  time_of_day: string;
  trade_species: {
    name: string;
    url: string;
  } | null;
  turn_upside_down: boolean;
}

// ============================================
// DETALHES COMPLETOS (para tela de detalhes)
// ============================================

/**
 * Interface combinada com todos os dados necessários para tela de detalhes
 */
export interface PokemonDetails {
  pokemon: Pokemon;
  species: PokemonSpecies;
  evolutionChain: EvolutionChain | null;
  description: string; // Descrição em PT-BR
  genus: string; // Categoria (ex: "Pokémon Semente")
}

