import React from "react";
import { View, Text } from "react-native";
import { AlertCircle } from "lucide-react-native";
import { useTheme } from "@/utils/useTheme";

export function InfoBox() {
  const theme = useTheme();

  return (
    <View
      style={{
        backgroundColor: `${theme.colors.primary}15`,
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
        flexDirection: "row",
        alignItems: "flex-start",
      }}
    >
      <AlertCircle
        size={20}
        color={theme.colors.primary}
        strokeWidth={1.5}
        style={{ marginTop: 2 }}
      />
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text
          style={{
            fontFamily: "Inter_600SemiBold",
            fontSize: 14,
            color: theme.colors.primary,
            marginBottom: 4,
          }}
        >
          Transferts en temps réel
        </Text>
        <Text
          style={{
            fontFamily: "Inter_400Regular",
            fontSize: 13,
            color: theme.colors.text,
            lineHeight: 18,
          }}
        >
          owo! utilise KkiaPay et FedaPay pour des transferts instantanés entre
          vos comptes européens et africains. Les fonds sont disponibles
          immédiatement.
        </Text>
      </View>
    </View>
  );
}
