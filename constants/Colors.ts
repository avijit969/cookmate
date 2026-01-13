
import { useColorScheme as useNativeColorScheme } from 'react-native';
import { useThemeStore } from '../store/themeStore';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: '#F59E0B',
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: '#F59E0B',
    card: '#ffffff',
    border: '#e5e5e5',
    subtext: '#666666',
    inputBg: '#f5f5f5',
    danger: '#ef4444',
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: '#F59E0B',
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: '#F59E0B',
    card: '#232526',
    border: '#333333',
    subtext: '#9BA1A6',
    inputBg: '#2a2a2a',
    danger: '#ef4444',
  },
};

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  const { mode } = useThemeStore();
  const systemScheme = useNativeColorScheme();
  const isDark = mode === 'system' ? systemScheme === 'dark' : mode === 'dark';
  
  const theme = isDark ? 'dark' : 'light';
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[theme][colorName];
  }
}

export function useAppTheme() {
    const { mode } = useThemeStore();
    const systemScheme = useNativeColorScheme();
    const isDark = mode === 'system' ? systemScheme === 'dark' : mode === 'dark';
    return isDark ? Colors.dark : Colors.light;
}
