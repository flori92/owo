// ============================================
// CONFIGURATION CENTRALISÉE owo!
// ============================================

// MODE MOCK : true = données fictives, false = Firebase réel
// Auth Firebase fonctionne, mais Firestore est vide donc on garde mock pour les données
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
