import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@theme/ThemeProvider';
import { useAbilityNames } from '@hooks/useFilterData';
import { GENERATIONS } from '@constants/index';

interface AdvancedFiltersProps {
  visible: boolean;
  onClose: () => void;
  selectedGeneration: number | null;
  onSelectGeneration: (gen: number | null) => void;
  selectedAbility: string | null;
  onSelectAbility: (ability: string | null) => void;
  onClear: () => void;
}

const prettyAbility = (slug: string) => slug.replace(/-/g, ' ');

export const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  visible,
  onClose,
  selectedGeneration,
  onSelectGeneration,
  selectedAbility,
  onSelectAbility,
  onClear,
}) => {
  const theme = useAppTheme();
  const { data: abilities, isLoading } = useAbilityNames(visible);
  const [abilityQuery, setAbilityQuery] = React.useState('');

  const filteredAbilities = React.useMemo(() => {
    const all = abilities ?? [];
    const q = abilityQuery.trim().toLowerCase();
    return q ? all.filter((a) => a.includes(q)) : all;
  }, [abilities, abilityQuery]);

  const renderAbility = ({ item }: { item: string }) => {
    const selected = item === selectedAbility;
    return (
      <TouchableOpacity
        style={[styles.abilityRow, { borderBottomColor: theme.colors.border }]}
        onPress={() => onSelectAbility(selected ? null : item)}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.abilityText,
            { color: selected ? theme.colors.primary : theme.colors.text },
          ]}
        >
          {prettyAbility(item)}
        </Text>
        {selected && <Ionicons name="checkmark" size={18} color={theme.colors.primary} />}
      </TouchableOpacity>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>Filtros avançados</Text>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="close" size={26} color={theme.colors.text} />
          </TouchableOpacity>
        </View>

        {/* Geração */}
        <Text style={[styles.section, { color: theme.colors.textSecondary }]}>Geração</Text>
        <View style={styles.chips}>
          <GenChip
            label="Todas"
            active={selectedGeneration === null}
            onPress={() => onSelectGeneration(null)}
          />
          {GENERATIONS.map((g) => (
            <GenChip
              key={g.id}
              label={g.label}
              active={selectedGeneration === g.id}
              onPress={() => onSelectGeneration(selectedGeneration === g.id ? null : g.id)}
            />
          ))}
        </View>

        {/* Habilidade */}
        <View style={styles.abilityHeader}>
          <Text style={[styles.section, { color: theme.colors.textSecondary }]}>Habilidade</Text>
          {selectedAbility && (
            <TouchableOpacity onPress={() => onSelectAbility(null)}>
              <Text style={[styles.clearAbility, { color: theme.colors.primary }]}>
                Limpar ({prettyAbility(selectedAbility)})
              </Text>
            </TouchableOpacity>
          )}
        </View>
        <TextInput
          style={[
            styles.search,
            { backgroundColor: theme.colors.surface, color: theme.colors.text, borderColor: theme.colors.border },
          ]}
          placeholder="Buscar habilidade..."
          placeholderTextColor={theme.colors.textSecondary}
          value={abilityQuery}
          onChangeText={setAbilityQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {isLoading ? (
          <ActivityIndicator color={theme.colors.primary} style={{ marginTop: 24 }} />
        ) : (
          <FlatList
            data={filteredAbilities}
            keyExtractor={(item) => item}
            renderItem={renderAbility}
            keyboardShouldPersistTaps="handled"
            initialNumToRender={20}
            style={styles.list}
          />
        )}

        {/* Footer */}
        <View style={[styles.footer, { borderTopColor: theme.colors.border }]}>
          <TouchableOpacity
            onPress={onClear}
            style={[styles.footerBtn, { borderColor: theme.colors.border }]}
          >
            <Text style={[styles.footerBtnText, { color: theme.colors.text }]}>Limpar filtros</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onClose}
            style={[styles.footerBtn, styles.applyBtn, { backgroundColor: theme.colors.primary }]}
          >
            <Text style={[styles.footerBtnText, { color: '#FFFFFF' }]}>Aplicar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const GenChip: React.FC<{ label: string; active: boolean; onPress: () => void }> = ({
  label,
  active,
  onPress,
}) => {
  const theme = useAppTheme();
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[
        styles.chip,
        {
          backgroundColor: active ? theme.colors.primary : theme.colors.surface,
          borderColor: active ? theme.colors.primary : theme.colors.border,
        },
      ]}
    >
      <Text style={[styles.chipText, { color: active ? '#FFFFFF' : theme.colors.text }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 56,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  section: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  abilityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  clearAbility: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  search: {
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 16,
    marginBottom: 8,
  },
  list: {
    flex: 1,
  },
  abilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  abilityText: {
    fontSize: 15,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  footerBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyBtn: {
    borderWidth: 0,
  },
  footerBtnText: {
    fontSize: 15,
    fontWeight: '700',
  },
});
