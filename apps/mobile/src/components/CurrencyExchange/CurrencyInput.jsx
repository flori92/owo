import React from "react";
import { View, Text, TextInput } from "react-native";
import { Euro, DollarSign } from "lucide-react-native";
import { useTheme } from "@/utils/useTheme";

export function CurrencyInput({
  label,
  currency,
  amount,
  onChangeAmount,
  isOutput = false,
  icon: Icon = Euro,
}) {
  const theme = useTheme();

  return (
    <View style={{ marginBottom: 20 }}>
      <Text
        style={{
          fontFamily: "Inter_500Medium",
          fontSize: 14,
          color: theme.colors.text,
          marginBottom: 12,
        }}
      >
        {label}: {currency}
      </Text>

      <View
        style={{
          backgroundColor: theme.colors.background,
          borderRadius: 12,
          padding: 16,
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <Icon
          size={20}
          color={isOutput ? theme.colors.success : theme.colors.primary}
          strokeWidth={1.5}
        />
        {isOutput ? (
          <Text
            style={{
              flex: 1,
              marginLeft: 12,
              fontFamily: "Inter_600SemiBold",
              fontSize: 18,
              color: theme.colors.success,
            }}
          >
            {amount || "0.00"}
          </Text>
        ) : (
          <TextInput
            style={{
              flex: 1,
              marginLeft: 12,
              fontFamily: "Inter_600SemiBold",
              fontSize: 18,
              color: theme.colors.text,
            }}
            placeholder="0.00"
            placeholderTextColor={theme.colors.textSecondary}
            value={amount}
            onChangeText={onChangeAmount}
            keyboardType="decimal-pad"
          />
        )}
        <Text
          style={{
            fontFamily: "Inter_500Medium",
            fontSize: 14,
            color: theme.colors.textSecondary,
          }}
        >
          {currency}
        </Text>
      </View>
    </View>
  );
}
