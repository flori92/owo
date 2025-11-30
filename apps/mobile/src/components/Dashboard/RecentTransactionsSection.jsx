import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Receipt } from "lucide-react-native";
import { router } from "expo-router";
import { TransactionItem } from "./TransactionItem";
import EmptyState from "@/components/EmptyState";

export function RecentTransactionsSection({ theme, transactions }) {
  return (
    <View>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <Text
          style={{
            fontFamily: "Inter_600SemiBold",
            fontSize: 18,
            color: theme.colors.text,
          }}
        >
          Transactions récentes
        </Text>

        <TouchableOpacity onPress={() => router.push("/(tabs)/transactions")}>
          <Text
            style={{
              fontFamily: "Inter_500Medium",
              fontSize: 14,
              color: theme.colors.primary,
            }}
          >
            Voir tout
          </Text>
        </TouchableOpacity>
      </View>

      {transactions.length > 0 ? (
        <View
          style={{
            backgroundColor: theme.colors.elevated,
            borderRadius: 16,
            padding: 20,
            shadowColor: theme.colors.shadowColor,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 2,
          }}
        >
          {transactions.slice(0, 4).map((transaction, index) => (
            <View key={transaction.id}>
              <TransactionItem theme={theme} transaction={transaction} />
              {index < transactions.slice(0, 4).length - 1 && (
                <View
                  style={{
                    height: 1,
                    backgroundColor: theme.colors.divider,
                    marginVertical: 8,
                  }}
                />
              )}
            </View>
          ))}
        </View>
      ) : (
        <EmptyState
          icon={Receipt}
          title="Aucune transaction"
          description="Vos transactions récentes apparaîtront ici"
          containerStyle={{ paddingVertical: 32 }}
        />
      )}
    </View>
  );
}
