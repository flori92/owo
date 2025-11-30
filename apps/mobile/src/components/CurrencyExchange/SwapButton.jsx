import React from "react";
import { View, TouchableOpacity } from "react-native";
import { ArrowUpDown } from "lucide-react-native";
import { useTheme } from "@/utils/useTheme";

export function SwapButton({ onPress }) {
  const theme = useTheme();

  return (
    <View style={{ alignItems: "center", marginVertical: 16 }}>
      <TouchableOpacity
        style={{
          backgroundColor: theme.colors.primary,
          borderRadius: 28,
          width: 56,
          height: 56,
          justifyContent: "center",
          alignItems: "center",
          elevation: 4,
          shadowColor: theme.colors.primary,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 12,
        }}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <ArrowUpDown size={28} color="#FFFFFF" strokeWidth={2} />
      </TouchableOpacity>
    </View>
  );
}
