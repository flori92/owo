import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Send, HandCoins, Users, PiggyBank, QrCode } from "lucide-react-native";
import { router } from "expo-router";
import useHaptics from "@/hooks/useHaptics";

export function QuickActionsSection({ theme }) {
  const haptics = useHaptics();

  const handlePress = (route) => {
    haptics.light();
    router.push(route);
  };

  const actions = [
    {
      icon: Send,
      title: "Envoyer",
      subtitle: "de l'argent",
      color: theme.colors.primary,
      route: "/(tabs)/send-money",
    },
    {
      icon: HandCoins,
      title: "Demander",
      subtitle: "de l'argent",
      color: theme.colors.secondary || "#8B5CF6",
      route: "/(tabs)/request-money",
    },
    {
      icon: Users,
      title: "Cagnottes",
      subtitle: "Épargne de groupe",
      color: theme.colors.accent,
      route: "/group-savings",
    },
    {
      icon: PiggyBank,
      title: "Épargne",
      subtitle: "Bloquée & sécurisée",
      color: theme.colors.success,
      route: "/locked-savings",
    },
    {
      icon: QrCode,
      title: "Scanner",
      subtitle: "QR Code",
      color: "#EC4899",
      route: "/qr-scanner",
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
            onPress={() => handlePress(action.route)}
            activeOpacity={0.7}
            style={{
              width: "31%",
              backgroundColor: theme.colors.cardBackground,
              borderRadius: 16,
              padding: 12,
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
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: action.color + "15",
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <action.icon color={action.color} size={20} strokeWidth={2} />
            </View>
            <Text
              style={{
                fontSize: 12,
                fontWeight: "600",
                color: theme.colors.text,
                textAlign: "center",
              }}
              numberOfLines={1}
            >
              {action.title}
            </Text>
            <Text
              style={{
                fontSize: 10,
                color: theme.colors.textSecondary,
                textAlign: "center",
                marginTop: 2,
              }}
              numberOfLines={1}
            >
              {action.subtitle}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
