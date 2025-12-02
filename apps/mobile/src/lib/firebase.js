// ============================================
// CONFIGURATION FIREBASE pour owo!
// ============================================

import { initializeApp, getApps } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  signInWithCredential,
  PhoneAuthProvider,
  signInWithPhoneNumber,
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  collection, 
  query, 
  where, 
  orderBy, 
  limit,
  getDocs,
  addDoc,
  serverTimestamp,
  onSnapshot,
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configuration Firebase depuis les variables d'environnement
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialiser Firebase (éviter la double initialisation)
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
  console.log('🔥 Firebase initialisé avec succès');
} else {
  app = getApps()[0];
  console.log('🔥 Firebase déjà initialisé');
}

// Services Firebase
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// ============================================
// COLLECTIONS FIRESTORE
// ============================================
export const COLLECTIONS = {
  USERS: 'users',
  PROFILES: 'profiles',
  WALLETS: 'wallets',
  TRANSACTIONS: 'transactions',
  GROUP_SAVINGS: 'groupSavings',
  GROUP_MEMBERS: 'groupMembers',
  LOCKED_SAVINGS: 'lockedSavings',
  VIRTUAL_CARDS: 'virtualCards',
  NOTIFICATIONS: 'notifications',
};

// ============================================
// MODE MOCK POUR DÉVELOPPEMENT
// ============================================
const USE_MOCK = __DEV__; // Activer les mocks en développement

const MOCK_SESSION_KEY = 'owo_mock_session';
const MOCK_USER_KEY = 'owo_mock_user';

// Stocker la session mock
async function setMockSession(user) {
  try {
    await AsyncStorage.setItem(MOCK_USER_KEY, JSON.stringify(user));
    await AsyncStorage.setItem(MOCK_SESSION_KEY, 'active');
  } catch (error) {
    console.error('Erreur sauvegarde session mock:', error);
  }
}

// Récupérer la session mock
async function getMockSession() {
  try {
    const session = await AsyncStorage.getItem(MOCK_SESSION_KEY);
    const userStr = await AsyncStorage.getItem(MOCK_USER_KEY);
    if (session === 'active' && userStr) {
      return JSON.parse(userStr);
    }
    return null;
  } catch (error) {
    return null;
  }
}

// Effacer la session mock
async function clearMockSession() {
  try {
    await AsyncStorage.removeItem(MOCK_SESSION_KEY);
    await AsyncStorage.removeItem(MOCK_USER_KEY);
  } catch (error) {
    console.error('Erreur effacement session mock:', error);
  }
}

// ============================================
// AUTHENTIFICATION
// ============================================

/**
 * Créer un compte avec email et mot de passe
 */
export async function createAccount(email, password, name) {
  if (USE_MOCK) {
    console.log('🔧 MODE MOCK : Création compte pour', email);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockUser = {
      uid: 'mock_user_' + Date.now(),
      email: email,
      displayName: name,
      createdAt: new Date().toISOString(),
    };
    
    await setMockSession(mockUser);
    return { success: true, user: mockUser };
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Mettre à jour le profil
    await updateProfile(user, { displayName: name });
    
    // Créer le document utilisateur dans Firestore
    await setDoc(doc(db, COLLECTIONS.USERS, user.uid), {
      email: email,
      displayName: name,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    
    // Créer le profil par défaut
    await setDoc(doc(db, COLLECTIONS.PROFILES, user.uid), {
      userId: user.uid,
      displayName: name,
      email: email,
      phone: '',
      avatar: '',
      createdAt: serverTimestamp(),
    });
    
    // Créer le wallet principal
    await addDoc(collection(db, COLLECTIONS.WALLETS), {
      userId: user.uid,
      name: 'Wallet Principal',
      type: 'main',
      balance: 0,
      currency: 'XOF',
      status: 'active',
      isPrimary: true,
      createdAt: serverTimestamp(),
    });
    
    return { success: true, user: { uid: user.uid, email, displayName: name } };
  } catch (error) {
    console.error('Erreur création compte Firebase:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Connexion avec email et mot de passe
 */
export async function login(email, password) {
  if (USE_MOCK) {
    console.log('🔧 MODE MOCK : Connexion pour', email);
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const mockUser = {
      uid: 'mock_user_' + Date.now(),
      email: email,
      displayName: email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      createdAt: new Date().toISOString(),
      phone: '+229 97 00 00 00',
    };
    
    await setMockSession(mockUser);
    return { success: true, user: mockUser };
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    return { 
      success: true, 
      user: { 
        uid: user.uid, 
        email: user.email, 
        displayName: user.displayName 
      } 
    };
  } catch (error) {
    console.error('Erreur connexion Firebase:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Déconnexion
 */
export async function logout() {
  if (USE_MOCK) {
    console.log('🔧 MODE MOCK : Déconnexion');
    await clearMockSession();
    return { success: true };
  }

  try {
    await firebaseSignOut(auth);
    return { success: true };
  } catch (error) {
    console.error('Erreur déconnexion Firebase:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Obtenir l'utilisateur connecté
 */
export async function getCurrentUser() {
  if (USE_MOCK) {
    const mockUser = await getMockSession();
    if (mockUser) {
      console.log('🔧 MODE MOCK : Utilisateur récupéré:', mockUser.email);
      return { success: true, user: mockUser };
    }
    return { success: false, user: null };
  }

  try {
    const user = auth.currentUser;
    if (user) {
      return { 
        success: true, 
        user: { 
          uid: user.uid, 
          email: user.email, 
          displayName: user.displayName 
        } 
      };
    }
    return { success: false, user: null };
  } catch (error) {
    console.error('Erreur getCurrentUser Firebase:', error);
    return { success: false, user: null };
  }
}

// ============================================
// PROFIL UTILISATEUR
// ============================================

/**
 * Obtenir le profil utilisateur
 */
export async function getProfile(userId) {
  if (USE_MOCK) {
    return {
      success: true,
      profile: {
        userId: userId || 'mock_user',
        displayName: 'Floriace FAVI',
        email: 'florifavi@gmail.com',
        phone: '+229 97 00 00 00',
        avatar: '',
        kycVerified: true,
        kycLevel: 2,
      }
    };
  }

  try {
    const profileDoc = await getDoc(doc(db, COLLECTIONS.PROFILES, userId));
    if (profileDoc.exists()) {
      return { success: true, profile: { id: profileDoc.id, ...profileDoc.data() } };
    }
    return { success: false, profile: null };
  } catch (error) {
    console.error('Erreur getProfile Firebase:', error);
    return { success: false, profile: null };
  }
}

// ============================================
// WALLETS
// ============================================

/**
 * Obtenir les wallets de l'utilisateur
 */
export async function getWallets(userId) {
  if (USE_MOCK) {
    const mockWallets = [
      {
        id: 'wallet_mtn',
        userId: userId,
        name: 'MTN Mobile Money',
        type: 'mobile_money',
        provider: 'mtn',
        balance: 125000,
        currency: 'XOF',
        status: 'active',
        isPrimary: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'wallet_moov',
        userId: userId,
        name: 'Moov Money',
        type: 'mobile_money',
        provider: 'moov',
        balance: 45000,
        currency: 'XOF',
        status: 'active',
        isPrimary: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'wallet_wave',
        userId: userId,
        name: 'Wave',
        type: 'mobile_money',
        provider: 'wave',
        balance: 78500,
        currency: 'XOF',
        status: 'active',
        isPrimary: false,
        createdAt: new Date().toISOString(),
      },
    ];
    return { success: true, wallets: mockWallets };
  }

  try {
    const q = query(
      collection(db, COLLECTIONS.WALLETS),
      where('userId', '==', userId),
      orderBy('isPrimary', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const wallets = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return { success: true, wallets };
  } catch (error) {
    console.error('Erreur getWallets Firebase:', error);
    return { success: false, wallets: [] };
  }
}

// ============================================
// TRANSACTIONS
// ============================================

/**
 * Obtenir les transactions de l'utilisateur
 */
export async function getTransactions(userId, limitCount = 20) {
  if (USE_MOCK) {
    const mockTransactions = [
      {
        id: 'tx_1',
        userId: userId,
        type: 'receive',
        amount: 25000,
        currency: 'XOF',
        description: 'Reçu de Jean KOUASSI',
        status: 'completed',
        createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        senderName: 'Jean KOUASSI',
      },
      {
        id: 'tx_2',
        userId: userId,
        type: 'send',
        amount: 15000,
        currency: 'XOF',
        description: 'Envoyé à Marie ADJOVI',
        status: 'completed',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        recipientName: 'Marie ADJOVI',
      },
      {
        id: 'tx_3',
        userId: userId,
        type: 'deposit',
        amount: 50000,
        currency: 'XOF',
        description: 'Dépôt MTN Mobile Money',
        status: 'completed',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      },
      {
        id: 'tx_4',
        userId: userId,
        type: 'payment',
        amount: 8500,
        currency: 'XOF',
        description: 'Paiement Supermarché EREVAN',
        status: 'completed',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
        merchantName: 'Supermarché EREVAN',
      },
    ];
    return { success: true, transactions: mockTransactions };
  }

  try {
    const q = query(
      collection(db, COLLECTIONS.TRANSACTIONS),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    const querySnapshot = await getDocs(q);
    const transactions = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return { success: true, transactions };
  } catch (error) {
    console.error('Erreur getTransactions Firebase:', error);
    return { success: false, transactions: [] };
  }
}

// ============================================
// NOTIFICATIONS
// ============================================

/**
 * Obtenir les notifications de l'utilisateur
 */
export async function getNotifications(userId, unreadOnly = false) {
  if (USE_MOCK) {
    const mockNotifications = [
      {
        id: 'notif_1',
        userId: userId,
        title: 'Transfert reçu',
        message: 'Vous avez reçu 25 000 FCFA de Jean KOUASSI',
        type: 'transaction',
        read: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      },
      {
        id: 'notif_2',
        userId: userId,
        title: 'Paiement effectué',
        message: 'Paiement de 8 500 FCFA chez Supermarché EREVAN',
        type: 'payment',
        read: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      },
      {
        id: 'notif_3',
        userId: userId,
        title: 'Nouveau membre dans votre tontine',
        message: 'Marie ADJOVI a rejoint "Épargne Famille 2024"',
        type: 'group',
        read: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      },
    ];
    
    if (unreadOnly) {
      return { success: true, notifications: mockNotifications.filter(n => !n.read) };
    }
    return { success: true, notifications: mockNotifications };
  }

  try {
    let q = query(
      collection(db, COLLECTIONS.NOTIFICATIONS),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
    
    if (unreadOnly) {
      q = query(
        collection(db, COLLECTIONS.NOTIFICATIONS),
        where('userId', '==', userId),
        where('read', '==', false),
        orderBy('createdAt', 'desc'),
        limit(50)
      );
    }
    
    const querySnapshot = await getDocs(q);
    const notifications = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return { success: true, notifications };
  } catch (error) {
    console.error('Erreur getNotifications Firebase:', error);
    return { success: false, notifications: [] };
  }
}

/**
 * Marquer une notification comme lue
 */
export async function markNotificationAsRead(notificationId) {
  if (USE_MOCK) {
    return { success: true };
  }

  try {
    await updateDoc(doc(db, COLLECTIONS.NOTIFICATIONS, notificationId), {
      read: true,
      readAt: serverTimestamp(),
    });
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

// ============================================
// EXPORTS POUR COMPATIBILITÉ AVEC appwrite.js
// ============================================
export { app as firebaseApp };
export default app;
