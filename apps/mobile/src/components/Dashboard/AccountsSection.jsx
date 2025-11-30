import React from "react";
import { View, Text } from "react-native";
import { Smartphone, Building, CreditCard, Zap } from "lucide-react-native";
import { router } from "expo-router";
import { AccountCard } from "./AccountCard";

export function AccountsSection({ theme, balance, balanceVisible }) {
  return (
    <View style={{ marginBottom: 24 }}>
      <Text
        style={{
          fontFamily: "Inter_600SemiBold",
          fontSize: 18,
          color: theme.colors.text,
          marginBottom: 16,
        }}
      >
        Vos comptes
      </Text>

      <View style={{ gap: 12 }}>
        {/* Mobile Money */}
        <AccountCard
          theme={theme}
          icon={Smartphone}
          title="Mobile Money"
          subtitle="MTN • Moov • Celtiis"
          amount={
            balanceVisible ? `${balance.total.toLocaleString()} FCFA` : "•••••"
          }
          borderColor={theme.colors.mobileMoneyOrange}
          iconColor={theme.colors.mobileMoneyOrange}
          onPress={() => router.push("/payment-integration")}
        />

        {/* European Banks */}
        <AccountCard
          theme={theme}
          icon={Building}
          title="Banques européennes"
          subtitle={balance.europeanBanks.accounts.join(" • ")}
          amount={
            balanceVisible
              ? `${balance.europeanBanks.total.toLocaleString()} €`
              : "•••••"
          }
          borderColor={theme.colors.primary}
          iconColor={theme.colors.primary}
          onPress={() => router.push("/(tabs)/currency")}
        />

        {/* Virtual Card */}
        <View
          style={{
            backgroundColor: theme.colors.elevated,
            borderRadius: 16,
            padding: 20,
            flexDirection: "row",
            alignItems: "center",
            borderLeftWidth: 4,
            borderLeftColor: theme.colors.accent,
            shadowColor: theme.colors.shadowColor,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 3,
          }}
        >
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: `${theme.colors.accent}20`,
              justifyContent: "center",
              alignItems: "center",
              marginRight: 16,
            }}
          >
            <CreditCard
              size={22}
              color={theme.colors.accent}
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
              Carte Visa virtuelle owo!
            </Text>
            <Text
              style={{
                fontFamily: "Inter_400Regular",
                fontSize: 13,
                color: theme.colors.textSecondary,
              }}
            >
              {balance.virtualCard.status === "active"
                ? "Active • Prête à utiliser"
                : "Inactive"}
            </Text>
          </View>

          <View style={{ alignItems: "flex-end" }}>
            <Text
              style={{
                fontFamily: "Inter_700Bold",
                fontSize: 16,
                color: theme.colors.text,
              }}
            >
              {balanceVisible
                ? `${balance.virtualCard.balance.toFixed(2)} €`
                : "•••••"}
            </Text>
            <Zap
              size={14}
              color={theme.colors.accent}
              strokeWidth={1.5}
              style={{ marginTop: 2 }}
            />
          </View>
        </View>
      </View>
    </View>
  );
}
