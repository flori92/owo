import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import { router } from "expo-router";
import { useTheme } from "@/utils/useTheme";
import { useAppwriteAuth } from "@/hooks/useAppwrite";
import ScreenContainer from "@/components/ScreenContainer";
import LoadingScreen from "@/components/LoadingScreen";
import HeaderBar from "@/components/HeaderBar";
import ActionButton from "@/components/ActionButton";
import { SocialAuthButton, SocialAuthDivider } from "@/components/SocialAuthButton";
import { OwoIcon, OwoTextIcon } from "@/components/icons/OwoIcon";

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const { login, loginWithGoogle, loginWithApple, loading } = useAppwriteAuth();

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await login(email, password);
      
      if (result.success) {
        Alert.alert(
          "Succès",
          "Connexion réussie!",
          [
            {
              text: "OK",
              onPress: () => {
                router.replace("/(tabs)/");
              },
            },
          ]
        );
      } else {
        Alert.alert("Erreur", result.error || "Échec de la connexion");
      }
    } catch (error) {
      console.error("Login error:", error);
      Alert.alert("Erreur", "Impossible de se connecter. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickLogin = () => {
    setEmail("florifavi@gmail.com");
    setPassword("OwoApp2024!");
  };

  const handleGoogleLogin = async () => {
    setIsSubmitting(true);
    try {
      const result = await loginWithGoogle();
      if (result.success) {
        Alert.alert(
          "Succès",
          "Connexion Google réussie!",
          [
            {
              text: "OK",
              onPress: () => {
                router.replace("/(tabs)/");
              },
            },
          ]
        );
      } else {
        Alert.alert("Erreur", result.error || "Échec de la connexion Google");
      }
    } catch (error) {
      console.error("Google login error:", error);
      Alert.alert("Erreur", "Impossible de se connecter avec Google. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAppleLogin = async () => {
    setIsSubmitting(true);
    try {
      const result = await loginWithApple();
      if (result.success) {
        Alert.alert(
          "Succès",
          "Connexion Apple réussie!",
          [
            {
              text: "OK",
              onPress: () => {
                router.replace("/(tabs)/");
              },
            },
          ]
        );
      } else {
        Alert.alert("Erreur", result.error || "Échec de la connexion Apple");
      }
    } catch (error) {
      console.error("Apple login error:", error);
      Alert.alert("Erreur", "Impossible de se connecter avec Apple. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!fontsLoaded) {
    return <LoadingScreen />;
  }

  return (
    <ScreenContainer>
      <HeaderBar title="Connexion" showBack={false} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 24,
            paddingVertical: 32,
            paddingBottom: insets.bottom + 100,
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Logo/Title */}
          <View style={{ alignItems: "center", marginBottom: 48 }}>
            <OwoIcon size={80} />
            <Text
              style={{
                fontFamily: "Inter_700Bold",
                fontSize: 24,
                color: theme.colors.primary,
                marginTop: 16,
              }}
            >
              owo!
            </Text>
            <Text
              style={{
                fontFamily: "Inter_400Regular",
                fontSize: 14,
                color: theme.colors.textSecondary,
                marginTop: 4,
              }}
            >
              Votre finance, simplifiée
            </Text>
          </View>

          {/* Quick Login Button */}
          <TouchableOpacity
            onPress={handleQuickLogin}
            style={{
              backgroundColor: `${theme.colors.primary}20`,
              borderRadius: 12,
              padding: 16,
              marginBottom: 24,
              borderWidth: 1,
              borderColor: theme.colors.primary,
            }}
          >
            <Text
              style={{
                fontFamily: "Inter_500Medium",
                fontSize: 14,
                color: theme.colors.primary,
                textAlign: "center",
              }}
            >
              🚀 Connexion rapide (Floriace FAVI)
            </Text>
          </TouchableOpacity>

          {/* Email Input */}
          <View style={{ marginBottom: 20 }}>
            <Text
              style={{
                fontFamily: "Inter_600SemiBold",
                fontSize: 16,
                color: theme.colors.text,
                marginBottom: 8,
              }}
            >
              Email
            </Text>
            <TextInput
              style={{
                backgroundColor: theme.colors.elevated,
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 16,
                fontSize: 16,
                color: theme.colors.text,
                fontFamily: "Inter_400Regular",
                borderWidth: 1,
                borderColor: theme.colors.border,
              }}
              placeholder="votre@email.com"
              placeholderTextColor={theme.colors.textSecondary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
          </View>

          {/* Password Input */}
          <View style={{ marginBottom: 32 }}>
            <Text
              style={{
                fontFamily: "Inter_600SemiBold",
                fontSize: 16,
                color: theme.colors.text,
                marginBottom: 8,
              }}
            >
              Mot de passe
            </Text>
            <View style={{ position: "relative" }}>
              <TextInput
                style={{
                  backgroundColor: theme.colors.elevated,
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 16,
                  fontSize: 16,
                  color: theme.colors.text,
                  fontFamily: "Inter_400Regular",
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                }}
                placeholder="••••••••"
                placeholderTextColor={theme.colors.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoComplete="password"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: 16,
                  top: 16,
                  padding: 4,
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    color: theme.colors.primary,
                    fontFamily: "Inter_500Medium",
                  }}
                >
                  {showPassword ? "Cacher" : "Voir"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Forgot Password */}
          <TouchableOpacity
            style={{ marginBottom: 32 }}
            onPress={() => {
              Alert.alert("Info", "Fonctionnalité de réinitialisation bientôt disponible");
            }}
          >
            <Text
              style={{
                fontFamily: "Inter_500Medium",
                fontSize: 14,
                color: theme.colors.primary,
                textAlign: "center",
              }}
            >
              Mot de passe oublié ?
            </Text>
          </TouchableOpacity>

          {/* Login Button */}
          <ActionButton
            title={isSubmitting ? "Connexion..." : "Se connecter"}
            onPress={handleLogin}
            disabled={isSubmitting || loading || !email || !password}
          />

          {/* Social Login Divider */}
          <SocialAuthDivider />

          {/* Social Login Buttons */}
          <View style={{ flexDirection: "row", gap: 12, marginBottom: 24 }}>
            <SocialAuthButton
              provider="google"
              onPress={handleGoogleLogin}
              disabled={isSubmitting}
              loading={isSubmitting && email === ""}
            />
            
            <SocialAuthButton
              provider="apple"
              onPress={handleAppleLogin}
              disabled={isSubmitting}
              loading={isSubmitting && email === ""}
            />
          </View>

          {/* Sign Up Link */}
          <View style={{ flexDirection: "row", justifyContent: "center", marginTop: 24 }}>
            <Text
              style={{
                fontFamily: "Inter_400Regular",
                fontSize: 14,
                color: theme.colors.textSecondary,
              }}
            >
              Pas encore de compte ?{" "}
            </Text>
            <TouchableOpacity onPress={() => router.push("/auth/register")}>
              <Text
                style={{
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 14,
                  color: theme.colors.primary,
                }}
              >
                S'inscrire
              </Text>
            </TouchableOpacity>
          </View>

          {/* Test Account Info */}
          <View
            style={{
              backgroundColor: `${theme.colors.warning}20`,
              borderRadius: 12,
              padding: 16,
              marginTop: 32,
              borderWidth: 1,
              borderColor: theme.colors.warning,
            }}
          >
            <Text
              style={{
                fontFamily: "Inter_600SemiBold",
                fontSize: 14,
                color: theme.colors.warning,
                marginBottom: 8,
              }}
            >
              📱 Compte de test disponible
            </Text>
            <Text
              style={{
                fontFamily: "Inter_400Regular",
                fontSize: 12,
                color: theme.colors.text,
                lineHeight: 18,
              }}
            >
              Email: florifavi@gmail.com{"\n"}
              Mot de passe: OwoApp2024!{"\n"}
              {"\n"}
              Utilisez le bouton "Connexion rapide" pour remplir automatiquement ces identifiants.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
