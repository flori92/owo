import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Bell, Settings } from "lucide-react-native";
import { router } from "expo-router";

export function DashboardHeader({
  theme,
  displayName,
  unreadNotificationCount,
  onNotificationPress,
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 32,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        {/* Logo Owo! miniature */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginRight: 12,
          }}
        >
          <View
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: theme.colors.gold,
              marginRight: 2,
            }}
          />
          <View
            style={{
              width: 12,
              height: 2,
              backgroundColor: theme.colors.primary,
              borderRadius: 1,
              marginRight: 2,
            }}
          />
          <View
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: theme.colors.gold,
            }}
          />
        </View>

        <View>
          <Text
            style={{
              fontFamily: "Inter_700Bold",
              fontSize: 24,
              color: theme.colors.primary,
              marginBottom: 2,
            }}
          >
            owo!
          </Text>
          <Text
            style={{
              fontFamily: "Inter_400Regular",
              fontSize: 14,
              color: theme.colors.textSecondary,
            }}
          >
            Bonjour, {displayName} 👋
          </Text>
        </View>
      </View>

      <View style={{ flexDirection: "row", gap: 12 }}>
        <TouchableOpacity
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: theme.colors.buttonBackground,
            justifyContent: "center",
            alignItems: "center",
            position: "relative",
            borderWidth: 1,
            borderColor: theme.colors.border,
          }}
          onPress={onNotificationPress}
        >
          <Bell size={20} color={theme.colors.text} strokeWidth={1.5} />
          {unreadNotificationCount > 0 && (
            <View
              style={{
                position: "absolute",
                top: 6,
                right: 6,
                minWidth: 16,
                height: 16,
                borderRadius: 8,
                backgroundColor: theme.colors.accent,
                justifyContent: "center",
                alignItems: "center",
                paddingHorizontal: 4,
              }}
            >
              <Text
                style={{
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 10,
                  color: "#FFFFFF",
                }}
              >
                {unreadNotificationCount > 9 ? "9+" : unreadNotificationCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: theme.colors.buttonBackground,
            justifyContent: "center",
            alignItems: "center",
            borderWidth: 1,
            borderColor: theme.colors.border,
          }}
          onPress={() => router.push("/(tabs)/profile")}
        >
          <Settings size={20} color={theme.colors.text} strokeWidth={1.5} />
        </TouchableOpacity>
      </View>
    </View>
  );
}
