import { useState } from "react";
import { Alert } from "react-native";

export function useProfilePreferences(initialProfile) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    initialProfile?.notifications_enabled ?? true,
  );
  const [biometricEnabled, setBiometricEnabled] = useState(
    initialProfile?.biometric_enabled ?? false,
  );
  const [darkModeEnabled, setDarkModeEnabled] = useState(
    initialProfile?.dark_mode_enabled ?? false,
  );

  // Mode démo : mise à jour locale uniquement (pas d'appel API)
  const updatePreference = (key, value) => {
    // Mettre à jour l'état local correspondant
    switch (key) {
      case "notifications_enabled":
        setNotificationsEnabled(value);
        break;
      case "biometric_enabled":
        setBiometricEnabled(value);
        break;
      case "dark_mode_enabled":
        setDarkModeEnabled(value);
        break;
    }
    
    // Feedback visuel
    const labels = {
      notifications_enabled: value ? "Notifications activées" : "Notifications désactivées",
      biometric_enabled: value ? "Biométrie activée" : "Biométrie désactivée",
      dark_mode_enabled: value ? "Mode sombre activé" : "Mode clair activé",
    };
    
    Alert.alert(
      "Préférence mise à jour",
      `${labels[key] || "Paramètre modifié"}\n\n(Mode démo : changement local uniquement)`
    );
  };

  return {
    notificationsEnabled,
    setNotificationsEnabled,
    biometricEnabled,
    setBiometricEnabled,
    darkModeEnabled,
    setDarkModeEnabled,
    updatePreference,
  };
}
