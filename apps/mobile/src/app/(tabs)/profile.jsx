import React, { useState, useEffect } from "react";
import { ScrollView, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from "@expo-google-fonts/inter";
import { router } from "expo-router";
import { useTheme } from "@/utils/useTheme";
import { useAuth } from "@/utils/auth/useAuth";
import useUser from "@/utils/auth/useUser";
import ScreenContainer from "@/components/ScreenContainer";
import LoadingScreen from "@/components/LoadingScreen";
import { useProfile } from "@/hooks/useProfile";
import { useLanguages } from "@/hooks/useLanguages";
import { useProfilePreferences } from "@/hooks/useProfilePreferences";
import { useProfileForm } from "@/hooks/useProfileForm";
import { ProfileHeader } from "@/components/Profile/ProfileHeader";
import { UserInfoCard } from "@/components/Profile/UserInfoCard";
import { MenuSection } from "@/components/Profile/MenuSection";
import { LogoutButton } from "@/components/Profile/LogoutButton";
import { AppVersion } from "@/components/Profile/AppVersion";
import { EditProfileModal } from "@/components/Profile/EditProfileModal";
import { LanguageModal } from "@/components/Profile/LanguageModal";
import { getMenuSections } from "@/utils/profileMenuConfig";

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { signOut } = useAuth();
  const { data: user, loading: userLoading, refetch: refetchUser } = useUser();
  const theme = useTheme();

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  // Modal states
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [languageModalVisible, setLanguageModalVisible] = useState(false);

  // Custom hooks
  const {
    userProfile,
    loading,
    refetch: refetchProfile,
  } = useProfile(user?.id);
  const {
    supportedLanguages,
    currentLanguage,
    setCurrentLanguage,
    updateLanguage,
  } = useLanguages();

  const {
    notificationsEnabled,
    setNotificationsEnabled,
    biometricEnabled,
    setBiometricEnabled,
    darkModeEnabled,
    setDarkModeEnabled,
    updatePreference,
  } = useProfilePreferences(userProfile);

  const formData = useProfileForm(userProfile, user, () => {
    setEditModalVisible(false);
    refetchProfile();
    refetchUser();
  });

  // Update form data when profile loads
  useEffect(() => {
    if (userProfile) {
      formData.setFormData(userProfile, user);
    }
  }, [userProfile, user]);

  // Update language when profile loads
  useEffect(() => {
    if (userProfile?.language_code) {
      setCurrentLanguage(userProfile.language_code);
    }
  }, [userProfile?.language_code]);

  const handleLogout = () => {
    Alert.alert("Déconnexion", "Êtes-vous sûr de vouloir vous déconnecter ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Se déconnecter",
        style: "destructive",
        onPress: async () => {
          try {
            await signOut();
            router.replace("/account/signin");
          } catch (error) {
            console.error("Erreur déconnexion:", error);
            Alert.alert("Erreur", "Impossible de se déconnecter");
          }
        },
      },
    ]);
  };

  const handleSaveProfile = async () => {
    const success = await formData.updateProfile({
      notifications_enabled: notificationsEnabled,
      biometric_enabled: biometricEnabled,
      dark_mode_enabled: darkModeEnabled,
    });
  };

  const handleSelectLanguage = async (languageCode) => {
    const success = await updateLanguage(languageCode);
    if (success) {
      setLanguageModalVisible(false);
    }
  };

  // Mock stats - en production, ces données viendraient des APIs
  const userData = {
    totalSavings: 66250,
    goalProgress: 66,
    mobileMoneyAccounts: 3,
    joinDate: "Novembre 2024",
  };

  const menuSections = getMenuSections({
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
  });

  // Étape 1 : on n'empêche pas l'affichage du profil si les données backend
  // ne sont pas encore disponibles. On se contente d'attendre les fontes.
  if (!fontsLoaded) {
    return <LoadingScreen />;
  }

  return (
    <ScreenContainer>
      <ProfileHeader theme={theme} />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingVertical: 20,
          paddingBottom: insets.bottom + 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        <UserInfoCard
          userProfile={userProfile}
          user={user}
          userData={userData}
          theme={theme}
          onEditPress={() => setEditModalVisible(true)}
        />

        {menuSections.map((section) => (
          <MenuSection key={section.title} section={section} theme={theme} />
        ))}

        <LogoutButton theme={theme} onPress={handleLogout} />

        <AppVersion theme={theme} />
      </ScrollView>

      <EditProfileModal
        visible={editModalVisible}
        onClose={() => setEditModalVisible(false)}
        theme={theme}
        formData={formData}
        onSave={handleSaveProfile}
        saving={formData.saving}
      />

      <LanguageModal
        visible={languageModalVisible}
        onClose={() => setLanguageModalVisible(false)}
        theme={theme}
        supportedLanguages={supportedLanguages}
        currentLanguage={currentLanguage}
        onSelectLanguage={handleSelectLanguage}
      />
    </ScreenContainer>
  );
}
