import React from "react";
import { View, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function ProfileHeader({ theme }) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        paddingTop: insets.top + 16,
        paddingHorizontal: 24,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
      }}
    >
      <Text
        style={{
          fontFamily: "Inter_600SemiBold",
          fontSize: 24,
          color: theme.colors.text,
        }}
      >
        Profil
      </Text>
    </View>
  );
}
