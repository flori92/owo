import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import {
  Shield,
  Banknote,
  Globe,
  ArrowRight,
  User,
} from "lucide-react-native";
import { Redirect, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/utils/auth/useAuth";
import { useAppwriteAuth } from "@/hooks/useAppwrite";
import { useTheme } from "@/utils/useTheme";

export default function Index() {
  const { auth, signIn, isReady } = useAuth();
  // TEMPORAIREMENT DÉSACTIVÉ : const { user, loading } = useAppwriteAuth();
  const user = null; // Force pas d'utilisateur pour tester
  const loading = false;
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  if (loading || !isReady) {
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
            fontSize: 18,
            fontWeight: "600",
          }}
        >
          Chargement...
        </Text>
      </View>
    );
  }

  // TEMPORAIREMENT DÉSACTIVÉ : redirection si user connecté
  // if (user) {
  //   return <Redirect href="/(tabs)/home" />;
  // }

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
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
          <View
            style={{
              width: 50,
              height: 50,
              borderRadius: 14,
              backgroundColor: "#FFFFFF",
              justifyContent: "center",
              alignItems: "center",
              marginRight: 12,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "bold",
                color: theme.colors.primary,
              }}
            >
              owo!
            </Text>
          </View>
          <View>
            <Text
              style={{
                fontSize: 26,
                fontWeight: "700",
                color: "#FFFFFF",
              }}
            >
              Bienvenue sur owo!
            </Text>
            <Text
              style={{
                fontSize: 13,
                fontWeight: "400",
                color: "#FFFFFF",
                opacity: 0.9,
              }}
            >
              Votre portefeuille digital sécurisé
            </Text>
          </View>
        </View>
      </View>

      <View
        style={{
          flex: 1,
          paddingHorizontal: 24,
          justifyContent: "center",
        }}
      >
        <Text
          style={{
            fontSize: 20,
            fontWeight: "600",
            color: "#1A202C",
            textAlign: "center",
            marginBottom: 28,
          }}
        >
          Pourquoi choisir owo! ?
        </Text>

        <View style={{ gap: 20, marginBottom: 32 }}>
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
              <Text style={{ fontSize: 16, fontWeight: "600", color: "#1A202C", marginBottom: 2 }}>
                Sécurité maximale
              </Text>
              <Text style={{ fontSize: 13, fontWeight: "400", color: "#64748B", lineHeight: 18 }}>
                Chiffrement et authentification biométrique
              </Text>
            </View>
          </View>

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
              <Text style={{ fontSize: 16, fontWeight: "600", color: "#1A202C", marginBottom: 2 }}>
                Transactions instantanées
              </Text>
              <Text style={{ fontSize: 13, fontWeight: "400", color: "#64748B", lineHeight: 18 }}>
                Envoi et réception d'argent en quelques secondes
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View
              style={{
                width: 52,
                height: 52,
                borderRadius: 14,
                backgroundColor: "#3B82F618",
                justifyContent: "center",
                alignItems: "center",
                marginRight: 14,
              }}
            >
              <Globe size={26} color="#3B82F6" strokeWidth={1.5} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 13, fontWeight: "400", color: "#64748B", lineHeight: 18 }}>
                Utilisez owo! partout dans le monde
              </Text>
            </View>
          </View>
        </View>

        <View style={{ gap: 12 }}>
          <TouchableOpacity
            style={{
              backgroundColor: theme.colors.primary,
              paddingVertical: 16,
              paddingHorizontal: 24,
              borderRadius: 12,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
            }}
            onPress={() => router.push("/auth/login")}
          >
            <Text
              style={{
                color: "#FFFFFF",
                fontSize: 16,
                fontWeight: "600",
                marginRight: 8,
              }}
            >
              Se connecter
            </Text>
            <ArrowRight size={18} color="#FFFFFF" strokeWidth={2} />
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              backgroundColor: "transparent",
              borderWidth: 2,
              borderColor: theme.colors.primary,
              paddingVertical: 14,
              paddingHorizontal: 24,
              borderRadius: 12,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
            }}
            onPress={() => router.push("/auth/register")}
          >
            <User size={18} color={theme.colors.primary} strokeWidth={2} />
            <Text
              style={{
                color: theme.colors.primary,
                fontSize: 16,
                fontWeight: "600",
                marginLeft: 8,
              }}
            >
              Créer un compte
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
