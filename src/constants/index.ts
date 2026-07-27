export const APP_NAME = 'Pokedex';
export const API_BASE_URL = 'https://pokeapi.co/api/v2';
export const ITEMS_PER_PAGE = 20;
export const MAX_POKEMON_ID = 1025; // Update as new generations release

export const POKEMON_TYPES = [
  'normal', 'fire', 'water', 'electric', 'grass', 'ice',
  'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug',
  'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'
] as const;

export type PokemonTypeName = typeof POKEMON_TYPES[number];

/**
 * Cores dos tipos de Pokémon
 * Centralizadas para reutilização em toda a aplicação
 */
export const TYPE_COLORS: Record<string, string> = {
  normal: '#A8A878',
  fire: '#F08030',
  water: '#6890F0',
  electric: '#F8D030',
  grass: '#78C850',
  ice: '#98D8D8',
  fighting: '#C03028',
  poison: '#A040A0',
  ground: '#E0C068',
  flying: '#A890F0',
  psychic: '#F85888',
  bug: '#A8B820',
  rock: '#B8A038',
  ghost: '#705898',
  dragon: '#7038F8',
  dark: '#705848',
  steel: '#B8B8D0',
  fairy: '#EE99AC',
};

/**
 * Mapeamento de nomes dos stats para PT-BR
 */
export const STAT_NAMES: Record<string, string> = {
  hp: 'HP',
  attack: 'Ataque',
  defense: 'Defesa',
  'special-attack': 'Atq. Esp.',
  'special-defense': 'Def. Esp.',
  speed: 'Velocidade',
};

/**
 * Cores dos stats para visualização em gráficos
 */
export const STAT_COLORS: Record<string, string> = {
  hp: '#FF5959',
  attack: '#F08030',
  defense: '#FAE078',
  'special-attack': '#9DB7F5',
  'special-defense': '#A7DB8D',
  speed: '#FA92B2',
};

/**
 * Valor máximo teórico de cada stat (para cálculo de porcentagem)
 * Baseado nos maiores valores possíveis na série
 */
export const MAX_STAT_VALUE = 255;
