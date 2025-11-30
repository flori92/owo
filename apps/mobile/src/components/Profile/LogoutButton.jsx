import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { LogOut } from "lucide-react-native";

export function LogoutButton({ theme, onPress }) {
  return (
    <View style={{ marginTop: 20 }}>
      <TouchableOpacity
        style={{
          backgroundColor: theme.colors.elevated,
          borderRadius: 12,
          padding: 20,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
        }}
        onPress={onPress}
      >
        <LogOut size={20} color={theme.colors.error} strokeWidth={1.5} />
        <Text
          style={{
            fontFamily: "Inter_600SemiBold",
            fontSize: 16,
            color: theme.colors.error,
            marginLeft: 12,
          }}
        >
          Se déconnecter
        </Text>
      </TouchableOpacity>
    </View>
  );
}
