import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PokemonListScreen } from '@screens/PokemonListScreen';
import { useAppTheme } from '@theme/ThemeProvider';

export type RootStackParamList = {
  PokemonList: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator = () => {
  const theme = useAppTheme();

  return (
    <NavigationContainer>
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
      </Stack.Navigator>
    </NavigationContainer>
  );
};
