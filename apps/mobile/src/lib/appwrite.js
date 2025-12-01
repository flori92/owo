import { Client, Account, Databases, Storage, Functions } from 'appwrite';

// Configuration Appwrite
const APPWRITE_ENDPOINT = process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID || '6915ff850039f714e80a';

// IDs des collections (à créer dans Appwrite)
export const DATABASE_ID = 'owo_database';
export const COLLECTIONS = {
  PROFILES: 'profiles',
  WALLETS: 'wallets',
  TRANSACTIONS: 'transactions',
  GROUP_SAVINGS: 'group_savings',
  GROUP_MEMBERS: 'group_members',
  LOCKED_SAVINGS: 'locked_savings',
  VIRTUAL_CARDS: 'virtual_cards',
  NOTIFICATIONS: 'notifications',
};

// Initialiser le client Appwrite
const client = new Client();

client
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT_ID);

// Services Appwrite
export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export const functions = new Functions(client);

// ============================================
// AUTHENTIFICATION
// ============================================

/**
 * Créer un compte avec email et mot de passe
 */
export async function createAccount(email, password, name) {
  try {
    const newAccount = await account.create('unique()', email, password, name);
    // Créer une session automatiquement
    await login(email, password);
    return { success: true, user: newAccount };
  } catch (error) {
    console.error('Erreur création compte:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Connexion avec email et mot de passe
 */
export async function login(email, password) {
  try {
    const session = await account.createEmailPasswordSession(email, password);
    return { success: true, session };
  } catch (error) {
    console.error('Erreur connexion:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Connexion avec numéro de téléphone (OTP)
 */
export async function sendPhoneOTP(phone) {
  try {
    const token = await account.createPhoneToken('unique()', phone);
    return { success: true, userId: token.userId };
  } catch (error) {
    console.error('Erreur envoi OTP:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Vérifier le code OTP
 */
export async function verifyPhoneOTP(userId, secret) {
  try {
    const session = await account.createSession(userId, secret);
    return { success: true, session };
  } catch (error) {
    console.error('Erreur vérification OTP:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Déconnexion
 */
export async function logout() {
  try {
    await account.deleteSession('current');
    return { success: true };
  } catch (error) {
    console.error('Erreur déconnexion:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Obtenir l'utilisateur connecté
 */
export async function getCurrentUser() {
  try {
    const user = await account.get();
    return { success: true, user };
  } catch (error) {
    return { success: false, user: null };
  }
}

// ============================================
// PROFIL UTILISATEUR
// ============================================

/**
 * Créer ou mettre à jour le profil utilisateur
 */
export async function upsertProfile(userId, profileData) {
  try {
    // Essayer de mettre à jour
    const existing = await databases.getDocument(
      DATABASE_ID,
      COLLECTIONS.PROFILES,
      userId
    ).catch(() => null);

    if (existing) {
      const updated = await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.PROFILES,
        userId,
        {
          ...profileData,
          updatedAt: new Date().toISOString(),
        }
      );
      return { success: true, profile: updated };
    } else {
      // Créer un nouveau profil
      const created = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.PROFILES,
        userId,
        {
          ...profileData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      );
      return { success: true, profile: created };
    }
  } catch (error) {
    console.error('Erreur profil:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Obtenir le profil utilisateur
 */
export async function getProfile(userId) {
  try {
    const profile = await databases.getDocument(
      DATABASE_ID,
      COLLECTIONS.PROFILES,
      userId
    );
    return { success: true, profile };
  } catch (error) {
    return { success: false, profile: null };
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
    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.WALLETS,
      [
        Query.equal('userId', userId),
        Query.orderDesc('isPrimary'),
      ]
    );
    return { success: true, wallets: response.documents };
  } catch (error) {
    console.error('Erreur wallets:', error);
    return { success: false, wallets: [] };
  }
}

/**
 * Créer un wallet
 */
export async function createWallet(walletData) {
  try {
    const wallet = await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.WALLETS,
      'unique()',
      {
        ...walletData,
        balance: 0,
        status: 'active',
        createdAt: new Date().toISOString(),
      }
    );
    return { success: true, wallet };
  } catch (error) {
    console.error('Erreur création wallet:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Mettre à jour le solde d'un wallet
 */
export async function updateWalletBalance(walletId, newBalance) {
  try {
    const wallet = await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.WALLETS,
      walletId,
      { balance: newBalance, updatedAt: new Date().toISOString() }
    );
    return { success: true, wallet };
  } catch (error) {
    console.error('Erreur mise à jour solde:', error);
    return { success: false, error: error.message };
  }
}

// ============================================
// TRANSACTIONS
// ============================================

/**
 * Créer une transaction
 */
export async function createTransaction(transactionData) {
  try {
    const transaction = await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.TRANSACTIONS,
      'unique()',
      {
        ...transactionData,
        status: 'pending',
        reference: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
      }
    );
    return { success: true, transaction };
  } catch (error) {
    console.error('Erreur création transaction:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Obtenir les transactions de l'utilisateur
 */
export async function getTransactions(userId, limit = 20) {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.TRANSACTIONS,
      [
        Query.equal('userId', userId),
        Query.orderDesc('createdAt'),
        Query.limit(limit),
      ]
    );
    return { success: true, transactions: response.documents };
  } catch (error) {
    console.error('Erreur transactions:', error);
    return { success: false, transactions: [] };
  }
}

// ============================================
// CAGNOTTES (GROUP SAVINGS)
// ============================================

/**
 * Créer une cagnotte
 */
export async function createGroupSaving(savingData) {
  try {
    const code = `OWO-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    
    const saving = await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.GROUP_SAVINGS,
      'unique()',
      {
        ...savingData,
        code,
        currentAmount: 0,
        status: 'active',
        createdAt: new Date().toISOString(),
      }
    );
    
    // Ajouter le créateur comme admin
    await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.GROUP_MEMBERS,
      'unique()',
      {
        groupId: saving.$id,
        userId: savingData.creatorId,
        role: 'admin',
        contributedAmount: 0,
        joinedAt: new Date().toISOString(),
      }
    );
    
    return { success: true, saving };
  } catch (error) {
    console.error('Erreur création cagnotte:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Rejoindre une cagnotte par code
 */
export async function joinGroupSaving(code, userId) {
  try {
    // Trouver la cagnotte
    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.GROUP_SAVINGS,
      [Query.equal('code', code)]
    );
    
    if (response.documents.length === 0) {
      return { success: false, error: 'Cagnotte non trouvée' };
    }
    
    const saving = response.documents[0];
    
    // Vérifier si déjà membre
    const members = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.GROUP_MEMBERS,
      [
        Query.equal('groupId', saving.$id),
        Query.equal('userId', userId),
      ]
    );
    
    if (members.documents.length > 0) {
      return { success: false, error: 'Vous êtes déjà membre de cette cagnotte' };
    }
    
    // Ajouter comme membre
    await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.GROUP_MEMBERS,
      'unique()',
      {
        groupId: saving.$id,
        userId,
        role: 'member',
        contributedAmount: 0,
        joinedAt: new Date().toISOString(),
      }
    );
    
    return { success: true, saving };
  } catch (error) {
    console.error('Erreur rejoindre cagnotte:', error);
    return { success: false, error: error.message };
  }
}

// ============================================
// ÉPARGNE BLOQUÉE
// ============================================

/**
 * Créer une épargne bloquée
 */
export async function createLockedSaving(savingData) {
  try {
    const saving = await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.LOCKED_SAVINGS,
      'unique()',
      {
        ...savingData,
        status: 'locked',
        createdAt: new Date().toISOString(),
      }
    );
    return { success: true, saving };
  } catch (error) {
    console.error('Erreur création épargne:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Débloquer une épargne (urgence)
 */
export async function unlockSaving(savingId, pin) {
  try {
    const saving = await databases.getDocument(
      DATABASE_ID,
      COLLECTIONS.LOCKED_SAVINGS,
      savingId
    );
    
    // Vérifier le PIN (à implémenter avec hash côté serveur)
    // Pour l'instant, vérification simple
    if (saving.emergencyPin !== pin) {
      return { success: false, error: 'PIN incorrect' };
    }
    
    const updated = await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.LOCKED_SAVINGS,
      savingId,
      {
        status: 'unlocked',
        unlockedAt: new Date().toISOString(),
      }
    );
    
    return { success: true, saving: updated };
  } catch (error) {
    console.error('Erreur déblocage:', error);
    return { success: false, error: error.message };
  }
}

// ============================================
// CARTE VIRTUELLE
// ============================================

/**
 * Obtenir la carte virtuelle de l'utilisateur
 */
export async function getVirtualCard(userId) {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.VIRTUAL_CARDS,
      [Query.equal('userId', userId)]
    );
    
    if (response.documents.length === 0) {
      return { success: true, card: null };
    }
    
    return { success: true, card: response.documents[0] };
  } catch (error) {
    console.error('Erreur carte virtuelle:', error);
    return { success: false, card: null };
  }
}

// ============================================
// NOTIFICATIONS
// ============================================

/**
 * Obtenir les notifications
 */
export async function getNotifications(userId, unreadOnly = false) {
  try {
    const queries = [
      Query.equal('userId', userId),
      Query.orderDesc('createdAt'),
      Query.limit(50),
    ];
    
    if (unreadOnly) {
      queries.push(Query.equal('read', false));
    }
    
    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.NOTIFICATIONS,
      queries
    );
    
    return { success: true, notifications: response.documents };
  } catch (error) {
    console.error('Erreur notifications:', error);
    return { success: false, notifications: [] };
  }
}

/**
 * Marquer une notification comme lue
 */
export async function markNotificationRead(notificationId) {
  try {
    await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.NOTIFICATIONS,
      notificationId,
      { read: true, readAt: new Date().toISOString() }
    );
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

// Export du client pour usage avancé
export { client };

// Import Query pour les filtres
import { Query } from 'appwrite';
