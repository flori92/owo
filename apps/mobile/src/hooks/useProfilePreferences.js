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

  const updatePreference = async (key, value) => {
    try {
      const response = await fetch("/api/user-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: value }),
      });

      if (response.ok) {
        Alert.alert("Succès", "Préférence mise à jour");
      }
    } catch (error) {
      console.error("Erreur mise à jour préférence:", error);
    }
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
