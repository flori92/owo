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
} from '@/lib/firebase';

/**
 * Hook pour gérer l'état d'authentification Firebase
 */
export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const checkAuth = useCallback(async () => {
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

  // Vérifier l'auth au démarrage
  useEffect(() => {
    checkAuth();
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
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWallets = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      const { success, wallets: data } = await getWallets(userId);
      if (success) {
        setWallets(data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchWallets();
  }, [fetchWallets]);

  const getTotalBalance = useCallback((currency = 'XOF') => {
    return wallets
      .filter(w => w.currency === currency && w.status === 'active')
      .reduce((sum, w) => sum + (parseFloat(w.balance) || 0), 0);
  }, [wallets]);

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

  const fetchTransactions = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      const { success, transactions: data } = await getTransactions(userId, limit);
      if (success) {
        setTransactions(data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId, limit]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

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
    if (!userId) return;

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
    if (!userId) return;

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
