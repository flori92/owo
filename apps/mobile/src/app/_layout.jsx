import { Stack } from 'expo-router';
import * as ExpoSplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import SplashScreen from '@/components/SplashScreen';
import { BalanceProvider } from '@/contexts/BalanceContext';
import { MarketProvider } from '@/contexts/MarketContext';
import { useTheme } from '@/utils/useTheme';

ExpoSplashScreen.preventAutoHideAsync().catch(() => {});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 30,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function RootLayout() {
  const [showOwoSplash, setShowOwoSplash] = useState(true);
  const theme = useTheme();

  useEffect(() => {
    ExpoSplashScreen.hideAsync().catch(() => {});
  }, []);

  if (showOwoSplash) {
    return <SplashScreen onAnimationComplete={() => setShowOwoSplash(false)} />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <MarketProvider>
        <BalanceProvider theme={theme}>
          <GestureHandlerRootView style={{ flex: 1 }}>
          <Stack screenOptions={{ headerShown: false }} initialRouteName="index">
            <Stack.Screen name="index" />
            <Stack.Screen name="auth" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="account-settings" />
            <Stack.Screen name="support" />
            <Stack.Screen name="legal" />
            <Stack.Screen name="payment-integration" />
            <Stack.Screen name="market-settings" />
            <Stack.Screen name="group-savings" />
            <Stack.Screen name="locked-savings" />
            <Stack.Screen name="notifications" />
            <Stack.Screen name="+not-found" />
          </Stack>
          </GestureHandlerRootView>
        </BalanceProvider>
      </MarketProvider>
    </QueryClientProvider>
  );
}
