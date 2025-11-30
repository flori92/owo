import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

export function AccountCard({
  theme,
  icon: Icon,
  title,
  subtitle,
  amount,
  borderColor,
  iconColor,
  onPress,
}) {
  return (
    <TouchableOpacity
      style={{
        backgroundColor: theme.colors.elevated,
        borderRadius: 16,
        padding: 20,
        flexDirection: "row",
        alignItems: "center",
        borderLeftWidth: 4,
        borderLeftColor: borderColor,
        shadowColor: theme.colors.shadowColor,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
      }}
      onPress={onPress}
    >
      <View
        style={{
          width: 48,
          height: 48,
          borderRadius: 24,
          backgroundColor: `${iconColor}20`,
          justifyContent: "center",
          alignItems: "center",
          marginRight: 16,
        }}
      >
        <Icon size={22} color={iconColor} strokeWidth={1.5} />
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
          {title}
        </Text>
        <Text
          style={{
            fontFamily: "Inter_400Regular",
            fontSize: 13,
            color: theme.colors.textSecondary,
          }}
        >
          {subtitle}
        </Text>
      </View>

      <Text
        style={{
          fontFamily: "Inter_700Bold",
          fontSize: 16,
          color: theme.colors.text,
        }}
      >
        {amount}
      </Text>
    </TouchableOpacity>
  );
}
