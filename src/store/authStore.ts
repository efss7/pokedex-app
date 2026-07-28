import { create } from 'zustand';
import type { Session, User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '@services/supabase';

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

interface AuthState {
  status: AuthStatus;
  session: Session | null;
  user: User | null;
  /** Restaura a sessão salva e escuta mudanças de autenticação. */
  initialize: () => void;
  signOut: () => Promise<void>;
}

const resolve = (session: Session | null): Pick<AuthState, 'session' | 'user' | 'status'> => ({
  session,
  user: session?.user ?? null,
  status: session ? 'authenticated' : 'unauthenticated',
});

export const useAuthStore = create<AuthState>((set) => ({
  status: 'loading',
  session: null,
  user: null,

  initialize: () => {
    if (!isSupabaseConfigured) {
      set({ status: 'unauthenticated' });
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      set(resolve(data.session));
    });

    // Reage a login/logout/refresh em qualquer parte do app.
    supabase.auth.onAuthStateChange((_event, session) => {
      set(resolve(session));
    });
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set(resolve(null));
  },
}));
