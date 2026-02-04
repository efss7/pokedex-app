import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useAppTheme } from '@theme/ThemeProvider';
import { POKEMON_TYPES, TYPE_COLORS } from '@constants/index';

interface TypeFilterProps {
  selectedType: string | null;
  onSelectType: (type: string | null) => void;
}

/**
 * Componente de filtro por tipo
 * 
 * Features:
 * - Chips clicáveis para cada tipo
 * - Visual com cores dos tipos
 * - Scroll horizontal
 * - Chip "Todos" para limpar filtro
 * 
 * Como funciona:
 * - Clica no tipo → filtra lista
 * - Clica novamente → remove filtro
 * - Clica em "Todos" → mostra todos
 */
export const TypeFilter: React.FC<TypeFilterProps> = ({
  selectedType,
  onSelectType,
}) => {
  const theme = useAppTheme();

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Chip "Todos" */}
        <TouchableOpacity
          onPress={() => onSelectType(selectedType === 'all' ? null : 'all')}
          style={[
            styles.chip,
            {
              backgroundColor: selectedType === 'all' ? theme.colors.primary : theme.colors.surface,
              borderColor: selectedType === 'all' ? theme.colors.primary : theme.colors.border,
              borderWidth: selectedType === 'all' ? 0 : 1,
            },
          ]}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.chipText,
              {
                color: selectedType === 'all' ? '#FFFFFF' : theme.colors.text,
                fontWeight: selectedType === 'all' ? '700' : '600',
              },
            ]}
          >
            Todos
          </Text>
        </TouchableOpacity>

        {/* Chips dos tipos */}
        {POKEMON_TYPES.map((type) => {
          const isSelected = selectedType === type;
          const backgroundColor = TYPE_COLORS[type];
          
          return (
            <TouchableOpacity
              key={type}
              onPress={() => onSelectType(isSelected ? null : type)}
              style={[
                styles.chip,
                {
                  backgroundColor: isSelected ? backgroundColor : theme.colors.surface,
                  borderColor: isSelected ? backgroundColor : theme.colors.border,
                  borderWidth: isSelected ? 0 : 1,
                },
              ]}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.chipText,
                  {
                    color: isSelected ? '#FFFFFF' : theme.colors.text,
                    fontWeight: isSelected ? '700' : '600',
                  },
                ]}
              >
                {type}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  chipText: {
    fontSize: 14,
    textTransform: 'capitalize',
  },
});
