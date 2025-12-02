// ============================================
// CONFIGURATION APPWRITE - Initialisation Lazy
// ============================================

// Configuration Appwrite
const APPWRITE_ENDPOINT = process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID || '6915ff850039f714e80a';
const APPWRITE_API_KEY = process.env.EXPO_PUBLIC_APPWRITE_API_KEY;

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

// ============================================
// INITIALISATION LAZY DU SDK APPWRITE
// ============================================

let client = null;
let account = null;
let databases = null;
let storage = null;
let functions = null;
let Query = null;
let appwriteInitialized = false;
let appwriteError = null;

/**
 * Initialise le SDK Appwrite de manière lazy (différée)
 * Cette fonction est appelée uniquement quand on a besoin d'Appwrite
 */
async function initializeAppwrite() {
  if (appwriteInitialized) return { success: !appwriteError, error: appwriteError };
  
  try {
    console.log('🚀 Initialisation Appwrite...');
    
    // Import dynamique du SDK
    const AppwriteSDK = await import('appwrite');
    const { Client, Account, Databases, Storage, Functions, Query: AppwriteQuery } = AppwriteSDK;
    Query = AppwriteQuery;
    
    // Créer le client
    client = new Client();
    client.setEndpoint(APPWRITE_ENDPOINT).setProject(APPWRITE_PROJECT_ID);
    
    // Initialiser les services
    account = new Account(client);
    databases = new Databases(client);
    storage = new Storage(client);
    functions = new Functions(client);
    
    appwriteInitialized = true;
    console.log('✅ Appwrite initialisé avec succès');
    return { success: true };
  } catch (error) {
    console.error('❌ Erreur initialisation Appwrite:', error.message);
    appwriteError = error.message;
    appwriteInitialized = true; // Marquer comme tenté pour éviter de réessayer
    return { success: false, error: error.message };
  }
}

// Export des objets (seront null jusqu'à l'initialisation)
export { client, account, databases, storage, functions, Query, initializeAppwrite };

// ============================================
// SESSION MOCK POUR DÉVELOPPEMENT
// ============================================
import AsyncStorage from '@react-native-async-storage/async-storage';

const MOCK_SESSION_KEY = 'owo_mock_session';
const MOCK_USER_KEY = 'owo_mock_user';

// Utilisateur mock par défaut
const DEFAULT_MOCK_USER = {
  $id: 'mock_user_floriace',
  email: 'florifavi@gmail.com',
  name: 'Floriace FAVI',
  $createdAt: new Date().toISOString(),
  phone: '+229 97 00 00 00',
  emailVerification: true,
  phoneVerification: true,
};

// Stocker la session mock
async function setMockSession(user) {
  try {
    await AsyncStorage.setItem(MOCK_USER_KEY, JSON.stringify(user));
    await AsyncStorage.setItem(MOCK_SESSION_KEY, 'active');
    console.log('🔧 MODE DÉV : Session mock sauvegardée');
  } catch (error) {
    console.error('Erreur sauvegarde session mock:', error);
  }
}

// Récupérer la session mock
async function getMockSession() {
  try {
    const session = await AsyncStorage.getItem(MOCK_SESSION_KEY);
    const userStr = await AsyncStorage.getItem(MOCK_USER_KEY);
    if (session === 'active' && userStr) {
      return JSON.parse(userStr);
    }
    return null;
  } catch (error) {
    console.error('Erreur récupération session mock:', error);
    return null;
  }
}

// Effacer la session mock
async function clearMockSession() {
  try {
    await AsyncStorage.removeItem(MOCK_SESSION_KEY);
    await AsyncStorage.removeItem(MOCK_USER_KEY);
    console.log('🔧 MODE DÉV : Session mock effacée');
  } catch (error) {
    console.error('Erreur effacement session mock:', error);
  }
}

// ============================================
// AUTHENTIFICATION
// ============================================

/**
 * Créer un compte avec email et mot de passe
 */
export async function createAccount(email, password, name) {
  // MODE DÉVELOPPEMENT : Mock authentification
  if (__DEV__) {
    console.log('🔧 MODE DÉV : Création compte mock pour', email);
    
    // Simuler un délai réseau
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockUser = {
      $id: 'mock_user_' + Date.now(),
      email: email,
      name: name,
      $createdAt: new Date().toISOString()
    };
    
    return { success: true, user: mockUser };
  }
  
  // MODE PRODUCTION : Code Appwrite avec initialisation lazy
  try {
    // Initialiser Appwrite si nécessaire
    const initResult = await initializeAppwrite();
    if (!initResult.success) {
      return { success: false, error: 'Appwrite non disponible: ' + initResult.error };
    }
    
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
  // MODE DÉVELOPPEMENT : Mock connexion avec persistance
  if (__DEV__) {
    console.log('🔧 MODE DÉV : Connexion mock pour', email);
    
    // Simuler un délai réseau
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Créer un utilisateur mock basé sur l'email
    const mockUser = {
      $id: 'mock_user_' + Date.now(),
      email: email,
      name: email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      $createdAt: new Date().toISOString(),
      phone: '+229 97 00 00 00',
      emailVerification: true,
      phoneVerification: true,
    };
    
    // Sauvegarder la session mock
    await setMockSession(mockUser);
    
    const mockSession = {
      $id: 'mock_session_' + Date.now(),
      userId: mockUser.$id,
      $createdAt: new Date().toISOString(),
      $expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    };
    
    return { success: true, session: mockSession };
  }
  
  // MODE PRODUCTION : Code Appwrite avec initialisation lazy
  try {
    const initResult = await initializeAppwrite();
    if (!initResult.success) {
      return { success: false, error: 'Appwrite non disponible: ' + initResult.error };
    }
    
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
  // MODE DÉVELOPPEMENT : Effacer la session mock
  if (__DEV__) {
    console.log('🔧 MODE DÉV : Déconnexion mock');
    await clearMockSession();
    return { success: true };
  }
  
  // MODE PRODUCTION : Code Appwrite original
  try {
    await account.deleteSession('current');
    return { success: true };
  } catch (error) {
    console.error('Erreur déconnexion:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Connexion avec Google OAuth
 */
export async function loginWithGoogle() {
  try {
    // Utiliser le navigateur pour l'authentification OAuth
    const session = await account.createOAuth2Session(
      'google',
      'https://fra.cloud.appwrite.io/v1/account/sessions/oauth2/callback/google',
      'owo://auth'
    );
    return { success: true, session };
  } catch (error) {
    console.error('Erreur connexion Google:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Connexion avec Apple OAuth
 */
export async function loginWithApple() {
  try {
    const session = await account.createOAuth2Session(
      'apple',
      'https://fra.cloud.appwrite.io/v1/account/sessions/oauth2/callback/apple',
      'owo://auth'
    );
    return { success: true, session };
  } catch (error) {
    console.error('Erreur connexion Apple:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Lier un compte Google à un utilisateur existant
 */
export async function linkGoogleAccount() {
  try {
    const session = await account.createOAuth2Session(
      'google',
      'https://fra.cloud.appwrite.io/v1/account/sessions/oauth2/callback/google',
      'owo://auth'
    );
    return { success: true, session };
  } catch (error) {
    console.error('Erreur liaison Google:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Lier un compte Apple à un utilisateur existant
 */
export async function linkAppleAccount() {
  try {
    const session = await account.createOAuth2Session(
      'apple',
      'https://fra.cloud.appwrite.io/v1/account/sessions/oauth2/callback/apple',
      'owo://auth'
    );
    return { success: true, session };
  } catch (error) {
    console.error('Erreur liaison Apple:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Obtenir l'utilisateur connecté
 */
export async function getCurrentUser() {
  // MODE DÉVELOPPEMENT : Récupérer la session mock persistante
  if (__DEV__) {
    const mockUser = await getMockSession();
    if (mockUser) {
      console.log('🔧 MODE DÉV : Utilisateur mock récupéré:', mockUser.email);
      return { success: true, user: mockUser };
    }
    console.log('🔧 MODE DÉV : Aucune session mock - utilisateur non connecté');
    return { success: false, user: null };
  }
  
  // MODE PRODUCTION : Code Appwrite original
  try {
    if (!account) {
      console.log('⚠️ Appwrite account not initialized');
      return { success: false, user: null };
    }
    const user = await account.get();
    return { success: true, user };
  } catch (error) {
    // Ne pas logger l'erreur si l'utilisateur n'est simplement pas connecté
    if (error.code !== 401) {
      console.error('❌ Erreur getCurrentUser:', error.message);
    }
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
  // MODE DÉVELOPPEMENT : Retourner un profil mock
  if (__DEV__) {
    console.log('🔧 MODE DÉV : Profil mock pour userId:', userId);
    const mockProfile = {
      $id: userId,
      userId: userId,
      email: 'florifavi@gmail.com',
      fullName: 'Floriace FAVI',
      phone: '+229 97 00 00 00',
      avatar: null,
      country: 'Bénin',
      city: 'Cotonou',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return { success: true, profile: mockProfile };
  }
  
  // MODE PRODUCTION : Code Appwrite original
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
  // MODE DÉVELOPPEMENT : Retourner des wallets mock
  if (__DEV__) {
    console.log('🔧 MODE DÉV : Wallets mock pour userId:', userId);
    const mockWallets = [
      {
        $id: 'wallet_mtn_1',
        userId: userId,
        type: 'mobile_money',
        provider: 'MTN Mobile Money',
        phoneNumber: '+229 97 00 00 00',
        balance: 125000,
        currency: 'XOF',
        status: 'active',
        isPrimary: true,
        createdAt: new Date().toISOString(),
      },
      {
        $id: 'wallet_moov_1',
        userId: userId,
        type: 'mobile_money',
        provider: 'Moov Money',
        phoneNumber: '+229 96 00 00 00',
        balance: 45000,
        currency: 'XOF',
        status: 'active',
        isPrimary: false,
        createdAt: new Date().toISOString(),
      },
      {
        $id: 'wallet_wave_1',
        userId: userId,
        type: 'mobile_money',
        provider: 'Wave',
        phoneNumber: '+229 95 00 00 00',
        balance: 78500,
        currency: 'XOF',
        status: 'active',
        isPrimary: false,
        createdAt: new Date().toISOString(),
      },
    ];
    return { success: true, wallets: mockWallets };
  }
  
  // MODE PRODUCTION : Code Appwrite avec initialisation lazy
  try {
    const initResult = await initializeAppwrite();
    if (!initResult.success) {
      return { success: false, wallets: [], error: initResult.error };
    }
    
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
  // MODE DÉVELOPPEMENT : Retourner des transactions mock
  if (__DEV__) {
    console.log('🔧 MODE DÉV : Transactions mock pour userId:', userId);
    const mockTransactions = [
      {
        $id: 'tx_1',
        userId: userId,
        type: 'receive',
        amount: 25000,
        currency: 'XOF',
        description: 'Paiement reçu de Kofi A.',
        status: 'completed',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        $id: 'tx_2',
        userId: userId,
        type: 'send',
        amount: 15000,
        currency: 'XOF',
        description: 'Envoi à Ama B.',
        status: 'completed',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        $id: 'tx_3',
        userId: userId,
        type: 'receive',
        amount: 50000,
        currency: 'XOF',
        description: 'Salaire mensuel',
        status: 'completed',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        $id: 'tx_4',
        userId: userId,
        type: 'send',
        amount: 8000,
        currency: 'XOF',
        description: 'Achat marché',
        status: 'completed',
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];
    return { success: true, transactions: mockTransactions.slice(0, limit) };
  }
  
  // MODE PRODUCTION : Code Appwrite original
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
  // MODE DÉVELOPPEMENT : Retourner des notifications mock
  if (__DEV__) {
    console.log('🔧 MODE DÉV : Notifications mock pour userId:', userId);
    const mockNotifications = [
      {
        $id: 'notif_1',
        userId: userId,
        title: 'Paiement reçu',
        message: 'Vous avez reçu 25,000 FCFA de Kofi A.',
        type: 'payment',
        read: false,
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      },
      {
        $id: 'notif_2',
        userId: userId,
        title: 'Transfert effectué',
        message: 'Votre transfert de 15,000 FCFA a été envoyé.',
        type: 'transfer',
        read: true,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
      {
        $id: 'notif_3',
        userId: userId,
        title: 'Bienvenue sur owo!',
        message: 'Votre compte a été créé avec succès.',
        type: 'system',
        read: true,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      },
    ];
    
    if (unreadOnly) {
      return { success: true, notifications: mockNotifications.filter(n => !n.read) };
    }
    return { success: true, notifications: mockNotifications };
  }
  
  // MODE PRODUCTION : Code Appwrite original
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

// Query sera initialisé dynamiquement avec le SDK
// Utilisé dans les fonctions qui appellent initializeAppwrite() d'abord
