export const APP_NAME = 'Pokedex';
export const API_BASE_URL = 'https://pokeapi.co/api/v2';
export const ITEMS_PER_PAGE = 20;
export const MAX_POKEMON_ID = 1010; // Update as new generations release

export const POKEMON_TYPES = [
  'normal', 'fire', 'water', 'electric', 'grass', 'ice',
  'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug',
  'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'
] as const;

export type PokemonTypeName = typeof POKEMON_TYPES[number];
