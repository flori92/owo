/**
 * Initialisation des données Firestore pour owo!
 * 
 * Ce fichier crée les données de démo dans Firestore
 * pour un utilisateur nouvellement créé
 */

import { db } from './firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  getDocs,
  query,
  where,
  serverTimestamp 
} from 'firebase/firestore';
import { COLLECTIONS } from './firebase';

/**
 * Crée les données initiales pour un nouvel utilisateur
 */
export async function initUserData(userId, userEmail, userName) {
  console.log('🔥 Initialisation des données pour', userEmail);

  try {
    // 1. Créer le profil utilisateur
    await setDoc(doc(db, COLLECTIONS.PROFILES, userId), {
      userId,
      displayName: userName || userEmail.split('@')[0],
      email: userEmail,
      phone: '',
      avatar: '',
      kycVerified: false,
      kycLevel: 0,
      createdAt: serverTimestamp(),
    });
    console.log('✅ Profil créé');

    // 2. Créer le wallet principal
    await addDoc(collection(db, COLLECTIONS.WALLETS), {
      userId,
      name: 'Wallet Principal',
      type: 'main',
      provider: 'owo',
      balance: 0,
      currency: 'XOF',
      status: 'active',
      isPrimary: true,
      createdAt: serverTimestamp(),
    });
    console.log('✅ Wallet principal créé');

    // 3. Créer une notification de bienvenue
    await addDoc(collection(db, COLLECTIONS.NOTIFICATIONS), {
      userId,
      title: 'Bienvenue sur owo! 🎉',
      message: 'Votre compte a été créé avec succès. Commencez par ajouter un mode de paiement.',
      type: 'system',
      read: false,
      createdAt: serverTimestamp(),
    });
    console.log('✅ Notification de bienvenue créée');

    return { success: true };
  } catch (error) {
    console.error('❌ Erreur initialisation données:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Crée des données de démo complètes (pour tests)
 */
export async function initDemoData(userId) {
  console.log('🔥 Initialisation des données de démo...');

  try {
    // Vérifier si l'utilisateur a déjà des wallets
    const walletsQuery = query(
      collection(db, COLLECTIONS.WALLETS),
      where('userId', '==', userId)
    );
    const existingWallets = await getDocs(walletsQuery);
    
    if (existingWallets.docs.length > 1) {
      console.log('⚠️ Données déjà existantes, skip');
      return { success: true, message: 'Données déjà existantes' };
    }

    // Wallets de démo
    const demoWallets = [
      { name: 'MTN Mobile Money', type: 'mobile_money', provider: 'mtn', balance: 125000, isPrimary: true },
      { name: 'Moov Money', type: 'mobile_money', provider: 'moov', balance: 45000, isPrimary: false },
      { name: 'Wave', type: 'mobile_money', provider: 'wave', balance: 78500, isPrimary: false },
    ];

    for (const wallet of demoWallets) {
      await addDoc(collection(db, COLLECTIONS.WALLETS), {
        userId,
        ...wallet,
        currency: 'XOF',
        status: 'active',
        createdAt: serverTimestamp(),
      });
    }
    console.log('✅ Wallets de démo créés');

    // Transactions de démo
    const demoTransactions = [
      { type: 'receive', amount: 25000, description: 'Reçu de Jean KOUASSI', senderName: 'Jean KOUASSI' },
      { type: 'send', amount: 15000, description: 'Envoyé à Marie ADJOVI', recipientName: 'Marie ADJOVI' },
      { type: 'deposit', amount: 50000, description: 'Dépôt MTN Mobile Money' },
      { type: 'payment', amount: 8500, description: 'Paiement Supermarché EREVAN', merchantName: 'Supermarché EREVAN' },
    ];

    for (const tx of demoTransactions) {
      await addDoc(collection(db, COLLECTIONS.TRANSACTIONS), {
        userId,
        ...tx,
        currency: 'XOF',
        status: 'completed',
        createdAt: serverTimestamp(),
      });
    }
    console.log('✅ Transactions de démo créées');

    // Notifications de démo
    const demoNotifications = [
      { title: 'Transfert reçu', message: 'Vous avez reçu 25 000 FCFA de Jean KOUASSI', type: 'transaction', read: false },
      { title: 'Paiement effectué', message: 'Paiement de 8 500 FCFA chez Supermarché EREVAN', type: 'payment', read: true },
      { title: 'Nouveau membre', message: 'Marie ADJOVI a rejoint "Épargne Famille 2024"', type: 'group', read: false },
    ];

    for (const notif of demoNotifications) {
      await addDoc(collection(db, COLLECTIONS.NOTIFICATIONS), {
        userId,
        ...notif,
        createdAt: serverTimestamp(),
      });
    }
    console.log('✅ Notifications de démo créées');

    // Groupes d'épargne de démo
    const demoGroups = [
      { name: 'Épargne Famille 2024', memberCount: 8, totalAmount: 450000, contributionAmount: 50000 },
      { name: 'Tontine Amis', memberCount: 5, totalAmount: 200000, contributionAmount: 40000 },
    ];

    for (const group of demoGroups) {
      await addDoc(collection(db, 'groupSavings'), {
        creatorId: userId,
        members: [userId],
        ...group,
        frequency: 'monthly',
        status: 'active',
        createdAt: serverTimestamp(),
      });
    }
    console.log('✅ Groupes d\'épargne créés');

    // Épargnes bloquées de démo
    const demoSavings = [
      { name: 'Projet Maison', targetAmount: 5000000, currentAmount: 1250000, interestRate: 5.5 },
      { name: 'Études Enfants', targetAmount: 2000000, currentAmount: 800000, interestRate: 4.5 },
    ];

    for (const saving of demoSavings) {
      await addDoc(collection(db, 'lockedSavings'), {
        userId,
        ...saving,
        currency: 'XOF',
        status: 'active',
        createdAt: serverTimestamp(),
      });
    }
    console.log('✅ Épargnes bloquées créées');

    // Cartes virtuelles de démo
    const demoCards = [
      { name: 'Carte Shopping', lastFour: '4582', balance: 75000, expiryDate: '12/26', type: 'visa' },
      { name: 'Carte Voyage', lastFour: '8891', balance: 150000, expiryDate: '08/27', type: 'mastercard' },
    ];

    for (const card of demoCards) {
      await addDoc(collection(db, 'virtualCards'), {
        userId,
        ...card,
        cardNumber: `**** **** **** ${card.lastFour}`,
        currency: 'XOF',
        status: 'active',
        createdAt: serverTimestamp(),
      });
    }
    console.log('✅ Cartes virtuelles créées');

    console.log('🎉 Données de démo initialisées !');
    return { success: true };

  } catch (error) {
    console.error('❌ Erreur:', error);
    return { success: false, error: error.message };
  }
}

export default { initUserData, initDemoData };
