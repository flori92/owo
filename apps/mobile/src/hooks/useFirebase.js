import { useState, useEffect, useCallback } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore';

// ============================================
// FIREBASE AUTH HOOK
// ============================================

/**
 * Hook pour l'authentification Firebase
 */
export function useFirebaseAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Écouter les changements d'état d'authentification
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    }, (err) => {
      console.error('Firebase Auth error:', err);
      setError(err.message);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { user, loading, error };
}

/**
 * Hook pour le profil utilisateur Firestore
 */
export function useProfile(userId) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setProfile(null);
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        const profileRef = doc(db, 'profiles', userId);
        const profileSnap = await getDoc(profileRef);
        
        if (profileSnap.exists()) {
          setProfile({ id: profileSnap.id, ...profileSnap.data() });
        } else {
          setProfile(null);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  return { profile, loading };
}

/**
 * Hook pour les wallets (portefeuilles) Firestore
 */
export function useWallets(userId) {
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setWallets([]);
      setLoading(false);
      return;
    }

    const fetchWallets = async () => {
      try {
        const walletsRef = collection(db, 'wallets');
        const q = query(
          walletsRef,
          where('userId', '==', userId),
          orderBy('isPrimary', 'desc')
        );
        const querySnapshot = await getDocs(q);
        
        const walletsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setWallets(walletsData);
      } catch (error) {
        console.error('Error fetching wallets:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWallets();
  }, [userId]);

  const getTotalBalance = useCallback(() => {
    return wallets.reduce((total, wallet) => total + (wallet.balance || 0), 0);
  }, [wallets]);

  return { wallets, loading, getTotalBalance };
}

/**
 * Hook pour les transactions Firestore
 */
export function useTransactions(userId, limitCount = 20) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setTransactions([]);
      setLoading(false);
      return;
    }

    const fetchTransactions = async () => {
      try {
        const transactionsRef = collection(db, 'transactions');
        const q = query(
          transactionsRef,
          where('userId', '==', userId),
          orderBy('createdAt', 'desc'),
          limit(limitCount)
        );
        const querySnapshot = await getDocs(q);
        
        const transactionsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setTransactions(transactionsData);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [userId, limitCount]);

  return { transactions, loading };
}

/**
 * Hook pour les notifications Firestore
 */
export function useNotifications(userId) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!userId) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    const fetchNotifications = async () => {
      try {
        const notificationsRef = collection(db, 'notifications');
        const q = query(
          notificationsRef,
          where('userId', '==', userId),
          orderBy('createdAt', 'desc'),
          limit(50)
        );
        const querySnapshot = await getDocs(q);
        
        const notificationsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setNotifications(notificationsData);
        setUnreadCount(notificationsData.filter(n => !n.read).length);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [userId]);

  return { notifications, unreadCount, loading };
}

// ============================================
// FONCTIONS D'AUTHENTIFICATION FIREBASE
// ============================================

/**
 * Connexion avec email et mot de passe
 */
export async function loginWithEmail(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Créer un compte avec email et mot de passe
 */
export async function createAccountWithEmail(email, password, displayName) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Mettre à jour le profil avec le nom
    if (displayName) {
      await updateProfile(userCredential.user, { displayName });
      
      // Créer le document profil dans Firestore
      await setDoc(doc(db, 'profiles', userCredential.user.uid), {
        email,
        displayName,
        createdAt: new Date().toISOString(),
      });
    }
    
    return { success: true, user: userCredential.user };
  } catch (error) {
    console.error('Create account error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Déconnexion
 */
export async function logoutUser() {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    return { success: false, error: error.message };
  }
}
