import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAppTheme } from '@theme/ThemeProvider';
import { usePokemonBasic } from '@hooks/usePokemonBasic';
import { usePokemonIndex } from '@hooks/usePokemonIndex';
import { PokemonTypeBadge } from '@components/common/PokemonTypeBadge';
import { TYPE_COLORS, STAT_NAMES, MAX_STAT_VALUE } from '@constants/index';
import type { RootStackParamList } from '@navigation/AppNavigator';
import type { Pokemon, SimplifiedPokemon } from '@/types/pokemon';

type Props = NativeStackScreenProps<RootStackParamList, 'Comparison'>;

const formatId = (id: number) => `#${id.toString().padStart(3, '0')}`;

/**
 * Tela de comparação: escolhe dois pokémons e compara stats lado a lado.
 */
export const ComparisonScreen: React.FC<Props> = ({ route }) => {
  const theme = useAppTheme();
  const [slotA, setSlotA] = React.useState<number | null>(route.params?.aId ?? null);
  const [slotB, setSlotB] = React.useState<number | null>(null);
  const [picking, setPicking] = React.useState<'a' | 'b' | null>(null);

  const a = usePokemonBasic(slotA ?? undefined);
  const b = usePokemonBasic(slotB ?? undefined);

  const handleSelect = (id: number) => {
    if (picking === 'a') setSlotA(id);
    else if (picking === 'b') setSlotB(id);
    setPicking(null);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Slots */}
        <View style={styles.slots}>
          <Slot
            label="Pokémon 1"
            pokemon={a.data}
            loading={a.isLoading}
            onPress={() => setPicking('a')}
            onClear={() => setSlotA(null)}
          />
          <Text style={[styles.vs, { color: theme.colors.textSecondary }]}>VS</Text>
          <Slot
            label="Pokémon 2"
            pokemon={b.data}
            loading={b.isLoading}
            onPress={() => setPicking('b')}
            onClear={() => setSlotB(null)}
          />
        </View>

        {/* Comparação */}
        {a.data && b.data ? (
          <StatsComparison a={a.data} b={b.data} />
        ) : (
          <View style={styles.hint}>
            <Ionicons name="git-compare-outline" size={40} color={theme.colors.textSecondary} />
            <Text style={[styles.hintText, { color: theme.colors.textSecondary }]}>
              Escolha dois pokémons para comparar as estatísticas.
            </Text>
          </View>
        )}
      </ScrollView>

      <PickerModal
        visible={picking !== null}
        onClose={() => setPicking(null)}
        onSelect={handleSelect}
      />
    </View>
  );
};

/* ---------- Slot ---------- */

interface SlotProps {
  label: string;
  pokemon?: Pokemon;
  loading: boolean;
  onPress: () => void;
  onClear: () => void;
}

const Slot: React.FC<SlotProps> = ({ label, pokemon, loading, onPress, onClear }) => {
  const theme = useAppTheme();

  return (
    <TouchableOpacity
      style={[styles.slot, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={theme.colors.primary} style={styles.slotImage} />
      ) : pokemon ? (
        <>
          <TouchableOpacity onPress={onClear} style={styles.clear} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="close-circle" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
          <Image
            source={pokemon.sprites.other['official-artwork'].front_default}
            style={styles.slotImage}
            contentFit="contain"
            transition={200}
            cachePolicy="memory-disk"
          />
          <Text style={[styles.slotId, { color: theme.colors.textSecondary }]}>{formatId(pokemon.id)}</Text>
          <Text style={[styles.slotName, { color: theme.colors.text }]} numberOfLines={1}>
            {pokemon.name}
          </Text>
          <View style={styles.slotTypes}>
            {pokemon.types.map((t) => (
              <PokemonTypeBadge key={t.type.name} type={t.type.name} size="small" />
            ))}
          </View>
        </>
      ) : (
        <>
          <View style={[styles.slotImage, styles.slotPlaceholder, { borderColor: theme.colors.border }]}>
            <Ionicons name="add" size={32} color={theme.colors.textSecondary} />
          </View>
          <Text style={[styles.slotName, { color: theme.colors.textSecondary }]}>{label}</Text>
          <Text style={[styles.slotHint, { color: theme.colors.textSecondary }]}>Toque para escolher</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

/* ---------- Comparação de stats ---------- */

const StatsComparison: React.FC<{ a: Pokemon; b: Pokemon }> = ({ a, b }) => {
  const theme = useAppTheme();
  const colorA = TYPE_COLORS[a.types[0].type.name] || theme.colors.primary;
  const colorB = TYPE_COLORS[b.types[0].type.name] || theme.colors.primary;

  const totalA = a.stats.reduce((s, x) => s + x.base_stat, 0);
  const totalB = b.stats.reduce((s, x) => s + x.base_stat, 0);

  return (
    <View style={styles.comparison}>
      {a.stats.map((statA) => {
        const name = statA.stat.name;
        const va = statA.base_stat;
        const vb = b.stats.find((s) => s.stat.name === name)?.base_stat ?? 0;
        return (
          <View key={name} style={styles.statBlock}>
            <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
              {STAT_NAMES[name] ?? name}
            </Text>
            <View style={styles.statRow}>
              <Text
                style={[
                  styles.statValue,
                  styles.statValueLeft,
                  { color: va >= vb ? theme.colors.text : theme.colors.textSecondary },
                  va > vb && styles.statWinner,
                ]}
              >
                {va}
              </Text>
              <View style={styles.barSideLeft}>
                <View
                  style={[
                    styles.bar,
                    {
                      width: `${Math.min((va / MAX_STAT_VALUE) * 100, 100)}%`,
                      backgroundColor: colorA,
                      opacity: va >= vb ? 1 : 0.45,
                    },
                  ]}
                />
              </View>
              <View style={styles.barSideRight}>
                <View
                  style={[
                    styles.bar,
                    {
                      width: `${Math.min((vb / MAX_STAT_VALUE) * 100, 100)}%`,
                      backgroundColor: colorB,
                      opacity: vb >= va ? 1 : 0.45,
                    },
                  ]}
                />
              </View>
              <Text
                style={[
                  styles.statValue,
                  styles.statValueRight,
                  { color: vb >= va ? theme.colors.text : theme.colors.textSecondary },
                  vb > va && styles.statWinner,
                ]}
              >
                {vb}
              </Text>
            </View>
          </View>
        );
      })}

      {/* Total */}
      <View style={[styles.totalRow, { borderTopColor: theme.colors.border }]}>
        <Text style={[styles.totalValue, { color: theme.colors.text }, totalA > totalB && styles.statWinner]}>
          {totalA}
        </Text>
        <Text style={[styles.totalLabel, { color: theme.colors.textSecondary }]}>Total</Text>
        <Text style={[styles.totalValue, { color: theme.colors.text }, totalB > totalA && styles.statWinner]}>
          {totalB}
        </Text>
      </View>
    </View>
  );
};

/* ---------- Modal de seleção ---------- */

interface PickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (id: number) => void;
}

const PickerModal: React.FC<PickerModalProps> = ({ visible, onClose, onSelect }) => {
  const theme = useAppTheme();
  const { data: index, isLoading } = usePokemonIndex(visible);
  const [query, setQuery] = React.useState('');

  const results = React.useMemo(() => {
    const all = index ?? [];
    const q = query.trim().toLowerCase();
    if (!q) return all;
    return all.filter((p) => p.name.toLowerCase().includes(q) || p.id.toString().includes(q));
  }, [index, query]);

  const renderItem = ({ item }: { item: SimplifiedPokemon }) => (
    <TouchableOpacity
      style={[styles.pickerRow, { borderBottomColor: theme.colors.border }]}
      onPress={() => onSelect(item.id)}
      activeOpacity={0.7}
    >
      <Image
        source={item.imageUrl}
        style={styles.pickerImage}
        contentFit="contain"
        cachePolicy="memory-disk"
      />
      <Text style={[styles.pickerId, { color: theme.colors.textSecondary }]}>{formatId(item.id)}</Text>
      <Text style={[styles.pickerName, { color: theme.colors.text }]} numberOfLines={1}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={[styles.modal, { backgroundColor: theme.colors.background }]}>
        <View style={styles.modalHeader}>
          <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Escolher pokémon</Text>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="close" size={26} color={theme.colors.text} />
          </TouchableOpacity>
        </View>

        <TextInput
          style={[
            styles.modalSearch,
            { backgroundColor: theme.colors.surface, color: theme.colors.text, borderColor: theme.colors.border },
          ]}
          placeholder="Buscar por nome ou ID..."
          placeholderTextColor={theme.colors.textSecondary}
          value={query}
          onChangeText={setQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />

        {isLoading ? (
          <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={results}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            keyboardShouldPersistTaps="handled"
            initialNumToRender={15}
            windowSize={10}
          />
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16 },
  slots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  vs: {
    fontSize: 16,
    fontWeight: '800',
  },
  slot: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    alignItems: 'center',
    minHeight: 190,
    justifyContent: 'center',
  },
  clear: {
    position: 'absolute',
    top: 6,
    right: 6,
    zIndex: 2,
  },
  slotImage: {
    width: 96,
    height: 96,
    marginBottom: 6,
  },
  slotPlaceholder: {
    borderRadius: 48,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotId: {
    fontSize: 12,
    fontWeight: '700',
  },
  slotName: {
    fontSize: 15,
    fontWeight: '700',
    textTransform: 'capitalize',
    marginTop: 2,
  },
  slotHint: {
    fontSize: 11,
    marginTop: 2,
  },
  slotTypes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 4,
    marginTop: 6,
  },
  hint: {
    alignItems: 'center',
    paddingVertical: 48,
    gap: 12,
  },
  hintText: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 32,
    lineHeight: 20,
  },
  comparison: {
    marginTop: 24,
  },
  statBlock: {
    marginBottom: 14,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statValue: {
    width: 34,
    fontSize: 14,
    fontWeight: '600',
  },
  statValueLeft: { textAlign: 'right' },
  statValueRight: { textAlign: 'left' },
  statWinner: {
    fontWeight: '800',
  },
  barSideLeft: {
    flex: 1,
    alignItems: 'flex-end',
  },
  barSideRight: {
    flex: 1,
    alignItems: 'flex-start',
  },
  bar: {
    height: 8,
    borderRadius: 4,
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 14,
    borderTopWidth: 1,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    width: 60,
    textAlign: 'center',
  },
  modal: {
    flex: 1,
    paddingTop: 56,
    paddingHorizontal: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  modalSearch: {
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 16,
    marginBottom: 12,
  },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  pickerImage: {
    width: 44,
    height: 44,
  },
  pickerId: {
    fontSize: 13,
    fontWeight: '700',
    width: 48,
  },
  pickerName: {
    fontSize: 15,
    fontWeight: '600',
    textTransform: 'capitalize',
    flex: 1,
  },
});
