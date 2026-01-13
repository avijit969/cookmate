import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance } from 'react-native';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeState {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  isDark: boolean;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      mode: 'dark',
      setMode: (mode) => set({ mode }),
      get isDark() {
          const { mode } = get();
          if (mode === 'system') {
              return Appearance.getColorScheme() === 'dark';
          }
          return mode === 'dark';
      }
    }),
    {
        name: 'theme-storage',
        storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
