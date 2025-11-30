import { useAuth } from "@/utils/auth/useAuth";
import { AuthModal } from "@/utils/auth/useAuthModal";
import { Stack } from "expo-router";
import * as ExpoSplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import SplashScreen from "@/components/SplashScreen";
import { BalanceProvider } from "@/contexts/BalanceContext";
import { useTheme } from "@/utils/useTheme";

ExpoSplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 30, // 30 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function RootLayout() {
  const { initiate, isReady } = useAuth();
  const [showOwSplash, setShowOwoSplash] = useState(true);
  const theme = useTheme();

  useEffect(() => {
    initiate();
  }, [initiate]);

  useEffect(() => {
    if (isReady) {
      // Cache le splash screen Expo natif quand l'auth est prête
      ExpoSplashScreen.hideAsync();
    }
  }, [isReady]);

  const handleOwoSplashComplete = () => {
    // L'animation Owo! est terminée
    setShowOwoSplash(false);
  };

  // Affiche d'abord notre splash Owo! personnalisé
  if (showOwSplash) {
    return <SplashScreen onAnimationComplete={handleOwoSplashComplete} />;
  }

  // Puis affiche l'app une fois que l'auth est prête
  if (!isReady) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <BalanceProvider theme={theme}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <Stack screenOptions={{ headerShown: false }} initialRouteName="index">
            <Stack.Screen name="index" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="transaction-details" />
            <Stack.Screen name="add-transaction" />
            <Stack.Screen name="payment-integration" />
            <Stack.Screen name="insights" />
            <Stack.Screen name="budget-setup" />
          </Stack>
          <AuthModal />
        </GestureHandlerRootView>
      </BalanceProvider>
    </QueryClientProvider>
  );
}
