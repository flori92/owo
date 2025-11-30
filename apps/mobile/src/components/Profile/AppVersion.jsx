import React from "react";
import { View, Text } from "react-native";

export function AppVersion({ theme }) {
  return (
    <View
      style={{
        alignItems: "center",
        marginTop: 32,
        paddingVertical: 20,
      }}
    >
      <Text
        style={{
          fontFamily: "Inter_400Regular",
          fontSize: 13,
          color: theme.colors.textSecondary,
          textAlign: "center",
        }}
      >
        owo! v1.0.0
      </Text>
      <Text
        style={{
          fontFamily: "Inter_400Regular",
          fontSize: 12,
          color: theme.colors.textSecondary,
          textAlign: "center",
          marginTop: 4,
        }}
      >
        Gestion financière intelligente pour l'Afrique
      </Text>
    </View>
  );
}
