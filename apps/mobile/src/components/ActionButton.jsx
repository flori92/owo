import React from "react";
import { TouchableOpacity, Text } from "react-native";
import { useTheme } from "@/utils/useTheme";

export default function ActionButton({
  title,
  onPress,
  disabled = false,
  variant = "primary", // 'primary' | 'secondary'
  style = {},
  textStyle = {},
}) {
  const theme = useTheme();

  const getButtonStyle = () => {
    const baseStyle = {
      height: 48,
      borderRadius: 6,
      alignItems: "center",
      justifyContent: "center",
      ...style,
    };

    if (disabled) {
      return {
        ...baseStyle,
        backgroundColor: theme.colors.disabled,
      };
    }

    if (variant === "secondary") {
      return {
        ...baseStyle,
        backgroundColor: theme.colors.buttonBackground,
        borderWidth: 1,
        borderColor: theme.colors.border,
      };
    }

    // Primary variant
    return {
      ...baseStyle,
      backgroundColor: theme.colors.text,
    };
  };

  const getTextStyle = () => {
    const baseTextStyle = {
      fontFamily: "Inter_600SemiBold",
      fontSize: 16,
      ...textStyle,
    };

    if (disabled) {
      return {
        ...baseTextStyle,
        color: theme.colors.disabledText,
      };
    }

    if (variant === "secondary") {
      return {
        ...baseTextStyle,
        color: theme.colors.text,
      };
    }

    // Primary variant
    return {
      ...baseTextStyle,
      color: theme.colors.background,
    };
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Text style={getTextStyle()}>{title}</Text>
    </TouchableOpacity>
  );
}
