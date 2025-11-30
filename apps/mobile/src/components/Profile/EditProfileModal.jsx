import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ScreenContainer from "@/components/ScreenContainer";

export function EditProfileModal({
  visible,
  onClose,
  theme,
  formData,
  onSave,
  saving,
}) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <ScreenContainer>
        <View
          style={{
            paddingTop: insets.top + 16,
            paddingHorizontal: 24,
            paddingBottom: 16,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <TouchableOpacity onPress={onClose}>
            <Text
              style={{
                fontFamily: "Inter_500Medium",
                fontSize: 16,
                color: theme.colors.textSecondary,
              }}
            >
              Annuler
            </Text>
          </TouchableOpacity>

          <Text
            style={{
              fontFamily: "Inter_600SemiBold",
              fontSize: 18,
              color: theme.colors.text,
            }}
          >
            Modifier le profil
          </Text>

          <TouchableOpacity
            onPress={onSave}
            disabled={saving}
            style={{ opacity: saving ? 0.5 : 1 }}
          >
            <Text
              style={{
                fontFamily: "Inter_600SemiBold",
                fontSize: 16,
                color: theme.colors.primary,
              }}
            >
              Sauver
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingVertical: 20,
            paddingBottom: insets.bottom + 20,
          }}
          showsVerticalScrollIndicator={false}
        >
          <View style={{ gap: 20 }}>
            {/* Prénom */}
            <View>
              <Text
                style={{
                  fontFamily: "Inter_500Medium",
                  fontSize: 16,
                  color: theme.colors.text,
                  marginBottom: 8,
                }}
              >
                Prénom
              </Text>
              <TextInput
                style={{
                  backgroundColor: theme.colors.elevated,
                  borderRadius: 12,
                  padding: 16,
                  fontSize: 16,
                  color: theme.colors.text,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                }}
                value={formData.firstName}
                onChangeText={formData.setFirstName}
                placeholder="Votre prénom"
                placeholderTextColor={theme.colors.textSecondary}
              />
            </View>

            {/* Nom */}
            <View>
              <Text
                style={{
                  fontFamily: "Inter_500Medium",
                  fontSize: 16,
                  color: theme.colors.text,
                  marginBottom: 8,
                }}
              >
                Nom
              </Text>
              <TextInput
                style={{
                  backgroundColor: theme.colors.elevated,
                  borderRadius: 12,
                  padding: 16,
                  fontSize: 16,
                  color: theme.colors.text,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                }}
                value={formData.lastName}
                onChangeText={formData.setLastName}
                placeholder="Votre nom"
                placeholderTextColor={theme.colors.textSecondary}
              />
            </View>

            {/* Email */}
            <View>
              <Text
                style={{
                  fontFamily: "Inter_500Medium",
                  fontSize: 16,
                  color: theme.colors.text,
                  marginBottom: 8,
                }}
              >
                Email
              </Text>
              <TextInput
                style={{
                  backgroundColor: theme.colors.elevated,
                  borderRadius: 12,
                  padding: 16,
                  fontSize: 16,
                  color: theme.colors.text,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                }}
                value={formData.email}
                onChangeText={formData.setEmail}
                placeholder="votre@email.com"
                placeholderTextColor={theme.colors.textSecondary}
                keyboardType="email-address"
              />
            </View>

            {/* Téléphone */}
            <View>
              <Text
                style={{
                  fontFamily: "Inter_500Medium",
                  fontSize: 16,
                  color: theme.colors.text,
                  marginBottom: 8,
                }}
              >
                Téléphone
              </Text>
              <TextInput
                style={{
                  backgroundColor: theme.colors.elevated,
                  borderRadius: 12,
                  padding: 16,
                  fontSize: 16,
                  color: theme.colors.text,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                }}
                value={formData.phone}
                onChangeText={formData.setPhone}
                placeholder="+229 XX XX XX XX"
                placeholderTextColor={theme.colors.textSecondary}
                keyboardType="phone-pad"
              />
            </View>

            {/* Adresse */}
            <View>
              <Text
                style={{
                  fontFamily: "Inter_500Medium",
                  fontSize: 16,
                  color: theme.colors.text,
                  marginBottom: 8,
                }}
              >
                Adresse
              </Text>
              <TextInput
                style={{
                  backgroundColor: theme.colors.elevated,
                  borderRadius: 12,
                  padding: 16,
                  fontSize: 16,
                  color: theme.colors.text,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                }}
                value={formData.address}
                onChangeText={formData.setAddress}
                placeholder="Votre adresse"
                placeholderTextColor={theme.colors.textSecondary}
              />
            </View>

            {/* Ville */}
            <View>
              <Text
                style={{
                  fontFamily: "Inter_500Medium",
                  fontSize: 16,
                  color: theme.colors.text,
                  marginBottom: 8,
                }}
              >
                Ville
              </Text>
              <TextInput
                style={{
                  backgroundColor: theme.colors.elevated,
                  borderRadius: 12,
                  padding: 16,
                  fontSize: 16,
                  color: theme.colors.text,
                  borderWidth: 1,
                  borderColor: theme.colors.border,
                }}
                value={formData.city}
                onChangeText={formData.setCity}
                placeholder="Votre ville"
                placeholderTextColor={theme.colors.textSecondary}
              />
            </View>
          </View>
        </ScrollView>
      </ScreenContainer>
    </Modal>
  );
}
