import { supabase } from './supabase';

/**
 * Sincronização dos favoritos na nuvem (tabela `favorites` no Supabase).
 * O RLS garante que cada usuário só acessa os próprios registros; ainda assim
 * enviamos o user_id explicitamente para o upsert.
 */

/** Busca os IDs de pokémon favoritados pelo usuário logado. */
export const getRemoteFavoriteIds = async (): Promise<number[]> => {
  const { data, error } = await supabase.from('favorites').select('pokemon_id');
  if (error) throw error;
  return (data ?? []).map((row) => row.pokemon_id as number);
};

/** Adiciona vários favoritos (ignora os que já existem). */
export const addRemoteFavorites = async (userId: string, pokemonIds: number[]): Promise<void> => {
  if (pokemonIds.length === 0) return;
  const rows = pokemonIds.map((pokemon_id) => ({ user_id: userId, pokemon_id }));
  const { error } = await supabase
    .from('favorites')
    .upsert(rows, { onConflict: 'user_id,pokemon_id', ignoreDuplicates: true });
  if (error) throw error;
};

/** Adiciona um favorito. */
export const addRemoteFavorite = async (userId: string, pokemonId: number): Promise<void> => {
  const { error } = await supabase
    .from('favorites')
    .upsert({ user_id: userId, pokemon_id: pokemonId }, {
      onConflict: 'user_id,pokemon_id',
      ignoreDuplicates: true,
    });
  if (error) throw error;
};

/** Remove um favorito. */
export const removeRemoteFavorite = async (pokemonId: number): Promise<void> => {
  const { error } = await supabase.from('favorites').delete().eq('pokemon_id', pokemonId);
  if (error) throw error;
};
