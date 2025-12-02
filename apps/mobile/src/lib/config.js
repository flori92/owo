// ============================================
// CONFIGURATION CENTRALISÉE owo!
// ============================================

// MODE MOCK : false = Firebase réel avec données migrées
export const USE_MOCK = false;

// Clé de session mock (gardée pour compatibilité)
export const MOCK_SESSION_KEY = 'owo_firebase_mock_session';

// Flag pour déclencher la migration des données
// Mettre à true pour migrer les données, puis remettre à false
export const TRIGGER_MIGRATION = true;

// Configuration de l'app
export const APP_CONFIG = {
  name: 'owo!',
  version: '1.0.0',
  environment: __DEV__ ? 'development' : 'production',
};

console.log(`🔧 owo! Config: USE_MOCK=${USE_MOCK}, MIGRATION=${TRIGGER_MIGRATION}`);
