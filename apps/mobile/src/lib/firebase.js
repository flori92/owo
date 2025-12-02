// ============================================
// CONFIGURATION FIREBASE
// ============================================
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
  collection,
  query,
  where,
  orderBy,
  limit,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
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

// Initialiser Firebase une seule fois
let app;
let auth;
let db;
let storage;

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
// AUTHENTIFICATION
// ============================================

/**
 * Connexion avec email et mot de passe
 */
export async function login(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    return { 
      success: true, 
      user: { 
        uid: user.uid, 
        $id: user.uid,
        email: user.email, 
        name: user.displayName,
        displayName: user.displayName 
      } 
    };
  } catch (error) {
    console.error('Erreur connexion Firebase:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Créer un compte avec email et mot de passe
 */
export async function createAccount(email, password, name) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Mettre à jour le profil avec le nom
    if (name) {
      await updateProfile(user, { displayName: name });
    }
    
    // Créer le document profil dans Firestore
    await setDoc(doc(db, COLLECTIONS.PROFILES, user.uid), {
      email,
      displayName: name,
      createdAt: serverTimestamp(),
    });
    
    return { 
      success: true, 
      user: { 
        uid: user.uid, 
        $id: user.uid,
        email, 
        name,
        displayName: name 
      } 
    };
  } catch (error) {
    console.error('Erreur création compte Firebase:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Déconnexion
 */
export async function logout() {
  try {
    await signOut(auth);
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
  try {
    const user = auth.currentUser;
    if (user) {
      return { 
        success: true, 
        user: { 
          uid: user.uid,
          $id: user.uid,
          email: user.email, 
          name: user.displayName,
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
  try {
    const q = query(
      collection(db, COLLECTIONS.WALLETS),
      where('userId', '==', userId),
      orderBy('isPrimary', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const wallets = querySnapshot.docs.map(d => ({ id: d.id, $id: d.id, ...d.data() }));
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
  try {
    const q = query(
      collection(db, COLLECTIONS.TRANSACTIONS),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    const querySnapshot = await getDocs(q);
    const transactions = querySnapshot.docs.map(d => ({ id: d.id, $id: d.id, ...d.data() }));
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
  try {
    let q;
    if (unreadOnly) {
      q = query(
        collection(db, COLLECTIONS.NOTIFICATIONS),
        where('userId', '==', userId),
        where('read', '==', false),
        orderBy('createdAt', 'desc'),
        limit(50)
      );
    } else {
      q = query(
        collection(db, COLLECTIONS.NOTIFICATIONS),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(50)
      );
    }
    
    const querySnapshot = await getDocs(q);
    const notifications = querySnapshot.docs.map(d => ({ id: d.id, $id: d.id, ...d.data() }));
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
