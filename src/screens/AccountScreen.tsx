import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@theme/ThemeProvider';
import { useAuthStore } from '@store/authStore';
import { isSupabaseConfigured } from '@services/supabase';
import { signInWithEmail, signUpWithEmail } from '@services/authService';

type Pending = 'email' | 'signout' | null;

/**
 * Tela de conta.
 * - Deslogado: login/cadastro com e-mail e senha.
 * - Logado: dados do usuário + sair.
 *
 * O login é opcional — serve para sincronizar os favoritos na nuvem.
 */
export const AccountScreen = () => {
  const theme = useAppTheme();
  const { status, user, signOut } = useAuthStore();

  const [pending, setPending] = React.useState<Pending>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [info, setInfo] = React.useState<string | null>(null);

  // Formulário de e-mail
  const [mode, setMode] = React.useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  const handleEmailSubmit = async () => {
    setError(null);
    setInfo(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setError('Preencha e-mail e senha.');
      return;
    }
    if (password.length < 6) {
      setError('A senha precisa ter pelo menos 6 caracteres.');
      return;
    }

    setPending('email');
    try {
      if (mode === 'signup') {
        const { needsConfirmation } = await signUpWithEmail(trimmedEmail, password);
        if (needsConfirmation) {
          setInfo('Enviamos um e-mail de confirmação. Confirme e depois faça login.');
          setMode('signin');
          setPassword('');
        }
      } else {
        await signInWithEmail(trimmedEmail, password);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Falha na autenticação.');
    } finally {
      setPending(null);
    }
  };

  const handleSignOut = async () => {
    setPending('signout');
    try {
      await signOut();
    } finally {
      setPending(null);
    }
  };

  if (status === 'loading') {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  // --- Logado ---
  if (status === 'authenticated' && user) {
    const displayName =
      (user.user_metadata?.full_name as string) ||
      (user.user_metadata?.name as string) ||
      user.email ||
      'Treinador';

    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.profile}>
          <View style={[styles.avatar, { backgroundColor: theme.colors.primary }]}>
            <Ionicons name="person" size={36} color="#FFFFFF" />
          </View>
          <Text style={[styles.name, { color: theme.colors.text }]}>{displayName}</Text>
          {user.email ? (
            <Text style={[styles.email, { color: theme.colors.textSecondary }]}>{user.email}</Text>
          ) : null}
        </View>

        <View style={[styles.syncNote, { backgroundColor: theme.colors.surface }]}>
          <Ionicons name="cloud-done-outline" size={18} color={theme.colors.success} />
          <Text style={[styles.syncText, { color: theme.colors.textSecondary }]}>
            Seus favoritos serão sincronizados na nuvem.
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleSignOut}
          style={[styles.button, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
          disabled={pending === 'signout'}
          activeOpacity={0.8}
        >
          {pending === 'signout' ? (
            <ActivityIndicator color={theme.colors.error} />
          ) : (
            <>
              <Ionicons name="log-out-outline" size={20} color={theme.colors.error} />
              <Text style={[styles.buttonText, { color: theme.colors.error }]}>Sair</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    );
  }

  // --- Deslogado ---
  const disabled = !isSupabaseConfigured || pending !== null;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Ionicons name="person-circle-outline" size={64} color={theme.colors.primary} />
          <Text style={[styles.title, { color: theme.colors.text }]}>
            {mode === 'signup' ? 'Criar conta' : 'Entre na sua conta'}
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            Sincronize seus favoritos entre dispositivos. É opcional — o app funciona
            normalmente sem login.
          </Text>
        </View>

        {!isSupabaseConfigured && (
          <View style={[styles.warning, { backgroundColor: theme.colors.surface }]}>
            <Ionicons name="alert-circle-outline" size={18} color={theme.colors.warning} />
            <Text style={[styles.warningText, { color: theme.colors.textSecondary }]}>
              Autenticação não configurada. Defina as chaves do Supabase no arquivo .env.
            </Text>
          </View>
        )}

        {/* Formulário de e-mail + senha */}
        <TextInput
          style={[styles.input, { backgroundColor: theme.colors.surface, color: theme.colors.text, borderColor: theme.colors.border }]}
          placeholder="E-mail"
          placeholderTextColor={theme.colors.textSecondary}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          textContentType="emailAddress"
          editable={!disabled}
        />
        <TextInput
          style={[styles.input, { backgroundColor: theme.colors.surface, color: theme.colors.text, borderColor: theme.colors.border }]}
          placeholder="Senha"
          placeholderTextColor={theme.colors.textSecondary}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
          editable={!disabled}
        />

        <TouchableOpacity
          onPress={handleEmailSubmit}
          style={[styles.button, styles.primaryButton, { backgroundColor: theme.colors.primary }]}
          disabled={disabled}
          activeOpacity={0.8}
        >
          {pending === 'email' ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>
              {mode === 'signup' ? 'Criar conta' : 'Entrar'}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            setMode((m) => (m === 'signin' ? 'signup' : 'signin'));
            setError(null);
            setInfo(null);
          }}
          style={styles.switchMode}
          disabled={pending !== null}
        >
          <Text style={[styles.switchModeText, { color: theme.colors.primary }]}>
            {mode === 'signup'
              ? 'Já tem conta? Entrar'
              : 'Não tem conta? Criar uma'}
          </Text>
        </TouchableOpacity>

        {info ? (
          <Text style={[styles.info, { color: theme.colors.success }]}>{info}</Text>
        ) : null}
        {error ? (
          <Text style={[styles.error, { color: theme.colors.error }]}>{error}</Text>
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 12,
  },
  primaryButton: {
    borderWidth: 0,
  },
  switchMode: {
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: 8,
  },
  switchModeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  info: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 12,
  },
  header: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 32,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  profile: {
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
  },
  email: {
    fontSize: 14,
    marginTop: 4,
  },
  syncNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 12,
    marginBottom: 24,
  },
  syncText: {
    fontSize: 13,
    flex: 1,
  },
  warning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  warningText: {
    fontSize: 13,
    flex: 1,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  error: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 12,
  },
});
