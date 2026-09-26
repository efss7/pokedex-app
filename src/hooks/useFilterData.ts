import { useQuery } from '@tanstack/react-query';
import {
  getPokemonIdsByAbility,
  getPokemonIdsByType,
  getAbilityNames,
} from '@services/pokemonService';

/** IDs dos pokémons que têm a habilidade selecionada. */
export const useAbilityRosterIds = (ability: string | null, enabled: boolean) =>
  useQuery({
    queryKey: ['abilityRosterIds', ability],
    enabled: enabled && Boolean(ability),
    queryFn: () => getPokemonIdsByAbility(ability as string),
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 60,
  });

/** IDs dos pokémons do tipo selecionado (para combinar com os filtros avançados). */
export const useTypeRosterIds = (type: string | null, enabled: boolean) =>
  useQuery({
    queryKey: ['typeRosterIds', type],
    enabled: enabled && Boolean(type) && type !== 'all',
    queryFn: () => getPokemonIdsByType(type as string),
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 60,
  });

/** Lista de nomes de habilidades (para o seletor do filtro avançado). */
export const useAbilityNames = (enabled: boolean) =>
  useQuery({
    queryKey: ['abilityNames'],
    enabled,
    queryFn: getAbilityNames,
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60 * 2,
  });
