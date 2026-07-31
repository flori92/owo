import React from "react";
import { View, Text } from "react-native";
import { Redirect } from "expo-router";
import { useAuth } from "@/utils/auth/useAuth";
import { useTheme } from "@/utils/useTheme";
import { isAuthTemporarilyDisabled } from "@/config/auth";

export default function Index() {
  const { isReady, user, loading } = useAuth();
  const theme = useTheme();

  const AUTH_BYPASS = isAuthTemporarilyDisabled();

  if (__DEV__) console.log('📱 Index: loading=', loading, 'isReady=', isReady, 'user=', user?.email);

  if (!isReady || loading) {
    if (__DEV__) console.log('📱 Index: Affichage écran de chargement');
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

  if (AUTH_BYPASS) {
    if (__DEV__) console.log('📱 Index: AUTH_BYPASS actif, redirection vers home');
    return <Redirect href="/(tabs)/home" />;
  }

  if (user) {
    if (__DEV__) console.log('📱 Index: Utilisateur connecté, redirection vers home');
    return <Redirect href="/(tabs)/home" />;
  }

  if (__DEV__) console.log('📱 Index: Redirection vers login');
  return <Redirect href="/auth/login" />;
}
