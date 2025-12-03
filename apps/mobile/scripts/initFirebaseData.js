#!/usr/bin/env node

// ============================================
// SCRIPT D'INITIALISATION DES DONNÉES FIREBASE
// Pour le profil Floriace FAVI avec données mockées
// ============================================

const admin = require('firebase-admin');
const path = require('path');

// Charger les variables d'environnement
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// ID utilisateur fixe pour Floriace FAVI
const FLORIACE_USER_ID = 'floriace_favi_mock_uid';
const FLORIACE_EMAIL = 'florifavi@gmail.com';

// ============================================
// INITIALISER FIREBASE ADMIN
// ============================================

try {
  // Utiliser le service account key
  const serviceAccount = require('../../../service-account-key.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: 'owo-631ab',
  });

  console.log('✅ Firebase Admin initialisé');
} catch (error) {
  console.error('❌ Erreur initialisation Firebase Admin:', error.message);
  console.log('\n📝 Pour utiliser ce script:');
  console.log('1. Téléchargez votre Service Account Key depuis Firebase Console');
  console.log('2. Sauvegardez-le dans /service-account-key.json');
  console.log('3. Relancez ce script');
  process.exit(1);
}

const db = admin.firestore();
const auth = admin.auth();

// ============================================
// DONNÉES MOCKÉES POUR FLORIACE FAVI
// ============================================

const mockProfile = {
  userId: FLORIACE_USER_ID,
  email: FLORIACE_EMAIL,
  displayName: 'Floriace FAVI',
  firstName: 'Floriace',
  lastName: 'FAVI',
  phoneNumber: '+22997123456',
  country: 'BJ', // Bénin
  currency: 'EUR',
  language: 'fr',
  avatar: null,
  createdAt: admin.firestore.FieldValue.serverTimestamp(),
  updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  status: 'active',
};

const mockWallets = [
  {
    id: 'wallet_mtn',
    userId: FLORIACE_USER_ID,
    name: 'MTN Mobile Money',
    type: 'mobile_money',
    provider: 'MTN',
    balance: 1234.50, // EUR
    currency: 'EUR',
    isDefault: true,
    status: 'active',
    accountNumber: '+22997******56',
    color: '#FFCC00',
    icon: 'Smartphone',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    lastActivity: admin.firestore.FieldValue.serverTimestamp(),
  },
  {
    id: 'wallet_moov',
    userId: FLORIACE_USER_ID,
    name: 'Moov Money',
    type: 'mobile_money',
    provider: 'Moov',
    balance: 876.25, // EUR
    currency: 'EUR',
    isDefault: false,
    status: 'active',
    accountNumber: '+22996******78',
    color: '#0066CC',
    icon: 'Smartphone',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    lastActivity: admin.firestore.FieldValue.serverTimestamp(),
  },
  {
    id: 'wallet_wave',
    userId: FLORIACE_USER_ID,
    name: 'Wave',
    type: 'mobile_money',
    provider: 'Wave',
    balance: 543.00, // EUR
    currency: 'EUR',
    isDefault: false,
    status: 'active',
    accountNumber: '+22998******90',
    color: '#FF6B9D',
    icon: 'Wallet',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    lastActivity: admin.firestore.FieldValue.serverTimestamp(),
  },
  {
    id: 'wallet_main',
    userId: FLORIACE_USER_ID,
    name: 'Compte Principal',
    type: 'main',
    provider: 'ECOBANK',
    balance: 7102.00, // EUR
    currency: 'EUR',
    isDefault: false,
    status: 'active',
    accountNumber: 'BJ**********1234',
    color: '#10B981',
    icon: 'Building2',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    lastActivity: admin.firestore.FieldValue.serverTimestamp(),
  },
];

const mockTransactions = [
  {
    userId: FLORIACE_USER_ID,
    type: 'receive',
    amount: 150.00,
    currency: 'EUR',
    status: 'completed',
    sourceWalletId: null,
    targetWalletId: 'wallet_mtn',
    senderName: 'Marie KOFFI',
    recipientName: null,
    description: 'Remboursement repas',
    createdAt: new Date('2025-11-28T14:30:00Z'),
  },
  {
    userId: FLORIACE_USER_ID,
    type: 'send',
    amount: 75.50,
    currency: 'EUR',
    status: 'completed',
    sourceWalletId: 'wallet_mtn',
    targetWalletId: null,
    senderName: null,
    recipientName: 'Jean AKPO',
    description: 'Cadeau anniversaire',
    createdAt: new Date('2025-11-27T10:15:00Z'),
  },
  {
    userId: FLORIACE_USER_ID,
    type: 'payment',
    amount: 45.00,
    currency: 'EUR',
    status: 'completed',
    sourceWalletId: 'wallet_moov',
    targetWalletId: null,
    merchantName: 'Supermarché Casino',
    description: 'Courses',
    createdAt: new Date('2025-11-26T18:45:00Z'),
  },
  {
    userId: FLORIACE_USER_ID,
    type: 'deposit',
    amount: 500.00,
    currency: 'EUR',
    status: 'completed',
    sourceWalletId: null,
    targetWalletId: 'wallet_main',
    description: 'Dépôt mensuel',
    createdAt: new Date('2025-11-25T09:00:00Z'),
  },
  {
    userId: FLORIACE_USER_ID,
    type: 'payment',
    amount: 25.75,
    currency: 'EUR',
    status: 'completed',
    sourceWalletId: 'wallet_wave',
    targetWalletId: null,
    merchantName: 'Restaurant Le Palmier',
    description: 'Déjeuner',
    createdAt: new Date('2025-11-24T12:30:00Z'),
  },
];

const mockSavingsGoals = [
  {
    id: 'savings_vacation',
    userId: FLORIACE_USER_ID,
    name: 'Vacances à Dubaï',
    description: 'Voyage de rêve en famille',
    targetAmount: 3000.00,
    currentAmount: 1250.00,
    currency: 'EUR',
    startDate: new Date('2025-11-01T00:00:00Z'),
    targetDate: new Date('2026-08-01T00:00:00Z'),
    status: 'active',
    icon: 'Plane',
    color: '#3B82F6',
    autoDebit: true,
    frequency: {
      type: 'monthly',
      amount: 200.00,
      dayOfMonth: 5,
    },
    sourceWalletId: 'wallet_main',
    type: 'locked',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    lastDebitDate: new Date('2025-12-05T00:00:00Z'),
  },
  {
    id: 'savings_laptop',
    userId: FLORIACE_USER_ID,
    name: 'Nouveau MacBook Pro',
    description: 'Ordinateur pour le travail',
    targetAmount: 2500.00,
    currentAmount: 1800.00,
    currency: 'EUR',
    startDate: new Date('2025-10-01T00:00:00Z'),
    targetDate: new Date('2026-03-01T00:00:00Z'),
    status: 'active',
    icon: 'Laptop',
    color: '#8B5CF6',
    autoDebit: true,
    frequency: {
      type: 'weekly',
      amount: 50.00,
      dayOfWeek: 1, // Lundi
    },
    sourceWalletId: 'wallet_mtn',
    type: 'locked',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    lastDebitDate: new Date('2025-11-25T00:00:00Z'),
  },
  {
    id: 'savings_emergency',
    userId: FLORIACE_USER_ID,
    name: 'Fonds d\'urgence',
    description: 'Sécurité financière',
    targetAmount: 5000.00,
    currentAmount: 3200.00,
    currency: 'EUR',
    startDate: new Date('2025-09-01T00:00:00Z'),
    targetDate: new Date('2026-12-31T00:00:00Z'),
    status: 'active',
    icon: 'Shield',
    color: '#10B981',
    autoDebit: true,
    frequency: {
      type: 'monthly',
      amount: 300.00,
      dayOfMonth: 1,
    },
    sourceWalletId: 'wallet_main',
    type: 'locked',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    lastDebitDate: new Date('2025-12-01T00:00:00Z'),
  },
];

const mockNotifications = [
  {
    userId: FLORIACE_USER_ID,
    type: 'transaction_receive',
    title: 'Argent reçu',
    message: 'Vous avez reçu 150.00 EUR de Marie KOFFI - Remboursement repas.',
    relatedId: null,
    relatedType: 'transaction',
    read: false,
    createdAt: new Date('2025-11-28T14:30:00Z'),
  },
  {
    userId: FLORIACE_USER_ID,
    type: 'auto_debit_success',
    title: 'Prélèvement automatique effectué',
    message: '50.00 € ont été prélevés de MTN Mobile Money pour "Nouveau MacBook Pro".',
    relatedId: 'savings_laptop',
    relatedType: 'savings',
    read: false,
    createdAt: new Date('2025-11-25T00:00:00Z'),
  },
  {
    userId: FLORIACE_USER_ID,
    type: 'welcome',
    title: 'Bienvenue Floriace 👋',
    message: 'Gérez votre argent facilement avec owo! Commencez par créer votre premier objectif d\'épargne.',
    relatedId: FLORIACE_USER_ID,
    relatedType: 'profile',
    read: true,
    readAt: new Date('2025-11-20T10:00:00Z'),
    createdAt: new Date('2025-11-20T09:00:00Z'),
  },
];

// ============================================
// FONCTIONS D'INITIALISATION
// ============================================

async function createAuthUser() {
  console.log('\n🔐 Création du compte Auth Firebase...');

  try {
    // Vérifier si l'utilisateur existe déjà
    try {
      const existingUser = await auth.getUserByEmail(FLORIACE_EMAIL);
      console.log(`✅ Utilisateur Auth existe déjà: ${existingUser.uid}`);

      // Mettre à jour l'UID si nécessaire
      if (existingUser.uid !== FLORIACE_USER_ID) {
        console.log(`⚠️  UID différent: ${existingUser.uid} vs ${FLORIACE_USER_ID}`);
        console.log('⚠️  Utilisation de l\'UID existant pour la cohérence.');
        return existingUser.uid;
      }

      return existingUser.uid;
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        // Créer un nouvel utilisateur
        const userRecord = await auth.createUser({
          uid: FLORIACE_USER_ID,
          email: FLORIACE_EMAIL,
          emailVerified: true,
          password: 'FloriaceOwo2025!', // Mot de passe par défaut (à changer)
          displayName: 'Floriace FAVI',
          disabled: false,
        });

        console.log(`✅ Utilisateur Auth créé: ${userRecord.uid}`);
        console.log('📧 Email:', FLORIACE_EMAIL);
        console.log('🔑 Mot de passe par défaut: FloriaceOwo2025!');
        return userRecord.uid;
      } else {
        throw error;
      }
    }
  } catch (error) {
    console.error('❌ Erreur création utilisateur Auth:', error.message);
    throw error;
  }
}

async function createProfile(userId) {
  console.log('\n👤 Création du profil Firestore...');

  try {
    const profileRef = db.collection('profiles').doc(userId);
    await profileRef.set(mockProfile);
    console.log(`✅ Profil créé: ${userId}`);
  } catch (error) {
    console.error('❌ Erreur création profil:', error.message);
    throw error;
  }
}

async function createWallets(userId) {
  console.log('\n💰 Création des wallets...');

  try {
    const batch = db.batch();

    for (const wallet of mockWallets) {
      const walletRef = db.collection('wallets').doc(wallet.id);
      batch.set(walletRef, { ...wallet, userId });
    }

    await batch.commit();
    console.log(`✅ ${mockWallets.length} wallets créés`);

    // Afficher le total
    const totalBalance = mockWallets.reduce((sum, w) => sum + w.balance, 0);
    console.log(`   💵 Solde total: ${totalBalance.toFixed(2)} EUR`);
  } catch (error) {
    console.error('❌ Erreur création wallets:', error.message);
    throw error;
  }
}

async function createTransactions(userId) {
  console.log('\n💸 Création des transactions...');

  try {
    const batch = db.batch();

    for (const transaction of mockTransactions) {
      const transactionRef = db.collection('transactions').doc();
      batch.set(transactionRef, { ...transaction, userId });
    }

    await batch.commit();
    console.log(`✅ ${mockTransactions.length} transactions créées`);
  } catch (error) {
    console.error('❌ Erreur création transactions:', error.message);
    throw error;
  }
}

async function createSavingsGoals(userId) {
  console.log('\n🎯 Création des objectifs d\'épargne...');

  try {
    const batch = db.batch();

    for (const goal of mockSavingsGoals) {
      const goalRef = db.collection('lockedSavings').doc(goal.id);
      batch.set(goalRef, { ...goal, userId });
    }

    await batch.commit();
    console.log(`✅ ${mockSavingsGoals.length} objectifs d'épargne créés`);

    // Afficher le total épargné
    const totalSaved = mockSavingsGoals.reduce((sum, g) => sum + g.currentAmount, 0);
    console.log(`   💰 Total épargné: ${totalSaved.toFixed(2)} EUR`);
  } catch (error) {
    console.error('❌ Erreur création objectifs épargne:', error.message);
    throw error;
  }
}

async function createNotifications(userId) {
  console.log('\n🔔 Création des notifications...');

  try {
    const batch = db.batch();

    for (const notification of mockNotifications) {
      const notifRef = db.collection('notifications').doc();
      batch.set(notifRef, { ...notification, userId });
    }

    await batch.commit();
    console.log(`✅ ${mockNotifications.length} notifications créées`);
  } catch (error) {
    console.error('❌ Erreur création notifications:', error.message);
    throw error;
  }
}

// ============================================
// FONCTION PRINCIPALE
// ============================================

async function main() {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║   INITIALISATION DES DONNÉES FIREBASE - OWO!          ║');
  console.log('║   Profil: Floriace FAVI                               ║');
  console.log('╚════════════════════════════════════════════════════════╝');

  try {
    // 1. Créer l'utilisateur Auth
    const userId = await createAuthUser();

    // 2. Créer le profil Firestore
    await createProfile(userId);

    // 3. Créer les wallets
    await createWallets(userId);

    // 4. Créer les transactions
    await createTransactions(userId);

    // 5. Créer les objectifs d'épargne
    await createSavingsGoals(userId);

    // 6. Créer les notifications
    await createNotifications(userId);

    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log('║   ✅ INITIALISATION TERMINÉE AVEC SUCCÈS!             ║');
    console.log('╚════════════════════════════════════════════════════════╝');
    console.log('\n📊 Récapitulatif:');
    console.log('   • 1 profil utilisateur');
    console.log('   • 4 wallets (9 755.75 EUR)');
    console.log('   • 5 transactions');
    console.log('   • 3 objectifs d\'épargne (6 250.00 EUR épargnés)');
    console.log('   • 3 notifications');
    console.log('\n🔐 Connexion:');
    console.log(`   Email: ${FLORIACE_EMAIL}`);
    console.log('   Mot de passe: FloriaceOwo2025!');
    console.log('\n💡 Prochaine étape:');
    console.log('   1. Dans src/lib/config.js, mettre USE_MOCK = false');
    console.log('   2. Décommenter le code Firebase dans src/lib/firebase.js');
    console.log('   3. Redémarrer l\'app Expo');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ ERREUR FATALE:', error);
    process.exit(1);
  }
}

// Exécuter le script
main();
