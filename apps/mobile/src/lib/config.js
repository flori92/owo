// ============================================
// CONFIGURATION CENTRALISÉE owo!
// ============================================

// Configuration de l'app
export const APP_CONFIG = {
  name: 'owo!',
  version: '1.0.0',
  environment: __DEV__ ? 'development' : 'production',
};

// Flag pour déclencher la migration des données de démo vers Firebase
// Quand il est à true, l'écran Home appelle migrateDataToFirestore() une fois
export const TRIGGER_MIGRATION =
  __DEV__ && process.env.EXPO_PUBLIC_ENABLE_DEMO_MIGRATION === 'true';
