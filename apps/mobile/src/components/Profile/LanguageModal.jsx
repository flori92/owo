import React from "react";
import { View, Text, TouchableOpacity, ScrollView, Modal } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Check } from "lucide-react-native";

export function LanguageModal({
  visible,
  onClose,
  theme,
  supportedLanguages,
  currentLanguage,
  onSelectLanguage,
}) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.5)",
          justifyContent: "flex-end",
        }}
      >
        <View
          style={{
            backgroundColor: theme.colors.elevated,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            paddingTop: 20,
            paddingBottom: insets.bottom + 20,
            maxHeight: "50%",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingHorizontal: 24,
              paddingBottom: 20,
              borderBottomWidth: 1,
              borderBottomColor: theme.colors.divider,
            }}
          >
            <Text
              style={{
                fontFamily: "Inter_600SemiBold",
                fontSize: 18,
                color: theme.colors.text,
              }}
            >
              Choisir la langue
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Text
                style={{
                  fontFamily: "Inter_500Medium",
                  fontSize: 16,
                  color: theme.colors.textSecondary,
                }}
              >
                Fermer
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 16 }}
          >
            {supportedLanguages.map((language, index) => (
              <TouchableOpacity
                key={language.code}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 16,
                  borderBottomWidth:
                    index < supportedLanguages.length - 1 ? 1 : 0,
                  borderBottomColor: theme.colors.divider,
                }}
                onPress={() => onSelectLanguage(language.code)}
              >
                <Text
                  style={{
                    fontSize: 24,
                    marginRight: 16,
                  }}
                >
                  {language.flag}
                </Text>

                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontFamily: "Inter_500Medium",
                      fontSize: 16,
                      color: theme.colors.text,
                      marginBottom: 2,
                    }}
                  >
                    {language.nativeName}
                  </Text>
                  <Text
                    style={{
                      fontFamily: "Inter_400Regular",
                      fontSize: 14,
                      color: theme.colors.textSecondary,
                    }}
                  >
                    {language.name}
                  </Text>
                </View>

                {currentLanguage === language.code && (
                  <Check
                    size={20}
                    color={theme.colors.primary}
                    strokeWidth={2}
                  />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
