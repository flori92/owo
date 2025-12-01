#!/usr/bin/env node

// Script pour créer l'utilisateur Floriace FAVI dans Appwrite
const https = require('https');

const API_ENDPOINT = 'https://fra.cloud.appwrite.io/v1';
const PROJECT_ID = '6915ff850039f714e80a';
const API_KEY = 'standard_7069172c1dfad4fbd791edc2814f129887169e0858f95bd395a66adb9b032c7103a107e9b46b4b22ed7019a5db9892ea520ef7e0ab15f50d23890c84b02652ece06ec91e6ff13ef7ab50b9f4e835a35487a14169ff2316204df2abdf46cb436b490b36f4d3b860b9e1c4b5f7b0d6b6e730b90b32622b75b0fd4625349faf2543';

function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'fra.cloud.appwrite.io',
      port: 443,
      path: `/v1${path}`,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'X-Appwrite-Project': PROJECT_ID,
        'X-Appwrite-Key': API_KEY,
      },
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(json);
          } else {
            console.error(`Erreur ${res.statusCode}:`, json);
            reject(json);
          }
        } catch (e) {
          reject(body);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function createFloriaceUser() {
  console.log('👤 Création de l\'utilisateur Floriace FAVI...');
  console.log('================================================\n');

  try {
    // 1. Créer le compte utilisateur
    console.log('1️⃣  Création du compte...');
    const userId = 'floriace_favi_' + Date.now();
    
    const accountData = {
      userId: userId,
      email: 'florifavi@gmail.com',
      password: 'OwoApp2024!',
      name: 'Floriace FAVI',
    };

    try {
      const account = await makeRequest('POST', '/account', accountData);
      console.log('✅ Compte créé avec succès!');
      console.log(`   ID: ${account.$id}`);
      console.log(`   Email: ${account.email}`);
      console.log(`   Nom: ${account.name}`);
    } catch (error) {
      if (error.type === 'user_already_exists') {
        console.log('✅ Compte existe déjà, passage à la suite...');
      } else {
        throw error;
      }
    }

    // 2. Créer le profil utilisateur
    console.log('\n2️⃣  Création du profil...');
    const profileData = {
      email: 'florifavi@gmail.com',
      phone: '+22507XXXXXXXX',
      firstName: 'Floriace',
      lastName: 'FAVI',
      country: 'CI',
      currency: 'XOF',
    };

    try {
      const profile = await makeRequest('POST', '/databases/owo_database/collections/profiles/documents', {
        documentId: userId,
        data: profileData,
      });
      console.log('✅ Profil créé avec succès!');
    } catch (error) {
      if (error.type === 'document_already_exists') {
        console.log('✅ Profil existe déjà, mise à jour...');
        await makeRequest('PATCH', `/databases/owo_database/collections/profiles/documents/${userId}`, {
          data: profileData,
        });
        console.log('✅ Profil mis à jour!');
      } else {
        console.warn('⚠️  Erreur profil:', error.message || error);
      }
    }

    // 3. Créer les wallets par défaut
    console.log('\n3️⃣  Création des wallets...');
    
    const wallets = [
      {
        type: 'mobile_money',
        provider: 'MTN Mobile Money',
        accountNumber: '+22507XXXXXXXX',
        isPrimary: true,
        balance: 50000, // 50,000 FCFA
      },
      {
        type: 'mobile_money',
        provider: 'Orange Money',
        accountNumber: '+22507XXXXXXXX',
        isPrimary: false,
        balance: 30000, // 30,000 FCFA
      },
      {
        type: 'bank',
        provider: 'ECOBANK CI',
        accountNumber: 'CI1234567890',
        isPrimary: false,
        balance: 100000, // 100,000 FCFA
      },
    ];

    for (let i = 0; i < wallets.length; i++) {
      try {
        const walletData = {
          userId: userId,
          ...wallets[i],
        };
        
        await makeRequest('POST', '/databases/owo_database/collections/wallets/documents', {
          documentId: `wallet_${userId}_${i}`,
          data: walletData,
        });
        console.log(`✅ Wallet ${wallets[i].provider} créé (${wallets[i].balance} FCFA)`);
      } catch (error) {
        console.warn(`⚠️  Erreur wallet ${wallets[i].provider}:`, error.message || error);
      }
    }

    // 4. Créer une carte virtuelle
    console.log('\n4️⃣  Création de la carte virtuelle...');
    const cardData = {
      userId: userId,
      cardNumber: '4242424242424242',
      expiryDate: '12/26',
      cvv: '123',
      balance: 25000, // 25,000 FCFA
      dailyLimit: 100000, // 100,000 FCFA
      monthlyLimit: 500000, // 500,000 FCFA
    };

    try {
      await makeRequest('POST', '/databases/owo_database/collections/virtual_cards/documents', {
        documentId: `card_${userId}`,
        data: cardData,
      });
      console.log('✅ Carte virtuelle créée (25,000 FCFA)');
    } catch (error) {
      console.warn('⚠️  Erreur carte virtuelle:', error.message || error);
    }

    // 5. Créer quelques transactions de test
    console.log('\n5️⃣  Création des transactions de test...');
    
    const transactions = [
      {
        type: 'deposit',
        amount: 50000,
        recipientName: 'Dépôt initial',
        description: 'Dépôt de départ sur le compte',
        status: 'completed',
      },
      {
        type: 'send',
        amount: 5000,
        recipientPhone: '+2250700000000',
        recipientName: 'Jean Kouadio',
        description: 'Remboursement prêt',
        status: 'completed',
      },
      {
        type: 'receive',
        amount: 15000,
        recipientPhone: '+2250800000000',
        recipientName: 'Marie Aya',
        description: 'Paiement freelance',
        status: 'completed',
      },
    ];

    for (let i = 0; i < transactions.length; i++) {
      try {
        const transactionData = {
          userId: userId,
          ...transactions[i],
        };
        
        await makeRequest('POST', '/databases/owo_database/collections/transactions/documents', {
          documentId: `txn_${userId}_${i}`,
          data: transactionData,
        });
        console.log(`✅ Transaction ${transactions[i].type} de ${transactions[i].amount} FCFA`);
      } catch (error) {
        console.warn(`⚠️  Erreur transaction:`, error.message || error);
      }
    }

    // 6. Créer une cagnotte de test
    console.log('\n6️⃣  Création d\'une cagnotte de test...');
    const groupSavingData = {
      code: 'OWO-TEST',
      name: 'Voyage à Paris 2025',
      description: 'Cagnotte pour notre voyage à Paris l\'année prochaine',
      targetAmount: 500000, // 500,000 FCFA
      currentAmount: 75000, // 75,000 FCFA déjà
      creatorId: userId,
      endDate: '2025-12-31',
      isPublic: false,
    };

    try {
      const saving = await makeRequest('POST', '/databases/owo_database/collections/group_savings/documents', {
        documentId: `group_${userId}`,
        data: groupSavingData,
      });
      
      // Ajouter comme membre admin
      await makeRequest('POST', '/databases/owo_database/collections/group_members/documents', {
        documentId: `member_${userId}_${saving.$id}`,
        data: {
          groupId: saving.$id,
          userId: userId,
          role: 'admin',
          contributedAmount: 75000,
        },
      });
      
      console.log('✅ Cagnotte "Voyage à Paris 2025" créée (75,000/500,000 FCFA)');
    } catch (error) {
      console.warn('⚠️  Erreur cagnotte:', error.message || error);
    }

    // 7. Créer une épargne bloquée
    console.log('\n7️⃣  Création d\'une épargne bloquée...');
    const lockedSavingData = {
      userId: userId,
      title: 'Fonds d\'urgence',
      description: 'Épargne bloquée pour les urgences, déblocage 31/12/2025',
      amount: 100000, // 100,000 FCFA
      targetAmount: 200000, // Objectif 200,000 FCFA
      unlockDate: '2025-12-31',
      emergencyPin: '1234',
    };

    try {
      await makeRequest('POST', '/databases/owo_database/collections/locked_savings/documents', {
        documentId: `locked_${userId}`,
        data: lockedSavingData,
      });
      console.log('✅ Épargne bloquée "Fonds d\'urgence" créée (100,000 FCFA)');
    } catch (error) {
      console.warn('⚠️  Erreur épargne bloquée:', error.message || error);
    }

    // 8. Créer quelques notifications
    console.log('\n8️⃣  Création des notifications...');
    
    const notifications = [
      {
        type: 'transaction',
        title: 'Nouveau virement reçu',
        message: 'Marie Aya vous a envoyé 15,000 FCFA',
        read: false,
      },
      {
        type: 'savings',
        title: 'Objectif de cagnotte',
        message: 'Votre cagnotte "Voyage à Paris" a atteint 15% de son objectif',
        read: false,
      },
      {
        type: 'system',
        title: 'Bienvenue sur owo!',
        message: 'Votre compte a été configuré avec succès',
        read: true,
      },
    ];

    for (let i = 0; i < notifications.length; i++) {
      try {
        const notifData = {
          userId: userId,
          ...notifications[i],
        };
        
        await makeRequest('POST', '/databases/owo_database/collections/notifications/documents', {
          documentId: `notif_${userId}_${i}`,
          data: notifData,
        });
        console.log(`✅ Notification "${notifications[i].title}" créée`);
      } catch (error) {
        console.warn(`⚠️  Erreur notification:`, error.message || error);
      }
    }

    console.log('\n🎉 Utilisateur Floriace FAVI créé avec succès!');
    console.log('\n📊 Résumé du compte:');
    console.log(`   👤 Nom: Floriace FAVI`);
    console.log(`   📧 Email: florifavi@gmail.com`);
    console.log(`   🔐 Mot de passe: OwoApp2024!`);
    console.log(`   💰 Solde total: 205,000 FCFA`);
    console.log(`   💳 Carte virtuelle: 25,000 FCFA`);
    console.log(`   🎯 Cagnotte: 75,000/500,000 FCFA`);
    console.log(`   🔒 Épargne bloquée: 100,000 FCFA`);
    console.log(`   📬 Notifications: 3 (2 non lues)`);
    console.log('\n🔗 Connexion: https://cloud.appwrite.io/console/project-6915ff850039f714e80a');

  } catch (error) {
    console.error('\n❌ Erreur lors de la création:', error);
    process.exit(1);
  }
}

// Lancer le script
createFloriaceUser();
