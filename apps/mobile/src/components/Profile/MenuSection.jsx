import React from "react";
import { View, Text, TouchableOpacity, Switch } from "react-native";
import { ChevronRight } from "lucide-react-native";

export function MenuSection({ section, theme }) {
  return (
    <View style={{ marginBottom: 32 }}>
      <Text
        style={{
          fontFamily: "Inter_600SemiBold",
          fontSize: 16,
          color: theme.colors.text,
          marginBottom: 16,
        }}
      >
        {section.title}
      </Text>

      <View
        style={{
          backgroundColor: theme.colors.elevated,
          borderRadius: 12,
          padding: 8,
        }}
      >
        {section.items.map((item, index) => {
          const IconComponent = item.icon;

          return (
            <View key={item.id}>
              <TouchableOpacity
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 16,
                  paddingHorizontal: 12,
                }}
                onPress={item.onPress}
                disabled={item.hasSwitch}
              >
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: `${theme.colors.primary}20`,
                    justifyContent: "center",
                    alignItems: "center",
                    marginRight: 12,
                  }}
                >
                  <IconComponent
                    size={20}
                    color={theme.colors.primary}
                    strokeWidth={1.5}
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontFamily: "Inter_500Medium",
                      fontSize: 16,
                      color: theme.colors.text,
                      marginBottom: 2,
                    }}
                  >
                    {item.title}
                  </Text>
                  <Text
                    style={{
                      fontFamily: "Inter_400Regular",
                      fontSize: 14,
                      color: theme.colors.textSecondary,
                    }}
                  >
                    {item.subtitle}
                  </Text>
                </View>

                {item.hasSwitch ? (
                  <Switch
                    value={item.switchValue}
                    onValueChange={item.onSwitchChange}
                    trackColor={{
                      false: theme.colors.disabled,
                      true: `${theme.colors.primary}40`,
                    }}
                    thumbColor={
                      item.switchValue
                        ? theme.colors.primary
                        : theme.colors.textSecondary
                    }
                  />
                ) : (
                  <ChevronRight
                    size={20}
                    color={theme.colors.textSecondary}
                    strokeWidth={1.5}
                  />
                )}
              </TouchableOpacity>

              {index < section.items.length - 1 && (
                <View
                  style={{
                    height: 1,
                    backgroundColor: theme.colors.divider,
                    marginLeft: 64,
                  }}
                />
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}
