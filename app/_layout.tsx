import '../global.css';

import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider } from '@/lib/auth';
import { queryClient } from '@/lib/query-client';
import { palette } from '@/lib/theme';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <StatusBar style="dark" />
          <Stack
            screenOptions={{
              headerStyle: { backgroundColor: palette.parchment },
              headerShadowVisible: false,
              headerTintColor: palette.ink,
              headerTitleStyle: { fontFamily: 'Georgia' },
              contentStyle: { backgroundColor: palette.parchment },
            }}
          >
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="library" options={{ title: 'My Library' }} />
            <Stack.Screen name="add-book" options={{ title: 'Add a Book' }} />
            <Stack.Screen name="scan" options={{ title: 'Scan ISBN' }} />
          <Stack.Screen name="[...slug]" options={{ headerShown: false }} />
          </Stack>
        </AuthProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
