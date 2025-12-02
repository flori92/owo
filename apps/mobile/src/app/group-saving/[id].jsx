import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
  Modal,
  Share,
  Linking,
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
  Users,
  Share2,
  Copy,
  Link,
  CreditCard,
  Smartphone,
  Plus,
  Calendar,
  Target,
  TrendingUp,
  Settings,
  UserPlus,
  ExternalLink,
  Check,
  Clock,
} from "lucide-react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useTheme } from "@/utils/useTheme";
import ScreenContainer from "@/components/ScreenContainer";
import HeaderBar from "@/components/HeaderBar";
import LoadingScreen from "@/components/LoadingScreen";
import { IS_DEMO_MODE, getDemoMessage } from "@/config/appConfig";
import * as Clipboard from "expo-clipboard";

export default function GroupSavingDetailScreen() {
  const { id } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  // Données mock de la cagnotte
  const [saving, setSaving] = useState(null);
  const [loading, setLoading] = useState(true);
  const [contributeModalVisible, setContributeModalVisible] = useState(false);
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [contributionAmount, setContributionAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("mobileMoney");

  // Contributions mock
  const [contributions, setContributions] = useState([
    { id: 1, name: "Kofi A.", amount: 50000, date: "2024-11-28", avatar: "K" },
    { id: 2, name: "Ama K.", amount: 35000, date: "2024-11-25", avatar: "A" },
    { id: 3, name: "Yao M.", amount: 25000, date: "2024-11-20", avatar: "Y" },
    { id: 4, name: "Akua B.", amount: 15000, date: "2024-11-15", avatar: "A" },
  ]);

  useEffect(() => {
    // Simuler le chargement des données
    setTimeout(() => {
      setSaving({
        id: id,
        title: id === "demo-1" ? "Voyage à Abidjan" : "Cadeau anniversaire Maman",
        description: id === "demo-1" 
          ? "Vacances en famille pour Noël 2025" 
          : "Surprise pour ses 60 ans",
        current_amount: id === "demo-1" ? 125000 : 75000,
        target_amount: id === "demo-1" ? 250000 : 100000,
        currency: "FCFA",
        member_count: id === "demo-1" ? 4 : 3,
        target_date: id === "demo-1" ? "2025-12-20" : "2025-03-15",
        invite_code: id === "demo-1" ? "OWO-ABIDJAN" : "OWO-MAMAN60",
        is_completed: false,
        is_private: id !== "demo-1",
        created_at: "2024-11-01",
        organizer: "Vous",
        // Lien de paiement externe (pour ceux qui n'ont pas l'app)
        payment_link: `https://pay.owo-app.com/c/${id === "demo-1" ? "OWO-ABIDJAN" : "OWO-MAMAN60"}`,
      });
      setLoading(false);
    }, 500);
  }, [id]);

  const copyToClipboard = async (text, label) => {
    await Clipboard.setStringAsync(text);
    Alert.alert("Copié !", `${label} copié dans le presse-papier`);
  };

  const shareInvite = async () => {
    if (!saving) return;

    try {
      await Share.share({
        message: `Rejoins ma cagnotte "${saving.title}" sur owo!\n\n` +
          `Objectif : ${saving.target_amount.toLocaleString()} ${saving.currency}\n\n` +
          `Code d'invitation : ${saving.invite_code}\n\n` +
          `Ou contribue directement (même sans l'app) :\n${saving.payment_link}\n\n` +
          `Télécharge owo! : https://owo-app.com/download`,
        title: `Cagnotte ${saving.title}`,
      });
    } catch (error) {
      console.error("Erreur partage:", error);
    }
  };

  const contribute = () => {
    if (!contributionAmount || parseFloat(contributionAmount) <= 0) {
      Alert.alert("Erreur", "Veuillez entrer un montant valide");
      return;
    }

    const amount = parseFloat(contributionAmount);
    const methodLabel = paymentMethod === "mobileMoney" ? "Mobile Money" : 
                        paymentMethod === "card" ? "Carte bancaire" : "Solde owo!";

    Alert.alert(
      "Confirmer la contribution",
      `Contribuer ${amount.toLocaleString()} FCFA via ${methodLabel} ?`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Confirmer",
          onPress: () => {
            // Ajouter la contribution
            const newContribution = {
              id: Date.now(),
              name: "Vous",
              amount: amount,
              date: new Date().toISOString().split("T")[0],
              avatar: "V",
            };
            setContributions((prev) => [newContribution, ...prev]);
            
            // Mettre à jour le montant
            setSaving((prev) => ({
              ...prev,
              current_amount: prev.current_amount + amount,
            }));

            setContributeModalVisible(false);
            setContributionAmount("");
            
            Alert.alert(
              "Merci !",
              `Votre contribution de ${amount.toLocaleString()} FCFA a été ajoutée.${getDemoMessage("dataNotPersisted")}`
            );
          },
        },
      ]
    );
  };

  const openPaymentLink = () => {
    if (saving?.payment_link) {
      Alert.alert(
        "Lien de paiement",
        "Ce lien permet à n'importe qui de contribuer à la cagnotte, même sans avoir l'application owo!.\n\nIls pourront payer par :\n• Carte bancaire (Visa/Mastercard)\n• Mobile Money (Orange, MTN, Wave...)",
        [
          { text: "Annuler", style: "cancel" },
          {
            text: "Ouvrir",
            onPress: () => {
              // En production, ouvrir le lien
              Alert.alert("Mode démo", `Le lien serait : ${saving.payment_link}`);
            },
          },
        ]
      );
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const getProgressPercentage = () => {
    if (!saving) return 0;
    return Math.min((saving.current_amount / saving.target_amount) * 100, 100);
  };

  if (!fontsLoaded || loading) {
    return <LoadingScreen />;
  }

  if (!saving) {
    return (
      <ScreenContainer>
        <HeaderBar title="Cagnotte" showBack onBack={() => router.back()} />
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text style={{ color: theme.colors.textSecondary }}>Cagnotte introuvable</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <HeaderBar
        title={saving.title}
        showBack={true}
        onBack={() => router.back()}
        rightComponent={
          <TouchableOpacity onPress={() => Alert.alert("Paramètres", "Options de la cagnotte")}>
            <Settings size={22} color={theme.colors.textSecondary} strokeWidth={2} />
          </TouchableOpacity>
        }
      />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingVertical: 20,
          paddingBottom: insets.bottom + 100,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Progress Card */}
        <View
          style={{
            backgroundColor: theme.colors.elevated,
            borderRadius: 24,
            padding: 24,
            marginBottom: 20,
          }}
        >
          <View style={{ alignItems: "center", marginBottom: 20 }}>
            <Text
              style={{
                fontFamily: "Inter_400Regular",
                fontSize: 14,
                color: theme.colors.textSecondary,
                marginBottom: 4,
              }}
            >
              Montant collecté
            </Text>
            <Text
              style={{
                fontFamily: "Inter_700Bold",
                fontSize: 36,
                color: theme.colors.text,
              }}
            >
              {saving.current_amount.toLocaleString()}
            </Text>
            <Text
              style={{
                fontFamily: "Inter_500Medium",
                fontSize: 16,
                color: theme.colors.textSecondary,
              }}
            >
              sur {saving.target_amount.toLocaleString()} {saving.currency}
            </Text>
          </View>

          {/* Progress bar */}
          <View
            style={{
              backgroundColor: theme.colors.background,
              borderRadius: 12,
              height: 12,
              overflow: "hidden",
              marginBottom: 12,
            }}
          >
            <View
              style={{
                backgroundColor: getProgressPercentage() >= 100 
                  ? theme.colors.success 
                  : theme.colors.primary,
                height: "100%",
                width: `${getProgressPercentage()}%`,
                borderRadius: 12,
              }}
            />
          </View>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontFamily: "Inter_600SemiBold",
                fontSize: 16,
                color: getProgressPercentage() >= 100 
                  ? theme.colors.success 
                  : theme.colors.primary,
              }}
            >
              {getProgressPercentage().toFixed(1)}% atteint
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Users size={16} color={theme.colors.textSecondary} strokeWidth={1.5} />
              <Text
                style={{
                  fontFamily: "Inter_500Medium",
                  fontSize: 14,
                  color: theme.colors.textSecondary,
                  marginLeft: 4,
                }}
              >
                {saving.member_count} participants
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={{ flexDirection: "row", gap: 12, marginBottom: 24 }}>
          <TouchableOpacity
            onPress={() => setContributeModalVisible(true)}
            style={{
              flex: 1,
              backgroundColor: theme.colors.primary,
              borderRadius: 16,
              paddingVertical: 16,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Plus size={20} color="#FFFFFF" strokeWidth={2} />
            <Text
              style={{
                fontFamily: "Inter_600SemiBold",
                fontSize: 15,
                color: "#FFFFFF",
                marginLeft: 8,
              }}
            >
              Contribuer
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setShareModalVisible(true)}
            style={{
              flex: 1,
              backgroundColor: theme.colors.elevated,
              borderRadius: 16,
              paddingVertical: 16,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 1,
              borderColor: theme.colors.border,
            }}
          >
            <Share2 size={20} color={theme.colors.primary} strokeWidth={2} />
            <Text
              style={{
                fontFamily: "Inter_600SemiBold",
                fontSize: 15,
                color: theme.colors.primary,
                marginLeft: 8,
              }}
            >
              Partager
            </Text>
          </TouchableOpacity>
        </View>

        {/* Info Cards */}
        <View style={{ flexDirection: "row", gap: 12, marginBottom: 24 }}>
          <View
            style={{
              flex: 1,
              backgroundColor: theme.colors.elevated,
              borderRadius: 16,
              padding: 16,
            }}
          >
            <Calendar size={20} color={theme.colors.accent} strokeWidth={1.5} />
            <Text
              style={{
                fontFamily: "Inter_400Regular",
                fontSize: 12,
                color: theme.colors.textSecondary,
                marginTop: 8,
              }}
            >
              Date limite
            </Text>
            <Text
              style={{
                fontFamily: "Inter_600SemiBold",
                fontSize: 14,
                color: theme.colors.text,
              }}
            >
              {formatDate(saving.target_date)}
            </Text>
          </View>

          <View
            style={{
              flex: 1,
              backgroundColor: theme.colors.elevated,
              borderRadius: 16,
              padding: 16,
            }}
          >
            <Target size={20} color={theme.colors.success} strokeWidth={1.5} />
            <Text
              style={{
                fontFamily: "Inter_400Regular",
                fontSize: 12,
                color: theme.colors.textSecondary,
                marginTop: 8,
              }}
            >
              Reste à collecter
            </Text>
            <Text
              style={{
                fontFamily: "Inter_600SemiBold",
                fontSize: 14,
                color: theme.colors.text,
              }}
            >
              {Math.max(0, saving.target_amount - saving.current_amount).toLocaleString()} {saving.currency}
            </Text>
          </View>
        </View>

        {/* Invite Code Card */}
        <View
          style={{
            backgroundColor: `${theme.colors.primary}10`,
            borderRadius: 16,
            padding: 20,
            marginBottom: 24,
          }}
        >
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
                fontFamily: "Inter_600SemiBold",
                fontSize: 14,
                color: theme.colors.primary,
              }}
            >
              Code d'invitation
            </Text>
            <TouchableOpacity
              onPress={() => copyToClipboard(saving.invite_code, "Code")}
              style={{
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Copy size={16} color={theme.colors.primary} strokeWidth={2} />
              <Text
                style={{
                  fontFamily: "Inter_500Medium",
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
              fontFamily: "Inter_700Bold",
              fontSize: 24,
              color: theme.colors.text,
              letterSpacing: 2,
              textAlign: "center",
            }}
          >
            {saving.invite_code}
          </Text>
        </View>

        {/* Payment Link Card */}
        <TouchableOpacity
          onPress={openPaymentLink}
          style={{
            backgroundColor: theme.colors.elevated,
            borderRadius: 16,
            padding: 20,
            marginBottom: 24,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: `${theme.colors.success}15`,
              justifyContent: "center",
              alignItems: "center",
              marginRight: 16,
            }}
          >
            <Link size={24} color={theme.colors.success} strokeWidth={1.5} />
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontFamily: "Inter_600SemiBold",
                fontSize: 15,
                color: theme.colors.text,
                marginBottom: 2,
              }}
            >
              Lien de paiement externe
            </Text>
            <Text
              style={{
                fontFamily: "Inter_400Regular",
                fontSize: 13,
                color: theme.colors.textSecondary,
              }}
            >
              Permettre à tous de contribuer (Carte, Mobile Money)
            </Text>
          </View>
          <ExternalLink size={20} color={theme.colors.textSecondary} strokeWidth={1.5} />
        </TouchableOpacity>

        {/* Recent Contributions */}
        <View style={{ marginBottom: 20 }}>
          <Text
            style={{
              fontFamily: "Inter_600SemiBold",
              fontSize: 18,
              color: theme.colors.text,
              marginBottom: 16,
            }}
          >
            Contributions récentes
          </Text>

          {contributions.map((contribution) => (
            <View
              key={contribution.id}
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: theme.colors.elevated,
                borderRadius: 12,
                padding: 16,
                marginBottom: 10,
              }}
            >
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: theme.colors.primary,
                  justifyContent: "center",
                  alignItems: "center",
                  marginRight: 12,
                }}
              >
                <Text
                  style={{
                    fontFamily: "Inter_600SemiBold",
                    fontSize: 18,
                    color: "#FFFFFF",
                  }}
                >
                  {contribution.avatar}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontFamily: "Inter_500Medium",
                    fontSize: 15,
                    color: theme.colors.text,
                  }}
                >
                  {contribution.name}
                </Text>
                <Text
                  style={{
                    fontFamily: "Inter_400Regular",
                    fontSize: 12,
                    color: theme.colors.textSecondary,
                  }}
                >
                  {formatDate(contribution.date)}
                </Text>
              </View>
              <Text
                style={{
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 15,
                  color: theme.colors.success,
                }}
              >
                +{contribution.amount.toLocaleString()} FCFA
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Contribute Modal */}
      <Modal
        visible={contributeModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setContributeModalVisible(false)}
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
              backgroundColor: theme.colors.background,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              padding: 24,
              paddingBottom: insets.bottom + 24,
            }}
          >
            <Text
              style={{
                fontFamily: "Inter_700Bold",
                fontSize: 20,
                color: theme.colors.text,
                marginBottom: 20,
                textAlign: "center",
              }}
            >
              Contribuer à la cagnotte
            </Text>

            {/* Amount Input */}
            <View style={{ marginBottom: 20 }}>
              <Text
                style={{
                  fontFamily: "Inter_500Medium",
                  fontSize: 14,
                  color: theme.colors.text,
                  marginBottom: 8,
                }}
              >
                Montant de la contribution
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: theme.colors.elevated,
                  borderRadius: 12,
                  paddingHorizontal: 16,
                }}
              >
                <TextInput
                  style={{
                    flex: 1,
                    paddingVertical: 16,
                    fontSize: 24,
                    fontFamily: "Inter_700Bold",
                    color: theme.colors.text,
                  }}
                  value={contributionAmount}
                  onChangeText={setContributionAmount}
                  placeholder="0"
                  placeholderTextColor={theme.colors.textSecondary}
                  keyboardType="numeric"
                />
                <Text
                  style={{
                    fontFamily: "Inter_600SemiBold",
                    fontSize: 16,
                    color: theme.colors.textSecondary,
                  }}
                >
                  FCFA
                </Text>
              </View>
            </View>

            {/* Payment Method */}
            <View style={{ marginBottom: 24 }}>
              <Text
                style={{
                  fontFamily: "Inter_500Medium",
                  fontSize: 14,
                  color: theme.colors.text,
                  marginBottom: 12,
                }}
              >
                Mode de paiement
              </Text>

              {[
                { id: "owoBalance", label: "Solde owo!", icon: Target, color: theme.colors.primary },
                { id: "mobileMoney", label: "Mobile Money", icon: Smartphone, color: "#FF6B00" },
                { id: "card", label: "Carte bancaire", icon: CreditCard, color: "#1A73E8" },
              ].map((method) => (
                <TouchableOpacity
                  key={method.id}
                  onPress={() => setPaymentMethod(method.id)}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: paymentMethod === method.id 
                      ? `${method.color}15` 
                      : theme.colors.elevated,
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 10,
                    borderWidth: 2,
                    borderColor: paymentMethod === method.id 
                      ? method.color 
                      : "transparent",
                  }}
                >
                  <method.icon size={24} color={method.color} strokeWidth={1.5} />
                  <Text
                    style={{
                      fontFamily: "Inter_500Medium",
                      fontSize: 15,
                      color: theme.colors.text,
                      marginLeft: 12,
                      flex: 1,
                    }}
                  >
                    {method.label}
                  </Text>
                  {paymentMethod === method.id && (
                    <Check size={20} color={method.color} strokeWidth={2} />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* Buttons */}
            <View style={{ flexDirection: "row", gap: 12 }}>
              <TouchableOpacity
                onPress={() => setContributeModalVisible(false)}
                style={{
                  flex: 1,
                  backgroundColor: theme.colors.elevated,
                  borderRadius: 12,
                  paddingVertical: 16,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontFamily: "Inter_500Medium",
                    fontSize: 16,
                    color: theme.colors.text,
                  }}
                >
                  Annuler
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={contribute}
                style={{
                  flex: 1,
                  backgroundColor: theme.colors.primary,
                  borderRadius: 12,
                  paddingVertical: 16,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontFamily: "Inter_600SemiBold",
                    fontSize: 16,
                    color: "#FFFFFF",
                  }}
                >
                  Contribuer
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Share Modal */}
      <Modal
        visible={shareModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShareModalVisible(false)}
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
              backgroundColor: theme.colors.background,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              padding: 24,
              paddingBottom: insets.bottom + 24,
            }}
          >
            <Text
              style={{
                fontFamily: "Inter_700Bold",
                fontSize: 20,
                color: theme.colors.text,
                marginBottom: 20,
                textAlign: "center",
              }}
            >
              Partager la cagnotte
            </Text>

            {/* Share Options */}
            <TouchableOpacity
              onPress={shareInvite}
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: theme.colors.elevated,
                borderRadius: 12,
                padding: 16,
                marginBottom: 12,
              }}
            >
              <Share2 size={24} color={theme.colors.primary} strokeWidth={1.5} />
              <View style={{ marginLeft: 16, flex: 1 }}>
                <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 15, color: theme.colors.text }}>
                  Partager l'invitation
                </Text>
                <Text style={{ fontFamily: "Inter_400Regular", fontSize: 13, color: theme.colors.textSecondary }}>
                  Envoyer le code et le lien par message
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => copyToClipboard(saving.invite_code, "Code d'invitation")}
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: theme.colors.elevated,
                borderRadius: 12,
                padding: 16,
                marginBottom: 12,
              }}
            >
              <Copy size={24} color={theme.colors.accent} strokeWidth={1.5} />
              <View style={{ marginLeft: 16, flex: 1 }}>
                <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 15, color: theme.colors.text }}>
                  Copier le code
                </Text>
                <Text style={{ fontFamily: "Inter_400Regular", fontSize: 13, color: theme.colors.textSecondary }}>
                  {saving.invite_code}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => copyToClipboard(saving.payment_link, "Lien de paiement")}
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: theme.colors.elevated,
                borderRadius: 12,
                padding: 16,
                marginBottom: 20,
              }}
            >
              <Link size={24} color={theme.colors.success} strokeWidth={1.5} />
              <View style={{ marginLeft: 16, flex: 1 }}>
                <Text style={{ fontFamily: "Inter_600SemiBold", fontSize: 15, color: theme.colors.text }}>
                  Copier le lien de paiement
                </Text>
                <Text style={{ fontFamily: "Inter_400Regular", fontSize: 13, color: theme.colors.textSecondary }}>
                  Pour contribuer sans l'app (Carte/Mobile Money)
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShareModalVisible(false)}
              style={{
                backgroundColor: theme.colors.elevated,
                borderRadius: 12,
                paddingVertical: 16,
                alignItems: "center",
              }}
            >
              <Text style={{ fontFamily: "Inter_500Medium", fontSize: 16, color: theme.colors.text }}>
                Fermer
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
