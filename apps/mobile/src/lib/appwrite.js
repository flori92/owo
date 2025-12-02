// ============================================
// MIGRATION VERS FIREBASE
// ============================================
// Ce fichier réexporte les fonctions depuis firebase.js
// pour maintenir la compatibilité avec le code existant
// 
// Date de migration: 2025-12-02
// Raison: SDK Appwrite causait des crashes sur mobile
// ============================================

// Réexporter tout depuis Firebase
export {
  // Auth
  createAccount,
  login,
  logout,
  getCurrentUser,
  
  // Profile
  getProfile,
  
  // Wallets
  getWallets,
  
  // Transactions
  getTransactions,
  
  // Notifications
  getNotifications,
  markNotificationAsRead,
  
  // Collections
  COLLECTIONS,
  
  // Firebase instances (pour usage avancé)
  auth,
  db,
  storage,
  firebaseApp,
} from './firebase';

// Aliases pour compatibilité avec l'ancien code Appwrite
export const loginWithGoogle = async () => {
  console.log('🔧 loginWithGoogle: Non implémenté avec Firebase');
  return { success: false, error: 'Google OAuth non configuré' };
};

export const loginWithApple = async () => {
  console.log('🔧 loginWithApple: Non implémenté avec Firebase');
  return { success: false, error: 'Apple OAuth non configuré' };
};

// Anciennes constantes Appwrite (pour compatibilité)
export const DATABASE_ID = 'owo_database';

// Client/Account/etc null (plus utilisés)
export const client = null;
export const account = null;
export const databases = null;
export const functions = null;
export const Query = null;

console.log('🔥 owo! utilise maintenant Firebase');
