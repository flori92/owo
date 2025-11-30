import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Animated,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import {
  CreditCard,
  Eye,
  EyeOff,
  Copy,
  Plus,
  Minus,
  Lock,
  Unlock,
  Settings,
  ShoppingCart,
  Globe,
  Smartphone,
  Zap,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  Calendar,
  Sparkles,
  Shield,
  Wallet,
} from "lucide-react-native";
import { useTheme } from "@/utils/useTheme";
import { useBalance } from "@/contexts/BalanceContext";
import ScreenContainer from "@/components/ScreenContainer";
import HeaderBar from "@/components/HeaderBar";
import ActionButton from "@/components/ActionButton";
import LoadingScreen from "@/components/LoadingScreen";

const { width: screenWidth } = Dimensions.get("window");
const cardWidth = screenWidth - 48; // 24px margin on each side

export default function VirtualCardScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const flipAnim = useRef(new Animated.Value(0)).current;
  const { balances, rechargeVirtualCard } = useBalance();

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const [isCardRevealed, setIsCardRevealed] = useState(false);
  const [isCardFrozen, setIsCardFrozen] = useState(false);
  const [isCardFlipped, setIsCardFlipped] = useState(false);

  // Mock card data avec nouvelle identité Owo!
  const cardData = {
    cardNumber: "5258 1234 5678 9012",
    cardHolder: "JEAN KOUADIO",
    expiryDate: "12/28",
    cvv: "123",
    provider: "owo! Visa",
    dailyLimit: 1000,
    monthlyLimit: 5000,
    spentToday: 150,
    spentThisMonth: 850,
  };

  // Recent transactions avec couleurs Owo!
  const recentTransactions = [
    {
      id: 1,
      merchant: "Amazon",
      amount: 89.99,
      currency: "EUR",
      date: new Date(),
      status: "completed",
      category: "Shopping",
      description: "Achat en ligne",
      categoryColor: theme.colors.categoryShopping,
    },
    {
      id: 2,
      merchant: "Netflix",
      amount: 13.99,
      currency: "EUR",
      date: new Date(Date.now() - 24 * 60 * 60 * 1000),
      status: "completed",
      category: "Divertissement",
      description: "Abonnement mensuel",
      categoryColor: theme.colors.categoryEntertainment,
    },
    {
      id: 3,
      merchant: "Uber",
      amount: 24.5,
      currency: "EUR",
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      status: "completed",
      category: "Transport",
      description: "Course",
      categoryColor: theme.colors.categoryTransport,
    },
  ];

  const handleCardFlip = () => {
    const toValue = isCardFlipped ? 0 : 1;

    Animated.spring(flipAnim, {
      toValue,
      tension: 80,
      friction: 8,
      useNativeDriver: true,
    }).start();

    setIsCardFlipped(!isCardFlipped);
  };

  const copyCardNumber = () => {
    Alert.alert(
      "Copié",
      "Numéro de carte owo! copié dans le presse-papiers",
    );
  };

  const toggleCardFreeze = () => {
    setIsCardFrozen(!isCardFrozen);
    Alert.alert(
      isCardFrozen ? "Carte débloquée" : "Carte gelée",
      isCardFrozen
        ? "Votre carte virtuelle owo! est maintenant active pour les paiements"
        : "Votre carte virtuelle owo! est temporairement gelée",
    );
  };

  const addFunds = () => {
    Alert.alert(
      "Recharger la carte owo!",
      `Sélectionnez le montant à ajouter depuis vos comptes européens\n\nSolde disponible: ${balances.europeanBanks.total.toFixed(2)} €`,
      [
        { text: "50 €", onPress: () => rechargeFunds(50) },
        { text: "100 €", onPress: () => rechargeFunds(100) },
        { text: "200 €", onPress: () => rechargeFunds(200) },
        { text: "Montant personnalisé", onPress: () => customAmount() },
        { text: "Annuler", style: "cancel" },
      ],
    );
  };

  const rechargeFunds = (amount) => {
    rechargeVirtualCard(amount);
  };

  const customAmount = () => {
    Alert.prompt(
      "Montant personnalisé",
      `Entrez le montant à ajouter (EUR):\n\nSolde disponible: ${balances.europeanBanks.total.toFixed(2)} €`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Confirmer",
          onPress: (value) => {
            const amount = parseFloat(value);
            if (amount && amount > 0 && amount <= balances.europeanBanks.total) {
              rechargeFunds(amount);
            } else if (amount > balances.europeanBanks.total) {
              Alert.alert(
                "Solde insuffisant",
                `Vous ne pouvez pas recharger plus que votre solde disponible (${balances.europeanBanks.total.toFixed(2)} €)`
              );
            } else {
              Alert.alert("Erreur", "Montant invalide");
            }
          },
        },
      ],
      "plain-text",
      "",
      "decimal-pad",
    );
  };

  if (!fontsLoaded) {
    return <LoadingScreen />;
  }

  const frontInterpolate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  const backInterpolate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["180deg", "360deg"],
  });

  return (
    <ScreenContainer>
      <HeaderBar title="Carte Virtuelle owo!" />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingVertical: 20,
          paddingBottom: insets.bottom + 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Virtual Card avec identité Owo! */}
        <View
          style={{
            height: 220,
            marginBottom: 32,
            alignItems: "center",
          }}
        >
          <View style={{ position: "relative", width: cardWidth, height: 200 }}>
            {/* Card Front avec couleurs Owo! */}
            <Animated.View
              style={{
                position: "absolute",
                width: "100%",
                height: "100%",
                backfaceVisibility: "hidden",
                transform: [{ rotateY: frontInterpolate }],
              }}
            >
              <View
                style={{
                  width: "100%",
                  height: "100%",
                  backgroundColor: theme.colors.primary, // Turquoise Owo!
                  borderRadius: 20,
                  padding: 24,
                  justifyContent: "space-between",
                  shadowColor: theme.colors.shadowColor,
                  shadowOffset: { width: 0, height: 12 },
                  shadowOpacity: 0.2,
                  shadowRadius: 20,
                  elevation: 15,
                }}
              >
                {/* Card Header avec logo Owo! */}
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Text
                      style={{
                        fontFamily: "Inter_700Bold",
                        fontSize: 18,
                        color: "#FFFFFF",
                      }}
                    >
                      {cardData.provider}
                    </Text>
                    <Sparkles
                      size={16}
                      color={theme.colors.gold}
                      strokeWidth={1.5}
                      style={{ marginLeft: 6 }}
                    />
                  </View>

                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    {/* Logo Visa modernisé */}
                    <View
                      style={{
                        width: 36,
                        height: 22,
                        backgroundColor: "#FFFFFF",
                        borderRadius: 6,
                        marginRight: -6,
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: "Inter_700Bold",
                          fontSize: 10,
                          color: theme.colors.primary,
                        }}
                      >
                        VISA
                      </Text>
                    </View>
                    <View
                      style={{
                        width: 36,
                        height: 22,
                        backgroundColor: theme.colors.gold, // Or Owo!
                        borderRadius: 6,
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: "Inter_700Bold",
                          fontSize: 8,
                          color: "#FFFFFF",
                        }}
                      >
                        owo!
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Card Number */}
                <View>
                  <TouchableOpacity onPress={copyCardNumber}>
                    <Text
                      style={{
                        fontFamily: "Inter_700Bold",
                        fontSize: 22,
                        color: "#FFFFFF",
                        letterSpacing: 3,
                        marginBottom: 12,
                      }}
                    >
                      {isCardRevealed
                        ? cardData.cardNumber
                        : "•••• •••• •••• " + cardData.cardNumber.slice(-4)}
                    </Text>
                  </TouchableOpacity>

                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "flex-end",
                    }}
                  >
                    <View>
                      <Text
                        style={{
                          fontFamily: "Inter_400Regular",
                          fontSize: 11,
                          color: "rgba(255,255,255,0.7)",
                          marginBottom: 4,
                        }}
                      >
                        TITULAIRE
                      </Text>
                      <Text
                        style={{
                          fontFamily: "Inter_600SemiBold",
                          fontSize: 15,
                          color: "#FFFFFF",
                        }}
                      >
                        {cardData.cardHolder}
                      </Text>
                    </View>

                    <View>
                      <Text
                        style={{
                          fontFamily: "Inter_400Regular",
                          fontSize: 11,
                          color: "rgba(255,255,255,0.7)",
                          marginBottom: 4,
                        }}
                      >
                        EXPIRE FIN
                      </Text>
                      <Text
                        style={{
                          fontFamily: "Inter_600SemiBold",
                          fontSize: 15,
                          color: "#FFFFFF",
                        }}
                      >
                        {cardData.expiryDate}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </Animated.View>

            {/* Card Back */}
            <Animated.View
              style={{
                position: "absolute",
                width: "100%",
                height: "100%",
                backfaceVisibility: "hidden",
                transform: [{ rotateY: backInterpolate }],
              }}
            >
              <View
                style={{
                  width: "100%",
                  height: "100%",
                  backgroundColor: "#1A2332", // Dark theme color
                  borderRadius: 20,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 12 },
                  shadowOpacity: 0.2,
                  shadowRadius: 20,
                  elevation: 15,
                }}
              >
                {/* Magnetic Strip */}
                <View
                  style={{
                    backgroundColor: "#000",
                    height: 40,
                    width: "100%",
                    marginTop: 24,
                  }}
                />

                {/* CVV */}
                <View
                  style={{
                    padding: 24,
                    flex: 1,
                    justifyContent: "center",
                  }}
                >
                  <View
                    style={{
                      backgroundColor: "#FFFFFF",
                      borderRadius: 8,
                      padding: 16,
                      alignItems: "flex-end",
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: "Inter_700Bold",
                        fontSize: 18,
                        color: "#000",
                        letterSpacing: 4,
                      }}
                    >
                      {isCardRevealed ? cardData.cvv : "•••"}
                    </Text>
                  </View>

                  <Text
                    style={{
                      fontFamily: "Inter_400Regular",
                      fontSize: 11,
                      color: "rgba(255,255,255,0.7)",
                      textAlign: "right",
                      marginTop: 8,
                    }}
                  >
                    Code CVV
                  </Text>
                </View>
              </View>
            </Animated.View>
          </View>

          {/* Card Controls avec style Owo! */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              gap: 16,
              marginTop: 20,
            }}
          >
            <TouchableOpacity
              style={{
                backgroundColor: theme.colors.elevated,
                borderRadius: 30,
                paddingHorizontal: 20,
                paddingVertical: 10,
                flexDirection: "row",
                alignItems: "center",
                borderWidth: 1,
                borderColor: theme.colors.border,
              }}
              onPress={() => setIsCardRevealed(!isCardRevealed)}
            >
              {isCardRevealed ? (
                <EyeOff size={16} color={theme.colors.text} strokeWidth={1.5} />
              ) : (
                <Eye size={16} color={theme.colors.text} strokeWidth={1.5} />
              )}
              <Text
                style={{
                  fontFamily: "Inter_500Medium",
                  fontSize: 13,
                  color: theme.colors.text,
                  marginLeft: 8,
                }}
              >
                {isCardRevealed ? "Masquer" : "Révéler"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                backgroundColor: theme.colors.elevated,
                borderRadius: 30,
                paddingHorizontal: 20,
                paddingVertical: 10,
                flexDirection: "row",
                alignItems: "center",
                borderWidth: 1,
                borderColor: theme.colors.border,
              }}
              onPress={handleCardFlip}
            >
              <CreditCard
                size={16}
                color={theme.colors.text}
                strokeWidth={1.5}
              />
              <Text
                style={{
                  fontFamily: "Inter_500Medium",
                  fontSize: 13,
                  color: theme.colors.text,
                  marginLeft: 8,
                }}
              >
                Retourner
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Card Status & Balance avec design Owo! */}
        <View
          style={{
            backgroundColor: theme.colors.elevated,
            borderRadius: 20,
            padding: 24,
            marginBottom: 24,
            shadowColor: theme.colors.shadowColor,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 12,
            elevation: 6,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 20,
            }}
          >
            <Text
              style={{
                fontFamily: "Inter_600SemiBold",
                fontSize: 20,
                color: theme.colors.text,
              }}
            >
              Solde de la carte
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: isCardFrozen
                  ? `${theme.colors.error}15`
                  : `${theme.colors.success}15`,
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 25,
              }}
            >
              {isCardFrozen ? (
                <Lock size={16} color={theme.colors.error} strokeWidth={1.5} />
              ) : (
                <Shield
                  size={16}
                  color={theme.colors.success}
                  strokeWidth={1.5}
                />
              )}
              <Text
                style={{
                  fontFamily: "Inter_500Medium",
                  fontSize: 13,
                  color: isCardFrozen
                    ? theme.colors.error
                    : theme.colors.success,
                  marginLeft: 8,
                }}
              >
                {isCardFrozen ? "Gelée" : "Active"}
              </Text>
            </View>
          </View>

          <View
            style={{
              alignItems: "center",
              marginBottom: 24,
            }}
          >
            <Text
              style={{
                fontFamily: "Inter_700Bold",
                fontSize: 36,
                color: theme.colors.text,
                marginBottom: 8,
              }}
            >
              {balances.virtualCard.balance.toLocaleString("fr-FR", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{" "}
              €
            </Text>
            <Text
              style={{
                fontFamily: "Inter_400Regular",
                fontSize: 15,
                color: theme.colors.textSecondary,
              }}
            >
              Disponible pour les achats en ligne
            </Text>
          </View>

          {/* Action Buttons avec couleurs Owo! */}
          <View
            style={{
              flexDirection: "row",
              gap: 12,
            }}
          >
            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: theme.colors.primary, // Turquoise Owo!
                borderRadius: 16,
                paddingVertical: 16,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                shadowColor: theme.colors.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
                elevation: 6,
              }}
              onPress={addFunds}
            >
              <Plus size={20} color="#FFFFFF" strokeWidth={2} />
              <Text
                style={{
                  fontFamily: "Inter_700Bold",
                  fontSize: 15,
                  color: "#FFFFFF",
                  marginLeft: 8,
                }}
              >
                Recharger
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: isCardFrozen
                  ? theme.colors.success
                  : theme.colors.accent, // Or Owo!
                borderRadius: 16,
                paddingVertical: 16,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                shadowColor: isCardFrozen
                  ? theme.colors.success
                  : theme.colors.accent,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
                elevation: 6,
              }}
              onPress={toggleCardFreeze}
            >
              {isCardFrozen ? (
                <Unlock size={20} color="#FFFFFF" strokeWidth={2} />
              ) : (
                <Lock size={20} color="#FFFFFF" strokeWidth={2} />
              )}
              <Text
                style={{
                  fontFamily: "Inter_700Bold",
                  fontSize: 15,
                  color: "#FFFFFF",
                  marginLeft: 8,
                }}
              >
                {isCardFrozen ? "Débloquer" : "Geler"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Spending Limits avec style moderne */}
        <View
          style={{
            backgroundColor: theme.colors.elevated,
            borderRadius: 20,
            padding: 24,
            marginBottom: 24,
            shadowColor: theme.colors.shadowColor,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 12,
            elevation: 6,
          }}
        >
          <Text
            style={{
              fontFamily: "Inter_600SemiBold",
              fontSize: 20,
              color: theme.colors.text,
              marginBottom: 24,
            }}
          >
            Limites de dépense
          </Text>

          {/* Daily Limit */}
          <View style={{ marginBottom: 20 }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <Text
                style={{
                  fontFamily: "Inter_500Medium",
                  fontSize: 15,
                  color: theme.colors.text,
                }}
              >
                Limite journalière
              </Text>
              <Text
                style={{
                  fontFamily: "Inter_700Bold",
                  fontSize: 15,
                  color: theme.colors.text,
                }}
              >
                {cardData.spentToday}€ / {cardData.dailyLimit}€
              </Text>
            </View>
            <View
              style={{
                backgroundColor: theme.colors.background,
                borderRadius: 10,
                height: 8,
                overflow: "hidden",
              }}
            >
              <View
                style={{
                  backgroundColor: theme.colors.primary, // Turquoise Owo!
                  height: "100%",
                  width: `${(cardData.spentToday / cardData.dailyLimit) * 100}%`,
                  borderRadius: 10,
                }}
              />
            </View>
          </View>

          {/* Monthly Limit */}
          <View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <Text
                style={{
                  fontFamily: "Inter_500Medium",
                  fontSize: 15,
                  color: theme.colors.text,
                }}
              >
                Limite mensuelle
              </Text>
              <Text
                style={{
                  fontFamily: "Inter_700Bold",
                  fontSize: 15,
                  color: theme.colors.text,
                }}
              >
                {cardData.spentThisMonth}€ / {cardData.monthlyLimit}€
              </Text>
            </View>
            <View
              style={{
                backgroundColor: theme.colors.background,
                borderRadius: 10,
                height: 8,
                overflow: "hidden",
              }}
            >
              <View
                style={{
                  backgroundColor: theme.colors.accent, // Or Owo!
                  height: "100%",
                  width: `${(cardData.spentThisMonth / cardData.monthlyLimit) * 100}%`,
                  borderRadius: 10,
                }}
              />
            </View>
          </View>
        </View>

        {/* Recent Transactions avec couleurs Owo! */}
        <View
          style={{
            backgroundColor: theme.colors.elevated,
            borderRadius: 20,
            padding: 24,
            marginBottom: 24,
            shadowColor: theme.colors.shadowColor,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 12,
            elevation: 6,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 20,
            }}
          >
            <Text
              style={{
                fontFamily: "Inter_600SemiBold",
                fontSize: 20,
                color: theme.colors.text,
              }}
            >
              Transactions récentes
            </Text>
            <TouchableOpacity>
              <Text
                style={{
                  fontFamily: "Inter_500Medium",
                  fontSize: 14,
                  color: theme.colors.primary, // Turquoise Owo!
                }}
              >
                Voir tout
              </Text>
            </TouchableOpacity>
          </View>

          <View style={{ gap: 16 }}>
            {recentTransactions.map((transaction) => (
              <View
                key={transaction.id}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 12,
                  borderBottomWidth:
                    transaction.id !== recentTransactions.length ? 1 : 0,
                  borderBottomColor: theme.colors.divider,
                }}
              >
                <View
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    backgroundColor: `${transaction.categoryColor}20`,
                    justifyContent: "center",
                    alignItems: "center",
                    marginRight: 16,
                  }}
                >
                  <ShoppingCart
                    size={20}
                    color={transaction.categoryColor}
                    strokeWidth={1.5}
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontFamily: "Inter_600SemiBold",
                      fontSize: 15,
                      color: theme.colors.text,
                      marginBottom: 4,
                    }}
                  >
                    {transaction.merchant}
                  </Text>
                  <Text
                    style={{
                      fontFamily: "Inter_400Regular",
                      fontSize: 13,
                      color: theme.colors.textSecondary,
                    }}
                  >
                    {transaction.description} •{" "}
                    {transaction.date.toLocaleDateString("fr-FR")}
                  </Text>
                </View>

                <Text
                  style={{
                    fontFamily: "Inter_700Bold",
                    fontSize: 16,
                    color: theme.colors.error,
                  }}
                >
                  -{transaction.amount.toFixed(2)} {transaction.currency}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Features Info avec identité Owo! */}
        <View
          style={{
            backgroundColor: `${theme.colors.primary}15`, // Turquoise Owo! transparent
            borderRadius: 16,
            padding: 20,
            borderLeftWidth: 4,
            borderLeftColor: theme.colors.primary,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <Text
              style={{
                fontFamily: "Inter_600SemiBold",
                fontSize: 16,
                color: theme.colors.primary,
                marginRight: 8,
              }}
            >
              Avantages de la carte owo! Visa
            </Text>
            <Sparkles size={16} color={theme.colors.gold} strokeWidth={1.5} />
          </View>

          <View style={{ gap: 12 }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Globe size={18} color={theme.colors.primary} strokeWidth={1.5} />
              <Text
                style={{
                  fontFamily: "Inter_400Regular",
                  fontSize: 14,
                  color: theme.colors.text,
                  marginLeft: 12,
                }}
              >
                Acceptée partout dans le monde
              </Text>
            </View>

            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Zap size={18} color={theme.colors.accent} strokeWidth={1.5} />
              <Text
                style={{
                  fontFamily: "Inter_400Regular",
                  fontSize: 14,
                  color: theme.colors.text,
                  marginLeft: 12,
                }}
              >
                Génération instantanée
              </Text>
            </View>

            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Shield
                size={18}
                color={theme.colors.success}
                strokeWidth={1.5}
              />
              <Text
                style={{
                  fontFamily: "Inter_400Regular",
                  fontSize: 14,
                  color: theme.colors.text,
                  marginLeft: 12,
                }}
              >
                Sécurité maximale avec gel instantané
              </Text>
            </View>

            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Wallet size={18} color={theme.colors.accent} strokeWidth={1.5} />
              <Text
                style={{
                  fontFamily: "Inter_400Regular",
                  fontSize: 14,
                  color: theme.colors.text,
                  marginLeft: 12,
                }}
              >
                Rechargement depuis vos comptes owo!
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
