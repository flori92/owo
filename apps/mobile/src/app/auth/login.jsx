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
import * as AppleAuthentication from "expo-apple-authentication";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import * as Crypto from "expo-crypto";
import { useTheme } from "@/utils/useTheme";
import { useAuth } from "@/hooks/useFirebase";
import { loginWithGoogle, loginWithApple, resetPassword } from "@/lib/firebase";
import ScreenContainer from "@/components/ScreenContainer";
import LoadingScreen from "@/components/LoadingScreen";
import HeaderBar from "@/components/HeaderBar";
import ActionButton from "@/components/ActionButton";
import { SocialAuthButton, SocialAuthDivider } from "@/components/SocialAuthButton";
import { loginSchema, validateForm } from "@/utils/validation";

// Configuration Google Sign-In
GoogleSignin.configure({
  webClientId: "647650316598-0ulgldchtrnk6a2m6sr5dfqvavtpf87r.apps.googleusercontent.com",
  iosClientId: "647650316598-0ulgldchtrnk6a2m6sr5dfqvavtpf87r.apps.googleusercontent.com",
});

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login, loading } = useAuth();

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const handleLogin = async () => {
    // Valider les champs avec Yup
    const validation = await validateForm(loginSchema, { email, password });

    if (!validation.valid) {
      const firstError = Object.values(validation.errors)[0];
      Alert.alert("Erreur de validation", firstError);
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
      if (__DEV__) {
        console.error("Login error:", error);
      }
      Alert.alert("Erreur", "Impossible de se connecter. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Connexion Google
  const handleGoogleLogin = async () => {
    try {
      setIsSubmitting(true);
      
      // Vérifier si Google Play Services est disponible (Android)
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      
      // Connexion Google
      const userInfo = await GoogleSignin.signIn();
      const idToken = userInfo.data?.idToken || userInfo.idToken;
      
      if (!idToken) {
        throw new Error("Impossible d'obtenir le token Google");
      }
      
      // Connexion Firebase avec le token Google
      const result = await loginWithGoogle(idToken);
      
      if (result.success) {
        router.replace("/(tabs)/");
      } else {
        Alert.alert("Erreur", result.error || "Échec de la connexion Google");
      }
    } catch (error) {
      if (__DEV__) {
        console.error("Google Sign-In error:", error);
      }
      
      // Ignorer l'erreur si l'utilisateur a annulé
      if (error.code !== "SIGN_IN_CANCELLED" && error.code !== "-5") {
        Alert.alert("Erreur", "Impossible de se connecter avec Google");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Connexion Apple
  const handleAppleLogin = async () => {
    try {
      setIsSubmitting(true);
      
      // Générer un nonce aléatoire pour la sécurité
      const nonce = Math.random().toString(36).substring(2, 15);
      const hashedNonce = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        nonce
      );
      
      // Lancer la connexion Apple
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
        nonce: hashedNonce,
      });
      
      if (!credential.identityToken) {
        throw new Error("Impossible d'obtenir le token Apple");
      }
      
      // Connexion Firebase avec le token Apple
      const result = await loginWithApple(credential.identityToken, nonce);
      
      if (result.success) {
        router.replace("/(tabs)/");
      } else {
        Alert.alert("Erreur", result.error || "Échec de la connexion Apple");
      }
    } catch (error) {
      if (__DEV__) {
        console.error("Apple Sign-In error:", error);
      }
      
      // Ignorer l'erreur si l'utilisateur a annulé
      if (error.code !== "ERR_CANCELED") {
        Alert.alert("Erreur", "Impossible de se connecter avec Apple");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Réinitialisation du mot de passe
  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert("Info", "Veuillez entrer votre email pour réinitialiser votre mot de passe");
      return;
    }
    
    try {
      const result = await resetPassword(email);
      if (result.success) {
        Alert.alert(
          "Email envoyé",
          "Un email de réinitialisation a été envoyé à " + email
        );
      } else {
        Alert.alert("Erreur", result.error || "Impossible d'envoyer l'email");
      }
    } catch (error) {
      Alert.alert("Erreur", "Une erreur est survenue");
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
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 16,
                backgroundColor: theme.colors.primary,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 16,
              }}
            >
              <Text
                style={{
                  fontSize: 24,
                  fontWeight: "bold",
                  color: "white",
                }}
              >
                owo!
              </Text>
            </View>
            <Text
              style={{
                fontFamily: "Inter_700Bold",
                fontSize: 24,
                color: theme.colors.primary,
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
            onPress={handleForgotPassword}
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
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
