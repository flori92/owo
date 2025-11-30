import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import {
  TrendingUp,
  TrendingDown,
  Clock,
  RefreshCw,
} from "lucide-react-native";
import { useTheme } from "@/utils/useTheme";

export function ExchangeRatesOverview({ lastUpdated }) {
  const theme = useTheme();

  return (
    <View
      style={{
        backgroundColor: theme.colors.elevated,
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
      }}
    >
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
          Taux de change
        </Text>
        <TouchableOpacity
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: `${theme.colors.primary}15`,
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 20,
          }}
        >
          <RefreshCw size={14} color={theme.colors.primary} strokeWidth={1.5} />
          <Text
            style={{
              fontFamily: "Inter_500Medium",
              fontSize: 12,
              color: theme.colors.primary,
              marginLeft: 6,
            }}
          >
            Actualiser
          </Text>
        </TouchableOpacity>
      </View>

      <View style={{ gap: 12 }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              fontFamily: "Inter_500Medium",
              fontSize: 14,
              color: theme.colors.text,
            }}
          >
            EUR → FCFA
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text
              style={{
                fontFamily: "Inter_700Bold",
                fontSize: 16,
                color: theme.colors.text,
                marginRight: 8,
              }}
            >
              655.96
            </Text>
            <TrendingUp
              size={16}
              color={theme.colors.success}
              strokeWidth={1.5}
            />
          </View>
        </View>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              fontFamily: "Inter_500Medium",
              fontSize: 14,
              color: theme.colors.text,
            }}
          >
            USD → FCFA
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text
              style={{
                fontFamily: "Inter_700Bold",
                fontSize: 16,
                color: theme.colors.text,
                marginRight: 8,
              }}
            >
              600.00
            </Text>
            <TrendingDown
              size={16}
              color={theme.colors.error}
              strokeWidth={1.5}
            />
          </View>
        </View>
      </View>

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginTop: 12,
          paddingTop: 12,
          borderTopWidth: 1,
          borderTopColor: theme.colors.border,
        }}
      >
        <Clock size={12} color={theme.colors.textSecondary} strokeWidth={1.5} />
        <Text
          style={{
            fontFamily: "Inter_400Regular",
            fontSize: 12,
            color: theme.colors.textSecondary,
            marginLeft: 6,
          }}
        >
          Dernière mise à jour: {lastUpdated.toLocaleTimeString("fr-FR")}
        </Text>
      </View>
    </View>
  );
}
