import type { EvolutionChain, ChainLink, EvolutionDetail } from '@/types/pokemon';
import { getOfficialArtworkUrl } from '@services/pokemonService';

/**
 * Interface simplificada para exibir cada estágio de evolução
 */
export interface SimplifiedEvolution {
  id: number;
  name: string;
  imageUrl: string;
  trigger?: string; // level-up, trade, use-item, etc.
  minLevel?: number;
  item?: string;
  condition?: string; // Texto descritivo da condição
}

/**
 * Extrai o ID do pokémon a partir da URL
 */
const extractIdFromUrl = (url: string): number => {
  const parts = url.split('/').filter(Boolean);
  return parseInt(parts[parts.length - 1], 10);
};

/**
 * Formata as condições de evolução em texto legível (PT-BR)
 */
const formatEvolutionCondition = (detail: EvolutionDetail): string => {
  const conditions: string[] = [];

  // Nível mínimo
  if (detail.min_level) {
    conditions.push(`Nível ${detail.min_level}`);
  }

  // Item necessário
  if (detail.item) {
    const itemName = detail.item.name.replace(/-/g, ' ');
    conditions.push(`Com ${itemName}`);
  }

  // Item segurado
  if (detail.held_item) {
    const itemName = detail.held_item.name.replace(/-/g, ' ');
    conditions.push(`Segurando ${itemName}`);
  }

  // Felicidade/amizade
  if (detail.min_happiness) {
    conditions.push(`Felicidade ${detail.min_happiness}+`);
  }

  // Beleza
  if (detail.min_beauty) {
    conditions.push(`Beleza ${detail.min_beauty}+`);
  }

  // Afeição
  if (detail.min_affection) {
    conditions.push(`Afeição ${detail.min_affection}+`);
  }

  // Movimento conhecido
  if (detail.known_move) {
    const moveName = detail.known_move.name.replace(/-/g, ' ');
    conditions.push(`Sabe ${moveName}`);
  }

  // Horário do dia
  if (detail.time_of_day) {
    const timeMap: Record<string, string> = {
      day: 'De dia',
      night: 'À noite',
    };
    conditions.push(timeMap[detail.time_of_day] || detail.time_of_day);
  }

  // Localização
  if (detail.location) {
    const locationName = detail.location.name.replace(/-/g, ' ');
    conditions.push(`Em ${locationName}`);
  }

  // Gênero
  if (detail.gender !== null) {
    const genderMap: Record<number, string> = {
      1: 'Fêmea',
      2: 'Macho',
    };
    conditions.push(genderMap[detail.gender]);
  }

  // Stats físicos relativos
  if (detail.relative_physical_stats !== null) {
    if (detail.relative_physical_stats === 1) {
      conditions.push('Ataque > Defesa');
    } else if (detail.relative_physical_stats === -1) {
      conditions.push('Defesa > Ataque');
    } else if (detail.relative_physical_stats === 0) {
      conditions.push('Ataque = Defesa');
    }
  }

  // Chuva
  if (detail.needs_overworld_rain) {
    conditions.push('Durante chuva');
  }

  // Virar de cabeça para baixo
  if (detail.turn_upside_down) {
    conditions.push('Virar console');
  }

  return conditions.length > 0 ? conditions.join(', ') : '';
};

/**
 * Processa recursivamente a cadeia evolutiva e retorna array linear
 */
const processChainLink = (
  chain: ChainLink,
  result: SimplifiedEvolution[] = []
): SimplifiedEvolution[] => {
  const id = extractIdFromUrl(chain.species.url);
  const imageUrl = getOfficialArtworkUrl(id);

  // Adiciona o pokémon atual
  const evolution: SimplifiedEvolution = {
    id,
    name: chain.species.name,
    imageUrl,
  };

  // Se tem detalhes de evolução (não é o primeiro da cadeia)
  if (chain.evolution_details.length > 0) {
    const detail = chain.evolution_details[0]; // Pega o primeiro método de evolução
    
    evolution.trigger = detail.trigger.name;
    evolution.minLevel = detail.min_level || undefined;
    evolution.item = detail.item?.name;
    evolution.condition = formatEvolutionCondition(detail);
  }

  result.push(evolution);

  // Processar próximas evoluções recursivamente
  if (chain.evolves_to.length > 0) {
    // Por simplicidade, vamos seguir apenas o primeiro caminho
    // (alguns pokémons têm múltiplas evoluções como Eevee)
    processChainLink(chain.evolves_to[0], result);
  }

  return result;
};

/**
 * Converte a cadeia evolutiva complexa em array linear simples
 * 
 * @param evolutionChain - Dados da cadeia evolutiva da PokeAPI
 * @returns Array de evoluções simplificadas
 * 
 * @example
 * ```ts
 * const chain = await getEvolutionChain(url);
 * const evolutions = parseEvolutionChain(chain);
 * // [
 * //   { id: 1, name: 'bulbasaur', imageUrl: '...', trigger: undefined },
 * //   { id: 2, name: 'ivysaur', imageUrl: '...', trigger: 'level-up', minLevel: 16 },
 * //   { id: 3, name: 'venusaur', imageUrl: '...', trigger: 'level-up', minLevel: 32 }
 * // ]
 * ```
 */
export const parseEvolutionChain = (evolutionChain: EvolutionChain): SimplifiedEvolution[] => {
  return processChainLink(evolutionChain.chain);
};
