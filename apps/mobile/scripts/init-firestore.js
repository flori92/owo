/**
 * Script d'initialisation Firestore pour owo!
 * 
 * Usage: node scripts/init-firestore.js
 * 
 * Ce script crée les collections et documents de démo dans Firestore
 */

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');

// Configuration Firebase Admin
// Utiliser les variables d'environnement ou le fichier de service account
const serviceAccount = process.env.GOOGLE_APPLICATION_CREDENTIALS 
  ? require(process.env.GOOGLE_APPLICATION_CREDENTIALS)
  : null;

if (!serviceAccount) {
  console.log('⚠️ Pas de service account trouvé.');
  console.log('📋 Pour initialiser Firestore, vous avez 2 options:');
  console.log('');
  console.log('Option 1: Via Firebase Console (recommandé)');
  console.log('   1. Allez sur https://console.firebase.google.com/project/owo-631ab/firestore');
  console.log('   2. Créez les collections manuellement');
  console.log('');
  console.log('Option 2: Via ce script');
  console.log('   1. Téléchargez le service account depuis Firebase Console');
  console.log('   2. Project Settings > Service Accounts > Generate new private key');
  console.log('   3. Sauvegardez le fichier JSON');
  console.log('   4. export GOOGLE_APPLICATION_CREDENTIALS="path/to/serviceAccount.json"');
  console.log('   5. Relancez ce script');
  process.exit(0);
}

// Initialiser Firebase Admin
initializeApp({
  credential: cert(serviceAccount),
  projectId: 'owo-631ab'
});

const db = getFirestore();

// ============================================
// DONNÉES DE DÉMO
// ============================================

const DEMO_USER_ID = 'demo_user_floriace';

const demoProfile = {
  userId: DEMO_USER_ID,
  displayName: 'Floriace FAVI',
  email: 'florifavi@gmail.com',
  phone: '+229 97 00 00 00',
  avatar: '',
  kycVerified: true,
  kycLevel: 2,
  createdAt: FieldValue.serverTimestamp(),
};

const demoWallets = [
  {
    userId: DEMO_USER_ID,
    name: 'MTN Mobile Money',
    type: 'mobile_money',
    provider: 'mtn',
    balance: 125000,
    currency: 'XOF',
    status: 'active',
    isPrimary: true,
    phone: '+229 97 00 00 00',
    createdAt: FieldValue.serverTimestamp(),
  },
  {
    userId: DEMO_USER_ID,
    name: 'Moov Money',
    type: 'mobile_money',
    provider: 'moov',
    balance: 45000,
    currency: 'XOF',
    status: 'active',
    isPrimary: false,
    phone: '+229 96 00 00 00',
    createdAt: FieldValue.serverTimestamp(),
  },
  {
    userId: DEMO_USER_ID,
    name: 'Wave',
    type: 'mobile_money',
    provider: 'wave',
    balance: 78500,
    currency: 'XOF',
    status: 'active',
    isPrimary: false,
    phone: '+229 97 00 00 00',
    createdAt: FieldValue.serverTimestamp(),
  },
];

const demoTransactions = [
  {
    userId: DEMO_USER_ID,
    type: 'receive',
    amount: 25000,
    currency: 'XOF',
    description: 'Reçu de Jean KOUASSI',
    status: 'completed',
    senderName: 'Jean KOUASSI',
    senderPhone: '+229 95 00 00 00',
    createdAt: FieldValue.serverTimestamp(),
  },
  {
    userId: DEMO_USER_ID,
    type: 'send',
    amount: 15000,
    currency: 'XOF',
    description: 'Envoyé à Marie ADJOVI',
    status: 'completed',
    recipientName: 'Marie ADJOVI',
    recipientPhone: '+229 94 00 00 00',
    createdAt: FieldValue.serverTimestamp(),
  },
  {
    userId: DEMO_USER_ID,
    type: 'deposit',
    amount: 50000,
    currency: 'XOF',
    description: 'Dépôt MTN Mobile Money',
    status: 'completed',
    provider: 'mtn',
    createdAt: FieldValue.serverTimestamp(),
  },
  {
    userId: DEMO_USER_ID,
    type: 'payment',
    amount: 8500,
    currency: 'XOF',
    description: 'Paiement Supermarché EREVAN',
    status: 'completed',
    merchantName: 'Supermarché EREVAN',
    merchantId: 'merchant_erevan',
    createdAt: FieldValue.serverTimestamp(),
  },
];

const demoNotifications = [
  {
    userId: DEMO_USER_ID,
    title: 'Transfert reçu',
    message: 'Vous avez reçu 25 000 FCFA de Jean KOUASSI',
    type: 'transaction',
    read: false,
    createdAt: FieldValue.serverTimestamp(),
  },
  {
    userId: DEMO_USER_ID,
    title: 'Paiement effectué',
    message: 'Paiement de 8 500 FCFA chez Supermarché EREVAN',
    type: 'payment',
    read: true,
    createdAt: FieldValue.serverTimestamp(),
  },
  {
    userId: DEMO_USER_ID,
    title: 'Nouveau membre dans votre tontine',
    message: 'Marie ADJOVI a rejoint "Épargne Famille 2024"',
    type: 'group',
    read: false,
    createdAt: FieldValue.serverTimestamp(),
  },
];

const demoGroupSavings = [
  {
    name: 'Épargne Famille 2024',
    description: 'Tontine familiale pour les fêtes de fin d\'année',
    creatorId: DEMO_USER_ID,
    members: [DEMO_USER_ID],
    memberCount: 8,
    totalAmount: 450000,
    contributionAmount: 50000,
    frequency: 'monthly',
    status: 'active',
    createdAt: FieldValue.serverTimestamp(),
  },
  {
    name: 'Tontine Amis',
    description: 'Épargne entre amis',
    creatorId: DEMO_USER_ID,
    members: [DEMO_USER_ID],
    memberCount: 5,
    totalAmount: 200000,
    contributionAmount: 40000,
    frequency: 'weekly',
    status: 'active',
    createdAt: FieldValue.serverTimestamp(),
  },
];

const demoLockedSavings = [
  {
    userId: DEMO_USER_ID,
    name: 'Projet Maison',
    targetAmount: 5000000,
    currentAmount: 1250000,
    currency: 'XOF',
    startDate: new Date('2024-01-01'),
    endDate: new Date('2025-12-31'),
    interestRate: 5.5,
    status: 'active',
    createdAt: FieldValue.serverTimestamp(),
  },
  {
    userId: DEMO_USER_ID,
    name: 'Études Enfants',
    targetAmount: 2000000,
    currentAmount: 800000,
    currency: 'XOF',
    startDate: new Date('2024-03-01'),
    endDate: new Date('2026-06-30'),
    interestRate: 4.5,
    status: 'active',
    createdAt: FieldValue.serverTimestamp(),
  },
];

const demoVirtualCards = [
  {
    userId: DEMO_USER_ID,
    name: 'Carte Shopping',
    cardNumber: '**** **** **** 4582',
    lastFour: '4582',
    balance: 75000,
    currency: 'XOF',
    expiryDate: '12/26',
    status: 'active',
    type: 'visa',
    createdAt: FieldValue.serverTimestamp(),
  },
  {
    userId: DEMO_USER_ID,
    name: 'Carte Voyage',
    cardNumber: '**** **** **** 8891',
    lastFour: '8891',
    balance: 150000,
    currency: 'XOF',
    expiryDate: '08/27',
    status: 'active',
    type: 'mastercard',
    createdAt: FieldValue.serverTimestamp(),
  },
];

// ============================================
// INITIALISATION
// ============================================

async function initializeFirestore() {
  console.log('🔥 Initialisation de Firestore pour owo!...\n');

  try {
    // 1. Créer le profil
    console.log('👤 Création du profil...');
    await db.collection('profiles').doc(DEMO_USER_ID).set(demoProfile);
    console.log('   ✅ Profil créé');

    // 2. Créer les wallets
    console.log('💰 Création des wallets...');
    for (const wallet of demoWallets) {
      await db.collection('wallets').add(wallet);
    }
    console.log(`   ✅ ${demoWallets.length} wallets créés`);

    // 3. Créer les transactions
    console.log('📝 Création des transactions...');
    for (const tx of demoTransactions) {
      await db.collection('transactions').add(tx);
    }
    console.log(`   ✅ ${demoTransactions.length} transactions créées`);

    // 4. Créer les notifications
    console.log('🔔 Création des notifications...');
    for (const notif of demoNotifications) {
      await db.collection('notifications').add(notif);
    }
    console.log(`   ✅ ${demoNotifications.length} notifications créées`);

    // 5. Créer les groupes d'épargne
    console.log('👥 Création des groupes d\'épargne...');
    for (const group of demoGroupSavings) {
      await db.collection('groupSavings').add(group);
    }
    console.log(`   ✅ ${demoGroupSavings.length} groupes créés`);

    // 6. Créer les épargnes bloquées
    console.log('🔒 Création des épargnes bloquées...');
    for (const saving of demoLockedSavings) {
      await db.collection('lockedSavings').add(saving);
    }
    console.log(`   ✅ ${demoLockedSavings.length} épargnes bloquées créées`);

    // 7. Créer les cartes virtuelles
    console.log('💳 Création des cartes virtuelles...');
    for (const card of demoVirtualCards) {
      await db.collection('virtualCards').add(card);
    }
    console.log(`   ✅ ${demoVirtualCards.length} cartes virtuelles créées`);

    console.log('\n🎉 Firestore initialisé avec succès !');
    console.log('\n📊 Résumé:');
    console.log(`   • 1 profil utilisateur`);
    console.log(`   • ${demoWallets.length} wallets (solde total: 248 500 FCFA)`);
    console.log(`   • ${demoTransactions.length} transactions`);
    console.log(`   • ${demoNotifications.length} notifications`);
    console.log(`   • ${demoGroupSavings.length} groupes d'épargne`);
    console.log(`   • ${demoLockedSavings.length} épargnes bloquées`);
    console.log(`   • ${demoVirtualCards.length} cartes virtuelles`);

  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

initializeFirestore();
