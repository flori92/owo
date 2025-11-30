import React from "react";
import { View, Text } from "react-native";
import { useTheme } from "@/utils/useTheme";

export default function EmptyState({
  icon: IconComponent,
  title,
  description,
  containerStyle = {},
}) {
  const theme = useTheme();

  return (
    <View
      style={{
        alignItems: "center",
        paddingVertical: 48,
        paddingHorizontal: 32,
        ...containerStyle,
      }}
    >
      <View
        style={{
          width: 60,
          height: 60,
          borderRadius: 30,
          backgroundColor: theme.colors.buttonBackground,
          justifyContent: "center",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <IconComponent
          size={28}
          color={theme.colors.textSecondary}
          strokeWidth={1.5}
        />
      </View>
      <Text
        style={{
          fontFamily: "Inter_600SemiBold",
          fontSize: 18,
          color: theme.colors.text,
          marginBottom: 8,
          textAlign: "center",
        }}
      >
        {title}
      </Text>
      <Text
        style={{
          fontFamily: "Inter_400Regular",
          fontSize: 14,
          color: theme.colors.textSecondary,
          textAlign: "center",
          lineHeight: 20,
        }}
      >
        {description}
      </Text>
    </View>
  );
}
