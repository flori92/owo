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
        <View style={{ gap: 20, marginBottom: 40 }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View
              style={{
                width: 50,
                height: 50,
                borderRadius: 15,
                backgroundColor: `${theme.colors.primary}15`,
                justifyContent: "center",
                alignItems: "center",
                marginRight: 16,
              }}
            >
              <Shield
                size={24}
                color={theme.colors.primary}
                strokeWidth={1.5}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 16,
                  color: theme.colors.text,
                  marginBottom: 4,
                }}
              >
                Authentification sécurisée
              </Text>
              <Text
                style={{
                  fontFamily: "Inter_400Regular",
                  fontSize: 13,
                  color: theme.colors.textSecondary,
                  lineHeight: 18,
                }}
              >
                Protection avancée avec chiffrement de bout en bout
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View
              style={{
                width: 50,
                height: 50,
                borderRadius: 15,
                backgroundColor: `${theme.colors.success}15`,
                justifyContent: "center",
                alignItems: "center",
                marginRight: 16,
              }}
            >
              <Banknote
                size={24}
                color={theme.colors.success}
                strokeWidth={1.5}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 16,
                  color: theme.colors.text,
                  marginBottom: 4,
                }}
              >
                Transactions instantanées
              </Text>
              <Text
                style={{
                  fontFamily: "Inter_400Regular",
                  fontSize: 13,
                  color: theme.colors.textSecondary,
                  lineHeight: 18,
                }}
              >
                Envoyez et recevez de l'argent en quelques secondes
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View
              style={{
                width: 50,
                height: 50,
                borderRadius: 15,
                backgroundColor: `${theme.colors.warning}15`,
                justifyContent: "center",
                alignItems: "center",
                marginRight: 16,
              }}
            >
              <Globe size={24} color={theme.colors.warning} strokeWidth={1.5} />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 16,
                  color: theme.colors.text,
                  marginBottom: 4,
                }}
              >
                Portée internationale
              </Text>
              <Text
                style={{
                  fontFamily: "Inter_400Regular",
                  fontSize: 13,
                  color: theme.colors.textSecondary,
                  lineHeight: 18,
                }}
              >
                Transférez vers l'Afrique et l'Europe sans frais cachés
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View
              style={{
                width: 50,
                height: 50,
                borderRadius: 15,
                backgroundColor: `${theme.colors.error}15`,
                justifyContent: "center",
                alignItems: "center",
                marginRight: 16,
              }}
            >
              <Fingerprint
                size={24}
                color={theme.colors.error}
                strokeWidth={1.5}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 16,
                  color: theme.colors.text,
                  marginBottom: 4,
                }}
              >
                Connexion biométrique
              </Text>
              <Text
                style={{
                  fontFamily: "Inter_400Regular",
                  fontSize: 13,
                  color: theme.colors.textSecondary,
                  lineHeight: 18,
                }}
              >
                Accédez rapidement avec votre empreinte ou visage
              </Text>
            </View>
          </View>
        </View>

        {/* Auth Button */}
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
            // Ouvre le modal d'authentification
            signIn();
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
