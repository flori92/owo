import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Edit } from "lucide-react-native";

export function UserInfoCard({
  userProfile,
  user,
  userData,
  theme,
  onEditPress,
}) {
  const getDisplayName = () => {
    if (userProfile?.first_name) {
      return `${userProfile.first_name} ${userProfile.last_name || ""}`.trim();
    }
    return user?.name || "Utilisateur";
  };

  return (
    <View
      style={{
        backgroundColor: theme.colors.elevated,
        borderRadius: 16,
        padding: 24,
        marginBottom: 32,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <View
          style={{
            width: 60,
            height: 60,
            borderRadius: 30,
            backgroundColor: theme.colors.primary,
            justifyContent: "center",
            alignItems: "center",
            marginRight: 16,
          }}
        >
          <Text
            style={{
              fontFamily: "Inter_600SemiBold",
              fontSize: 24,
              color: "#FFFFFF",
            }}
          >
            {getDisplayName().charAt(0).toUpperCase()}
          </Text>
        </View>

        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontFamily: "Inter_600SemiBold",
              fontSize: 20,
              color: theme.colors.text,
              marginBottom: 4,
            }}
          >
            {getDisplayName()}
          </Text>
          <Text
            style={{
              fontFamily: "Inter_400Regular",
              fontSize: 14,
              color: theme.colors.textSecondary,
              marginBottom: 2,
            }}
          >
            {userProfile?.email || user?.email}
          </Text>
          <Text
            style={{
              fontFamily: "Inter_400Regular",
              fontSize: 14,
              color: theme.colors.textSecondary,
            }}
          >
            Membre depuis {userData.joinDate}
          </Text>
        </View>

        <TouchableOpacity onPress={onEditPress}>
          <Edit size={20} color={theme.colors.primary} strokeWidth={1.5} />
        </TouchableOpacity>
      </View>

      {/* Quick Stats */}
      <View
        style={{
          flexDirection: "row",
          gap: 16,
          paddingTop: 16,
          borderTopWidth: 1,
          borderTopColor: theme.colors.divider,
        }}
      >
        <View style={{ flex: 1, alignItems: "center" }}>
          <Text
            style={{
              fontFamily: "Inter_600SemiBold",
              fontSize: 18,
              color: theme.colors.primary,
              marginBottom: 4,
            }}
          >
            {userData.totalSavings.toLocaleString()}
          </Text>
          <Text
            style={{
              fontFamily: "Inter_400Regular",
              fontSize: 13,
              color: theme.colors.textSecondary,
              textAlign: "center",
            }}
          >
            Économies totales (FCFA)
          </Text>
        </View>

        <View
          style={{
            width: 1,
            backgroundColor: theme.colors.divider,
          }}
        />

        <View style={{ flex: 1, alignItems: "center" }}>
          <Text
            style={{
              fontFamily: "Inter_600SemiBold",
              fontSize: 18,
              color: theme.colors.success,
              marginBottom: 4,
            }}
          >
            {userData.goalProgress}%
          </Text>
          <Text
            style={{
              fontFamily: "Inter_400Regular",
              fontSize: 13,
              color: theme.colors.textSecondary,
              textAlign: "center",
            }}
          >
            Objectif atteint
          </Text>
        </View>
      </View>
    </View>
  );
}
