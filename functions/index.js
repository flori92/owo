// ============================================
// CLOUD FUNCTIONS POUR OWO!
// ============================================

const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();
const db = admin.firestore();

// ============================================
// 1. PRÉLÈVEMENT AUTOMATIQUE DES ÉPARGNES
// Fonction planifiée qui s'exécute chaque jour à minuit (UTC)
// ============================================

exports.processAutoDebit = functions.pubsub
  .schedule('0 0 * * *') // Chaque jour à minuit UTC
  .timeZone('Africa/Porto-Novo') // Timezone Bénin
  .onRun(async (context) => {
    console.log('🔄 Démarrage du processus d\'auto-débit...');

    try {
      // Récupérer tous les objectifs d'épargne actifs avec auto-débit
      const savingsSnapshot = await db
        .collection('lockedSavings')
        .where('status', '==', 'active')
        .where('autoDebit', '==', true)
        .get();

      if (savingsSnapshot.empty) {
        console.log('Aucun objectif d\'épargne avec auto-débit actif trouvé.');
        return null;
      }

      const batch = db.batch();
      const notifications = [];
      let processedCount = 0;
      let errorCount = 0;

      // Traiter chaque objectif d'épargne
      for (const savingDoc of savingsSnapshot.docs) {
        const saving = savingDoc.data();
        const savingId = savingDoc.id;

        try {
          // Vérifier si le solde cible n'est pas déjà atteint
          if (saving.currentAmount >= saving.targetAmount) {
            console.log(`✅ Objectif ${savingId} déjà atteint, skip.`);

            // Marquer comme complété si pas encore fait
            if (saving.status !== 'completed') {
              batch.update(savingDoc.ref, {
                status: 'completed',
                completedAt: admin.firestore.FieldValue.serverTimestamp(),
              });
            }
            continue;
          }

          // Récupérer le wallet source
          const sourceWalletSnapshot = await db
            .collection('wallets')
            .doc(saving.sourceWalletId)
            .get();

          if (!sourceWalletSnapshot.exists) {
            console.error(`❌ Wallet source ${saving.sourceWalletId} introuvable pour ${savingId}`);
            errorCount++;
            continue;
          }

          const sourceWallet = sourceWalletSnapshot.data();

          // Vérifier que le wallet a suffisamment de fonds
          if (sourceWallet.balance < saving.frequency.amount) {
            console.log(`⚠️ Solde insuffisant dans ${sourceWallet.name} pour ${savingId}`);

            // Créer une notification d'échec
            notifications.push({
              userId: saving.userId,
              type: 'auto_debit_failed',
              title: 'Prélèvement automatique échoué',
              message: `Le prélèvement de ${saving.frequency.amount} € pour "${saving.name}" a échoué. Solde insuffisant dans ${sourceWallet.name}.`,
              relatedId: savingId,
              relatedType: 'savings',
              read: false,
              createdAt: admin.firestore.FieldValue.serverTimestamp(),
            });

            errorCount++;
            continue;
          }

          // Calculer le nouveau montant (ne pas dépasser la cible)
          const amountToAdd = Math.min(
            saving.frequency.amount,
            saving.targetAmount - saving.currentAmount
          );

          // Déduire du wallet source
          batch.update(sourceWalletSnapshot.ref, {
            balance: admin.firestore.Increment(-amountToAdd),
            lastActivity: admin.firestore.FieldValue.serverTimestamp(),
          });

          // Ajouter à l'objectif d'épargne
          const newAmount = saving.currentAmount + amountToAdd;
          const isCompleted = newAmount >= saving.targetAmount;

          batch.update(savingDoc.ref, {
            currentAmount: newAmount,
            lastDebitDate: admin.firestore.FieldValue.serverTimestamp(),
            status: isCompleted ? 'completed' : 'active',
            completedAt: isCompleted ? admin.firestore.FieldValue.serverTimestamp() : null,
          });

          // Créer une transaction
          const transactionRef = db.collection('transactions').doc();
          batch.set(transactionRef, {
            userId: saving.userId,
            type: 'savings_auto_debit',
            amount: amountToAdd,
            currency: 'EUR',
            status: 'completed',
            sourceWalletId: saving.sourceWalletId,
            targetSavingsId: savingId,
            description: `Prélèvement automatique pour "${saving.name}"`,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
          });

          // Créer une notification de succès
          notifications.push({
            userId: saving.userId,
            type: 'auto_debit_success',
            title: isCompleted ? '🎉 Objectif atteint!' : 'Prélèvement automatique effectué',
            message: isCompleted
              ? `Félicitations! Votre objectif "${saving.name}" a été atteint avec ${newAmount.toFixed(2)} €.`
              : `${amountToAdd.toFixed(2)} € ont été prélevés de ${sourceWallet.name} pour "${saving.name}".`,
            relatedId: savingId,
            relatedType: 'savings',
            read: false,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
          });

          processedCount++;
          console.log(`✅ Auto-débit réussi pour ${savingId}: ${amountToAdd} €`);
        } catch (error) {
          console.error(`❌ Erreur traitement ${savingId}:`, error);
          errorCount++;
        }
      }

      // Commit toutes les mises à jour
      await batch.commit();

      // Créer les notifications
      for (const notif of notifications) {
        await db.collection('notifications').add(notif);
      }

      console.log(`✅ Auto-débit terminé: ${processedCount} succès, ${errorCount} échecs`);
      return { success: processedCount, errors: errorCount };
    } catch (error) {
      console.error('❌ Erreur globale auto-débit:', error);
      throw error;
    }
  });

// ============================================
// 2. NOTIFICATION DE BIENVENUE
// Déclenchée lors de la création d'un profil utilisateur
// ============================================

exports.createWelcomeNotification = functions.firestore
  .document('profiles/{userId}')
  .onCreate(async (snap, context) => {
    const userId = context.params.userId;
    const profile = snap.data();

    console.log(`🎉 Nouveau profil créé: ${userId}`);

    try {
      // Créer une notification de bienvenue
      await db.collection('notifications').add({
        userId: userId,
        type: 'welcome',
        title: `Bienvenue ${profile.displayName || 'sur owo!'} 👋`,
        message:
          'Gérez votre argent facilement avec owo! Commencez par créer votre premier objectif d\'épargne.',
        relatedId: userId,
        relatedType: 'profile',
        read: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log(`✅ Notification de bienvenue créée pour ${userId}`);
      return null;
    } catch (error) {
      console.error(`❌ Erreur création notification bienvenue:`, error);
      throw error;
    }
  });

// ============================================
// 3. NOTIFICATION DE TRANSACTION
// Déclenchée lors de la création d'une transaction
// ============================================

exports.onTransactionCreated = functions.firestore
  .document('transactions/{transactionId}')
  .onCreate(async (snap, context) => {
    const transactionId = context.params.transactionId;
    const transaction = snap.data();

    console.log(`💸 Nouvelle transaction: ${transactionId}`);

    try {
      // Construire le message de notification selon le type
      let title = '';
      let message = '';
      let notifType = 'transaction';

      switch (transaction.type) {
        case 'send':
          title = 'Envoi d\'argent effectué';
          message = `Vous avez envoyé ${transaction.amount} ${transaction.currency} ${
            transaction.recipientName ? `à ${transaction.recipientName}` : ''
          }.`;
          notifType = 'transaction_send';
          break;

        case 'receive':
          title = 'Argent reçu';
          message = `Vous avez reçu ${transaction.amount} ${transaction.currency} ${
            transaction.senderName ? `de ${transaction.senderName}` : ''
          }.`;
          notifType = 'transaction_receive';
          break;

        case 'deposit':
          title = 'Dépôt effectué';
          message = `Vous avez déposé ${transaction.amount} ${transaction.currency} sur votre compte.`;
          notifType = 'transaction_deposit';
          break;

        case 'payment':
          title = 'Paiement effectué';
          message = `Paiement de ${transaction.amount} ${transaction.currency} ${
            transaction.merchantName ? `chez ${transaction.merchantName}` : ''
          }.`;
          notifType = 'transaction_payment';
          break;

        case 'withdrawal':
          title = 'Retrait effectué';
          message = `Vous avez retiré ${transaction.amount} ${transaction.currency}.`;
          notifType = 'transaction_withdrawal';
          break;

        case 'savings_auto_debit':
          // Déjà géré dans processAutoDebit
          console.log('Transaction auto-débit, notification déjà créée.');
          return null;

        default:
          title = 'Transaction effectuée';
          message = `Transaction de ${transaction.amount} ${transaction.currency}.`;
      }

      // Ajouter la description si disponible
      if (transaction.description) {
        message += ` - ${transaction.description}`;
      }

      // Créer la notification
      await db.collection('notifications').add({
        userId: transaction.userId,
        type: notifType,
        title: title,
        message: message,
        relatedId: transactionId,
        relatedType: 'transaction',
        read: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log(`✅ Notification créée pour transaction ${transactionId}`);
      return null;
    } catch (error) {
      console.error(`❌ Erreur création notification transaction:`, error);
      throw error;
    }
  });

// ============================================
// 4. MISE À JOUR AUTOMATIQUE DES WALLETS
// Met à jour lastActivity lors d'une transaction
// ============================================

exports.updateWalletActivity = functions.firestore
  .document('transactions/{transactionId}')
  .onCreate(async (snap, context) => {
    const transaction = snap.data();

    try {
      const batch = db.batch();

      // Mettre à jour le wallet source
      if (transaction.sourceWalletId) {
        const sourceWalletRef = db.collection('wallets').doc(transaction.sourceWalletId);
        batch.update(sourceWalletRef, {
          lastActivity: admin.firestore.FieldValue.serverTimestamp(),
        });
      }

      // Mettre à jour le wallet destination
      if (transaction.targetWalletId) {
        const targetWalletRef = db.collection('wallets').doc(transaction.targetWalletId);
        batch.update(targetWalletRef, {
          lastActivity: admin.firestore.FieldValue.serverTimestamp(),
        });
      }

      await batch.commit();
      console.log(`✅ Wallets mis à jour pour transaction ${context.params.transactionId}`);
      return null;
    } catch (error) {
      console.error(`❌ Erreur mise à jour wallets:`, error);
      // Ne pas throw pour ne pas bloquer la transaction
      return null;
    }
  });

// ============================================
// 5. NETTOYAGE DES NOTIFICATIONS ANCIENNES
// Fonction planifiée qui s'exécute chaque semaine
// Supprime les notifications lues de plus de 30 jours
// ============================================

exports.cleanupOldNotifications = functions.pubsub
  .schedule('0 0 * * 0') // Chaque dimanche à minuit
  .timeZone('Africa/Porto-Novo')
  .onRun(async (context) => {
    console.log('🧹 Nettoyage des anciennes notifications...');

    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const oldNotifications = await db
        .collection('notifications')
        .where('read', '==', true)
        .where('readAt', '<', thirtyDaysAgo)
        .get();

      if (oldNotifications.empty) {
        console.log('Aucune notification à nettoyer.');
        return null;
      }

      const batch = db.batch();
      oldNotifications.forEach((doc) => {
        batch.delete(doc.ref);
      });

      await batch.commit();
      console.log(`✅ ${oldNotifications.size} notifications nettoyées.`);
      return { deleted: oldNotifications.size };
    } catch (error) {
      console.error('❌ Erreur nettoyage notifications:', error);
      throw error;
    }
  });

// ============================================
// 6. VALIDATION DES DONNÉES
// Valide l'intégrité des données avant écriture
// ============================================

exports.validateWalletBalance = functions.firestore
  .document('wallets/{walletId}')
  .onWrite(async (change, context) => {
    // Si c'est une suppression, ignorer
    if (!change.after.exists) {
      return null;
    }

    const newData = change.after.data();

    // Vérifier que le solde n'est pas négatif
    if (newData.balance < 0) {
      console.error(`❌ Solde négatif détecté pour wallet ${context.params.walletId}`);

      // Créer une alerte pour l'admin (système)
      await db.collection('system').doc('alerts').collection('balance_alerts').add({
        walletId: context.params.walletId,
        userId: newData.userId,
        balance: newData.balance,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        severity: 'high',
      });
    }

    return null;
  });
