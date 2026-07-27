import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@theme/ThemeProvider';
import { useDebounce } from '@hooks/useDebounce';

interface SearchBarProps {
  /** Recebe o termo já "assentado" (debounced). */
  onChangeTerm: (term: string) => void;
  /** Mostra spinner no lugar do X (ex.: enquanto o índice carrega). */
  loading?: boolean;
}

/**
 * Campo de busca autocontido.
 *
 * Mantém texto, foco e debounce em estado LOCAL e só avisa o pai quando o
 * termo assenta. Assim, digitar/focar não re-renderiza a tela da lista — o
 * que evita o teclado abrir e fechar.
 */
export const SearchBar: React.FC<SearchBarProps> = ({ onChangeTerm, loading = false }) => {
  const theme = useAppTheme();
  const [text, setText] = useState('');
  const [focused, setFocused] = useState(false);
  const debounced = useDebounce(text, 400);

  // Mantém a callback atual sem re-disparar o efeito por mudança de identidade.
  const onChangeTermRef = useRef(onChangeTerm);
  onChangeTermRef.current = onChangeTerm;

  useEffect(() => {
    onChangeTermRef.current(debounced.trim());
  }, [debounced]);

  const handleClear = () => {
    setText('');
    onChangeTermRef.current(''); // limpa na hora, sem esperar o debounce
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View
        style={[
          styles.box,
          {
            backgroundColor: theme.colors.surface,
            // IMPORTANTE: só a COR muda no foco. Mudar borderWidth/elevation
            // aqui recria a view nativa e faz o TextInput perder o foco
            // (teclado abre e fecha na hora).
            borderColor: focused ? theme.colors.primary : theme.colors.border,
          },
        ]}
      >
        <Ionicons
          name="search"
          size={18}
          color={focused ? theme.colors.primary : theme.colors.textSecondary}
          style={styles.icon}
        />
        <TextInput
          style={[styles.input, { color: theme.colors.text }]}
          placeholder="Buscar por nome ou ID..."
          placeholderTextColor={theme.colors.textSecondary}
          value={text}
          onChangeText={setText}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
        />
        {loading ? (
          <ActivityIndicator size="small" color={theme.colors.primary} style={styles.trailing} />
        ) : text.length > 0 ? (
          <TouchableOpacity
            onPress={handleClear}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={styles.trailing}
            accessibilityRole="button"
            accessibilityLabel="Limpar busca"
          >
            <Ionicons name="close-circle" size={18} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 8,
  },
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 12,
    // borderWidth fixo (não muda no foco) para não recriar a view nativa.
    borderWidth: 1.5,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    padding: 0,
  },
  trailing: {
    marginLeft: 8,
    width: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
