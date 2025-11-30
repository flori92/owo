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
import ScreenContainer from "@/components/ScreenContainer";
import HeaderBar from "@/components/HeaderBar";
import ActionButton from "@/components/ActionButton";
import LoadingScreen from "@/components/LoadingScreen";
import KeyboardAvoidingAnimatedView from "@/components/KeyboardAvoidingAnimatedView";

export default function AddTransactionScreen() {
  const insets = useSafeAreaInsets();
  const [transactionType, setTransactionType] = useState("expense"); // 'income' or 'expense'
  const [amount, setAmount] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [provider, setProvider] = useState("MTN Mobile Money");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const theme = useTheme();

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  const categories = {
    expense: [
      {
        id: "food",
        name: "Alimentation",
        icon: Utensils,
        color: theme.colors.categoryFood,
      },
      {
        id: "transport",
        name: "Transport",
        icon: Car,
        color: theme.colors.categoryTransport,
      },
      {
        id: "shopping",
        name: "Shopping",
        icon: ShoppingCart,
        color: theme.colors.categoryShopping,
      },
      {
        id: "utilities",
        name: "Factures",
        icon: Home,
        color: theme.colors.categoryUtilities,
      },
      {
        id: "communication",
        name: "Communications",
        icon: Smartphone,
        color: theme.colors.categoryUtilities,
      },
      {
        id: "entertainment",
        name: "Divertissement",
        icon: Gamepad2,
        color: theme.colors.categoryEntertainment,
      },
      {
        id: "other",
        name: "Autres",
        icon: DollarSign,
        color: theme.colors.categoryOther,
      },
    ],
    income: [
      {
        id: "salary",
        name: "Salaire",
        icon: DollarSign,
        color: theme.colors.success,
      },
      {
        id: "freelance",
        name: "Freelance",
        icon: DollarSign,
        color: theme.colors.success,
      },
      {
        id: "investment",
        name: "Investissement",
        icon: DollarSign,
        color: theme.colors.success,
      },
      {
        id: "gift",
        name: "Cadeau",
        icon: DollarSign,
        color: theme.colors.success,
      },
      {
        id: "other",
        name: "Autres",
        icon: DollarSign,
        color: theme.colors.success,
      },
    ],
  };

  const mobileMoneyProviders = [
    "MTN Mobile Money",
    "Moov Money",
    "Celtiis Cash",
  ];

  // Function to get AI categorization suggestion
  const getAiSuggestion = useCallback(
    async (title, description, type) => {
      if (!title.trim()) return;

      setIsAnalyzing(true);
      try {
        const response = await fetch("/api/ai/categorize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: title.trim(),
            description: description?.trim() || "",
            amount: parseFloat(amount) || 0,
            type,
          }),
        });

        if (response.ok) {
          const suggestion = await response.json();
          setAiSuggestion(suggestion);

          // Auto-select the AI suggested category if confidence is high
          if (suggestion.confidence > 0.7 && !category) {
            setCategory(suggestion.categoryId.toString());
          }
        }
      } catch (error) {
        console.error("Error getting AI suggestion:", error);
      } finally {
        setIsAnalyzing(false);
      }
    },
    [amount, category],
  );

  // Trigger AI suggestion when title changes
  const handleTitleChange = useCallback(
    (newTitle) => {
      setTitle(newTitle);
      if (newTitle.length > 3) {
        // Debounce the AI call
        const timeoutId = setTimeout(() => {
          getAiSuggestion(newTitle, description, transactionType);
        }, 1000);
        return () => clearTimeout(timeoutId);
      }
    },
    [description, transactionType, getAiSuggestion],
  );

  const handleSubmit = useCallback(async () => {
    if (!amount || !title || !category) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs obligatoires");
      return;
    }

    if (parseFloat(amount) <= 0) {
      Alert.alert("Erreur", "Le montant doit être supérieur à 0");
      return;
    }

    setIsSubmitting(true);

    try {
      // Create the transaction via API
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: 1, // Default user for now
          mobileMoneyAccountId: 1, // Default to first account for now
          categoryId: parseInt(category),
          title: title.trim(),
          description: description?.trim() || null,
          amount: parseFloat(amount),
          type: transactionType,
          referenceNumber: `TXN${Date.now()}`, // Generate reference
          transactionDate: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create transaction");
      }

      const newTransaction = await response.json();

      Alert.alert(
        "Succès",
        `Transaction ${newTransaction.is_ai_categorized ? "catégorisée automatiquement et " : ""}ajoutée avec succès!`,
        [
          {
            text: "OK",
            onPress: () => {
              // Reset form
              setAmount("");
              setTitle("");
              setCategory("");
              setDescription("");
              setAiSuggestion(null);
              // Navigate back or to transactions list
              router.push("/(tabs)/transactions");
            },
          },
        ],
      );
    } catch (error) {
      console.error("Transaction creation error:", error);
      Alert.alert(
        "Erreur",
        error.message ||
          "Impossible d'ajouter la transaction. Veuillez réessayer.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [amount, title, category, description, transactionType]);

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
          {/* Transaction Type Toggle */}
          <View style={{ marginBottom: 32 }}>
            <Text
              style={{
                fontFamily: "Inter_600SemiBold",
                fontSize: 16,
                color: theme.colors.text,
                marginBottom: 16,
              }}
            >
              Type de transaction
            </Text>

            <View
              style={{
                flexDirection: "row",
                backgroundColor: theme.colors.elevated,
                borderRadius: 12,
                padding: 4,
              }}
            >
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor:
                    transactionType === "expense"
                      ? theme.colors.error
                      : "transparent",
                  borderRadius: 8,
                  paddingVertical: 12,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onPress={() => {
                  setTransactionType("expense");
                  setCategory(""); // Reset category when changing type
                  setAiSuggestion(null);
                }}
              >
                <ArrowUpRight
                  size={20}
                  color={
                    transactionType === "expense"
                      ? "#FFFFFF"
                      : theme.colors.error
                  }
                  strokeWidth={1.5}
                />
                <Text
                  style={{
                    fontFamily: "Inter_600SemiBold",
                    fontSize: 14,
                    color:
                      transactionType === "expense"
                        ? "#FFFFFF"
                        : theme.colors.error,
                    marginLeft: 8,
                  }}
                >
                  Dépense
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor:
                    transactionType === "income"
                      ? theme.colors.success
                      : "transparent",
                  borderRadius: 8,
                  paddingVertical: 12,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onPress={() => {
                  setTransactionType("income");
                  setCategory(""); // Reset category when changing type
                  setAiSuggestion(null);
                }}
              >
                <ArrowDownLeft
                  size={20}
                  color={
                    transactionType === "income"
                      ? "#FFFFFF"
                      : theme.colors.success
                  }
                  strokeWidth={1.5}
                />
                <Text
                  style={{
                    fontFamily: "Inter_600SemiBold",
                    fontSize: 14,
                    color:
                      transactionType === "income"
                        ? "#FFFFFF"
                        : theme.colors.success,
                    marginLeft: 8,
                  }}
                >
                  Revenu
                </Text>
              </TouchableOpacity>
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
              Titre *
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
                placeholder="Ex: Achat supermarché"
                placeholderTextColor={theme.colors.textSecondary}
                value={title}
                onChangeText={handleTitleChange}
              />
              {isAnalyzing && (
                <Text style={{ color: theme.colors.primary, fontSize: 12 }}>
                  IA...
                </Text>
              )}
            </View>

            {/* AI Suggestion */}
            {aiSuggestion && (
              <View
                style={{
                  backgroundColor: `${theme.colors.primary}15`,
                  borderRadius: 8,
                  padding: 12,
                  marginTop: 8,
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <View
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    backgroundColor: theme.colors.primary,
                    justifyContent: "center",
                    alignItems: "center",
                    marginRight: 8,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 10,
                      color: "#FFFFFF",
                      fontWeight: "bold",
                    }}
                  >
                    IA
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontFamily: "Inter_500Medium",
                      fontSize: 14,
                      color: theme.colors.text,
                      marginBottom: 2,
                    }}
                  >
                    Suggestion IA: {aiSuggestion.categoryName}
                  </Text>
                  <Text
                    style={{
                      fontFamily: "Inter_400Regular",
                      fontSize: 12,
                      color: theme.colors.textSecondary,
                    }}
                  >
                    Confiance: {Math.round(aiSuggestion.confidence * 100)}% •{" "}
                    {aiSuggestion.reasoning}
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Category Selection */}
          <View style={{ marginBottom: 24 }}>
            <Text
              style={{
                fontFamily: "Inter_600SemiBold",
                fontSize: 16,
                color: theme.colors.text,
                marginBottom: 12,
              }}
            >
              Catégorie *
            </Text>

            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 12,
              }}
            >
              {categories[transactionType].map((cat) => {
                const IconComponent = cat.icon;
                const isSelected = category === cat.id;

                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={{
                      backgroundColor: isSelected
                        ? cat.color
                        : theme.colors.elevated,
                      borderRadius: 12,
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      flexDirection: "row",
                      alignItems: "center",
                      minWidth: "45%",
                    }}
                    onPress={() => setCategory(cat.id)}
                  >
                    <IconComponent
                      size={18}
                      color={isSelected ? "#FFFFFF" : cat.color}
                      strokeWidth={1.5}
                    />
                    <Text
                      style={{
                        fontFamily: "Inter_500Medium",
                        fontSize: 14,
                        color: isSelected ? "#FFFFFF" : theme.colors.text,
                        marginLeft: 8,
                      }}
                    >
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Mobile Money Provider */}
          <View style={{ marginBottom: 24 }}>
            <Text
              style={{
                fontFamily: "Inter_600SemiBold",
                fontSize: 16,
                color: theme.colors.text,
                marginBottom: 8,
              }}
            >
              Fournisseur
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
                  {provider}
                </Text>
              </View>
              <ChevronDown
                size={20}
                color={theme.colors.textSecondary}
                strokeWidth={1.5}
              />
            </TouchableOpacity>
          </View>

          {/* Description Input */}
          <View style={{ marginBottom: 24 }}>
            <Text
              style={{
                fontFamily: "Inter_600SemiBold",
                fontSize: 16,
                color: theme.colors.text,
                marginBottom: 8,
              }}
            >
              Description (optionnelle)
            </Text>

            <View
              style={{
                flexDirection: "row",
                alignItems: "flex-start",
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
                style={{ marginTop: 2 }}
              />
              <TextInput
                style={{
                  flex: 1,
                  marginLeft: 12,
                  fontFamily: "Inter_400Regular",
                  fontSize: 16,
                  color: theme.colors.text,
                  minHeight: 60,
                  textAlignVertical: "top",
                }}
                placeholder="Ajouter une note..."
                placeholderTextColor={theme.colors.textSecondary}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
              />
            </View>
          </View>

          {/* AI Insight Box */}
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
              Conseil IA
            </Text>
            <Text
              style={{
                fontFamily: "Inter_400Regular",
                fontSize: 14,
                color: theme.colors.text,
                lineHeight: 20,
              }}
            >
              {transactionType === "expense"
                ? "Cette dépense sera automatiquement catégorisée et analysée pour vous proposer des conseils d'optimisation budgétaire."
                : "Excellent! Ce revenu contribue à améliorer votre santé financière. L'IA analysera vos habitudes pour vous proposer des stratégies d'épargne."}
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
            disabled={isSubmitting || !amount || !title || !category}
          />
        </View>
      </KeyboardAvoidingAnimatedView>
    </ScreenContainer>
  );
}
