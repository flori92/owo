import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/utils/auth/useAuth";
import { useTheme } from "@/utils/useTheme";
import { isAuthTemporarilyDisabled } from "@/config/auth";

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const authDisabled = isAuthTemporarilyDisabled();

  useEffect(() => {
    if (authDisabled) router.replace("/(tabs)/home");
  }, [authDisabled]);

  if (authDisabled) return null;

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert("Informations manquantes", "Renseignez votre email et votre mot de passe.");
      return;
    }
    setLoading(true);
    try {
      await login(email.trim(), password);
      router.replace("/(tabs)/home");
    } catch (error) {
      Alert.alert("Connexion impossible", error?.message || "Vérifiez vos identifiants.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 28, paddingBottom: insets.bottom + 28 }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.brandCard, { backgroundColor: theme.colors.elevated, borderColor: theme.colors.border }]}>
          <Image
            source={require("../../../assets/images/icon.png")}
            style={styles.logo}
            resizeMode="contain"
            accessibilityLabel="Logo owo!"
          />
        </View>
        <Text style={[styles.title, { color: theme.colors.text }]}>Bienvenue sur owo!</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>Gérez votre argent simplement et en toute sécurité.</Text>

        <View style={styles.form}>
          <Text style={[styles.label, { color: theme.colors.text }]}>Adresse email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="vous@exemple.com"
            placeholderTextColor={theme.colors.textSecondary}
            style={[styles.input, { color: theme.colors.text, backgroundColor: theme.colors.elevated, borderColor: theme.colors.border }]}
          />
          <Text style={[styles.label, { color: theme.colors.text }]}>Mot de passe</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="Votre mot de passe"
            placeholderTextColor={theme.colors.textSecondary}
            style={[styles.input, { color: theme.colors.text, backgroundColor: theme.colors.elevated, borderColor: theme.colors.border }]}
          />
          <Pressable
            onPress={handleLogin}
            disabled={loading}
            style={({ pressed }) => [styles.button, { backgroundColor: theme.colors.primary, opacity: pressed || loading ? 0.75 : 1 }]}
          >
            <Text style={styles.buttonText}>{loading ? "Connexion..." : "Se connecter"}</Text>
          </Pressable>
        </View>

        <Pressable onPress={() => router.push("/auth/register")} style={styles.registerLink}>
          <Text style={[styles.registerText, { color: theme.colors.textSecondary }]}>Pas encore de compte ? </Text>
          <Text style={[styles.registerText, { color: theme.colors.accent, fontWeight: "700" }]}>Créer un compte</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flexGrow: 1, justifyContent: "center", paddingHorizontal: 24 },
  brandCard: { alignSelf: "center", width: 112, height: 112, borderRadius: 28, borderWidth: 1, justifyContent: "center", alignItems: "center", marginBottom: 22 },
  logo: { width: 96, height: 96, borderRadius: 22 },
  title: { textAlign: "center", fontSize: 28, fontWeight: "800", letterSpacing: -0.5 },
  subtitle: { textAlign: "center", fontSize: 15, lineHeight: 22, marginTop: 8, marginBottom: 30 },
  form: { width: "100%", maxWidth: 460, alignSelf: "center" },
  label: { fontSize: 14, fontWeight: "600", marginBottom: 8, marginTop: 14 },
  input: { minHeight: 52, borderWidth: 1, borderRadius: 14, paddingHorizontal: 16, fontSize: 16 },
  button: { minHeight: 54, borderRadius: 14, alignItems: "center", justifyContent: "center", marginTop: 24 },
  buttonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "800" },
  registerLink: { flexDirection: "row", justifyContent: "center", marginTop: 26 },
  registerText: { fontSize: 14 },
});
