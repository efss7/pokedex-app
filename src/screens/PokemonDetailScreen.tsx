import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Animated as RNAnimated,
} from 'react-native';
import Animated from 'react-native-reanimated';
import { Image as ExpoImage } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAppTheme } from '@theme/ThemeProvider';
import { usePokemonDetails } from '../hooks';
import { useAnimatedEntrance, useScaleBounce } from '../hooks/useAnimations';
import { useFavoritesStore } from '@store/favoritesStore';
import { PokemonTypeBadge } from '@components/common/PokemonTypeBadge';
import { ErrorScreen } from '@components/common/ErrorScreen';
import { ThemedBackground } from '@components/common/ThemedBackground';
import { PokemonStats } from '@components/pokemon/PokemonStats';
import { PokemonEvolutionChain } from '@components/pokemon/EvolutionChain';
import { TypeEffectiveness } from '@components/pokemon/TypeEffectiveness';
import { PokemonDetailSkeleton } from '@components/pokemon/PokemonDetailSkeleton';
import { TYPE_COLORS, MAX_POKEMON_ID } from '../constants';
import type { RootStackParamList } from '@navigation/AppNavigator';
import type { PokemonType, PokemonAbility } from '@/types/pokemon';

const AnimatedImage = Animated.createAnimatedComponent(ExpoImage);

const { width } = Dimensions.get('window');

type Props = NativeStackScreenProps<RootStackParamList, 'PokemonDetail'>;

/**
 * Tela de detalhes do Pokémon
 * 
 * Exibe:
 * - Imagem grande do pokémon
 * - ID e nome
 * - Tipos
 * - Descrição/Genus
 * - Informações base (altura, peso)
 * - Placeholder para componentes futuros (stats, evoluções)
 */
export const PokemonDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { pokemonId } = route.params;
  const theme = useAppTheme();
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);
  const favorite = useFavoritesStore((state) => state.favorites.includes(pokemonId));

  const {
    data: details,
    isLoading,
    isFetching,
    isPlaceholderData,
    error,
    refetch,
  } = usePokemonDetails(pokemonId);

  // Toggle shiny (reseta ao trocar de pokémon)
  const [showShiny, setShowShiny] = React.useState(false);
  React.useEffect(() => {
    setShowShiny(false);
  }, [pokemonId]);

  // Toast de feedback (favoritar)
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);
  const toastOpacity = React.useRef(new RNAnimated.Value(0)).current;

  const showToast = React.useCallback(
    (message: string) => {
      setToastMessage(message);
      RNAnimated.sequence([
        RNAnimated.timing(toastOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        RNAnimated.delay(1400),
        RNAnimated.timing(toastOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start(() => setToastMessage(null));
    },
    [toastOpacity]
  );

  // Animações
  const imageScale = useScaleBounce(60);
  const titleAnimation = useAnimatedEntrance(80);
  const typesAnimation = useAnimatedEntrance(130);
  const aboutAnimation = useAnimatedEntrance(180);
  const infoAnimation = useAnimatedEntrance(230);
  const abilitiesAnimation = useAnimatedEntrance(280);
  const statsAnimation = useAnimatedEntrance(330);
  const effectivenessAnimation = useAnimatedEntrance(360);
  const evolutionAnimation = useAnimatedEntrance(380);
  const extraAnimation = useAnimatedEntrance(430);

  // Configurar título da tela
  React.useEffect(() => {
    if (details) {
      navigation.setOptions({
        title: details.pokemon.name.charAt(0).toUpperCase() + details.pokemon.name.slice(1),
      });
    }
  }, [details, navigation]);

  // Loading (só no primeiro acesso; navegação anterior/próximo usa placeholder)
  if (isLoading) {
    return <PokemonDetailSkeleton />;
  }

  // Erro
  if (error || !details) {
    return (
      <ErrorScreen
        title="Erro ao carregar pokémon"
        message={error?.message || 'Não foi possível carregar os detalhes do pokémon'}
        onRetry={refetch}
      />
    );
  }

  const { pokemon, species, description, genus } = details;
  const primaryType = pokemon.types[0].type.name;
  const primaryColor = TYPE_COLORS[primaryType] || theme.colors.primary;
  const typeNames = pokemon.types.map((t) => t.type.name);

  // Formatar ID com zeros (#001, #025, etc.)
  const formattedId = `#${pokemon.id.toString().padStart(3, '0')}`;

  // Converter altura e peso
  const heightInMeters = (pokemon.height / 10).toFixed(1); // decímetros para metros
  const weightInKg = (pokemon.weight / 10).toFixed(1); // hectogramas para kg

  // Imagem (normal ou shiny)
  const artwork = pokemon.sprites.other['official-artwork'];
  const imageUri = showShiny ? artwork.front_shiny ?? artwork.front_default : artwork.front_default;
  const hasShiny = Boolean(artwork.front_shiny);

  // Navegação anterior/próximo
  const canGoPrev = pokemon.id > 1;
  const canGoNext = pokemon.id < MAX_POKEMON_ID;
  const goToPokemon = (id: number) => {
    Haptics.selectionAsync();
    navigation.setParams({ pokemonId: id });
  };

  // Favoritar com feedback tátil + toast
  const handleToggleFavorite = () => {
    const willAdd = !favorite;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    toggleFavorite(pokemon.id);
    showToast(willAdd ? 'Adicionado aos favoritos' : 'Removido dos favoritos');
  };

  const isSwitching = isFetching && isPlaceholderData;

  return (
    <View style={{ flex: 1 }}>
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Header colorido com imagem e gradiente temático */}
      <ThemedBackground color={primaryColor} height={320}>
        {/* Toggle shiny (topo esquerda) */}
        {hasShiny && (
          <TouchableOpacity
            onPress={() => {
              Haptics.selectionAsync();
              setShowShiny((prev) => !prev);
            }}
            activeOpacity={0.8}
            style={[
              styles.cornerButton,
              styles.cornerLeft,
              {
                backgroundColor: showShiny ? '#FFFFFF' : 'rgba(255, 255, 255, 0.2)',
                borderColor: showShiny ? '#FFFFFF' : 'rgba(255, 255, 255, 0.4)',
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel={showShiny ? 'Mostrar forma normal' : 'Mostrar forma shiny'}
          >
            <Ionicons name="sparkles" size={20} color={showShiny ? primaryColor : '#FFFFFF'} />
          </TouchableOpacity>
        )}

        {/* Favoritar (topo direita) */}
        <TouchableOpacity
          onPress={handleToggleFavorite}
          activeOpacity={0.8}
          style={[
            styles.cornerButton,
            styles.cornerRight,
            {
              backgroundColor: favorite ? '#FFFFFF' : 'rgba(255, 255, 255, 0.2)',
              borderColor: favorite ? '#FFFFFF' : 'rgba(255, 255, 255, 0.4)',
            },
          ]}
          accessibilityRole="button"
          accessibilityLabel={favorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
        >
          <Ionicons
            name={favorite ? 'heart' : 'heart-outline'}
            size={22}
            color={favorite ? primaryColor : '#FFFFFF'}
            style={styles.favoriteIcon}
          />
        </TouchableOpacity>

        {/* Setas anterior/próximo */}
        {canGoPrev && (
          <TouchableOpacity
            onPress={() => goToPokemon(pokemon.id - 1)}
            style={[styles.navButton, styles.navPrev]}
            hitSlop={{ top: 20, bottom: 20, left: 10, right: 10 }}
            accessibilityRole="button"
            accessibilityLabel="Pokémon anterior"
          >
            <Ionicons name="chevron-back" size={26} color="#FFFFFF" />
          </TouchableOpacity>
        )}
        {canGoNext && (
          <TouchableOpacity
            onPress={() => goToPokemon(pokemon.id + 1)}
            style={[styles.navButton, styles.navNext]}
            hitSlop={{ top: 20, bottom: 20, left: 10, right: 10 }}
            accessibilityRole="button"
            accessibilityLabel="Próximo pokémon"
          >
            <Ionicons name="chevron-forward" size={26} color="#FFFFFF" />
          </TouchableOpacity>
        )}

        <View style={styles.headerContent}>
          <AnimatedImage
            source={imageUri}
            style={[styles.image, imageScale, { opacity: isSwitching ? 0.4 : 1 }]}
            contentFit="contain"
            cachePolicy="memory-disk"
          />
        </View>
      </ThemedBackground>

      {/* Conteúdo principal */}
      <View style={[styles.content, { backgroundColor: theme.colors.background }]}>
        {/* ID e Nome */}
        <Animated.View style={[styles.titleSection, titleAnimation]}>
          <Text style={[styles.id, { color: theme.colors.textSecondary }]}>
            {formattedId}
          </Text>
          <Text style={[styles.name, { color: theme.colors.text }]}>
            {pokemon.name}
          </Text>
          <Text style={[styles.genus, { color: theme.colors.textSecondary }]}>
            {genus}
          </Text>
        </Animated.View>

        {/* Tipos */}
        <Animated.View style={[styles.typesContainer, typesAnimation]}>
          {pokemon.types.map((type: PokemonType) => (
            <PokemonTypeBadge key={type.type.name} type={type.type.name} size="large" />
          ))}
        </Animated.View>

        {/* Descrição */}
        <Animated.View style={[styles.section, aboutAnimation]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Sobre
          </Text>
          <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
            {description}
          </Text>
        </Animated.View>

        {/* Informações básicas */}
        <Animated.View style={[styles.infoGrid, infoAnimation]}>
          <View style={styles.infoItem}>
            <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>
              Altura
            </Text>
            <Text style={[styles.infoValue, { color: theme.colors.text }]}>
              {heightInMeters} m
            </Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>
              Peso
            </Text>
            <Text style={[styles.infoValue, { color: theme.colors.text }]}>
              {weightInKg} kg
            </Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>
              Experiência Base
            </Text>
            <Text style={[styles.infoValue, { color: theme.colors.text }]}>
              {pokemon.base_experience}
            </Text>
          </View>
        </Animated.View>

        {/* Habilidades */}
        <Animated.View style={[styles.section, abilitiesAnimation]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Habilidades
          </Text>
          <View style={styles.abilitiesContainer}>
            {pokemon.abilities.map((ability: PokemonAbility) => (
              <View
                key={ability.ability.name}
                style={[
                  styles.abilityChip,
                  { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
                ]}
              >
                <Text style={[styles.abilityText, { color: theme.colors.text }]}>
                  {ability.ability.name}
                </Text>
                {ability.is_hidden && (
                  <Text style={[styles.hiddenBadge, { color: theme.colors.textSecondary }]}>
                    (Oculta)
                  </Text>
                )}
              </View>
            ))}
          </View>
        </Animated.View>

        {/* Estatísticas Base */}
        <Animated.View style={[styles.section, statsAnimation]}>
          <PokemonStats stats={pokemon.stats} color={primaryColor} />
        </Animated.View>

        {/* Fraquezas e resistências */}
        <Animated.View style={[styles.section, effectivenessAnimation]}>
          <TypeEffectiveness types={typeNames} />
        </Animated.View>

        {/* Cadeia Evolutiva */}
        {details.evolutionChain && (
          <Animated.View style={[styles.section, evolutionAnimation]}>
            <PokemonEvolutionChain 
              evolutionChain={details.evolutionChain} 
              currentPokemonId={pokemon.id}
            />
          </Animated.View>
        )}

        {/* Informações extras da espécie */}
        <Animated.View style={[styles.section, extraAnimation]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Informações Adicionais
          </Text>
          <View style={styles.extraInfoGrid}>
            {species.is_legendary && (
              <View style={[styles.badge, { backgroundColor: '#FFD700' }]}>
                <MaterialIcons name="stars" size={16} color="#1B1B1B" style={styles.badgeIcon} />
                <Text style={styles.badgeText}>Lendário</Text>
              </View>
            )}
            {species.is_mythical && (
              <View style={[styles.badge, { backgroundColor: '#FF69B4' }]}>
                <MaterialIcons name="auto-awesome" size={16} color="#1B1B1B" style={styles.badgeIcon} />
                <Text style={styles.badgeText}>Mítico</Text>
              </View>
            )}
            {species.is_baby && (
              <View style={[styles.badge, { backgroundColor: '#87CEEB' }]}>
                <MaterialIcons name="child-care" size={16} color="#1B1B1B" style={styles.badgeIcon} />
                <Text style={styles.badgeText}>Baby</Text>
              </View>
            )}
            <View style={[styles.infoRow]}>
              <Text style={[styles.infoRowLabel, { color: theme.colors.textSecondary }]}>
                Taxa de Captura:
              </Text>
              <Text style={[styles.infoRowValue, { color: theme.colors.text }]}>
                {species.capture_rate}/255
              </Text>
            </View>
            <View style={[styles.infoRow]}>
              <Text style={[styles.infoRowLabel, { color: theme.colors.textSecondary }]}>
                Felicidade Base:
              </Text>
              <Text style={[styles.infoRowValue, { color: theme.colors.text }]}>
                {species.base_happiness}
              </Text>
            </View>
          </View>
        </Animated.View>
      </View>
    </ScrollView>

      {/* Toast de feedback */}
      {toastMessage && (
        <RNAnimated.View
          pointerEvents="none"
          style={[styles.toast, { opacity: toastOpacity, backgroundColor: theme.colors.text }]}
        >
          <Ionicons name="heart" size={16} color={theme.colors.background} />
          <Text style={[styles.toastText, { color: theme.colors.background }]}>
            {toastMessage}
          </Text>
        </RNAnimated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 20,
  },
  cornerButton: {
    position: 'absolute',
    top: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    zIndex: 2,
  },
  cornerLeft: {
    left: 16,
  },
  cornerRight: {
    right: 16,
  },
  navButton: {
    position: 'absolute',
    top: '45%',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    zIndex: 2,
  },
  navPrev: {
    left: 10,
  },
  navNext: {
    right: 10,
  },
  toast: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  toastText: {
    fontSize: 14,
    fontWeight: '600',
  },
  favoriteIcon: {
    lineHeight: 22,
  },
  image: {
    width: width * 0.6,
    height: width * 0.6,
  },
  content: {
    padding: 20,
    marginTop: -50,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    // Sombra para dar profundidade
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  id: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  name: {
    fontSize: 32,
    fontWeight: '700',
    textTransform: 'capitalize',
    marginBottom: 4,
  },
  genus: {
    fontSize: 16,
    fontStyle: 'italic',
  },
  typesContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  infoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  infoItem: {
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  abilitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  abilityChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  abilityText: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  hiddenBadge: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  placeholder: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 20,
  },
  extraInfoGrid: {
    gap: 12,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  badgeIcon: {
    marginRight: 6,
  },
  badgeText: {
    color: '#1B1B1B',
    fontSize: 12,
    fontWeight: '700',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  infoRowLabel: {
    fontSize: 14,
  },
  infoRowValue: {
    fontSize: 14,
    fontWeight: '600',
  },
});
