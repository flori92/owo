import { useState } from "react";
import { Alert } from "react-native";

// Mode démo offline : langues supportées en dur
const DEMO_LANGUAGES = [
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "wo", name: "Wolof", flag: "🇸🇳" },
  { code: "bm", name: "Bambara", flag: "🇲🇱" },
];

export function useLanguages() {
  const [supportedLanguages] = useState(DEMO_LANGUAGES);
  const [currentLanguage, setCurrentLanguage] = useState("fr");

  // Mode démo : mise à jour locale uniquement
  const updateLanguage = (languageCode) => {
    const language = DEMO_LANGUAGES.find((l) => l.code === languageCode);
    if (language) {
      setCurrentLanguage(languageCode);
      Alert.alert(
        "Langue mise à jour",
        `Interface en ${language.name}\n\n(Mode démo : changement local uniquement)`
      );
      return true;
    }
    return false;
  };

  return {
    supportedLanguages,
    currentLanguage,
    setCurrentLanguage,
    updateLanguage,
  };
}
