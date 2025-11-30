import { useState, useEffect } from "react";
import { Alert } from "react-native";

export function useLanguages() {
  const [supportedLanguages, setSupportedLanguages] = useState([]);
  const [currentLanguage, setCurrentLanguage] = useState("fr");

  const loadLanguages = async () => {
    try {
      const response = await fetch("/api/languages?type=supported");
      if (response.ok) {
        const data = await response.json();
        setSupportedLanguages(data.languages || []);
      }
    } catch (error) {
      console.error("Erreur chargement langues:", error);
    }
  };

  const updateLanguage = async (languageCode) => {
    try {
      const response = await fetch("/api/languages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language_code: languageCode }),
      });

      if (response.ok) {
        setCurrentLanguage(languageCode);
        Alert.alert("Succès", "Langue mise à jour");
        return true;
      } else {
        Alert.alert("Erreur", "Impossible de changer la langue");
        return false;
      }
    } catch (error) {
      console.error("Erreur mise à jour langue:", error);
      Alert.alert("Erreur", "Erreur réseau");
      return false;
    }
  };

  useEffect(() => {
    loadLanguages();
  }, []);

  return {
    supportedLanguages,
    currentLanguage,
    setCurrentLanguage,
    updateLanguage,
  };
}
