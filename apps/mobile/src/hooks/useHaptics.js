import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/**
 * Hook pour gérer le feedback haptique de manière cohérente dans l'app
 */
export function useHaptics() {
  const isSupported = Platform.OS !== 'web';

  // Feedback léger - pour les sélections, toggles
  const light = () => {
    if (isSupported) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  // Feedback moyen - pour les boutons, actions
  const medium = () => {
    if (isSupported) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  // Feedback fort - pour les confirmations importantes
  const heavy = () => {
    if (isSupported) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
  };

  // Feedback de succès - pour les actions réussies
  const success = () => {
    if (isSupported) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  // Feedback d'erreur - pour les erreurs
  const error = () => {
    if (isSupported) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  // Feedback d'avertissement
  const warning = () => {
    if (isSupported) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
  };

  // Sélection - pour les pickers, listes
  const selection = () => {
    if (isSupported) {
      Haptics.selectionAsync();
    }
  };

  return {
    light,
    medium,
    heavy,
    success,
    error,
    warning,
    selection,
    isSupported,
  };
}

export default useHaptics;
