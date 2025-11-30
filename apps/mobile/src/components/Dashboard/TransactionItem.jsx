import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { CreditCard, ArrowDownLeft, ArrowUpRight } from "lucide-react-native";
import { router } from "expo-router";

export function TransactionItem({ theme, transaction }) {
  return (
    <TouchableOpacity
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
      }}
      onPress={() => router.push(`/transaction-details?id=${transaction.id}`)}
    >
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 22,
          backgroundColor: `${transaction.categoryColor}20`,
          justifyContent: "center",
          alignItems: "center",
          marginRight: 14,
        }}
      >
        {transaction.isVirtualCard ? (
          <CreditCard
            size={20}
            color={transaction.categoryColor}
            strokeWidth={1.5}
          />
        ) : transaction.type === "income" ? (
          <ArrowDownLeft
            size={20}
            color={transaction.categoryColor}
            strokeWidth={1.5}
          />
        ) : (
          <ArrowUpRight
            size={20}
            color={transaction.categoryColor}
            strokeWidth={1.5}
          />
        )}
      </View>

      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontFamily: "Inter_600SemiBold",
            fontSize: 15,
            color: theme.colors.text,
            marginBottom: 4,
          }}
        >
          {transaction.title}
        </Text>
        <Text
          style={{
            fontFamily: "Inter_400Regular",
            fontSize: 13,
            color: theme.colors.textSecondary,
          }}
        >
          {transaction.category} • {transaction.date}
          {transaction.isVirtualCard && " • Carte owo!"}
        </Text>
      </View>

      <Text
        style={{
          fontFamily: "Inter_700Bold",
          fontSize: 16,
          color:
            transaction.amount > 0 ? theme.colors.success : theme.colors.error,
        }}
      >
        {transaction.amount > 0 ? "+" : ""}
        {transaction.amount.toLocaleString()} {transaction.currency}
      </Text>
    </TouchableOpacity>
  );
}
