import React, { useState, useCallback, useEffect } from "react";
import { ScrollView, RefreshControl, Alert } from "react-native";
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
import {
  useFirebaseAuth,
  useWallets,
  useTransactions,
  useNotifications,
  useProfile,
} from "@/hooks/useFirebase";
import { TRIGGER_MIGRATION } from "@/lib/config";
import { migrateDataToFirestore } from "@/lib/migrateToFirebase";
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

  // Récupérer les données utilisateur via Firebase
  const { user, loading: userLoading } = useFirebaseAuth();
  const { profile, loading: profileLoading } = useProfile(user?.uid);
  const { wallets, loading: walletsLoading, getTotalBalance } = useWallets(user?.uid);
  const { transactions, loading: transactionsLoading } = useTransactions(user?.uid);
  const { notifications, unreadCount } = useNotifications(user?.uid);

  // Migration automatique des données (une seule fois)
  const [migrationDone, setMigrationDone] = useState(false);
  
  useEffect(() => {
    if (TRIGGER_MIGRATION && user && !migrationDone) {
      console.log('🔄 Démarrage de la migration...');
      migrateDataToFirestore()
        .then((result) => {
          if (result.success) {
            setMigrationDone(true);
            Alert.alert(
              '✅ Migration réussie',
              'Vos données ont été migrées vers Firebase.\n\n💰 Solde: 9 755,75 €\n💳 Cartes: 1 787,00 €',
              [{ text: 'OK' }]
            );
          }
        })
        .catch((error) => {
          console.error('Erreur migration:', error);
        });
    }
  }, [user, migrationDone]);

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

  // Pull-to-refresh avec Firebase
  const onRefresh = useCallback(async () => {
    haptics.medium();
    setRefreshing(true);
    try {
      // Rafraîchir toutes les données Firebase
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

  // Obtenir le nom d'affichage depuis Firebase
  const getDisplayName = () => {
    if (profile?.displayName) {
      return profile.displayName.split(" ")[0];
    }
    if (user?.displayName) {
      return user.displayName.split(" ")[0];
    }
    if (user?.email) {
      return user.email.split("@")[0];
    }
    return "Floriace";
  };

  // Créer l'objet balance pour les composants depuis Firebase
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

  // Utiliser les vraies transactions Firebase
  const recentTransactions = transactions.slice(0, 5);

  // Stats rapides depuis les données Firebase
  const quickStats = [
    {
      icon: 'Repeat',
      title: 'Transactions',
      value: transactions.length.toString(),
      change: '+12%',
      color: theme.colors.primary,
    },
    {
      icon: 'PiggyBank',
      title: 'Épargne totale',
      value: `${wallets.reduce((sum, w) => sum + (w.balance || 0), 0).toLocaleString('fr-FR')} FCFA`,
      change: '+8%',
      color: theme.colors.success,
    },
    {
      icon: 'CreditCard',
      title: 'Dépenses',
      value: `${transactions.filter(t => t.type === 'send').reduce((sum, t) => sum + (t.amount || 0), 0).toLocaleString('fr-FR')} FCFA`,
      change: '-3%',
      color: theme.colors.error,
    },
  ];

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
