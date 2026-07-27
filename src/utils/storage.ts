import AsyncStorage from '@react-native-async-storage/async-storage';

export const storageKeys = {
  THEME_MODE: 'theme_mode',
  FAVORITES: 'favorites',
  USER_SETTINGS: 'user_settings',
};

// Helper functions
export const storageHelpers = {
  setItem: async (key: string, value: string) => {
    await AsyncStorage.setItem(key, value);
  },

  getItem: async (key: string): Promise<string | null> => {
    return AsyncStorage.getItem(key);
  },

  setObject: async (key: string, value: unknown) => {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  },

  getObject: async <T>(key: string): Promise<T | null> => {
    const item = await AsyncStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : null;
  },

  removeItem: async (key: string) => {
    await AsyncStorage.removeItem(key);
  },

  clearAll: async () => {
    await AsyncStorage.clear();
  },
};
