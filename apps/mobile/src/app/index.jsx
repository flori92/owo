import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { Redirect, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Shield,
  Banknote,
  Globe,
  ArrowRight,
  Fingerprint,
} from "lucide-react-native";
import { useAuth } from "@/utils/auth/useAuth";
import { useTheme } from "@/utils/useTheme";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";

export default function Index() {
  const { auth, signIn, isReady } = useAuth();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  // Show loading while auth system initializes
  if (!isReady || !fontsLoaded) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: theme.colors.primary,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text
          style={{
            color: "#FFFFFF",
            fontFamily: "Inter_600SemiBold",
            fontSize: 18,
          }}
        >
          Chargement...
        </Text>
      </View>
    );
  }

  // If user is authenticated, redirect to main app
  if (auth && auth.user) {
    return <Redirect href="/(tabs)" />;
  }

  // Show welcome screen for unauthenticated users
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#FFFFFF",
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
      }}
    >
      <StatusBar style="dark" />

      {/* Header with gradient background */}
      <View
        style={{
          backgroundColor: theme.colors.primary,
          borderBottomLeftRadius: 40,
          borderBottomRightRadius: 40,
          paddingHorizontal: 24,
          paddingBottom: 60,
          paddingTop: 40,
        }}
      >
        {/* Logo */}
        <View style={{ alignItems: "center", marginBottom: 32 }}>
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 20,
              backgroundColor: "#FFFFFF",
              justifyContent: "center",
              alignItems: "center",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 12,
              elevation: 4,
              overflow: "hidden",
            }}
          >
            <Image
              source={require("../../assets/images/icon.png")}
              style={{ width: 80, height: 80 }}
              resizeMode="cover"
            />
          </View>
        </View>

        {/* Welcome Text */}
        <Text
          style={{
            fontFamily: "Inter_700Bold",
            fontSize: 32,
            color: "#FFFFFF",
            textAlign: "center",
            marginBottom: 12,
          }}
        >
          Bienvenue sur owo!
        </Text>

        <Text
          style={{
            fontFamily: "Inter_400Regular",
            fontSize: 16,
            color: "#FFFFFF",
            textAlign: "center",
            opacity: 0.9,
            lineHeight: 22,
          }}
        >
          Votre portefeuille digital sécurisé pour l'Afrique de l'Ouest
        </Text>
      </View>

      {/* Features Section */}
      <View
        style={{
          flex: 1,
          paddingHorizontal: 24,
          paddingTop: 40,
        }}
      >
        <Text
          style={{
            fontFamily: "Inter_600SemiBold",
            fontSize: 22,
            color: theme.colors.text,
            textAlign: "center",
            marginBottom: 32,
          }}
        >
          Pourquoi choisir owo! ?
        </Text>

        {/* Feature List */}
        <View style={{ gap: 24, marginBottom: 40 }}>
          {/* Feature 1 - Sécurité */}
          <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: 16,
                backgroundColor: "#20B2AA20",
                justifyContent: "center",
                alignItems: "center",
                marginRight: 16,
              }}
            >
              <Shield size={28} color="#20B2AA" strokeWidth={1.5} />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 17,
                  color: "#1A202C",
                  marginBottom: 6,
                }}
              >
                Sécurité maximale
              </Text>
              <Text
                style={{
                  fontFamily: "Inter_400Regular",
                  fontSize: 14,
                  color: "#64748B",
                  lineHeight: 20,
                }}
              >
                Chiffrement de bout en bout et authentification biométrique pour protéger vos fonds
              </Text>
            </View>
          </View>

          {/* Feature 2 - Transactions */}
          <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: 16,
                backgroundColor: "#10B98120",
                justifyContent: "center",
                alignItems: "center",
                marginRight: 16,
              }}
            >
              <Banknote size={28} color="#10B981" strokeWidth={1.5} />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 17,
                  color: "#1A202C",
                  marginBottom: 6,
                }}
              >
                Transferts instantanés
              </Text>
              <Text
                style={{
                  fontFamily: "Inter_400Regular",
                  fontSize: 14,
                  color: "#64748B",
                  lineHeight: 20,
                }}
              >
                Envoyez et recevez de l'argent en quelques secondes, 24h/24 et 7j/7
              </Text>
            </View>
          </View>

          {/* Feature 3 - International */}
          <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: 16,
                backgroundColor: "#F5920020",
                justifyContent: "center",
                alignItems: "center",
                marginRight: 16,
              }}
            >
              <Globe size={28} color="#F59200" strokeWidth={1.5} />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 17,
                  color: "#1A202C",
                  marginBottom: 6,
                }}
              >
                Afrique ↔ Europe
              </Text>
              <Text
                style={{
                  fontFamily: "Inter_400Regular",
                  fontSize: 14,
                  color: "#64748B",
                  lineHeight: 20,
                }}
              >
                Transférez entre l'Afrique de l'Ouest et l'Europe sans frais cachés
              </Text>
            </View>
          </View>

          {/* Feature 4 - Multi-services */}
          <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: 16,
                backgroundColor: "#8B5CF620",
                justifyContent: "center",
                alignItems: "center",
                marginRight: 16,
              }}
            >
              <Fingerprint size={28} color="#8B5CF6" strokeWidth={1.5} />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 17,
                  color: "#1A202C",
                  marginBottom: 6,
                }}
              >
                Tout-en-un
              </Text>
              <Text
                style={{
                  fontFamily: "Inter_400Regular",
                  fontSize: 14,
                  color: "#64748B",
                  lineHeight: 20,
                }}
              >
                Cagnottes, épargne bloquée, carte virtuelle et Mobile Money réunis
              </Text>
            </View>
          </View>
        </View>

        {/* Start Button - redirige directement vers l'app pour l'étape 1 */}
        <TouchableOpacity
          style={{
            backgroundColor: theme.colors.primary,
            borderRadius: 16,
            paddingVertical: 18,
            paddingHorizontal: 24,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            shadowColor: theme.colors.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 12,
            elevation: 4,
          }}
          onPress={() => {
            // Étape 1 : on entre directement dans l'app, sans flux d'auth web
            router.push("/(tabs)");
          }}
          activeOpacity={0.8}
        >
          <Text
            style={{
              fontFamily: "Inter_600SemiBold",
              fontSize: 18,
              color: "#FFFFFF",
              marginRight: 12,
            }}
          >
            Commencer
          </Text>
          <ArrowRight size={20} color="#FFFFFF" strokeWidth={2} />
        </TouchableOpacity>

        {/* Footer */}
        <Text
          style={{
            fontFamily: "Inter_400Regular",
            fontSize: 12,
            color: theme.colors.textSecondary,
            textAlign: "center",
            marginTop: 24,
            lineHeight: 16,
          }}
        >
          En continuant, vous acceptez nos Conditions d'utilisation{"\n"}et
          notre Politique de confidentialité
        </Text>
      </View>
    </View>
  );
}
