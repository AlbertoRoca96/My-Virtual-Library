import '../global.css';

import { QueryClientProvider } from '@tanstack/react-query';
import { Href, Stack, usePathname, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider } from '@/lib/auth';
import { queryClient } from '@/lib/query-client';
import { palette } from '@/lib/theme';

const GITHUB_PAGES_BASE_SEGMENT = '/My-Virtual-Library';

function GithubPagesRouteNormalizer() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (Platform.OS !== 'web') {
      return;
    }

    const duplicatedBasePath = `${GITHUB_PAGES_BASE_SEGMENT}${GITHUB_PAGES_BASE_SEGMENT}`;

    let normalizedPathname = pathname;
    if (normalizedPathname.startsWith(duplicatedBasePath)) {
      normalizedPathname = normalizedPathname.slice(GITHUB_PAGES_BASE_SEGMENT.length);
    }
    if (normalizedPathname.startsWith(GITHUB_PAGES_BASE_SEGMENT)) {
      normalizedPathname = normalizedPathname.slice(GITHUB_PAGES_BASE_SEGMENT.length) || '/';
    }

    if (!normalizedPathname.startsWith('/')) {
      normalizedPathname = `/${normalizedPathname}`;
    }

    if (normalizedPathname !== pathname) {
      router.replace(normalizedPathname as Href);
    }
  }, [pathname, router]);

  return null;
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <GithubPagesRouteNormalizer />
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
            <Stack.Screen name="profile" options={{ title: 'Edit Sanctuary' }} />
            <Stack.Screen name="[...slug]" options={{ headerShown: false }} />
          </Stack>
        </AuthProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
