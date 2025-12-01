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

      {/* Features Section - Centré verticalement */}
      <View
        style={{
          flex: 1,
          paddingHorizontal: 24,
          justifyContent: "center",
        }}
      >
        <Text
          style={{
            fontFamily: "Inter_600SemiBold",
            fontSize: 20,
            color: "#1A202C",
            textAlign: "center",
            marginBottom: 28,
          }}
        >
          Pourquoi choisir owo! ?
        </Text>

        {/* Feature List */}
        <View style={{ gap: 20, marginBottom: 32 }}>
          {/* Feature 1 - Sécurité */}
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View
              style={{
                width: 52,
                height: 52,
                borderRadius: 14,
                backgroundColor: "#20B2AA18",
                justifyContent: "center",
                alignItems: "center",
                marginRight: 14,
              }}
            >
              <Shield size={26} color="#20B2AA" strokeWidth={1.5} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 16, color: "#1A202C", marginBottom: 2 }}>
                Sécurité maximale
              </Text>
              <Text style={{ fontFamily: "Inter_400Regular", fontSize: 13, color: "#64748B", lineHeight: 18 }}>
                Chiffrement et authentification biométrique
              </Text>
            </View>
          </View>

          {/* Feature 2 - Transactions */}
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View
              style={{
                width: 52,
                height: 52,
                borderRadius: 14,
                backgroundColor: "#10B98118",
                justifyContent: "center",
                alignItems: "center",
                marginRight: 14,
              }}
            >
              <Banknote size={26} color="#10B981" strokeWidth={1.5} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 16, color: "#1A202C", marginBottom: 2 }}>
                Transferts instantanés
              </Text>
              <Text style={{ fontFamily: "Inter_400Regular", fontSize: 13, color: "#64748B", lineHeight: 18 }}>
                Envoyez et recevez de l'argent 24h/24
              </Text>
            </View>
          </View>

          {/* Feature 3 - International */}
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View
              style={{
                width: 52,
                height: 52,
                borderRadius: 14,
                backgroundColor: "#F5920018",
                justifyContent: "center",
                alignItems: "center",
                marginRight: 14,
              }}
            >
              <Globe size={26} color="#F59200" strokeWidth={1.5} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 16, color: "#1A202C", marginBottom: 2 }}>
                Afrique ↔ Europe
              </Text>
              <Text style={{ fontFamily: "Inter_400Regular", fontSize: 13, color: "#64748B", lineHeight: 18 }}>
                Transferts sans frais cachés
              </Text>
            </View>
          </View>

          {/* Feature 4 - Multi-services */}
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View
              style={{
                width: 52,
                height: 52,
                borderRadius: 14,
                backgroundColor: "#8B5CF618",
                justifyContent: "center",
                alignItems: "center",
                marginRight: 14,
              }}
            >
              <Fingerprint size={26} color="#8B5CF6" strokeWidth={1.5} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 16, color: "#1A202C", marginBottom: 2 }}>
                Tout-en-un
              </Text>
              <Text style={{ fontFamily: "Inter_400Regular", fontSize: 13, color: "#64748B", lineHeight: 18 }}>
                Cagnottes, épargne, carte, Mobile Money
              </Text>
            </View>
          </View>
        </View>

        {/* Start Button */}
        <TouchableOpacity
          style={{
            backgroundColor: theme.colors.primary,
            borderRadius: 16,
            paddingVertical: 16,
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
