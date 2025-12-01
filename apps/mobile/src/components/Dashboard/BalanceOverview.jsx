import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import {
  Eye,
  EyeOff,
  Repeat,
  Plus,
  Wallet,
  Sparkles,
} from "lucide-react-native";
import { router } from "expo-router";

export function BalanceOverview({
  theme,
  balance,
  balanceVisible,
  onToggleVisibility,
}) {
  const totalBalance = balance 
    ? (balance.totalEUR || 0) + (balance.europeanBanks?.total || 0) + (balance.virtualCard?.balance || 0)
    : 0;

  return (
    <View
      style={{
        backgroundColor: theme.colors.primary,
        borderRadius: 20,
        padding: 28,
        marginBottom: 24,
        shadowColor: theme.colors.shadowColor,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 12,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text
            style={{
              fontFamily: "Inter_500Medium",
              fontSize: 16,
              color: "rgba(255,255,255,0.8)",
            }}
          >
            Solde total équivalent
          </Text>
          <Sparkles
            size={16}
            color={theme.colors.gold}
            strokeWidth={1.5}
            style={{ marginLeft: 6 }}
          />
        </View>
        <TouchableOpacity
          onPress={onToggleVisibility}
          style={{
            padding: 8,
            borderRadius: 20,
            backgroundColor: "rgba(255,255,255,0.15)",
          }}
        >
          {balanceVisible ? (
            <EyeOff size={20} color="rgba(255,255,255,0.9)" strokeWidth={1.5} />
          ) : (
            <Eye size={20} color="rgba(255,255,255,0.9)" strokeWidth={1.5} />
          )}
        </TouchableOpacity>
      </View>

      <View style={{ marginBottom: 24 }}>
        <Text
          style={{
            fontFamily: "Inter_700Bold",
            fontSize: 36,
            color: "#FFFFFF",
            marginBottom: 8,
            letterSpacing: -1,
          }}
        >
          {balanceVisible
            ? `${totalBalance.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €`
            : "••••• €"}
        </Text>
        <Text
          style={{
            fontFamily: "Inter_400Regular",
            fontSize: 14,
            color: "rgba(255,255,255,0.7)",
          }}
        >
          Équivalent:{" "}
          {balanceVisible
            ? `${balance?.total?.toLocaleString() || 0} FCFA`
            : "••••• FCFA"}
        </Text>
      </View>

      {/* Quick Action Buttons */}
      <View
        style={{
          flexDirection: "row",
          gap: 12,
        }}
      >
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: "rgba(255,255,255,0.2)",
            borderRadius: 16,
            paddingVertical: 14,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.1)",
          }}
          onPress={() => router.push("/(tabs)/currency")}
        >
          <Repeat size={18} color="#FFFFFF" strokeWidth={1.5} />
          <Text
            style={{
              fontFamily: "Inter_600SemiBold",
              fontSize: 14,
              color: "#FFFFFF",
              marginLeft: 8,
            }}
          >
            Changer
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: theme.colors.gold,
            borderRadius: 16,
            paddingVertical: 14,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            shadowColor: theme.colors.gold,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 6,
          }}
          onPress={() => router.push("/(tabs)/add-transaction")}
        >
          <Plus size={18} color="#FFFFFF" strokeWidth={2} />
          <Text
            style={{
              fontFamily: "Inter_700Bold",
              fontSize: 14,
              color: "#FFFFFF",
              marginLeft: 8,
            }}
          >
            Ajouter
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: "rgba(255,255,255,0.2)",
            borderRadius: 16,
            paddingVertical: 14,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.1)",
          }}
          onPress={() => router.push("/(tabs)/virtual-card")}
        >
          <Wallet size={18} color="#FFFFFF" strokeWidth={1.5} />
          <Text
            style={{
              fontFamily: "Inter_600SemiBold",
              fontSize: 14,
              color: "#FFFFFF",
              marginLeft: 8,
            }}
          >
            Carte
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
