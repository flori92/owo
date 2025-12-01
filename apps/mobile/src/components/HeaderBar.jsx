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
  rightComponent, // Support pour un composant personnalisé à droite
  showBack = false,
  onBack,
  showNotificationDot = false,
}) {
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  const handleLeftPress = () => {
    if (onBack) {
      onBack();
    } else if (onLeftPress) {
      onLeftPress();
    } else {
      router.back();
    }
  };

  const LeftIconComponent = leftIcon;
  const showLeftButton = showBack || onLeftPress || onBack;

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
      {/* Bouton gauche (retour) */}
      {showLeftButton ? (
        <TouchableOpacity
          accessibilityLabel="Back"
          style={{ padding: 8, minWidth: 40 }}
          onPress={handleLeftPress}
        >
          <LeftIconComponent size={24} color={theme.colors.textTertiary} />
        </TouchableOpacity>
      ) : (
        <View style={{ width: 40, height: 40 }} />
      )}

      {/* Titre */}
      <Text
        style={{
          fontFamily: "Inter_500Medium",
          fontSize: 16,
          color: theme.colors.text,
          flex: 1,
          textAlign: "center",
        }}
        numberOfLines={1}
      >
        {title}
      </Text>

      {/* Composant droit personnalisé OU icône simple */}
      {rightComponent ? (
        <View style={{ minWidth: 40, alignItems: "flex-end" }}>
          {rightComponent}
        </View>
      ) : RightIcon ? (
        <TouchableOpacity
          accessibilityLabel="Menu"
          style={{ padding: 8, position: "relative", minWidth: 40 }}
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
