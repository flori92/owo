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

// Épargne de groupe (Tontines) - EUR
export async function getGroupSavings(userId) {
  console.log('🔧 getGroupSavings: Mock pour', userId);
  return {
    success: true,
    groups: [
      { $id: 'g1', userId, name: 'Épargne Famille 2024', members: 8, totalAmount: 12000, myContribution: 1500, currency: 'EUR', status: 'active', frequency: 'monthly' },
      { $id: 'g2', userId, name: 'Projet Investissement', members: 4, totalAmount: 8000, myContribution: 2000, currency: 'EUR', status: 'active', frequency: 'monthly' },
    ]
  };
}

// Épargne bloquée - EUR
export async function getLockedSavings(userId) {
  console.log('🔧 getLockedSavings: Mock pour', userId);
  return {
    success: true,
    savings: [
      { $id: 'ls1', userId, name: 'Projet Immobilier', targetAmount: 50000, currentAmount: 15000, currency: 'EUR', endDate: '2026-12-31', interestRate: 3.5, status: 'active' },
      { $id: 'ls2', userId, name: 'Épargne Retraite', targetAmount: 100000, currentAmount: 8500, currency: 'EUR', endDate: '2040-01-01', interestRate: 4.2, status: 'active' },
    ]
  };
}

// Cartes virtuelles - Solde total: 1787 EUR
export async function getVirtualCards(userId) {
  console.log('🔧 getVirtualCards: Mock pour', userId);
  return {
    success: true,
    cards: [
      { $id: 'vc1', userId, name: 'Carte Visa Premium', lastFour: '4582', balance: 1287.00, currency: 'EUR', status: 'active', expiryDate: '12/27', type: 'visa', cardNumber: '**** **** **** 4582' },
      { $id: 'vc2', userId, name: 'Carte Mastercard', lastFour: '8891', balance: 500.00, currency: 'EUR', status: 'active', expiryDate: '08/28', type: 'mastercard', cardNumber: '**** **** **** 8891' },
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
