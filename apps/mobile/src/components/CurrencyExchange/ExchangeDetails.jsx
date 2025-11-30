import React from "react";
import { View, Text } from "react-native";
import { useTheme } from "@/utils/useTheme";

export function ExchangeDetails({
  fromAmount,
  toAmount,
  fromCurrency,
  toCurrency,
  exchangeRate,
  fees,
}) {
  const theme = useTheme();

  if (!fromAmount || !toAmount) {
    return null;
  }

  return (
    <View
      style={{
        backgroundColor: `${theme.colors.warning}10`,
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 8,
        }}
      >
        <Text
          style={{
            fontFamily: "Inter_400Regular",
            fontSize: 14,
            color: theme.colors.text,
          }}
        >
          Taux de change:
        </Text>
        <Text
          style={{
            fontFamily: "Inter_600SemiBold",
            fontSize: 14,
            color: theme.colors.text,
          }}
        >
          1 {fromCurrency} = {exchangeRate.toFixed(4)} {toCurrency}
        </Text>
      </View>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 8,
        }}
      >
        <Text
          style={{
            fontFamily: "Inter_400Regular",
            fontSize: 14,
            color: theme.colors.text,
          }}
        >
          Frais owo! (1.5%):
        </Text>
        <Text
          style={{
            fontFamily: "Inter_600SemiBold",
            fontSize: 14,
            color: theme.colors.error,
          }}
        >
          -{fees.toFixed(2)} {toCurrency}
        </Text>
      </View>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingTop: 8,
          borderTopWidth: 1,
          borderTopColor: theme.colors.border,
        }}
      >
        <Text
          style={{
            fontFamily: "Inter_600SemiBold",
            fontSize: 14,
            color: theme.colors.text,
          }}
        >
          Montant final:
        </Text>
        <Text
          style={{
            fontFamily: "Inter_700Bold",
            fontSize: 16,
            color: theme.colors.success,
          }}
        >
          {toAmount} {toCurrency}
        </Text>
      </View>
    </View>
  );
}
