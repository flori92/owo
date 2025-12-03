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
import { useSavingsGoals } from "@/hooks/useSavingsGoals";
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
import { SavingsSection } from "@/components/Dashboard/SavingsSection";
import useHaptics from "@/hooks/useHaptics";

export default function DashboardScreen() {
  console.log('🏠 Home: Rendu du composant');
  
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
  const { lockedSavings, totalSaved, loading: savingsLoading } = useSavingsGoals(user?.uid);

  console.log('🏠 Home: userLoading=', userLoading, 'profileLoading=', profileLoading, 'walletsLoading=', walletsLoading);

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
  // Les wallets sont déjà en EUR (pas en FCFA)
  const mobileMoneyWallets = wallets.filter(w => w.type === 'mobile_money');
  const mainWallets = wallets.filter(w => w.type === 'main');

  const mobileMoneyTotal = mobileMoneyWallets.reduce((sum, w) => sum + (w.balance || 0), 0);
  const europeanBanksTotal = mainWallets.reduce((sum, w) => sum + (w.balance || 0), 0);

  // Total des wallets = 9755.75 EUR
  const totalWalletsEUR = mobileMoneyTotal + europeanBanksTotal;

  const balance = {
    // Pour BalanceOverview - il additionne totalEUR + europeanBanks.total + virtualCard.balance
    totalEUR: mobileMoneyTotal, // Mobile Money seulement (MTN + Moov + Wave)
    total: mobileMoneyTotal * 655.957, // Mobile Money en FCFA (pour AccountsSection)
    totalFCFA: totalWalletsEUR * 655.957, // Total complet en FCFA

    // Pour AccountsSection
    mobileMoneyTotal: mobileMoneyTotal,
    mtn: wallets.find(w => w.provider?.includes('MTN'))?.balance || 0,
    orange: wallets.find(w => w.provider?.includes('Orange'))?.balance || 0,
    ecobank: wallets.find(w => w.provider?.includes('ECOBANK'))?.balance || 0,
    wave: wallets.find(w => w.provider?.includes('Wave'))?.balance || 0,
    moov: wallets.find(w => w.provider?.includes('Moov'))?.balance || 0,

    europeanBanks: {
      accounts: ['Compte Principal'],
      total: europeanBanksTotal, // Compte Principal en EUR
    },

    virtualCard: {
      status: 'active',
      balance: 0, // Carte virtuelle non incluse dans le solde total
    },
  };

  // Transformer les transactions Firebase en format compatible TransactionItem
  const formatTransactions = (firebaseTransactions) => {
    return firebaseTransactions.map(t => {
      // Déterminer le type et la couleur
      let type, categoryColor, category;

      switch(t.type) {
        case 'receive':
          type = 'income';
          categoryColor = theme.colors.success;
          category = 'Réception';
          break;
        case 'send':
          type = 'expense';
          categoryColor = theme.colors.error;
          category = 'Envoi';
          break;
        case 'deposit':
          type = 'income';
          categoryColor = theme.colors.primary;
          category = 'Dépôt';
          break;
        case 'payment':
          type = 'expense';
          categoryColor = theme.colors.warning || '#F59E0B';
          category = 'Paiement';
          break;
        default:
          type = 'expense';
          categoryColor = theme.colors.textSecondary;
          category = 'Autre';
      }

      // Formater la date
      const date = new Date(t.createdAt);
      const formattedDate = date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short'
      });

      // Construire le titre
      let title = t.description || category;
      if (t.senderName) title = t.senderName;
      if (t.recipientName) title = t.recipientName;
      if (t.merchantName) title = t.merchantName;

      return {
        ...t,
        title,
        category,
        date: formattedDate,
        categoryColor,
        type,
        isVirtualCard: false,
        amount: type === 'income' ? t.amount : -t.amount, // Négatif pour les dépenses
      };
    });
  };

  const recentTransactions = formatTransactions(transactions.slice(0, 5));

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

  console.log('🏠 Home: fontsLoaded=', fontsLoaded, 'userLoading=', userLoading, 'profileLoading=', profileLoading);
  
  if (!fontsLoaded || userLoading || profileLoading) {
    console.log('🏠 Home: Affichage LoadingScreen');
    return <LoadingScreen />;
  }
  
  console.log('🏠 Home: Affichage du dashboard');

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

        <SavingsSection
          theme={theme}
          savings={lockedSavings}
          totalSaved={totalSaved}
        />

        <RecentTransactionsSection
          theme={theme}
          transactions={recentTransactions}
        />
      </ScrollView>
    </ScreenContainer>
  );
}
