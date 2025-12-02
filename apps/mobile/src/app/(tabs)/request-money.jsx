import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
  Share,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import {
  ArrowLeft,
  HandCoins,
  Phone,
  DollarSign,
  Link,
  Copy,
  Share2,
  CreditCard,
  Smartphone,
  Check,
  ExternalLink,
  QrCode,
  MessageCircle,
} from "lucide-react-native";
import { useTheme } from "@/utils/useTheme";
import { useBalance } from "@/contexts/BalanceContext";
import { detectOperator, formatPhoneNumber } from "@/utils/phoneValidator";
import { OPERATORS, COUNTRY_NAMES } from "@/utils/operators";
import ScreenContainer from "@/components/ScreenContainer";
import { IS_DEMO_MODE, getDemoMessage } from "@/config/appConfig";
import * as Clipboard from "expo-clipboard";

export default function RequestMoneyScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { EXCHANGE_RATE } = useBalance();

  const [phoneNumber, setPhoneNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [detectedInfo, setDetectedInfo] = useState(null);
  
  // États pour le lien de paiement
  const [requestCreated, setRequestCreated] = useState(false);
  const [paymentLink, setPaymentLink] = useState("");
  const [requestCode, setRequestCode] = useState("");
  const [shareModalVisible, setShareModalVisible] = useState(false);

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
    // Validation du montant uniquement (le numéro est optionnel maintenant)
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      Alert.alert("Montant invalide", "Veuillez entrer un montant valide");
      return;
    }

    setIsLoading(true);

    // Générer un code unique et un lien de paiement
    setTimeout(() => {
      const code = `REQ-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      const link = `https://pay.owo-app.com/r/${code}`;
      
      setRequestCode(code);
      setPaymentLink(link);
      setRequestCreated(true);
      setIsLoading(false);
    }, 1000);
  };

  const copyToClipboard = async (text, label) => {
    await Clipboard.setStringAsync(text);
    Alert.alert("Copié !", `${label} copié dans le presse-papier`);
  };

  const shareRequest = async () => {
    const amountNum = parseFloat(amount);
    try {
      await Share.share({
        message: `Demande de paiement owo!\n\n` +
          `Bonjour ! Je te demande ${amount} FCFA via owo!.\n\n` +
          `Si tu as l'app owo!, utilise ce code : ${requestCode}\n\n` +
          `Sinon, paie directement ici (Carte ou Mobile Money) :\n${paymentLink}\n\n` +
          `Merci !`,
        title: "Demande de paiement",
      });
    } catch (error) {
      console.error("Erreur partage:", error);
    }
  };

  const sendViaSMS = () => {
    if (!phoneNumber) {
      Alert.alert("Info", "Ajoutez un numéro de téléphone pour envoyer par SMS");
      return;
    }
    
    const amountNum = parseFloat(amount);
    const message = `Demande de ${amountNum.toLocaleString('fr-FR')} FCFA via owo!. ` +
      `Paie ici: ${paymentLink}`;
    
    // En production, utiliser Linking pour ouvrir l'app SMS
    Alert.alert(
      "Envoyer par SMS",
      `Message à ${formatPhoneNumber(phoneNumber)}:\n\n"${message}"${getDemoMessage("dataNotPersisted")}`
    );
  };

  const createNewRequest = () => {
    setRequestCreated(false);
    setPaymentLink("");
    setRequestCode("");
    setAmount("");
    setReason("");
    setPhoneNumber("");
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

        {/* Écran de succès avec lien de paiement */}
        {requestCreated ? (
          <View style={{ flex: 1 }}>
            {/* Success Icon */}
            <View style={{ alignItems: "center", marginBottom: 32 }}>
              <View
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  backgroundColor: `${theme.colors.success}15`,
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: 16,
                }}
              >
                <Check size={40} color={theme.colors.success} strokeWidth={2} />
              </View>
              <Text
                style={{
                  fontSize: 24,
                  fontWeight: "700",
                  color: theme.colors.text,
                  textAlign: "center",
                }}
              >
                Demande créée !
              </Text>
              <Text
                style={{
                  fontSize: 28,
                  fontWeight: "700",
                  color: theme.colors.primary,
                  marginTop: 8,
                }}
              >
                {parseFloat(amount).toLocaleString('fr-FR')} FCFA
              </Text>
              {reason && (
                <Text
                  style={{
                    fontSize: 14,
                    color: theme.colors.textSecondary,
                    marginTop: 4,
                  }}
                >
                  {reason}
                </Text>
              )}
            </View>

            {/* Code de demande */}
            <View
              style={{
                backgroundColor: `${theme.colors.primary}10`,
                borderRadius: 16,
                padding: 20,
                marginBottom: 16,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: theme.colors.primary,
                  }}
                >
                  Code de demande
                </Text>
                <TouchableOpacity
                  onPress={() => copyToClipboard(requestCode, "Code")}
                  style={{ flexDirection: "row", alignItems: "center" }}
                >
                  <Copy size={16} color={theme.colors.primary} strokeWidth={2} />
                  <Text
                    style={{
                      fontSize: 12,
                      color: theme.colors.primary,
                      marginLeft: 4,
                    }}
                  >
                    Copier
                  </Text>
                </TouchableOpacity>
              </View>
              <Text
                style={{
                  fontSize: 24,
                  fontWeight: "700",
                  color: theme.colors.text,
                  letterSpacing: 2,
                  textAlign: "center",
                }}
              >
                {requestCode}
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  color: theme.colors.textSecondary,
                  textAlign: "center",
                  marginTop: 8,
                }}
              >
                Pour les utilisateurs de l'app owo!
              </Text>
            </View>

            {/* Lien de paiement externe */}
            <View
              style={{
                backgroundColor: theme.colors.cardBackground,
                borderRadius: 16,
                padding: 20,
                marginBottom: 24,
                borderWidth: 2,
                borderColor: theme.colors.success,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <Link size={20} color={theme.colors.success} strokeWidth={2} />
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "600",
                    color: theme.colors.text,
                    marginLeft: 10,
                  }}
                >
                  Lien de paiement universel
                </Text>
              </View>
              <Text
                style={{
                  fontSize: 13,
                  color: theme.colors.textSecondary,
                  marginBottom: 16,
                  lineHeight: 20,
                }}
              >
                Ce lien permet à n'importe qui de payer, même sans l'app owo! :
              </Text>
              
              {/* Méthodes de paiement acceptées */}
              <View style={{ flexDirection: "row", gap: 12, marginBottom: 16 }}>
                <View
                  style={{
                    flex: 1,
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: `${theme.colors.info}10`,
                    borderRadius: 10,
                    padding: 12,
                  }}
                >
                  <CreditCard size={18} color={theme.colors.info} strokeWidth={1.5} />
                  <Text
                    style={{
                      fontSize: 12,
                      color: theme.colors.text,
                      marginLeft: 8,
                    }}
                  >
                    Carte Visa/MC
                  </Text>
                </View>
                <View
                  style={{
                    flex: 1,
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: "#FF6B0010",
                    borderRadius: 10,
                    padding: 12,
                  }}
                >
                  <Smartphone size={18} color="#FF6B00" strokeWidth={1.5} />
                  <Text
                    style={{
                      fontSize: 12,
                      color: theme.colors.text,
                      marginLeft: 8,
                    }}
                  >
                    Mobile Money
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => copyToClipboard(paymentLink, "Lien")}
                style={{
                  backgroundColor: theme.colors.background,
                  borderRadius: 10,
                  padding: 14,
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    flex: 1,
                    fontSize: 13,
                    color: theme.colors.primary,
                  }}
                  numberOfLines={1}
                >
                  {paymentLink}
                </Text>
                <Copy size={18} color={theme.colors.textSecondary} strokeWidth={2} />
              </TouchableOpacity>
            </View>

            {/* Boutons de partage */}
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: theme.colors.text,
                marginBottom: 12,
              }}
            >
              Partager la demande
            </Text>

            <View style={{ gap: 12 }}>
              <TouchableOpacity
                onPress={shareRequest}
                style={{
                  backgroundColor: theme.colors.primary,
                  borderRadius: 14,
                  paddingVertical: 16,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Share2 size={20} color="#FFFFFF" strokeWidth={2} />
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "600",
                    color: "#FFFFFF",
                    marginLeft: 10,
                  }}
                >
                  Partager (WhatsApp, SMS, etc.)
                </Text>
              </TouchableOpacity>

              {phoneNumber && (
                <TouchableOpacity
                  onPress={sendViaSMS}
                  style={{
                    backgroundColor: theme.colors.cardBackground,
                    borderRadius: 14,
                    paddingVertical: 16,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    borderWidth: 1,
                    borderColor: theme.colors.border,
                  }}
                >
                  <MessageCircle size={20} color={theme.colors.text} strokeWidth={2} />
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "600",
                      color: theme.colors.text,
                      marginLeft: 10,
                    }}
                  >
                    Envoyer par SMS à {formatPhoneNumber(phoneNumber)}
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                onPress={createNewRequest}
                style={{
                  paddingVertical: 16,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    color: theme.colors.textSecondary,
                  }}
                >
                  Créer une nouvelle demande
                </Text>
              </TouchableOpacity>
            </View>

            {/* Info mode démo */}
            {IS_DEMO_MODE && (
              <View
                style={{
                  backgroundColor: `${theme.colors.accent}10`,
                  borderRadius: 12,
                  padding: 16,
                  marginTop: 24,
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    color: theme.colors.accent,
                  }}
                >
                  💡 Mode démo : En production, le lien ouvrira une page de paiement sécurisée acceptant Visa, Mastercard, Orange Money, MTN, Wave, etc.
                </Text>
              </View>
            )}
          </View>
        ) : (
          <>
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
            💡 Créez une demande de paiement et partagez le lien. La personne pourra payer par carte ou Mobile Money, même sans avoir l'app owo!
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
          </>
        )}
      </ScrollView>

      {/* Bouton de demande fixe en bas - seulement si demande pas encore créée */}
      {!requestCreated && (
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
            disabled={isLoading || !amount}
            style={{
              backgroundColor: theme.colors.secondary || theme.colors.primary,
              borderRadius: 16,
              paddingVertical: 18,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              opacity: isLoading || !amount ? 0.5 : 1,
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
                  Créer la demande
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </ScreenContainer>
  );
}
