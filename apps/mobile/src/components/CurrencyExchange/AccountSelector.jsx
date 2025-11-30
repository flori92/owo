import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { CheckCircle } from "lucide-react-native";
import { useTheme } from "@/utils/useTheme";

export function AccountSelector({
  label,
  accounts,
  selectedAccount,
  onSelectAccount,
  accentColor = "primary",
}) {
  const theme = useTheme();

  if (accounts.length === 0) {
    return null;
  }

  return (
    <View style={{ marginTop: 12 }}>
      <Text
        style={{
          fontFamily: "Inter_500Medium",
          fontSize: 13,
          color: theme.colors.textSecondary,
          marginBottom: 8,
        }}
      >
        {label}:
      </Text>
      <View style={{ gap: 8 }}>
        {accounts.map((account) => {
          const IconComponent = account.icon;
          const isSelected =
            selectedAccount?.id === account.id &&
            selectedAccount?.type === account.type;

          return (
            <TouchableOpacity
              key={`${account.type}_${account.id}`}
              style={{
                backgroundColor: isSelected
                  ? `${theme.colors[accentColor]}15`
                  : theme.colors.background,
                borderRadius: 8,
                padding: 12,
                flexDirection: "row",
                alignItems: "center",
                borderWidth: isSelected ? 1 : 0,
                borderColor: isSelected
                  ? theme.colors[accentColor]
                  : "transparent",
              }}
              onPress={() => onSelectAccount(account)}
            >
              <IconComponent
                size={18}
                color={
                  isSelected
                    ? theme.colors[accentColor]
                    : theme.colors.textSecondary
                }
                strokeWidth={1.5}
              />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text
                  style={{
                    fontFamily: "Inter_500Medium",
                    fontSize: 14,
                    color: theme.colors.text,
                  }}
                >
                  {account.displayName}
                </Text>
                <Text
                  style={{
                    fontFamily: "Inter_400Regular",
                    fontSize: 12,
                    color: theme.colors.textSecondary,
                  }}
                >
                  {account.subtitle}
                </Text>
              </View>
              {isSelected && (
                <CheckCircle
                  size={18}
                  color={theme.colors[accentColor]}
                  strokeWidth={1.5}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
