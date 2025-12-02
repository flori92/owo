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

// ============================================
// FONCTIONS MOCK POUR COMPATIBILITÉ APPWRITE
// ============================================

// Créer un wallet
export async function createWallet(data) {
  console.log('🔧 createWallet: Mock', data);
  return { 
    success: true, 
    wallet: { 
      $id: 'w_' + Date.now(),
      ...data,
      balance: 0,
      createdAt: new Date().toISOString(),
      status: 'active'
    } 
  };
}

// Créer une transaction
export async function createTransaction(data) {
  console.log('🔧 createTransaction: Mock', data);
  return { 
    success: true, 
    transaction: { 
      $id: 'tx_' + Date.now(),
      ...data,
      createdAt: new Date().toISOString(),
      status: 'completed'
    } 
  };
}

// Épargne de groupe (Tontines)
export async function getGroupSavings(userId) {
  console.log('🔧 getGroupSavings: Mock pour', userId);
  return {
    success: true,
    groups: [
      { $id: 'g1', name: 'Épargne Famille 2024', members: 8, totalAmount: 450000, myContribution: 50000, status: 'active' },
      { $id: 'g2', name: 'Tontine Amis', members: 5, totalAmount: 200000, myContribution: 40000, status: 'active' },
    ]
  };
}

// Épargne bloquée
export async function getLockedSavings(userId) {
  console.log('🔧 getLockedSavings: Mock pour', userId);
  return {
    success: true,
    savings: [
      { $id: 'ls1', name: 'Projet Maison', targetAmount: 5000000, currentAmount: 1250000, endDate: '2025-12-31', interestRate: 5.5 },
      { $id: 'ls2', name: 'Études Enfants', targetAmount: 2000000, currentAmount: 800000, endDate: '2026-06-30', interestRate: 4.5 },
    ]
  };
}

// Cartes virtuelles
export async function getVirtualCards(userId) {
  console.log('🔧 getVirtualCards: Mock pour', userId);
  return {
    success: true,
    cards: [
      { $id: 'vc1', name: 'Carte Shopping', lastFour: '4582', balance: 75000, status: 'active', expiryDate: '12/26' },
      { $id: 'vc2', name: 'Carte Voyage', lastFour: '8891', balance: 150000, status: 'active', expiryDate: '08/27' },
    ]
  };
}

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
