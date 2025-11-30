import React from "react";
import { View, Text } from "react-native";
import { PiggyBank, Repeat, CreditCard, Sparkles } from "lucide-react-native";

const iconMap = {
  PiggyBank,
  Repeat,
  CreditCard,
};

export function QuickStatsSection({ theme, stats }) {
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
        Aperçu owo!
      </Text>

      <View style={{ gap: 12 }}>
        {stats.map((stat, index) => {
          const IconComponent = iconMap[stat.icon];
          return (
            <View
              key={index}
              style={{
                backgroundColor: theme.colors.elevated,
                borderRadius: 16,
                padding: 20,
                flexDirection: "row",
                alignItems: "center",
                shadowColor: theme.colors.shadowColor,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 2,
              }}
            >
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: `${stat.color}20`,
                  justifyContent: "center",
                  alignItems: "center",
                  marginRight: 16,
                }}
              >
                <IconComponent size={22} color={stat.color} strokeWidth={1.5} />
              </View>

              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontFamily: "Inter_400Regular",
                    fontSize: 13,
                    color: theme.colors.textSecondary,
                    marginBottom: 4,
                  }}
                >
                  {stat.title}
                </Text>
                <Text
                  style={{
                    fontFamily: "Inter_700Bold",
                    fontSize: 18,
                    color: theme.colors.text,
                  }}
                >
                  {stat.value}
                </Text>
              </View>

              <View style={{ alignItems: "flex-end" }}>
                <Text
                  style={{
                    fontFamily: "Inter_500Medium",
                    fontSize: 12,
                    color: stat.change.includes("+")
                      ? theme.colors.success
                      : stat.change.includes("-")
                        ? theme.colors.error
                        : theme.colors.textSecondary,
                    marginBottom: 4,
                  }}
                >
                  {stat.change}
                </Text>
                {stat.sparkle && (
                  <Sparkles
                    size={14}
                    color={theme.colors.gold}
                    strokeWidth={1.5}
                  />
                )}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}
