import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { Redirect } from "expo-router";
import { useAuth } from "@/utils/auth/useAuth";
import { useAuth as useFirebaseAuth } from "@/hooks/useFirebase";
import { useTheme } from "@/utils/useTheme";

export default function Index() {
  const { isReady } = useAuth();
  const { user, loading } = useFirebaseAuth();
  const theme = useTheme();

  const AUTH_BYPASS = process.env.EXPO_PUBLIC_AUTH_BYPASS === 'true';

  const [ignoreFirebaseLoading, setIgnoreFirebaseLoading] = useState(false);

  useEffect(() => {
    if (!loading) {
      setIgnoreFirebaseLoading(false);
      return;
    }

    const t = setTimeout(() => setIgnoreFirebaseLoading(true), 3000);
    return () => clearTimeout(t);
  }, [loading]);

  console.log('📱 Index: loading=', loading, 'isReady=', isReady, 'user=', user?.email);

  if (!isReady || (loading && !ignoreFirebaseLoading)) {
    console.log('📱 Index: Affichage écran de chargement');
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
    console.log('📱 Index: AUTH_BYPASS actif, redirection vers home');
    return <Redirect href="/(tabs)/home" />;
  }

  if (user) {
    console.log('📱 Index: Utilisateur connecté, redirection vers home');
    return <Redirect href="/(tabs)/home" />;
  }

  console.log('📱 Index: Redirection vers login');
  return <Redirect href="/auth/login" />;
}
