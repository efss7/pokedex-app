import 'react-native-url-polyfill/auto';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

/**
 * Cliente Supabase para autenticação e sincronização na nuvem.
 *
 * As credenciais vêm de variáveis de ambiente (EXPO_PUBLIC_*), definidas no
 * arquivo `.env` (veja `.env.example`). Se não estiverem configuradas, a
 * autenticação fica desativada e o app continua funcionando localmente.
 */
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
  console.warn(
    '[supabase] EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY não definidos. ' +
      'A autenticação ficará desativada. Copie .env.example para .env e preencha as chaves.'
  );
}

// Sem env válido, o createClient lançaria "supabaseUrl is required" e o app
// crasharia no boot. Usamos placeholders para o cliente construir sem quebrar;
// as chamadas reais ficam guardadas por `isSupabaseConfigured`.
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'public-anon-placeholder',
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      // Em apps nativos não há sessão vindo pela URL do navegador.
      detectSessionInUrl: false,
      flowType: 'pkce',
    },
  }
);

// Mantém o token renovando enquanto o app está em primeiro plano.
AppState.addEventListener('change', (state) => {
  if (!isSupabaseConfigured) return;
  if (state === 'active') {
    supabase.auth.startAutoRefresh();
  } else {
    supabase.auth.stopAutoRefresh();
  }
});
