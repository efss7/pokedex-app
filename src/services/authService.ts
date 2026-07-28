import { supabase } from './supabase';

/**
 * Autenticação com e-mail e senha (Supabase Auth).
 *
 * Login social (Google/Apple) foi removido: Apple exige conta Apple Developer
 * paga e Google exige um dev build + configuração de OAuth. O e-mail/senha
 * cobre o objetivo da fase (conta + sessão + sync de favoritos na nuvem).
 */

/**
 * Cadastro com e-mail e senha.
 * @returns needsConfirmation=true quando o projeto exige confirmação por e-mail
 *          (nesse caso a sessão só vem depois que o usuário confirmar).
 */
export const signUpWithEmail = async (
  email: string,
  password: string
): Promise<{ needsConfirmation: boolean }> => {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return { needsConfirmation: !data.session };
};

/** Login com e-mail e senha. */
export const signInWithEmail = async (email: string, password: string): Promise<void> => {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
};
