/**
 * Configuration de l'application owo!
 * 
 * Ce fichier centralise la configuration pour basculer entre :
 * - Mode DEMO : données mockées, pas d'appels API
 * - Mode PRODUCTION : appels API réels, authentification requise
 * 
 * Pour passer en production :
 * 1. Définir EXPO_PUBLIC_APP_MODE=production dans .env.local
 * 2. S'assurer que toutes les URLs d'API sont configurées
 * 3. Activer l'authentification réelle dans useAuth.js
 */

// Mode de l'application : 'demo' ou 'production'
export const APP_MODE =
  process.env.EXPO_PUBLIC_APP_MODE || (__DEV__ ? 'demo' : 'production');

// Vérifier si on est en mode démo
export const IS_DEMO_MODE = APP_MODE === 'demo';

// Vérifier si on est en mode production
export const IS_PRODUCTION = APP_MODE === 'production';

// URLs des APIs
export const API_CONFIG = {
  baseUrl: process.env.EXPO_PUBLIC_API_URL || '',
  authUrl: process.env.EXPO_PUBLIC_BASE_URL || 'https://owo-631ab.web.app',
  proxyUrl: process.env.EXPO_PUBLIC_PROXY_BASE_URL || 'https://owo-631ab.web.app',
};

export const LEGAL_CONFIG = {
  privacyPolicyUrl: process.env.EXPO_PUBLIC_PRIVACY_POLICY_URL || '',
  termsUrl: process.env.EXPO_PUBLIC_TERMS_URL || '',
  supportUrl: process.env.EXPO_PUBLIC_SUPPORT_URL || '',
  accountDeletionUrl: process.env.EXPO_PUBLIC_ACCOUNT_DELETION_URL || '',
  supportEmail: process.env.EXPO_PUBLIC_SUPPORT_EMAIL || '',
};

// Configuration des fonctionnalités
export const FEATURES = {
  // Authentification
  requireAuth: IS_PRODUCTION,
  
  // APIs
  useRealApi: IS_PRODUCTION,
  
  // Fonctionnalités disponibles
  groupSavings: true,
  lockedSavings: true,
  virtualCard: true,
  currencyExchange: true,
  mobileMoneyIntegration: true,
  
  // Notifications
  pushNotifications: IS_PRODUCTION,
  
  // Analytics
  analytics: IS_PRODUCTION,
};

// Messages d'avertissement pour le mode démo
export const DEMO_MESSAGES = {
  dataNotPersisted: "(Mode démo : données non persistées)",
  localOnly: "(Mode démo : changement local uniquement)",
  demoPin: "En mode démo, utilisez le PIN: 1234",
};

// Fonction utilitaire pour afficher un message conditionnel
export const getDemoMessage = (key) => {
  if (IS_DEMO_MODE && DEMO_MESSAGES[key]) {
    return `\n\n${DEMO_MESSAGES[key]}`;
  }
  return '';
};

// Log de la configuration au démarrage (utile pour le debug)
if (__DEV__) {
  console.log('🔧 owo! App Config:', {
    mode: APP_MODE,
    isDemo: IS_DEMO_MODE,
    apiBaseUrl: API_CONFIG.baseUrl,
  });
}

export default {
  APP_MODE,
  IS_DEMO_MODE,
  IS_PRODUCTION,
  API_CONFIG,
  LEGAL_CONFIG,
  FEATURES,
  DEMO_MESSAGES,
  getDemoMessage,
};
