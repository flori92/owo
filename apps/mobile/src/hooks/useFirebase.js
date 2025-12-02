import { useState, useEffect, useCallback } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { USE_MOCK, MOCK_SESSION_KEY } from '@/lib/config';
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
import AsyncStorage from '@react-native-async-storage/async-storage';

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
    // MODE MOCK : Vérifier la session dans AsyncStorage
    if (USE_MOCK) {
      const checkMockSession = async () => {
        try {
          const data = await AsyncStorage.getItem(MOCK_SESSION_KEY);
          if (data) {
            const mockUser = JSON.parse(data);
            console.log('🔧 MODE MOCK: Session trouvée pour', mockUser.email);
            setUser(mockUser);
          } else {
            setUser(null);
          }
        } catch (err) {
          console.error('Erreur lecture session mock:', err);
          setUser(null);
        } finally {
          setLoading(false);
        }
      };
      
      checkMockSession();
      
      // Écouter les changements de session mock
      const interval = setInterval(checkMockSession, 1000);
      return () => clearInterval(interval);
    }

    // MODE FIREBASE RÉEL
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
        // MODE MOCK : Profil Floriace FAVI
        if (USE_MOCK) {
          setProfile({
            id: userId,
            displayName: 'Floriace FAVI',
            email: 'florifavi@gmail.com',
            phone: '+229 97 00 00 00',
            avatar: '',
            kycVerified: true,
            kycLevel: 3,
            country: 'Bénin',
            currency: 'EUR',
          });
          setLoading(false);
          return;
        }

        const profileRef = doc(db, 'profiles', userId);
        const profileSnap = await getDoc(profileRef);
        
        if (profileSnap.exists()) {
          setProfile({ id: profileSnap.id, ...profileSnap.data() });
        } else {
          // Créer un profil par défaut si inexistant
          setProfile({
            id: userId,
            displayName: 'Utilisateur owo!',
            email: '',
          });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        // Fallback en cas d'erreur
        setProfile({ id: userId, displayName: 'Utilisateur', email: '' });
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
        // MODE MOCK : Wallets Floriace FAVI (Total: 9755.75 EUR)
        if (USE_MOCK) {
          setWallets([
            { id: 'w1', userId, name: 'Compte Principal', type: 'main', provider: 'owo', balance: 4250.50, currency: 'EUR', status: 'active', isPrimary: true },
            { id: 'w2', userId, name: 'MTN Mobile Money', type: 'mobile_money', provider: 'mtn', balance: 2150.25, currency: 'EUR', status: 'active', isPrimary: false },
            { id: 'w3', userId, name: 'Moov Money', type: 'mobile_money', provider: 'moov', balance: 1875.00, currency: 'EUR', status: 'active', isPrimary: false },
            { id: 'w4', userId, name: 'Wave', type: 'mobile_money', provider: 'wave', balance: 1480.00, currency: 'EUR', status: 'active', isPrimary: false },
          ]);
          setLoading(false);
          return;
        }

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
        
        // Si pas de wallets, créer des wallets par défaut
        if (walletsData.length === 0) {
          setWallets([
            { id: 'default', userId, name: 'Wallet Principal', balance: 0, currency: 'XOF', isPrimary: true },
          ]);
        } else {
          setWallets(walletsData);
        }
      } catch (error) {
        console.error('Error fetching wallets:', error);
        // Fallback avec wallet vide
        setWallets([{ id: 'default', userId, name: 'Wallet Principal', balance: 0, currency: 'XOF', isPrimary: true }]);
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
        // MODE MOCK : Transactions Floriace FAVI
        if (USE_MOCK) {
          setTransactions([
            { id: 't1', userId, type: 'receive', amount: 1500.00, currency: 'EUR', description: 'Virement reçu - Salaire', status: 'completed', createdAt: new Date(Date.now() - 1000*60*30).toISOString(), senderName: 'ENTREPRISE XYZ' },
            { id: 't2', userId, type: 'send', amount: 350.00, currency: 'EUR', description: 'Envoyé à Famille', status: 'completed', createdAt: new Date(Date.now() - 1000*60*60*2).toISOString(), recipientName: 'Marie FAVI' },
            { id: 't3', userId, type: 'deposit', amount: 2000.00, currency: 'EUR', description: 'Dépôt compte principal', status: 'completed', createdAt: new Date(Date.now() - 1000*60*60*24).toISOString() },
            { id: 't4', userId, type: 'payment', amount: 89.99, currency: 'EUR', description: 'Paiement Amazon', status: 'completed', createdAt: new Date(Date.now() - 1000*60*60*48).toISOString(), merchantName: 'Amazon' },
            { id: 't5', userId, type: 'receive', amount: 500.00, currency: 'EUR', description: 'Remboursement', status: 'completed', createdAt: new Date(Date.now() - 1000*60*60*72).toISOString(), senderName: 'Jean KOUASSI' },
            { id: 't6', userId, type: 'payment', amount: 45.50, currency: 'EUR', description: 'Carburant Total', status: 'completed', createdAt: new Date(Date.now() - 1000*60*60*96).toISOString(), merchantName: 'Total Energies' },
          ]);
          setLoading(false);
          return;
        }

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
        setTransactions([]);
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
        // MODE MOCK : Notifications Floriace FAVI
        if (USE_MOCK) {
          const mockNotifications = [
            { id: 'n1', userId, title: 'Virement reçu 💰', message: 'Vous avez reçu 1 500,00 € - Salaire', type: 'transaction', read: false, createdAt: new Date(Date.now() - 1000*60*30).toISOString() },
            { id: 'n2', userId, title: 'Paiement effectué', message: 'Paiement de 89,99 € chez Amazon', type: 'payment', read: true, createdAt: new Date(Date.now() - 1000*60*60*2).toISOString() },
            { id: 'n3', userId, title: 'Carte rechargée 💳', message: 'Votre carte Visa a été rechargée de 500 €', type: 'card', read: false, createdAt: new Date(Date.now() - 1000*60*60*24).toISOString() },
            { id: 'n4', userId, title: 'Sécurité', message: 'Nouvelle connexion détectée depuis Paris', type: 'security', read: true, createdAt: new Date(Date.now() - 1000*60*60*48).toISOString() },
          ];
          setNotifications(mockNotifications);
          setUnreadCount(mockNotifications.filter(n => !n.read).length);
          setLoading(false);
          return;
        }

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
