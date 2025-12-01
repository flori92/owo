import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Send, HandCoins, Users, PiggyBank } from "lucide-react-native";
import { router } from "expo-router";

export function QuickActionsSection({ theme }) {
  const actions = [
    {
      icon: Send,
      title: "Envoyer",
      subtitle: "de l'argent",
      color: theme.colors.primary,
      onPress: () => router.push("/(tabs)/send-money"),
    },
    {
      icon: HandCoins,
      title: "Demander",
      subtitle: "de l'argent",
      color: theme.colors.secondary || "#8B5CF6",
      onPress: () => router.push("/(tabs)/request-money"),
    },
    {
      icon: Users,
      title: "Cagnottes",
      subtitle: "Épargne de groupe",
      color: theme.colors.accent,
      onPress: () => router.push("/group-savings"),
    },
    {
      icon: PiggyBank,
      title: "Épargne",
      subtitle: "Bloquée & sécurisée",
      color: theme.colors.success,
      onPress: () => router.push("/locked-savings"),
    },
  ];

  return (
    <View style={{ marginTop: 24 }}>
      <Text
        style={{
          fontSize: 18,
          fontWeight: "700",
          color: theme.colors.text,
          marginBottom: 16,
        }}
      >
        Actions rapides
      </Text>

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
        {actions.map((action, index) => (
          <TouchableOpacity
            key={index}
            onPress={action.onPress}
            style={{
              width: "47%",
              backgroundColor: theme.colors.cardBackground,
              borderRadius: 16,
              padding: 16,
              alignItems: "center",
              borderWidth: 1,
              borderColor: theme.colors.border,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: action.color + "15",
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 10,
              }}
            >
              <action.icon color={action.color} size={22} strokeWidth={2} />
            </View>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: theme.colors.text,
                textAlign: "center",
              }}
            >
              {action.title}
            </Text>
            <Text
              style={{
                fontSize: 11,
                color: theme.colors.textSecondary,
                textAlign: "center",
                marginTop: 2,
              }}
            >
              {action.subtitle}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
