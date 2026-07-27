import { useQuery } from '@tanstack/react-query';
import { getTypeDamageRelations } from '@services/pokemonService';
import { POKEMON_TYPES } from '@constants/index';

export interface TypeMatchup {
  type: string;
  multiplier: number;
}

export interface TypeEffectivenessResult {
  weaknesses: TypeMatchup[]; // multiplicador > 1 (2× ou 4×)
  resistances: TypeMatchup[]; // 0 < multiplicador < 1 (½× ou ¼×)
  immunities: string[]; // multiplicador 0
}

/**
 * Calcula fraquezas, resistências e imunidades de um pokémon combinando as
 * relações de dano de todos os seus tipos.
 *
 * Para cada tipo atacante, o multiplicador final é o produto dos
 * multiplicadores contra cada tipo do pokémon (2× recebe o dobro, ½× metade,
 * 0× imune).
 *
 * @param types - Tipos do pokémon (ex: ['fire', 'flying']).
 */
export const useTypeEffectiveness = (types: string[]) => {
  return useQuery({
    queryKey: ['typeEffectiveness', [...types].sort()],
    enabled: types.length > 0,
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60,
    queryFn: async (): Promise<TypeEffectivenessResult> => {
      const relations = await Promise.all(types.map(getTypeDamageRelations));

      const multipliers: Record<string, number> = {};
      POKEMON_TYPES.forEach((t) => {
        multipliers[t] = 1;
      });

      relations.forEach((r) => {
        r.double_damage_from.forEach((x) => (multipliers[x.name] *= 2));
        r.half_damage_from.forEach((x) => (multipliers[x.name] *= 0.5));
        r.no_damage_from.forEach((x) => (multipliers[x.name] *= 0));
      });

      const weaknesses: TypeMatchup[] = [];
      const resistances: TypeMatchup[] = [];
      const immunities: string[] = [];

      Object.entries(multipliers).forEach(([type, multiplier]) => {
        if (multiplier === 0) immunities.push(type);
        else if (multiplier > 1) weaknesses.push({ type, multiplier });
        else if (multiplier < 1) resistances.push({ type, multiplier });
      });

      weaknesses.sort((a, b) => b.multiplier - a.multiplier);
      resistances.sort((a, b) => a.multiplier - b.multiplier);

      return { weaknesses, resistances, immunities };
    },
  });
};
