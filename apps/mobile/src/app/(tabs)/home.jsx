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
import { useAppwriteAuth } from "@/hooks/useAppwrite";
import { useWallets } from "@/hooks/useAppwrite";
import { useTransactions } from "@/hooks/useAppwrite";
import { useNotifications } from "@/hooks/useAppwrite";
import { useProfile } from "@/hooks/useAppwrite";
import ScreenContainer from "@/components/ScreenContainer";
import LoadingScreen from "@/components/LoadingScreen";
import { DashboardHeader } from "@/components/Dashboard/DashboardHeader";
import { UserMenu } from "@/components/Dashboard/UserMenu";
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

  // Récupérer les données utilisateur via Appwrite
  const { user, loading: userLoading } = useAppwriteAuth();
  const { profile, loading: profileLoading } = useProfile(user?.$id);
  const { wallets, loading: walletsLoading, getTotalBalance } = useWallets(user?.$id);
  const { transactions, loading: transactionsLoading } = useTransactions(user?.$id);
  const { notifications, unreadCount } = useNotifications(user?.$id);

  // État pour la visibilité du solde
  const [balanceVisible, setBalanceVisible] = useState(true);
  const toggleBalanceVisibility = () => setBalanceVisible(!balanceVisible);

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

  // Pull-to-refresh avec Appwrite
  const onRefresh = useCallback(async () => {
    haptics.medium();
    setRefreshing(true);
    try {
      // Rafraîchir toutes les données Appwrite
      await Promise.all([
        // Les hooks vont automatiquement se rafraîchir
      ]);
      haptics.success();
    } catch (error) {
      console.error('Erreur rafraîchissement:', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Obtenir le nom d'affichage depuis Appwrite
  const getDisplayName = () => {
    if (profile?.firstName) {
      return profile.firstName;
    }
    if (user?.name) {
      return user.name.split(" ")[0];
    }
    return "Floriace";
  };

  // Créer l'objet balance pour les composants depuis Appwrite
  const totalBalance = getTotalBalance();
  const balance = {
    total: totalBalance,
    totalEUR: totalBalance / 655.956, // Conversion XOF → EUR
    totalFCFA: totalBalance,
    // Ajouter les wallets individuels
    mtn: wallets.find(w => w.provider?.includes('MTN'))?.balance || 0,
    orange: wallets.find(w => w.provider?.includes('Orange'))?.balance || 0,
    ecobank: wallets.find(w => w.provider?.includes('ECOBANK'))?.balance || 0,
    wave: wallets.find(w => w.provider?.includes('Wave'))?.balance || 0,
    moov: wallets.find(w => w.provider?.includes('Moov'))?.balance || 0,
  };

  // Utiliser les vraies transactions Appwrite
  const recentTransactions = transactions.slice(0, 5);
  
  // Stats rapides depuis les données Appwrite
  const quickStats = {
    totalTransactions: transactions.length,
    totalSent: transactions.filter(t => t.type === 'send').reduce((sum, t) => sum + (t.amount || 0), 0),
    totalReceived: transactions.filter(t => t.type === 'receive').reduce((sum, t) => sum + (t.amount || 0), 0),
    totalSaved: wallets.reduce((sum, w) => sum + (w.balance || 0), 0),
  };

  if (!fontsLoaded || userLoading || profileLoading) {
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
          unreadNotificationCount={unreadCount}
          onNotificationPress={handleNotificationPress}
          rightComponent={<UserMenu displayName={getDisplayName()} />}
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
