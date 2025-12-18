// ============================================
// CONFIGURATION FIREBASE
// ============================================
import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  initializeAuth,
  inMemoryPersistence,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  signInWithCredential,
  GoogleAuthProvider,
  OAuthProvider,
  sendPasswordResetEmail,
  PhoneAuthProvider,
  multiFactor,
  PhoneMultiFactorGenerator,
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

if (getApps().length === 0) {
  // Première initialisation
  app = initializeApp(firebaseConfig);

  // Expo Go / React Native: on évite la persistence "web".
  // (firebase/auth/react-native n'est pas disponible selon versions)
  auth = initializeAuth(app, {
    persistence: inMemoryPersistence,
  });

  db = getFirestore(app);
  storage = getStorage(app);

  if (__DEV__) {
    console.log('✅ Firebase initialized successfully');
  }
} else {
  // Firebase déjà initialisé
  app = getApps()[0];
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
}

if (__DEV__) {
  console.log('🔥 Firebase SDK activé');
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
    if (__DEV__) {
      console.error('Erreur connexion Firebase:', error);
    }
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
      userId: user.uid,
      email,
      displayName: name || email.split('@')[0],
      phone: '',
      avatar: '',
      kycVerified: false,
      kycLevel: 0,
      createdAt: serverTimestamp(),
    });

    // Créer le wallet principal
    await addDoc(collection(db, COLLECTIONS.WALLETS), {
      userId: user.uid,
      name: 'Wallet Principal',
      type: 'main',
      provider: 'owo',
      balance: 0,
      currency: 'XOF',
      status: 'active',
      isPrimary: true,
      createdAt: serverTimestamp(),
    });

    // Créer une notification de bienvenue
    await addDoc(collection(db, COLLECTIONS.NOTIFICATIONS), {
      userId: user.uid,
      title: 'Bienvenue sur owo!',
      message: 'Votre compte a été créé avec succès. Commencez par ajouter un mode de paiement.',
      type: 'system',
      read: false,
      createdAt: serverTimestamp(),
    });

    if (__DEV__) {
      console.log('✅ Compte créé avec profil, wallet et notification');
    }

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
    if (__DEV__) {
      console.error('Erreur création compte Firebase:', error);
    }
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
    if (__DEV__) {
      console.error('Erreur déconnexion Firebase:', error);
    }
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
    if (__DEV__) {
      console.error('Erreur getCurrentUser Firebase:', error);
    }
    return { success: false, user: null };
  }
}

/**
 * Connexion avec Google
 */
export async function loginWithGoogle(idToken) {
  try {
    const credential = GoogleAuthProvider.credential(idToken);
    const userCredential = await signInWithCredential(auth, credential);
    const user = userCredential.user;
    
    // Créer ou mettre à jour le profil
    const profileRef = doc(db, COLLECTIONS.PROFILES, user.uid);
    const profileDoc = await getDoc(profileRef);
    
    if (!profileDoc.exists()) {
      await setDoc(profileRef, {
        userId: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        provider: 'google',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
    
    return {
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
      }
    };
  } catch (error) {
    if (__DEV__) {
      console.error('Erreur connexion Google:', error);
    }
    return { success: false, error: error.message };
  }
}

/**
 * Connexion avec Apple
 */
export async function loginWithApple(identityToken, nonce) {
  try {
    const provider = new OAuthProvider('apple.com');
    const credential = provider.credential({
      idToken: identityToken,
      rawNonce: nonce,
    });
    
    const userCredential = await signInWithCredential(auth, credential);
    const user = userCredential.user;
    
    // Créer ou mettre à jour le profil
    const profileRef = doc(db, COLLECTIONS.PROFILES, user.uid);
    const profileDoc = await getDoc(profileRef);
    
    if (!profileDoc.exists()) {
      await setDoc(profileRef, {
        userId: user.uid,
        email: user.email,
        displayName: user.displayName || 'Utilisateur Apple',
        provider: 'apple',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
    
    return {
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
      }
    };
  } catch (error) {
    if (__DEV__) {
      console.error('Erreur connexion Apple:', error);
    }
    return { success: false, error: error.message };
  }
}

/**
 * Réinitialiser le mot de passe
 */
export async function resetPassword(email) {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error) {
    if (__DEV__) {
      console.error('Erreur réinitialisation mot de passe:', error);
    }
    return { success: false, error: error.message };
  }
}

/**
 * Vérifier si l'utilisateur a activé la 2FA
 */
export function has2FAEnabled() {
  const user = auth.currentUser;
  if (!user) return false;
  
  try {
    const enrolledFactors = multiFactor(user).enrolledFactors;
    return enrolledFactors.length > 0;
  } catch {
    return false;
  }
}

/**
 * Obtenir l'instance auth pour la 2FA
 */
export function getAuthInstance() {
  return auth;
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
    if (__DEV__) {
      console.error('Erreur getProfile Firebase:', error);
    }
    return { success: false, profile: null };
  }
}

/**
 * Mettre à jour le profil utilisateur
 */
export async function updateUserProfile(userId, profileData) {
  try {
    const profileRef = doc(db, COLLECTIONS.PROFILES, userId);
    const profileDoc = await getDoc(profileRef);
    
    const dataToSave = {
      ...profileData,
      updatedAt: serverTimestamp(),
    };
    
    if (profileDoc.exists()) {
      // Mise à jour du profil existant
      await updateDoc(profileRef, dataToSave);
    } else {
      // Création du profil
      await setDoc(profileRef, {
        ...dataToSave,
        userId: userId,
        createdAt: serverTimestamp(),
      });
    }
    
    // Mettre à jour aussi le displayName dans Firebase Auth si fourni
    if (profileData.displayName && auth.currentUser) {
      await updateProfile(auth.currentUser, {
        displayName: profileData.displayName,
      });
    }
    
    return { success: true };
  } catch (error) {
    if (__DEV__) {
      console.error('Erreur updateUserProfile Firebase:', error);
    }
    return { success: false, error: error.message };
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
    if (__DEV__) {
      console.error('Erreur getWallets Firebase:', error);
    }
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
    if (__DEV__) {
      console.error('Erreur getTransactions Firebase:', error);
    }
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
    if (__DEV__) {
      console.error('Erreur getNotifications Firebase:', error);
    }
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
    if (__DEV__) {
      console.error('Erreur markNotificationAsRead Firebase:', error);
    }
    return { success: false };
  }
}

// ============================================
// EXPORTS
// ============================================
export { app, auth, db, storage };
export { app as firebaseApp };
export default app;
