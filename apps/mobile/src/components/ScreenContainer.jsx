import React from "react";
import { View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useTheme } from "@/utils/useTheme";

export default function ScreenContainer({ children, style = {} }) {
  const theme = useTheme();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.colors.background,
        ...style,
      }}
    >
      <StatusBar style={theme.colors.statusBar} />
      {children}
    </View>
  );
}
