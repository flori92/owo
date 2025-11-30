import {
  User,
  Bell,
  Shield,
  Smartphone,
  HelpCircle,
  MessageCircle,
  Star,
  Moon,
  Globe,
  Users,
  Lock,
} from "lucide-react-native";

export function getMenuSections({
  router,
  userData,
  notificationsEnabled,
  setNotificationsEnabled,
  biometricEnabled,
  setBiometricEnabled,
  darkModeEnabled,
  setDarkModeEnabled,
  currentLanguage,
  supportedLanguages,
  updatePreference,
  setEditModalVisible,
  setLanguageModalVisible,
}) {
  return [
    {
      title: "Compte",
      items: [
        {
          id: "edit-profile",
          title: "Informations personnelles",
          subtitle: "Nom, email, téléphone",
          icon: User,
          onPress: () => setEditModalVisible(true),
        },
        {
          id: "mobile-money",
          title: "Comptes Mobile Money",
          subtitle: `${userData.mobileMoneyAccounts} comptes connectés`,
          icon: Smartphone,
          onPress: () => router.push("/payment-integration"),
        },
        {
          id: "group-savings",
          title: "Cagnottes collaboratives",
          subtitle: "Épargner avec vos amis",
          icon: Users,
          onPress: () => router.push("/group-savings"),
        },
        {
          id: "locked-savings",
          title: "Épargnes bloquées",
          subtitle: "Épargne sécurisée avec dates",
          icon: Lock,
          onPress: () => router.push("/locked-savings"),
        },
      ],
    },
    {
      title: "Préférences",
      items: [
        {
          id: "notifications",
          title: "Notifications",
          subtitle: "Alertes et rappels",
          icon: Bell,
          hasSwitch: true,
          switchValue: notificationsEnabled,
          onSwitchChange: (value) => {
            setNotificationsEnabled(value);
            updatePreference("notifications_enabled", value);
          },
        },
        {
          id: "biometric",
          title: "Authentification biométrique",
          subtitle: "Empreinte digitale / Face ID",
          icon: Shield,
          hasSwitch: true,
          switchValue: biometricEnabled,
          onSwitchChange: (value) => {
            setBiometricEnabled(value);
            updatePreference("biometric_enabled", value);
          },
        },
        {
          id: "dark-mode",
          title: "Mode sombre",
          subtitle: "Apparence de l'application",
          icon: Moon,
          hasSwitch: true,
          switchValue: darkModeEnabled,
          onSwitchChange: (value) => {
            setDarkModeEnabled(value);
            updatePreference("dark_mode_enabled", value);
          },
        },
        {
          id: "language",
          title: "Langue",
          subtitle:
            supportedLanguages.find((l) => l.code === currentLanguage)
              ?.nativeName || "Français",
          icon: Globe,
          onPress: () => setLanguageModalVisible(true),
        },
      ],
    },
    {
      title: "Support",
      items: [
        {
          id: "help",
          title: "Centre d'aide",
          subtitle: "FAQ et guides",
          icon: HelpCircle,
          onPress: () => router.push("/help"),
        },
        {
          id: "feedback",
          title: "Donner son avis",
          subtitle: "Partagez vos suggestions",
          icon: MessageCircle,
          onPress: () => router.push("/feedback"),
        },
        {
          id: "rate",
          title: "Noter l'application",
          subtitle: "Aidez-nous à nous améliorer",
          icon: Star,
          onPress: () => {
            const { Alert } = require("react-native");
            Alert.alert("Merci!", "Redirection vers l'App Store...");
          },
        },
      ],
    },
  ];
}
