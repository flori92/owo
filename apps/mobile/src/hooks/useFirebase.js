import { useState, useEffect, useCallback } from 'react';
import {
  getCurrentUser,
  getWallets,
  getTransactions,
  getNotifications,
  getProfile,
  createAccount as firebaseCreateAccount,
  login as firebaseLogin,
  logout as firebaseLogout,
  subscribeToAuthChanges,
} from '@/lib/firebase';
import { IS_PRODUCTION } from '@/config/appConfig';
import { getApiWallets } from '@/services/accounts';
import { listApiTransactions } from '@/services/transactions';
import { subscribeFinancialDataChanged } from '@/services/financialEvents';
import { useMarket } from '@/contexts/MarketContext';

/**
 * Hook pour gérer l'état d'authentification Firebase
 */
export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const checkAuth = useCallback(async () => {
    const AUTH_BYPASS = process.env.EXPO_PUBLIC_AUTH_BYPASS === 'true';
    if (AUTH_BYPASS) {
      setUser({
        uid: 'demo',
        $id: 'demo',
        email: 'demo@owo.app',
        displayName: 'Floriace',
      });
      setError(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { success, user } = await getCurrentUser();
      setUser(success ? user : null);
    } catch (err) {
      setError(err.message);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (process.env.EXPO_PUBLIC_AUTH_BYPASS === 'true') {
      checkAuth();
      return undefined;
    }

    setLoading(true);
    return subscribeToAuthChanges(
      (nextUser) => {
        setUser(nextUser);
        setError(null);
        setLoading(false);
      },
      (subscriptionError) => {
        setUser(null);
        setError(subscriptionError.message);
        setLoading(false);
      },
    );
  }, [checkAuth]);

  // Créer un compte
  const createAccount = useCallback(async (email, password, name) => {
    try {
      const result = await firebaseCreateAccount(email, password, name);
      if (result.success) {
        await checkAuth();
      }
      return result;
    } catch (error) {
      if (__DEV__) {
        console.error('Erreur création compte:', error);
      }
      return { success: false, error: error.message };
    }
  }, [checkAuth]);

  const logout = useCallback(async () => {
    await firebaseLogout();
    setUser(null);
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      const result = await firebaseLogin(email, password);
      if (result.success) {
        await checkAuth();
      }
      return result;
    } catch (error) {
      if (__DEV__) {
        console.error('Erreur connexion:', error);
      }
      return { success: false, error: error.message };
    }
  }, [checkAuth]);

  return {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    checkAuth,
    logout,
    login,
    createAccount,
  };
}

/**
 * Hook pour gérer les wallets
 */
export function useWallets(userId) {
  const { market } = useMarket();
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWallets = useCallback(async () => {
    const AUTH_BYPASS = process.env.EXPO_PUBLIC_AUTH_BYPASS === 'true';
    if (AUTH_BYPASS) {
      // Compte de test (démo) pour garantir des écrans fonctionnels en bypass.
      setWallets([
        ...market.operators.map((operator, index) => ({
          id: `demo-mm-${operator.id}`,
          $id: `demo-mm-${operator.id}`,
          userId: 'demo',
          type: 'mobile_money',
          provider: operator.name,
          operatorId: operator.id,
          currency: market.currency,
          balance: index === 0 ? 495739 : 0,
          status: 'active',
          isPrimary: index === 0,
        })),
        {
          id: `demo-main-${market.currency.toLowerCase()}`,
          $id: `demo-main-${market.currency.toLowerCase()}`,
          userId: 'demo',
          type: 'main',
          provider: 'Compte Principal',
          currency: market.currency,
          balance: 9000000,
          status: 'active',
          isPrimary: true,
        },
      ]);
      setError(null);
      setLoading(false);
      return;
    }

    if (!userId) {
      setWallets([]);
      setError(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { success, wallets: data, error: requestError } = IS_PRODUCTION
        ? await getApiWallets()
        : await getWallets(userId);
      if (success) {
        setWallets(data);
        setError(null);
      } else if (requestError) {
        setError(requestError);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId, market]);

  useEffect(() => {
    fetchWallets();
  }, [fetchWallets]);

  useEffect(() => subscribeFinancialDataChanged(fetchWallets), [fetchWallets]);

  const getTotalBalance = useCallback((currency = market.currency) => {
    return wallets
      .filter(w => w.currency === currency && w.status === 'active')
      .reduce((sum, w) => sum + (parseFloat(w.balance) || 0), 0);
  }, [wallets, market.currency]);

  const getMobileMoneyWallets = useCallback(() => {
    return wallets.filter(w => w.type === 'mobile_money');
  }, [wallets]);

  const getBankWallets = useCallback(() => {
    return wallets.filter(w => w.type === 'bank');
  }, [wallets]);

  return {
    wallets,
    loading,
    error,
    refetch: fetchWallets,
    getTotalBalance,
    getMobileMoneyWallets,
    getBankWallets,
  };
}

/**
 * Hook pour gérer les transactions
 */
export function useTransactions(userId, limit = 20) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTransactions = useCallback(async (silent = false) => {
    const AUTH_BYPASS = process.env.EXPO_PUBLIC_AUTH_BYPASS === 'true';
    if (AUTH_BYPASS) {
      const now = Date.now();
      setTransactions([
        {
          id: 'demo-tx-1',
          $id: 'demo-tx-1',
          userId: 'demo',
          type: 'receive',
          amount: 120,
          description: 'Salaire',
          createdAt: now - 1000 * 60 * 60 * 24 * 2,
        },
        {
          id: 'demo-tx-2',
          $id: 'demo-tx-2',
          userId: 'demo',
          type: 'send',
          amount: 35.5,
          description: 'Courses',
          createdAt: now - 1000 * 60 * 60 * 24,
        },
        {
          id: 'demo-tx-3',
          $id: 'demo-tx-3',
          userId: 'demo',
          type: 'payment',
          amount: 12.9,
          description: 'Abonnement',
          createdAt: now - 1000 * 60 * 60 * 6,
        },
      ].slice(0, limit));
      setError(null);
      setLoading(false);
      return;
    }

    if (!userId) {
      setTransactions([]);
      setError(null);
      setLoading(false);
      return;
    }

    try {
      if (!silent) setLoading(true);
      const { success, transactions: data, error: requestError } = IS_PRODUCTION
        ? await listApiTransactions(limit)
        : await getTransactions(userId, limit);
      if (success) {
        setTransactions(data);
        setError(null);
      } else if (requestError) {
        setError(requestError);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [userId, limit]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  useEffect(
    () => subscribeFinancialDataChanged(() => fetchTransactions(true)),
    [fetchTransactions],
  );

  useEffect(() => {
    if (!IS_PRODUCTION || !transactions.some((transaction) => ['pending', 'processing'].includes(transaction.status))) {
      return undefined;
    }
    const oldestProcessingAge = Math.max(
      0,
      ...transactions
        .filter((transaction) => ['pending', 'processing'].includes(transaction.status))
        .map((transaction) => Date.now() - new Date(transaction.createdAt).getTime()),
    );
    const pollDelay = oldestProcessingAge < 15_000 ? 1000 : oldestProcessingAge < 60_000 ? 5000 : 30_000;
    const refreshTimer = setTimeout(() => fetchTransactions(true), pollDelay);
    return () => clearTimeout(refreshTimer);
  }, [transactions, fetchTransactions]);

  return {
    transactions,
    loading,
    error,
    refetch: fetchTransactions,
  };
}

/**
 * Hook pour gérer les notifications
 */
export function useNotifications(userId) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    const AUTH_BYPASS = process.env.EXPO_PUBLIC_AUTH_BYPASS === 'true';
    if (AUTH_BYPASS) {
      setNotifications([
        {
          id: 'demo-notif-1',
          $id: 'demo-notif-1',
          title: 'Bienvenue sur owo!',
          body: 'Mode démo activé. Certaines données sont simulées.',
          read: false,
          createdAt: Date.now() - 1000 * 60 * 60,
        },
      ]);
      setUnreadCount(1);
      setLoading(false);
      return;
    }

    if (!userId) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { success, notifications: data } = await getNotifications(userId);
      if (success) {
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.read).length);
      }
    } catch (err) {
      if (__DEV__) {
        console.error('Erreur notifications:', err);
      }
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    refetch: fetchNotifications,
  };
}

/**
 * Hook pour gérer le profil utilisateur
 */
export function useProfile(userId) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProfile = useCallback(async () => {
    const AUTH_BYPASS = process.env.EXPO_PUBLIC_AUTH_BYPASS === 'true';
    if (AUTH_BYPASS) {
      setProfile({
        id: 'demo',
        userId: 'demo',
        displayName: 'Floriace',
        email: 'demo@owo.app',
        createdAt: Date.now(),
      });
      setError(null);
      setLoading(false);
      return;
    }

    if (!userId) {
      setProfile(null);
      setError(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { success, profile: data } = await getProfile(userId);
      if (success) {
        setProfile(data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    loading,
    error,
    refetch: fetchProfile,
  };
}

export default useAuth;
