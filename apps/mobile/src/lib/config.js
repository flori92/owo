// ============================================
// CONFIGURATION CENTRALISÉE owo!
// ============================================

// MODE MOCK : true pour Expo Go, false pour production Firebase
// ⚠️ Passer à false quand Firebase sera configuré avec les vrais tokens
export const USE_MOCK = false;

// Clé de session mock (gardée pour compatibilité)
export const MOCK_SESSION_KEY = 'owo_firebase_mock_session';

// Flag pour déclencher la migration des données
// Migration effectuée le 2025-12-02 pour Floriace FAVI
export const TRIGGER_MIGRATION = false;

// ID utilisateur mock pour Floriace FAVI
// Utilisé pour lier les données mockées à un profil spécifique
export const MOCK_USER_ID = 'floriace_favi_mock_uid';

// Configuration de l'app
export const APP_CONFIG = {
  name: 'owo!',
  version: '1.0.0',
  environment: __DEV__ ? 'development' : 'production',
};

console.log(`🔧 owo! Config: USE_MOCK=${USE_MOCK}, MIGRATION=${TRIGGER_MIGRATION}`);
