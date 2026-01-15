import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { useColorScheme as useNativeColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import CustomAlert from '@/components/CustomAlert';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';

export const unstable_settings = {
  initialRouteName: '(auth)',
};

export default function RootLayout() {
  const { mode } = useThemeStore();
  const systemColorScheme = useNativeColorScheme();
  const { token } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();
  const [isNavigationReady, setIsNavigationReady] = useState(false);

  const isDark = mode === 'system' ? systemColorScheme === 'dark' : mode === 'dark';

  useEffect(() => {
    setIsNavigationReady(true);
  }, []);

  useEffect(() => {
    if (!isNavigationReady) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!token && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (token && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [token, segments, isNavigationReady]);

  if (!isNavigationReady) {
    return null;
  }


  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <CustomAlert />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
