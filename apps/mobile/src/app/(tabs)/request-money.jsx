import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { ArrowLeft, HandCoins, Phone, DollarSign } from "lucide-react-native";
import { useTheme } from "@/utils/useTheme";
import { useBalance } from "@/contexts/BalanceContext";
import { detectOperator, formatPhoneNumber } from "@/utils/phoneValidator";
import { OPERATORS, COUNTRY_NAMES } from "@/utils/operators";
import ScreenContainer from "@/components/ScreenContainer";

export default function RequestMoneyScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { EXCHANGE_RATE } = useBalance();

  const [phoneNumber, setPhoneNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [detectedInfo, setDetectedInfo] = useState(null);

  // Détecter l'opérateur lors de la saisie du numéro
  const handlePhoneChange = (text) => {
    setPhoneNumber(text);

    if (text.length > 8) {
      const detection = detectOperator(text);
      setDetectedInfo(detection);
    } else {
      setDetectedInfo(null);
    }
  };

  const handleRequest = async () => {
    // Validation
    if (!phoneNumber || !amount) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs obligatoires");
      return;
    }

    const detection = detectOperator(phoneNumber);
    if (!detection.isValid) {
      Alert.alert(
        "Numéro invalide",
        "Ce numéro ne correspond à aucun opérateur mobile money connu"
      );
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      Alert.alert("Montant invalide", "Veuillez entrer un montant valide");
      return;
    }

    setIsLoading(true);

    // Simuler l'envoi de la demande (dans une vraie app, appeler l'API backend)
    setTimeout(() => {
      setIsLoading(false);

      Alert.alert(
        "Demande envoyée!",
        `Une demande de ${amountNum.toLocaleString('fr-FR')} FCFA a été envoyée au ${formatPhoneNumber(phoneNumber)}${reason ? `\n\nMotif: ${reason}` : ''}\n\nOpérateur: ${OPERATORS[detection.operator]?.name}\nPays: ${COUNTRY_NAMES[detection.country]}\n\nVous serez notifié quand la personne aura répondu.`,
        [
          {
            text: "OK",
            onPress: () => {
              router.back();
            },
          },
        ]
      );
    }, 1500);
  };

  return (
    <ScreenContainer>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: insets.top + 16,
          paddingHorizontal: 24,
          paddingBottom: insets.bottom + 80,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 32 }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              backgroundColor: theme.colors.cardBackground,
              justifyContent: "center",
              alignItems: "center",
              marginRight: 16,
            }}
          >
            <ArrowLeft color={theme.colors.text} size={20} />
          </TouchableOpacity>
          <View>
            <Text
              style={{
                fontSize: 24,
                fontWeight: "700",
                color: theme.colors.text,
              }}
            >
              Demander de l'argent
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: theme.colors.textSecondary,
                marginTop: 4,
              }}
            >
              À un proche via mobile money
            </Text>
          </View>
        </View>

        {/* Info Box */}
        <View
          style={{
            backgroundColor: theme.colors.info + "15",
            borderRadius: 16,
            padding: 20,
            marginBottom: 32,
            borderLeftWidth: 4,
            borderLeftColor: theme.colors.info,
          }}
        >
          <Text
            style={{
              fontSize: 14,
              color: theme.colors.text,
              lineHeight: 20,
            }}
          >
            💡 La personne recevra une notification avec votre demande. Elle pourra l'accepter ou la refuser.
          </Text>
        </View>

        {/* Formulaire */}
        <View style={{ gap: 24 }}>
          {/* Numéro de téléphone */}
          <View>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: theme.colors.text,
                marginBottom: 8,
              }}
            >
              Numéro du contact *
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: theme.colors.cardBackground,
                borderRadius: 12,
                paddingHorizontal: 16,
                borderWidth: 1,
                borderColor: detectedInfo?.isValid
                  ? theme.colors.success
                  : theme.colors.border,
              }}
            >
              <Phone color={theme.colors.textSecondary} size={20} />
              <TextInput
                style={{
                  flex: 1,
                  fontSize: 16,
                  color: theme.colors.text,
                  paddingVertical: 16,
                  paddingHorizontal: 12,
                }}
                placeholder="+229 XX XX XX XX"
                placeholderTextColor={theme.colors.textSecondary}
                keyboardType="phone-pad"
                value={phoneNumber}
                onChangeText={handlePhoneChange}
              />
            </View>
            {detectedInfo?.isValid && (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginTop: 8,
                  gap: 8,
                }}
              >
                <View
                  style={{
                    backgroundColor: OPERATORS[detectedInfo.operator]?.color,
                    paddingHorizontal: 12,
                    paddingVertical: 4,
                    borderRadius: 8,
                  }}
                >
                  <Text style={{ color: "#FFFFFF", fontSize: 12, fontWeight: "600" }}>
                    {OPERATORS[detectedInfo.operator]?.name}
                  </Text>
                </View>
                <Text style={{ fontSize: 12, color: theme.colors.textSecondary }}>
                  {COUNTRY_NAMES[detectedInfo.country]}
                </Text>
              </View>
            )}
          </View>

          {/* Montant */}
          <View>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: theme.colors.text,
                marginBottom: 8,
              }}
            >
              Montant demandé *
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: theme.colors.cardBackground,
                borderRadius: 12,
                paddingHorizontal: 16,
                borderWidth: 1,
                borderColor: theme.colors.border,
              }}
            >
              <DollarSign color={theme.colors.textSecondary} size={20} />
              <TextInput
                style={{
                  flex: 1,
                  fontSize: 16,
                  color: theme.colors.text,
                  paddingVertical: 16,
                  paddingHorizontal: 12,
                }}
                placeholder="0"
                placeholderTextColor={theme.colors.textSecondary}
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
              />
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  color: theme.colors.textSecondary,
                }}
              >
                FCFA
              </Text>
            </View>
            {amount && !isNaN(parseFloat(amount)) && (
              <Text
                style={{
                  fontSize: 13,
                  color: theme.colors.textSecondary,
                  marginTop: 8,
                }}
              >
                ≈ {(parseFloat(amount) / EXCHANGE_RATE).toFixed(2)} EUR
              </Text>
            )}
          </View>

          {/* Montants rapides */}
          <View>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: theme.colors.text,
                marginBottom: 8,
              }}
            >
              Montants rapides
            </Text>
            <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
              {[1000, 5000, 10000, 25000, 50000].map((quickAmount) => (
                <TouchableOpacity
                  key={quickAmount}
                  onPress={() => setAmount(quickAmount.toString())}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 10,
                    borderRadius: 8,
                    backgroundColor:
                      amount === quickAmount.toString()
                        ? theme.colors.primary
                        : theme.colors.cardBackground,
                    borderWidth: 1,
                    borderColor:
                      amount === quickAmount.toString()
                        ? theme.colors.primary
                        : theme.colors.border,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "600",
                      color:
                        amount === quickAmount.toString()
                          ? "#FFFFFF"
                          : theme.colors.text,
                    }}
                  >
                    {quickAmount.toLocaleString('fr-FR')} F
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Motif (optionnel) */}
          <View>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: theme.colors.text,
                marginBottom: 8,
              }}
            >
              Motif de la demande (optionnel)
            </Text>
            <TextInput
              style={{
                backgroundColor: theme.colors.cardBackground,
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 16,
                fontSize: 16,
                color: theme.colors.text,
                borderWidth: 1,
                borderColor: theme.colors.border,
                minHeight: 100,
                textAlignVertical: "top",
              }}
              placeholder="Ex: Remboursement repas, Cotisation, etc."
              placeholderTextColor={theme.colors.textSecondary}
              value={reason}
              onChangeText={setReason}
              multiline
              numberOfLines={4}
            />
          </View>
        </View>
      </ScrollView>

      {/* Bouton de demande fixe en bas */}
      <View
        style={{
          position: "absolute",
          bottom: insets.bottom + 16,
          left: 24,
          right: 24,
        }}
      >
        <TouchableOpacity
          onPress={handleRequest}
          disabled={isLoading || !phoneNumber || !amount}
          style={{
            backgroundColor: theme.colors.secondary || theme.colors.primary,
            borderRadius: 16,
            paddingVertical: 18,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            opacity: isLoading || !phoneNumber || !amount ? 0.5 : 1,
          }}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <HandCoins color="#FFFFFF" size={20} />
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  color: "#FFFFFF",
                }}
              >
                Envoyer la demande
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </ScreenContainer>
  );
}
