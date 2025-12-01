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

      {/* Header compact */}
      <View
        style={{
          backgroundColor: theme.colors.primary,
          borderBottomLeftRadius: 30,
          borderBottomRightRadius: 30,
          paddingHorizontal: 24,
          paddingBottom: 24,
          paddingTop: 16,
        }}
      >
        {/* Logo + Titre sur la même ligne */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
          <View
            style={{
              width: 50,
              height: 50,
              borderRadius: 14,
              backgroundColor: "#FFFFFF",
              justifyContent: "center",
              alignItems: "center",
              overflow: "hidden",
              marginRight: 12,
            }}
          >
            <Image
              source={require("../../assets/images/icon.png")}
              style={{ width: 50, height: 50 }}
              resizeMode="cover"
            />
          </View>
          <View>
            <Text
              style={{
                fontFamily: "Inter_700Bold",
                fontSize: 26,
                color: "#FFFFFF",
              }}
            >
              Bienvenue sur owo!
            </Text>
            <Text
              style={{
                fontFamily: "Inter_400Regular",
                fontSize: 13,
                color: "#FFFFFF",
                opacity: 0.9,
              }}
            >
              Votre portefeuille digital sécurisé
            </Text>
          </View>
        </View>
      </View>

      {/* Features Section */}
      <View
        style={{
          flex: 1,
          paddingHorizontal: 24,
          paddingTop: 24,
        }}
      >
        <Text
          style={{
            fontFamily: "Inter_600SemiBold",
            fontSize: 18,
            color: "#1A202C",
            textAlign: "center",
            marginBottom: 32,
          }}
        >
          Pourquoi choisir owo! ?
        </Text>

        {/* Feature List - Compact */}
        <View style={{ gap: 16, marginBottom: 24 }}>
          {/* Feature 1 - Sécurité */}
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                backgroundColor: "#20B2AA15",
                justifyContent: "center",
                alignItems: "center",
                marginRight: 12,
              }}
            >
              <Shield size={22} color="#20B2AA" strokeWidth={1.5} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 15, color: "#1A202C" }}>
                Sécurité maximale
              </Text>
              <Text style={{ fontFamily: "Inter_400Regular", fontSize: 12, color: "#64748B" }}>
                Chiffrement et authentification biométrique
              </Text>
            </View>
          </View>

          {/* Feature 2 - Transactions */}
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                backgroundColor: "#10B98115",
                justifyContent: "center",
                alignItems: "center",
                marginRight: 12,
              }}
            >
              <Banknote size={22} color="#10B981" strokeWidth={1.5} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 15, color: "#1A202C" }}>
                Transferts instantanés
              </Text>
              <Text style={{ fontFamily: "Inter_400Regular", fontSize: 12, color: "#64748B" }}>
                Envoyez et recevez 24h/24, 7j/7
              </Text>
            </View>
          </View>

          {/* Feature 3 - International */}
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                backgroundColor: "#F5920015",
                justifyContent: "center",
                alignItems: "center",
                marginRight: 12,
              }}
            >
              <Globe size={22} color="#F59200" strokeWidth={1.5} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 15, color: "#1A202C" }}>
                Afrique ↔ Europe
              </Text>
              <Text style={{ fontFamily: "Inter_400Regular", fontSize: 12, color: "#64748B" }}>
                Sans frais cachés
              </Text>
            </View>
          </View>

          {/* Feature 4 - Multi-services */}
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                backgroundColor: "#8B5CF615",
                justifyContent: "center",
                alignItems: "center",
                marginRight: 12,
              }}
            >
              <Fingerprint size={22} color="#8B5CF6" strokeWidth={1.5} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 15, color: "#1A202C" }}>
                Tout-en-un
              </Text>
              <Text style={{ fontFamily: "Inter_400Regular", fontSize: 12, color: "#64748B" }}>
                Cagnottes, épargne, carte virtuelle, Mobile Money
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
