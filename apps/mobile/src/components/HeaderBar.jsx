import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ChevronLeft } from "lucide-react-native";
import { router } from "expo-router";
import { useTheme } from "@/utils/useTheme";

export default function HeaderBar({
  title,
  leftIcon = ChevronLeft,
  onLeftPress,
  rightIcon: RightIcon,
  onRightPress,
  showNotificationDot = false,
}) {
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  const handleLeftPress = () => {
    if (onLeftPress) {
      onLeftPress();
    } else {
      router.back();
    }
  };

  const LeftIconComponent = leftIcon;

  return (
    <View
      style={{
        paddingTop: insets.top,
        paddingHorizontal: 16,
        height: 44 + insets.top,
        backgroundColor: theme.colors.background,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        zIndex: 1000,
      }}
    >
      <TouchableOpacity
        accessibilityLabel="Back"
        style={{ padding: 8 }}
        onPress={handleLeftPress}
      >
        <LeftIconComponent size={24} color={theme.colors.textTertiary} />
      </TouchableOpacity>

      <Text
        style={{
          fontFamily: "Inter_500Medium",
          fontSize: 16,
          color: theme.colors.text,
        }}
      >
        {title}
      </Text>

      {RightIcon ? (
        <TouchableOpacity
          accessibilityLabel="Menu"
          style={{ padding: 8, position: "relative" }}
          onPress={onRightPress}
        >
          <RightIcon size={24} color={theme.colors.textTertiary} />
          {showNotificationDot && (
            <View
              style={{
                position: "absolute",
                top: 6,
                right: 6,
                width: 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: theme.colors.notificationDot,
              }}
            />
          )}
        </TouchableOpacity>
      ) : (
        <View style={{ width: 40, height: 40 }} />
      )}
    </View>
  );
}
