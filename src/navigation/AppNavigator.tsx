import React from 'react';
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
} from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PokemonListScreen } from '@screens/PokemonListScreen';
import { PokemonDetailScreen } from '@screens/PokemonDetailScreen';
import { FavoritesScreen } from '@screens/FavoritesScreen';
import { AccountScreen } from '@screens/AccountScreen';
import { ComparisonScreen } from '@screens/ComparisonScreen';
import { RankingScreen } from '@screens/RankingScreen';
import { useAppTheme } from '@theme/ThemeProvider';
import { linking } from './linking';

export type RootStackParamList = {
  PokemonList: undefined;
  Favorites: undefined;
  Account: undefined;
  Ranking: undefined;
  Comparison: {
    aId?: number;
  };
  PokemonDetail: {
    pokemonId: number;
  };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator = () => {
  const theme = useAppTheme();

  // Alinha o tema de navegação (fundos, bordas) ao tema do app.
  const navigationTheme = {
    ...(theme.dark ? DarkTheme : DefaultTheme),
    colors: {
      ...(theme.dark ? DarkTheme : DefaultTheme).colors,
      background: theme.colors.background,
      card: theme.colors.primary,
      text: '#FFFFFF',
      border: theme.colors.border,
      primary: theme.colors.primary,
    },
  };

  return (
    <NavigationContainer theme={navigationTheme} linking={linking}>
      <StatusBar style="light" />
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.colors.primary,
          },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen 
          name="PokemonList" 
          component={PokemonListScreen}
          options={{ title: 'Pokédex' }}
        />
        <Stack.Screen
          name="Favorites"
          component={FavoritesScreen}
          options={{ title: 'Favoritos' }}
        />
        <Stack.Screen
          name="Account"
          component={AccountScreen}
          options={{ title: 'Conta' }}
        />
        <Stack.Screen
          name="Comparison"
          component={ComparisonScreen}
          options={{ title: 'Comparar' }}
        />
        <Stack.Screen
          name="Ranking"
          component={RankingScreen}
          options={{ title: 'Ranking dos Favoritos' }}
        />
        <Stack.Screen 
          name="PokemonDetail" 
          component={PokemonDetailScreen}
          options={{ 
            title: 'Detalhes',
            headerBackTitle: 'Voltar',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
