import { useState, useEffect, useCallback } from 'react';
import { 
  getCurrentUser, 
  getWallets, 
  getTransactions,
  getNotifications,
  getProfile,
  createAccount as appwriteCreateAccount,
  login as appwriteLogin,
  loginWithGoogle as appwriteLoginWithGoogle,
  loginWithApple as appwriteLoginWithApple,
  logout as appwriteLogout,
} from '@/lib/appwrite';
import { USE_MOCK, MOCK_SESSION_KEY } from '@/lib/config';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Hook pour gérer l'état d'authentification Appwrite
 * Synchronisé avec le mode mock de Firebase
 */
export function useAppwriteAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const checkAuth = useCallback(async () => {
    try {
      setLoading(true);
      
      // MODE MOCK : Vérifier AsyncStorage
      if (USE_MOCK) {
        const data = await AsyncStorage.getItem(MOCK_SESSION_KEY);
        if (data) {
          const mockUser = JSON.parse(data);
          console.log('🔧 useAppwriteAuth MOCK: Session trouvée pour', mockUser.email);
          setUser(mockUser);
        } else {
          setUser(null);
        }
        setLoading(false);
        return;
      }
      
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
    
    // En mode mock, écouter les changements
    if (USE_MOCK) {
      const interval = setInterval(checkAuth, 1000);
      return () => clearInterval(interval);
    }
  }, [checkAuth]);

  // Créer un compte
  const createAccount = useCallback(async (email, password, name) => {
    try {
      const result = await appwriteCreateAccount(email, password, name);
      if (result.success) {
        // Forcer le rafraîchissement de l'utilisateur
        await checkAuth();
      }
      return result;
    } catch (error) {
      console.error('Erreur création compte:', error);
      return { success: false, error: error.message };
    }
  }, [checkAuth]);

  // Connexion avec Google
  const loginWithGoogle = useCallback(async () => {
    try {
      const result = await appwriteLoginWithGoogle();
      if (result.success) {
        await checkAuth();
      }
      return result;
    } catch (error) {
      console.error('Erreur connexion Google:', error);
      return { success: false, error: error.message };
    }
  }, [checkAuth]);

  // Connexion avec Apple
  const loginWithApple = useCallback(async () => {
    try {
      const result = await appwriteLoginWithApple();
      if (result.success) {
        await checkAuth();
      }
      return result;
    } catch (error) {
      console.error('Erreur connexion Apple:', error);
      return { success: false, error: error.message };
    }
  }, [checkAuth]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const logout = useCallback(async () => {
    await appwriteLogout();
    setUser(null);
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      const result = await appwriteLogin(email, password);
      if (result.success) {
        await checkAuth();
      }
      return result;
    } catch (error) {
      console.error('Erreur connexion:', error);
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
    loginWithGoogle,
    loginWithApple,
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
      console.error('Erreur notifications:', err);
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

export default useAppwriteAuth;
