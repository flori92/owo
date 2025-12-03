// ============================================
// CONFIGURATION FIREBASE
// ============================================
import { USE_MOCK, MOCK_SESSION_KEY } from './config';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  initializeAuth,
  getReactNativePersistence,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  getDocs,
  addDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

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

// Initialiser Firebase une seule fois
let app = null;
let auth = null;
let db = null;
let storage = null;

if (!USE_MOCK) {
  if (getApps().length === 0) {
    // Première initialisation
    app = initializeApp(firebaseConfig);

    // Initialiser Auth avec persistence React Native
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });

    db = getFirestore(app);
    storage = getStorage(app);

    console.log('✅ Firebase initialized successfully');
  } else {
    // Firebase déjà initialisé
    app = getApps()[0];
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
  }
  console.log('🔥 Firebase SDK activé - Mode PRODUCTION');
} else {
  console.log('🔥 Firebase SDK désactivé - Mode MOCK actif pour Expo Go');
}

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
// MODE MOCK TEMPORAIRE (Firebase API bloquée)
// ============================================

async function setMockSession(user) {
  await AsyncStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(user));
}

async function getMockSession() {
  const data = await AsyncStorage.getItem(MOCK_SESSION_KEY);
  return data ? JSON.parse(data) : null;
}

async function clearMockSession() {
  await AsyncStorage.removeItem(MOCK_SESSION_KEY);
}

// ============================================
// AUTHENTIFICATION
// ============================================

/**
 * Connexion avec email et mot de passe
 */
export async function login(email, password) {
  // MODE MOCK temporaire pour Expo Go
  console.log('🔧 MODE MOCK: Connexion pour', email);
  await new Promise(r => setTimeout(r, 800));
  const mockUser = {
    uid: 'mock_' + Date.now(),
    $id: 'mock_' + Date.now(),
    email: email,
    name: email.split('@')[0],
    displayName: email.split('@')[0],
  };
  await setMockSession(mockUser);
  return { success: true, user: mockUser };

  // ⚠️ Code Firebase désactivé pour Expo Go
  // try {
  //   const userCredential = await signInWithEmailAndPassword(auth, email, password);
  //   const user = userCredential.user;
  //   return {
  //     success: true,
  //     user: {
  //       uid: user.uid,
  //       $id: user.uid,
  //       email: user.email,
  //       name: user.displayName,
  //       displayName: user.displayName
  //     }
  //   };
  // } catch (error) {
  //   console.error('Erreur connexion Firebase:', error);
  //   return { success: false, error: error.message };
  // }
}

/**
 * Créer un compte avec email et mot de passe
 */
export async function createAccount(email, password, name) {
  // MODE MOCK temporaire pour Expo Go
  console.log('🔧 MODE MOCK: Création compte pour', email);
  await new Promise(r => setTimeout(r, 1000));
  const mockUser = {
    uid: 'mock_' + Date.now(),
    $id: 'mock_' + Date.now(),
    email: email,
    name: name || email.split('@')[0],
    displayName: name || email.split('@')[0],
  };
  await setMockSession(mockUser);
  return { success: true, user: mockUser };

  // ⚠️ Code Firebase désactivé pour Expo Go
  // try {
  //   const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  //   const user = userCredential.user;
  //
  //   // Mettre à jour le profil avec le nom
  //   if (name) {
  //     await updateProfile(user, { displayName: name });
  //   }
  //
  //   // Créer le document profil dans Firestore
  //   await setDoc(doc(db, COLLECTIONS.PROFILES, user.uid), {
  //     userId: user.uid,
  //     email,
  //     displayName: name || email.split('@')[0],
  //     phone: '',
  //     avatar: '',
  //     kycVerified: false,
  //     kycLevel: 0,
  //     createdAt: serverTimestamp(),
  //   });
  //
  //   // Créer le wallet principal
  //   await addDoc(collection(db, COLLECTIONS.WALLETS), {
  //     userId: user.uid,
  //     name: 'Wallet Principal',
  //     type: 'main',
  //     provider: 'owo',
  //     balance: 0,
  //     currency: 'XOF',
  //     status: 'active',
  //     isPrimary: true,
  //     createdAt: serverTimestamp(),
  //   });
  //
  //   // Créer une notification de bienvenue
  //   await addDoc(collection(db, COLLECTIONS.NOTIFICATIONS), {
  //     userId: user.uid,
  //     title: 'Bienvenue sur owo! 🎉',
  //     message: 'Votre compte a été créé avec succès. Commencez par ajouter un mode de paiement.',
  //     type: 'system',
  //     read: false,
  //     createdAt: serverTimestamp(),
  //   });
  //
  //   console.log('✅ Compte créé avec profil, wallet et notification');
  //
  //   return {
  //     success: true,
  //     user: {
  //       uid: user.uid,
  //       $id: user.uid,
  //       email,
  //       name,
  //       displayName: name
  //     }
  //   };
  // } catch (error) {
  //   console.error('Erreur création compte Firebase:', error);
  //   return { success: false, error: error.message };
  // }
}

/**
 * Déconnexion
 */
export async function logout() {
  // MODE MOCK temporaire pour Expo Go
  console.log('🔧 MODE MOCK: Déconnexion');
  await clearMockSession();
  return { success: true };

  // ⚠️ Code Firebase désactivé pour Expo Go
  // try {
  //   await signOut(auth);
  //   return { success: true };
  // } catch (error) {
  //   console.error('Erreur déconnexion Firebase:', error);
  //   return { success: false, error: error.message };
  // }
}

/**
 * Obtenir l'utilisateur connecté
 */
export async function getCurrentUser() {
  // MODE MOCK temporaire pour Expo Go
  const mockUser = await getMockSession();
  if (mockUser) {
    console.log('🔧 MODE MOCK: Utilisateur récupéré:', mockUser.email);
    return { success: true, user: mockUser };
  }
  return { success: false, user: null };

  // ⚠️ Code Firebase désactivé pour Expo Go
  // try {
  //   const user = auth.currentUser;
  //   if (user) {
  //     return {
  //       success: true,
  //       user: {
  //         uid: user.uid,
  //         $id: user.uid,
  //         email: user.email,
  //         name: user.displayName,
  //         displayName: user.displayName
  //       }
  //     };
  //   }
  //   return { success: false, user: null };
  // } catch (error) {
  //   console.error('Erreur getCurrentUser Firebase:', error);
  //   return { success: false, user: null };
  // }
}

// ============================================
// PROFIL UTILISATEUR
// ============================================

/**
 * Obtenir le profil utilisateur
 */
export async function getProfile(userId) {
  // MODE MOCK temporaire pour Expo Go
  return {
    success: true,
    profile: {
      id: userId,
      displayName: 'Floriace FAVI',
      email: 'florifavi@gmail.com',
      phone: '+229 97 00 00 00',
      avatar: '',
      kycVerified: true,
      kycLevel: 2,
    }
  };

  // ⚠️ Code Firebase désactivé pour Expo Go
  // try {
  //   const profileDoc = await getDoc(doc(db, COLLECTIONS.PROFILES, userId));
  //   if (profileDoc.exists()) {
  //     return { success: true, profile: { id: profileDoc.id, ...profileDoc.data() } };
  //   }
  //   return { success: false, profile: null };
  // } catch (error) {
  //   console.error('Erreur getProfile Firebase:', error);
  //   return { success: false, profile: null };
  // }
}

// ============================================
// WALLETS
// ============================================

/**
 * Obtenir les wallets de l'utilisateur
 */
export async function getWallets(userId) {
  // MODE MOCK temporaire pour Expo Go
  return {
    success: true,
    wallets: [
      { id: 'w1', $id: 'w1', userId, name: 'MTN Mobile Money', type: 'mobile_money', provider: 'MTN', balance: 125000, currency: 'XOF', status: 'active', isPrimary: true },
      { id: 'w2', $id: 'w2', userId, name: 'Moov Money', type: 'mobile_money', provider: 'Moov', balance: 45000, currency: 'XOF', status: 'active', isPrimary: false },
      { id: 'w3', $id: 'w3', userId, name: 'Wave', type: 'mobile_money', provider: 'Wave', balance: 78500, currency: 'XOF', status: 'active', isPrimary: false },
    ]
  };

  // ⚠️ Code Firebase désactivé pour Expo Go
  // try {
  //   const q = query(
  //     collection(db, COLLECTIONS.WALLETS),
  //     where('userId', '==', userId),
  //     orderBy('isPrimary', 'desc')
  //   );
  //   const querySnapshot = await getDocs(q);
  //   const wallets = querySnapshot.docs.map(d => ({ id: d.id, $id: d.id, ...d.data() }));
  //   return { success: true, wallets };
  // } catch (error) {
  //   console.error('Erreur getWallets Firebase:', error);
  //   return { success: false, wallets: [] };
  // }
}

// ============================================
// TRANSACTIONS
// ============================================

/**
 * Obtenir les transactions de l'utilisateur
 */
export async function getTransactions(userId, limitCount = 20) {
  // MODE MOCK temporaire pour Expo Go
  return {
    success: true,
    transactions: [
      { id: 't1', $id: 't1', userId, type: 'receive', amount: 25000, currency: 'XOF', description: 'Reçu de Jean KOUASSI', status: 'completed', createdAt: new Date(Date.now() - 1000*60*30).toISOString(), senderName: 'Jean KOUASSI' },
      { id: 't2', $id: 't2', userId, type: 'send', amount: 15000, currency: 'XOF', description: 'Envoyé à Marie ADJOVI', status: 'completed', createdAt: new Date(Date.now() - 1000*60*60*2).toISOString(), recipientName: 'Marie ADJOVI' },
      { id: 't3', $id: 't3', userId, type: 'deposit', amount: 50000, currency: 'XOF', description: 'Dépôt MTN Mobile Money', status: 'completed', createdAt: new Date(Date.now() - 1000*60*60*24).toISOString() },
      { id: 't4', $id: 't4', userId, type: 'payment', amount: 8500, currency: 'XOF', description: 'Paiement Supermarché EREVAN', status: 'completed', createdAt: new Date(Date.now() - 1000*60*60*48).toISOString(), merchantName: 'Supermarché EREVAN' },
    ]
  };

  // ⚠️ Code Firebase désactivé pour Expo Go
  // try {
  //   const q = query(
  //     collection(db, COLLECTIONS.TRANSACTIONS),
  //     where('userId', '==', userId),
  //     orderBy('createdAt', 'desc'),
  //     limit(limitCount)
  //   );
  //   const querySnapshot = await getDocs(q);
  //   const transactions = querySnapshot.docs.map(d => ({ id: d.id, $id: d.id, ...d.data() }));
  //   return { success: true, transactions };
  // } catch (error) {
  //   console.error('Erreur getTransactions Firebase:', error);
  //   return { success: false, transactions: [] };
  // }
}

// ============================================
// NOTIFICATIONS
// ============================================

/**
 * Obtenir les notifications de l'utilisateur
 */
export async function getNotifications(userId, unreadOnly = false) {
  // MODE MOCK temporaire pour Expo Go
  const mockNotifications = [
    { id: 'n1', $id: 'n1', userId, title: 'Transfert reçu', message: 'Vous avez reçu 25 000 FCFA de Jean KOUASSI', type: 'transaction', read: false, createdAt: new Date(Date.now() - 1000*60*30).toISOString() },
    { id: 'n2', $id: 'n2', userId, title: 'Paiement effectué', message: 'Paiement de 8 500 FCFA chez Supermarché EREVAN', type: 'payment', read: true, createdAt: new Date(Date.now() - 1000*60*60*2).toISOString() },
    { id: 'n3', $id: 'n3', userId, title: 'Nouveau membre', message: 'Marie ADJOVI a rejoint "Épargne Famille 2024"', type: 'group', read: false, createdAt: new Date(Date.now() - 1000*60*60*24).toISOString() },
  ];
  return { success: true, notifications: unreadOnly ? mockNotifications.filter(n => !n.read) : mockNotifications };

  // ⚠️ Code Firebase désactivé pour Expo Go
  // try {
  //   let q;
  //   if (unreadOnly) {
  //     q = query(
  //       collection(db, COLLECTIONS.NOTIFICATIONS),
  //       where('userId', '==', userId),
  //       where('read', '==', false),
  //       orderBy('createdAt', 'desc'),
  //       limit(50)
  //     );
  //   } else {
  //     q = query(
  //       collection(db, COLLECTIONS.NOTIFICATIONS),
  //       where('userId', '==', userId),
  //       orderBy('createdAt', 'desc'),
  //       limit(50)
  //     );
  //   }
  //
  //   const querySnapshot = await getDocs(q);
  //   const notifications = querySnapshot.docs.map(d => ({ id: d.id, $id: d.id, ...d.data() }));
  //   return { success: true, notifications };
  // } catch (error) {
  //   console.error('Erreur getNotifications Firebase:', error);
  //   return { success: false, notifications: [] };
  // }
}

/**
 * Marquer une notification comme lue
 */
export async function markNotificationAsRead(notificationId) {
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
// EXPORTS
// ============================================
export { app, auth, db, storage };
export { app as firebaseApp };
export default app;
