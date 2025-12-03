import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from "@expo-google-fonts/inter";
import {
  ArrowUpRight,
  ArrowDownLeft,
  ShoppingCart,
  Car,
  Home,
  Smartphone,
  Utensils,
  Gamepad2,
  DollarSign,
  Calendar,
  Hash,
  AlignLeft,
  ChevronDown,
} from "lucide-react-native";
import { router } from "expo-router";
import { useTheme } from "@/utils/useTheme";
import { useAuth, useWallets } from "@/hooks/useFirebase";
import { createTransaction } from "@/lib/firebase";
import ScreenContainer from "@/components/ScreenContainer";
import HeaderBar from "@/components/HeaderBar";
import ActionButton from "@/components/ActionButton";
import LoadingScreen from "@/components/LoadingScreen";
import KeyboardAvoidingAnimatedView from "@/components/KeyboardAvoidingAnimatedView";

export default function AddTransactionScreen() {
  const insets = useSafeAreaInsets();
  const [transactionType, setTransactionType] = useState("send"); // 'send', 'receive', 'deposit'
  const [amount, setAmount] = useState("");
  const [title, setTitle] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [walletId, setWalletId] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const theme = useTheme();

  // Récupérer l'utilisateur et ses wallets
  const { user } = useAuth();
  const { wallets } = useWallets(user?.$id);

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  const transactionTypes = [
    {
      id: "send",
      name: "Envoyer",
      icon: ArrowUpRight,
      color: theme.colors.error,
      description: "Envoyer de l'argent"
    },
    {
      id: "receive",
      name: "Recevoir",
      icon: ArrowDownLeft,
      color: theme.colors.success,
      description: "Recevoir de l'argent"
    },
    {
      id: "deposit",
      name: "Dépôt",
      icon: DollarSign,
      color: theme.colors.primary,
      description: "Déposer sur un compte"
    }
  ];

  // Set default wallet when wallets are loaded
  React.useEffect(() => {
    if (wallets.length > 0 && !walletId) {
      const primaryWallet = wallets.find(w => w.isPrimary) || wallets[0];
      setWalletId(primaryWallet.$id);
    }
  }, [wallets, walletId]);

  const handleSubmit = useCallback(async () => {
    if (!amount || !title || !walletId) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs obligatoires");
      return;
    }

    if (parseFloat(amount) <= 0) {
      Alert.alert("Erreur", "Le montant doit être supérieur à 0");
      return;
    }

    // Pour les transactions d'envoi, vérifier le destinataire
    if (transactionType === 'send' && (!recipientPhone || !recipientName)) {
      Alert.alert("Erreur", "Veuillez renseigner le destinataire");
      return;
    }

    setIsSubmitting(true);

    try {
      const transactionData = {
        userId: user.$id,
        walletId: walletId,
        type: transactionType,
        amount: parseFloat(amount),
        recipientPhone: recipientPhone || null,
        recipientName: recipientName || null,
        description: description || null,
      };

      const result = await createTransaction(transactionData);

      if (result.success) {
        Alert.alert(
          "Succès",
          `Transaction ajoutée avec succès! Référence: ${result.transaction.reference}`,
          [
            {
              text: "OK",
              onPress: () => {
                // Reset form
                setAmount("");
                setTitle("");
                setRecipientPhone("");
                setRecipientName("");
                setDescription("");
                // Navigate back
                router.back();
              },
            },
          ]
        );
      } else {
        Alert.alert("Erreur", result.error || "Impossible d'ajouter la transaction");
      }
    } catch (error) {
      console.error("Transaction creation error:", error);
      Alert.alert(
        "Erreur",
        "Impossible d'ajouter la transaction. Veuillez réessayer.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [amount, title, recipientPhone, recipientName, description, transactionType, walletId, user]);

  if (!fontsLoaded) {
    return <LoadingScreen />;
  }

  return (
    <ScreenContainer>
      <HeaderBar title="Ajouter transaction" />

      <KeyboardAvoidingAnimatedView style={{ flex: 1 }} behavior="padding">
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingVertical: 24,
            paddingBottom: insets.bottom + 100,
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Transaction Type Selection */}
          <View style={{ marginBottom: 32 }}>
            <Text
              style={{
                fontFamily: "Inter_600SemiBold",
                fontSize: 16,
                color: theme.colors.text,
                marginBottom: 16,
              }}
            >
              Type de transaction *
            </Text>

            <View
              style={{
                flexDirection: "row",
                backgroundColor: theme.colors.elevated,
                borderRadius: 12,
                padding: 4,
              }}
            >
              {transactionTypes.map((type) => {
                const IconComponent = type.icon;
                return (
                  <TouchableOpacity
                    key={type.id}
                    style={{
                      flex: 1,
                      backgroundColor:
                        transactionType === type.id
                          ? type.color
                          : "transparent",
                      borderRadius: 8,
                      paddingVertical: 12,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    onPress={() => {
                      setTransactionType(type.id);
                    }}
                  >
                    <IconComponent
                      size={20}
                      color={
                        transactionType === type.id
                          ? "#FFFFFF"
                          : type.color
                      }
                      strokeWidth={1.5}
                    />
                    <Text
                      style={{
                        fontFamily: "Inter_600SemiBold",
                        fontSize: 14,
                        color:
                          transactionType === type.id
                            ? "#FFFFFF"
                            : type.color,
                        marginLeft: 8,
                      }}
                    >
                      {type.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Amount Input */}
          <View style={{ marginBottom: 24 }}>
            <Text
              style={{
                fontFamily: "Inter_600SemiBold",
                fontSize: 16,
                color: theme.colors.text,
                marginBottom: 8,
              }}
            >
              Montant *
            </Text>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: theme.colors.elevated,
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 16,
              }}
            >
              <DollarSign
                size={20}
                color={theme.colors.textSecondary}
                strokeWidth={1.5}
              />
              <TextInput
                style={{
                  flex: 1,
                  marginLeft: 12,
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 18,
                  color: theme.colors.text,
                }}
                placeholder="0"
                placeholderTextColor={theme.colors.textSecondary}
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
              />
              <Text
                style={{
                  fontFamily: "Inter_500Medium",
                  fontSize: 16,
                  color: theme.colors.textSecondary,
                }}
              >
                FCFA
              </Text>
            </View>
          </View>

          {/* Wallet Selection */}
          <View style={{ marginBottom: 24 }}>
            <Text
              style={{
                fontFamily: "Inter_600SemiBold",
                fontSize: 16,
                color: theme.colors.text,
                marginBottom: 8,
              }}
            >
              Portefeuille *
            </Text>

            <TouchableOpacity
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: theme.colors.elevated,
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 16,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Smartphone
                  size={20}
                  color={theme.colors.textSecondary}
                  strokeWidth={1.5}
                />
                <Text
                  style={{
                    fontFamily: "Inter_500Medium",
                    fontSize: 16,
                    color: theme.colors.text,
                    marginLeft: 12,
                  }}
                >
                  {wallets.find(w => w.$id === walletId)?.provider || "Sélectionner..."}
                </Text>
              </View>
              <ChevronDown
                size={20}
                color={theme.colors.textSecondary}
                strokeWidth={1.5}
              />
            </TouchableOpacity>
          </View>

          {/* Recipient Fields (for send transactions) */}
          {transactionType === 'send' && (
            <>
              <View style={{ marginBottom: 24 }}>
                <Text
                  style={{
                    fontFamily: "Inter_600SemiBold",
                    fontSize: 16,
                    color: theme.colors.text,
                    marginBottom: 8,
                  }}
                >
                  Nom du destinataire *
                </Text>

                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: theme.colors.elevated,
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 16,
                  }}
                >
                  <Hash
                    size={20}
                    color={theme.colors.textSecondary}
                    strokeWidth={1.5}
                  />
                  <TextInput
                    style={{
                      flex: 1,
                      marginLeft: 12,
                      fontFamily: "Inter_500Medium",
                      fontSize: 16,
                      color: theme.colors.text,
                    }}
                    placeholder="Ex: Jean Kouadio"
                    placeholderTextColor={theme.colors.textSecondary}
                    value={recipientName}
                    onChangeText={setRecipientName}
                  />
                </View>
              </View>

              <View style={{ marginBottom: 24 }}>
                <Text
                  style={{
                    fontFamily: "Inter_600SemiBold",
                    fontSize: 16,
                    color: theme.colors.text,
                    marginBottom: 8,
                  }}
                >
                  Téléphone du destinataire *
                </Text>

                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: theme.colors.elevated,
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 16,
                  }}
                >
                  <Smartphone
                    size={20}
                    color={theme.colors.textSecondary}
                    strokeWidth={1.5}
                  />
                  <TextInput
                    style={{
                      flex: 1,
                      marginLeft: 12,
                      fontFamily: "Inter_500Medium",
                      fontSize: 16,
                      color: theme.colors.text,
                    }}
                    placeholder="Ex: +22507XXXXXXXX"
                    placeholderTextColor={theme.colors.textSecondary}
                    value={recipientPhone}
                    onChangeText={setRecipientPhone}
                    keyboardType="phone-pad"
                  />
                </View>
              </View>
            </>
          )}

          {/* Title Input */}
          <View style={{ marginBottom: 24 }}>
            <Text
              style={{
                fontFamily: "Inter_600SemiBold",
                fontSize: 16,
                color: theme.colors.text,
                marginBottom: 8,
              }}
            >
              Description *
            </Text>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: theme.colors.elevated,
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 16,
              }}
            >
              <AlignLeft
                size={20}
                color={theme.colors.textSecondary}
                strokeWidth={1.5}
              />
              <TextInput
                style={{
                  flex: 1,
                  marginLeft: 12,
                  fontFamily: "Inter_500Medium",
                  fontSize: 16,
                  color: theme.colors.text,
                }}
                placeholder={
                  transactionType === 'send' 
                    ? "Ex: Remboursement prêt" 
                    : transactionType === 'receive'
                    ? "Ex: Paiement freelance"
                    : "Ex: Dépôt de départ"
                }
                placeholderTextColor={theme.colors.textSecondary}
                value={title}
                onChangeText={setTitle}
              />
            </View>
          </View>

          {/* Info Box */}
          <View
            style={{
              backgroundColor: `${theme.colors.primary}15`,
              borderRadius: 12,
              padding: 16,
              marginBottom: 32,
            }}
          >
            <Text
              style={{
                fontFamily: "Inter_600SemiBold",
                fontSize: 14,
                color: theme.colors.primary,
                marginBottom: 8,
              }}
            >
              💡 Information
            </Text>
            <Text
              style={{
                fontFamily: "Inter_400Regular",
                fontSize: 14,
                color: theme.colors.text,
                lineHeight: 20,
              }}
            >
              {transactionType === "send"
                ? "L'argent sera débité de votre portefeuille et envoyé au destinataire."
                : transactionType === "receive"
                ? "L'argent sera ajouté à votre portefeuille."
                : "Le montant sera déposé sur le portefeuille sélectionné."}
            </Text>
          </View>
        </ScrollView>

        {/* Submit Button */}
        <View
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            padding: 24,
            paddingBottom: insets.bottom + 24,
            backgroundColor: theme.colors.background,
            borderTopWidth: 1,
            borderTopColor: theme.colors.border,
          }}
        >
          <ActionButton
            title={
              isSubmitting ? "Ajout en cours..." : "Ajouter la transaction"
            }
            onPress={handleSubmit}
            disabled={isSubmitting || !amount || !title || !walletId || (transactionType === 'send' && (!recipientPhone || !recipientName))}
          />
        </View>
      </KeyboardAvoidingAnimatedView>
    </ScreenContainer>
  );
}
