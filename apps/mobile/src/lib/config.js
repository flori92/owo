// ============================================
// CONFIGURATION CENTRALISÉE owo!
// ============================================

// MODE MOCK : Mettre à false pour utiliser Firebase réel
// Quand Firebase API sera débloquée, changez cette valeur
export const USE_MOCK = true;

// Clé de session mock
export const MOCK_SESSION_KEY = 'owo_firebase_mock_session';

// Configuration de l'app
export const APP_CONFIG = {
  name: 'owo!',
  version: '1.0.0',
  environment: __DEV__ ? 'development' : 'production',
};

console.log(`🔧 owo! Config: USE_MOCK=${USE_MOCK}, ENV=${APP_CONFIG.environment}`);
