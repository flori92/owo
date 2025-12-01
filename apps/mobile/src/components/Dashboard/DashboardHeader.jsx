import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
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
        {/* Logo carré officiel owo! */}
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            backgroundColor: "#FFFFFF",
            justifyContent: "center",
            alignItems: "center",
            marginRight: 12,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 6,
            elevation: 3,
            overflow: "hidden",
          }}
        >
          <Image
            source={require("../../../assets/images/icon.png")}
            style={{ width: 40, height: 40 }}
            resizeMode="cover"
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
            <Text style={{ color: theme.colors.primary }}>owo</Text>
            <Text style={{ color: theme.colors.gold }}>!</Text>
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
