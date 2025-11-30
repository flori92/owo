import { useColorScheme } from "react-native";

export const useTheme = () => {
  const colorScheme = useColorScheme();

  const theme = {
    isDark: colorScheme === "dark",
    colors: {
      // === IDENTITÉ VISUELLE OWO! ===
      // Couleurs principales - Afro-futurisme financier
      primary: "#20B2AA", // Lagon Numérique - Turquoise vif
      primaryLight: "#48D1CC", // Turquoise plus clair
      primaryDark: "#008B8B", // Turquoise foncé pour contraste

      // Accent Owo! - Soleil d'Or
      accent: "#DAA520", // Or chaud principal
      gold: "#FFD700", // Or pur pour étincelles et highlights
      goldenSpark: "#FFA500", // Orange doré pour animations

      // Background colors avec identité Owo!
      background: colorScheme === "dark" ? "#0F1419" : "#FFFFFF",
      surface: colorScheme === "dark" ? "#1A2332" : "#FFFFFF",
      elevated: colorScheme === "dark" ? "#243447" : "#F8FFFE", // Blanc teinté turquoise

      // Text colors
      text: colorScheme === "dark" ? "#FFFFFF" : "#1A202C",
      textSecondary:
        colorScheme === "dark" ? "rgba(255, 255, 255, 0.7)" : "#4A5568",
      textTertiary:
        colorScheme === "dark" ? "rgba(255, 255, 255, 0.5)" : "#718096",

      // Border colors
      border: colorScheme === "dark" ? "#334155" : "#E2E8F0",
      borderLight: colorScheme === "dark" ? "#1E293B" : "#F1F5F9",
      divider: colorScheme === "dark" ? "#334155" : "#EDF2F7",

      // Button colors avec style Owo!
      buttonBackground: colorScheme === "dark" ? "#243447" : "#F7FAFC",
      buttonText: colorScheme === "dark" ? "#FFFFFF" : "#1A202C",
      buttonPress:
        colorScheme === "dark"
          ? "rgba(72, 209, 204, 0.2)"
          : "rgba(32, 178, 170, 0.1)",

      // Card backgrounds
      cardBackground: colorScheme === "dark" ? "#1A2332" : "#FFFFFF",

      // Status bar
      statusBar: colorScheme === "dark" ? "light" : "dark",

      // Tab bar avec couleurs Owo!
      tabBarBackground: colorScheme === "dark" ? "#0F1419" : "#FFFFFF",
      tabBarBorder: colorScheme === "dark" ? "#243447" : "#E5E7EB",
      tabBarActive: colorScheme === "dark" ? "#20B2AA" : "#20B2AA", // Turquoise Owo!
      tabBarInactive:
        colorScheme === "dark" ? "rgba(255, 255, 255, 0.6)" : "#6B6B6B",

      // Status colors avec palette Owo!
      success: "#20B2AA", // Utilise le turquoise Owo! pour succès
      error: "#FF6B6B",
      warning: "#DAA520", // Utilise l'or Owo! pour warnings

      // Mobile Money colors authentiques
      mobileMoneyOrange: "#FFB020", // MTN Orange officiel
      mobileMoneyGreen: "#00A651", // Celtiis Vert officiel
      mobileMoneyBlue: "#0066CC", // Moov Bleu officiel

      // Category colors avec palette Owo!
      categoryFood: "#DAA520", // Or pour nourriture
      categoryTransport: "#48D1CC", // Turquoise clair pour transport
      categoryShopping: "#20B2AA", // Turquoise principal pour shopping
      categoryUtilities: "#008B8B", // Turquoise foncé pour utilities
      categoryEntertainment: "#FFD700", // Or pur pour divertissement
      categoryIncome: "#20B2AA", // Turquoise pour revenus
      categoryOther: "#87CEEB", // Bleu ciel pour autres

      // Notification colors
      notification: colorScheme === "dark" ? "#FF6B6B" : "#E04444",
      notificationDot: "#FF6B6B",

      // Disabled states
      disabled: colorScheme === "dark" ? "#334155" : "#E6E6E6",
      disabledText:
        colorScheme === "dark" ? "rgba(255, 255, 255, 0.3)" : "#9A9A9A",

      // Couleurs spéciales Owo! pour animations et effets
      splashGlow: "rgba(32, 178, 170, 0.4)", // Pour animations splash
      goldGlow: "rgba(218, 165, 32, 0.3)", // Pour effets dorés
      shadowColor: colorScheme === "dark" ? "#000000" : "#20B2AA", // Ombres turquoise en mode clair
    },

    // Animation settings pour l'identité Owo!
    animation: {
      duration: {
        fast: 200,
        normal: 300,
        slow: 500,
        splash: 2000, // Durée animation splash screen
      },
      easing: {
        standard: "cubic-bezier(0.4, 0.0, 0.2, 1)",
        bounce: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
        owo: "cubic-bezier(0.25, 0.46, 0.45, 0.94)", // Easing signature Owo!
      },
    },
  };

  return theme;
};
