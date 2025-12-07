import { MMKV } from 'react-native-mmkv';

export const storage = new MMKV();

export const storageKeys = {
  THEME_MODE: 'theme_mode',
  FAVORITES: 'favorites',
  USER_SETTINGS: 'user_settings',
};

// Helper functions
export const storageHelpers = {
  setItem: (key: string, value: string) => {
    storage.set(key, value);
  },
  
  getItem: (key: string): string | undefined => {
    return storage.getString(key);
  },
  
  setObject: (key: string, value: any) => {
    storage.set(key, JSON.stringify(value));
  },
  
  getObject: <T>(key: string): T | null => {
    const item = storage.getString(key);
    return item ? JSON.parse(item) : null;
  },
  
  removeItem: (key: string) => {
    storage.delete(key);
  },
  
  clearAll: () => {
    storage.clearAll();
  },
};
