import React, { useState, useCallback } from "react";
import { ScrollView, RefreshControl } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import { router } from "expo-router";
import { useTheme } from "@/utils/useTheme";
import { useRequireAuth } from "@/utils/auth/useAuth";
import useUser from "@/utils/auth/useUser";
import { useBalance } from "@/contexts/BalanceContext";
import ScreenContainer from "@/components/ScreenContainer";
import LoadingScreen from "@/components/LoadingScreen";
import { useDashboard } from "@/hooks/useDashboard";
import { getMockTransactions, getQuickStats } from "@/utils/dashboardData";
import { DashboardHeader } from "@/components/Dashboard/DashboardHeader";
import { BalanceOverview } from "@/components/Dashboard/BalanceOverview";
import { AccountsSection } from "@/components/Dashboard/AccountsSection";
import { QuickActionsSection } from "@/components/Dashboard/QuickActionsSection";
import { QuickStatsSection } from "@/components/Dashboard/QuickStatsSection";
import { RecentTransactionsSection } from "@/components/Dashboard/RecentTransactionsSection";
import useHaptics from "@/hooks/useHaptics";

export default function DashboardScreen() {
  // Require authentication to access this screen
  useRequireAuth();

  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const haptics = useHaptics();
  const [refreshing, setRefreshing] = useState(false);

  // Récupérer les données utilisateur
  const { data: user, loading: userLoading } = useUser();

  // Utiliser le contexte de balance
  const { balances, getTotalEUR, getTotalFCFA } = useBalance();

  const {
    userProfile,
    unreadNotificationCount,
    balanceVisible,
    hasTransactions,
    toggleBalanceVisibility,
  } = useDashboard(user?.id);

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const handleNotificationPress = () => {
    haptics.light();
    router.push("/notifications");
  };

  // Pull-to-refresh
  const onRefresh = useCallback(() => {
    haptics.medium();
    setRefreshing(true);
    // Simuler un rechargement des données
    setTimeout(() => {
      setRefreshing(false);
      haptics.success();
    }, 1500);
  }, []);

  // Obtenir le nom d'affichage
  const getDisplayName = () => {
    if (userProfile?.first_name) {
      return userProfile.first_name;
    }
    if (user?.name) {
      return user.name.split(" ")[0];
    }
    return "Utilisateur";
  };

  // Créer l'objet balance pour les composants
  // On s'appuie directement sur les helpers du contexte pour avoir des totaux cohérents
  const balance = {
    ...balances,
    totalEUR: getTotalEUR(),
    total: getTotalFCFA(),
  };

  const recentTransactions = hasTransactions ? getMockTransactions(theme) : [];
  const quickStats = getQuickStats(theme);

  if (!fontsLoaded || userLoading) {
    return <LoadingScreen />;
  }

  return (
    <ScreenContainer>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: insets.top + 16,
          paddingHorizontal: 24,
          paddingBottom: insets.bottom + 16,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
            progressBackgroundColor={theme.colors.cardBackground}
          />
        }
      >
        <DashboardHeader
          theme={theme}
          displayName={getDisplayName()}
          unreadNotificationCount={unreadNotificationCount}
          onNotificationPress={handleNotificationPress}
        />

        <BalanceOverview
          theme={theme}
          balance={balance}
          balanceVisible={balanceVisible}
          onToggleVisibility={toggleBalanceVisibility}
        />

        <AccountsSection
          theme={theme}
          balance={balance}
          balanceVisible={balanceVisible}
        />

        <QuickActionsSection theme={theme} />

        <QuickStatsSection theme={theme} stats={quickStats} />

        <RecentTransactionsSection
          theme={theme}
          transactions={recentTransactions}
        />
      </ScrollView>
    </ScreenContainer>
  );
}
