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
import { useAuth } from "@/hooks/useFirebase";
import ScreenContainer from "@/components/ScreenContainer";
import LoadingScreen from "@/components/LoadingScreen";
import HeaderBar from "@/components/HeaderBar";
import ActionButton from "@/components/ActionButton";

export default function RegisterScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { createAccount, loading } = useAuth();

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword || !name) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Erreur", "Les mots de passe ne correspondent pas");
      return;
    }

    if (password.length < 8) {
      Alert.alert("Erreur", "Le mot de passe doit contenir au moins 8 caractères");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createAccount(email, password, name);
      
      if (result.success) {
        Alert.alert(
          "Succès",
          "Compte créé avec succès! Vous pouvez maintenant vous connecter.",
          [
            {
              text: "OK",
              onPress: () => {
                router.replace("/auth/login");
              },
            },
          ]
        );
      } else {
        Alert.alert("Erreur", result.error || "Échec de la création du compte");
      }
    } catch (error) {
      console.error("Register error:", error);
      Alert.alert("Erreur", "Impossible de créer le compte. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!fontsLoaded) {
    return <LoadingScreen />;
  }

  return (
    <ScreenContainer>
      <HeaderBar title="Inscription" />

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
                color: theme.colors.text,
                marginBottom: 8,
              }}
            >
              owo!
            </Text>
            <Text
              style={{
                fontFamily: "Inter_400Regular",
                fontSize: 16,
                color: theme.colors.textSecondary,
                textAlign: "center",
              }}
            >
              Rejoignez-nous pour gérer vos finances
            </Text>
          </View>

          {/* Name Input */}
          <View style={{ marginBottom: 20 }}>
            <Text
              style={{
                fontFamily: "Inter_600SemiBold",
                fontSize: 16,
                color: theme.colors.text,
                marginBottom: 8,
              }}
            >
              Nom complet
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
              placeholder="Jean Kouadio"
              placeholderTextColor={theme.colors.textSecondary}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              autoComplete="name"
            />
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
          <View style={{ marginBottom: 20 }}>
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
                placeholder="Min. 8 caractères"
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

          {/* Confirm Password Input */}
          <View style={{ marginBottom: 32 }}>
            <Text
              style={{
                fontFamily: "Inter_600SemiBold",
                fontSize: 16,
                color: theme.colors.text,
                marginBottom: 8,
              }}
            >
              Confirmer le mot de passe
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
                placeholder="Confirmer le mot de passe"
                placeholderTextColor={theme.colors.textSecondary}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
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
                  {showConfirmPassword ? "Cacher" : "Voir"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Terms */}
          <View style={{ marginBottom: 32 }}>
            <Text
              style={{
                fontFamily: "Inter_400Regular",
                fontSize: 12,
                color: theme.colors.textSecondary,
                textAlign: "center",
                lineHeight: 18,
              }}
            >
              En créant un compte, vous acceptez nos{" "}
              <Text style={{ color: theme.colors.primary, fontFamily: "Inter_600SemiBold" }}>
                conditions d'utilisation
              </Text>{" "}
              et notre{" "}
              <Text style={{ color: theme.colors.primary, fontFamily: "Inter_600SemiBold" }}>
                politique de confidentialité
              </Text>
            </Text>
          </View>

          {/* Register Button */}
          <ActionButton
            title={isSubmitting ? "Création..." : "Créer un compte"}
            onPress={handleRegister}
            disabled={
              isSubmitting || loading || !email || !password || !confirmPassword || !name
            }
          />

          {/* Login Link */}
          <View style={{ flexDirection: "row", justifyContent: "center", marginTop: 24 }}>
            <Text
              style={{
                fontFamily: "Inter_400Regular",
                fontSize: 14,
                color: theme.colors.textSecondary,
              }}
            >
              Déjà un compte ?{" "}
            </Text>
            <TouchableOpacity onPress={() => router.replace("/auth/login")}>
              <Text
                style={{
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 14,
                  color: theme.colors.primary,
                }}
              >
                Se connecter
              </Text>
            </TouchableOpacity>
          </View>

          {/* Password Requirements */}
          <View
            style={{
              backgroundColor: `${theme.colors.primary}15`,
              borderRadius: 12,
              padding: 16,
              marginTop: 32,
            }}
          >
            <Text
              style={{
                fontFamily: "Inter_600SemiBold",
                fontSize: 14,
                color: theme.colors.primary,
                marginBottom: 8,
              }}
            >
              🔐 Exigences du mot de passe
            </Text>
            <Text
              style={{
                fontFamily: "Inter_400Regular",
                fontSize: 12,
                color: theme.colors.text,
                lineHeight: 18,
              }}
            >
              • Au moins 8 caractères{"\n"}
              • Contient des lettres et chiffres{"\n"}
              • Facile à retenir mais sécurisé
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
