/**
 * Migration des données de démo vers Firestore
 * Pour le profil Floriace FAVI
 */

import { db, auth, COLLECTIONS } from './firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  getDocs,
  query,
  where,
  deleteDoc,
  serverTimestamp 
} from 'firebase/firestore';

/**
 * Migrer toutes les données de démo vers Firestore pour un utilisateur
 */
export async function migrateDataToFirestore() {
  const user = auth.currentUser;
  
  if (!user) {
    console.error('❌ Aucun utilisateur connecté');
    return { success: false, error: 'Non connecté' };
  }

  const userId = user.uid;
  console.log('🔥 Migration des données pour:', user.email);

  try {
    // 1. Mettre à jour le profil
    console.log('👤 Mise à jour du profil...');
    await setDoc(doc(db, COLLECTIONS.PROFILES, userId), {
      userId,
      displayName: 'Floriace FAVI',
      email: user.email || 'florifavi@gmail.com',
      phone: '+229 97 00 00 00',
      avatar: '',
      kycVerified: true,
      kycLevel: 3,
      country: 'Bénin',
      currency: 'EUR',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }, { merge: true });
    console.log('✅ Profil mis à jour');

    // 2. Supprimer les anciens wallets
    console.log('🗑️ Suppression des anciens wallets...');
    const oldWallets = await getDocs(query(
      collection(db, COLLECTIONS.WALLETS),
      where('userId', '==', userId)
    ));
    for (const doc of oldWallets.docs) {
      await deleteDoc(doc.ref);
    }

    // 3. Créer les nouveaux wallets (Total: 9755.75 EUR)
    console.log('💰 Création des wallets...');
    const wallets = [
      { name: 'Compte Principal', type: 'main', provider: 'owo', balance: 4250.50, isPrimary: true },
      { name: 'MTN Mobile Money', type: 'mobile_money', provider: 'mtn', balance: 2150.25, isPrimary: false },
      { name: 'Moov Money', type: 'mobile_money', provider: 'moov', balance: 1875.00, isPrimary: false },
      { name: 'Wave', type: 'mobile_money', provider: 'wave', balance: 1480.00, isPrimary: false },
    ];

    for (const wallet of wallets) {
      await addDoc(collection(db, COLLECTIONS.WALLETS), {
        userId,
        ...wallet,
        currency: 'EUR',
        status: 'active',
        createdAt: serverTimestamp(),
      });
    }
    console.log('✅ 4 wallets créés (Total: 9 755,75 €)');

    // 4. Supprimer les anciennes transactions
    console.log('🗑️ Suppression des anciennes transactions...');
    const oldTransactions = await getDocs(query(
      collection(db, COLLECTIONS.TRANSACTIONS),
      where('userId', '==', userId)
    ));
    for (const doc of oldTransactions.docs) {
      await deleteDoc(doc.ref);
    }

    // 5. Créer les nouvelles transactions
    console.log('📝 Création des transactions...');
    const transactions = [
      { type: 'receive', amount: 1500.00, description: 'Virement reçu - Salaire', senderName: 'ENTREPRISE XYZ' },
      { type: 'send', amount: 350.00, description: 'Envoyé à Famille', recipientName: 'Marie FAVI' },
      { type: 'deposit', amount: 2000.00, description: 'Dépôt compte principal' },
      { type: 'payment', amount: 89.99, description: 'Paiement Amazon', merchantName: 'Amazon' },
      { type: 'receive', amount: 500.00, description: 'Remboursement', senderName: 'Jean KOUASSI' },
      { type: 'payment', amount: 45.50, description: 'Carburant Total', merchantName: 'Total Energies' },
    ];

    for (const tx of transactions) {
      await addDoc(collection(db, COLLECTIONS.TRANSACTIONS), {
        userId,
        ...tx,
        currency: 'EUR',
        status: 'completed',
        createdAt: serverTimestamp(),
      });
    }
    console.log('✅ 6 transactions créées');

    // 6. Supprimer les anciennes notifications
    console.log('🗑️ Suppression des anciennes notifications...');
    const oldNotifications = await getDocs(query(
      collection(db, COLLECTIONS.NOTIFICATIONS),
      where('userId', '==', userId)
    ));
    for (const doc of oldNotifications.docs) {
      await deleteDoc(doc.ref);
    }

    // 7. Créer les nouvelles notifications
    console.log('🔔 Création des notifications...');
    const notifications = [
      { title: 'Virement reçu 💰', message: 'Vous avez reçu 1 500,00 € - Salaire', type: 'transaction', read: false },
      { title: 'Paiement effectué', message: 'Paiement de 89,99 € chez Amazon', type: 'payment', read: true },
      { title: 'Carte rechargée 💳', message: 'Votre carte Visa a été rechargée de 500 €', type: 'card', read: false },
      { title: 'Bienvenue sur owo! 🎉', message: 'Votre compte a été créé avec succès.', type: 'system', read: true },
    ];

    for (const notif of notifications) {
      await addDoc(collection(db, COLLECTIONS.NOTIFICATIONS), {
        userId,
        ...notif,
        createdAt: serverTimestamp(),
      });
    }
    console.log('✅ 4 notifications créées');

    // 8. Créer les groupes d'épargne
    console.log('👥 Création des groupes d\'épargne...');
    const groups = [
      { name: 'Épargne Famille 2024', members: [userId], memberCount: 8, totalAmount: 12000, contributionAmount: 1500, frequency: 'monthly' },
      { name: 'Projet Investissement', members: [userId], memberCount: 4, totalAmount: 8000, contributionAmount: 2000, frequency: 'monthly' },
    ];

    for (const group of groups) {
      await addDoc(collection(db, 'groupSavings'), {
        creatorId: userId,
        ...group,
        currency: 'EUR',
        status: 'active',
        createdAt: serverTimestamp(),
      });
    }
    console.log('✅ 2 groupes d\'épargne créés');

    // 9. Créer les épargnes bloquées
    console.log('🔒 Création des épargnes bloquées...');
    const savings = [
      { name: 'Projet Immobilier', targetAmount: 50000, currentAmount: 15000, interestRate: 3.5, endDate: '2026-12-31' },
      { name: 'Épargne Retraite', targetAmount: 100000, currentAmount: 8500, interestRate: 4.2, endDate: '2040-01-01' },
    ];

    for (const saving of savings) {
      await addDoc(collection(db, 'lockedSavings'), {
        userId,
        ...saving,
        currency: 'EUR',
        status: 'active',
        createdAt: serverTimestamp(),
      });
    }
    console.log('✅ 2 épargnes bloquées créées');

    // 10. Créer les cartes virtuelles (Total: 1787 EUR)
    console.log('💳 Création des cartes virtuelles...');
    const cards = [
      { name: 'Carte Visa Premium', lastFour: '4582', balance: 1287.00, expiryDate: '12/27', type: 'visa' },
      { name: 'Carte Mastercard', lastFour: '8891', balance: 500.00, expiryDate: '08/28', type: 'mastercard' },
    ];

    for (const card of cards) {
      await addDoc(collection(db, 'virtualCards'), {
        userId,
        ...card,
        cardNumber: `**** **** **** ${card.lastFour}`,
        currency: 'EUR',
        status: 'active',
        createdAt: serverTimestamp(),
      });
    }
    console.log('✅ 2 cartes virtuelles créées (Total: 1 787 €)');

    console.log('\n🎉 Migration terminée avec succès !');
    console.log('📊 Résumé:');
    console.log('   • Profil: Floriace FAVI');
    console.log('   • Solde total: 9 755,75 €');
    console.log('   • Cartes: 1 787,00 €');
    console.log('   • 4 wallets, 6 transactions, 4 notifications');
    console.log('   • 2 groupes épargne, 2 épargnes bloquées, 2 cartes');

    return { success: true };

  } catch (error) {
    console.error('❌ Erreur migration:', error);
    return { success: false, error: error.message };
  }
}

export default migrateDataToFirestore;
