import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Alert,
  TextInput,
  Modal,
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
  Plus,
  Target,
  Calendar,
  Share,
  TrendingUp,
  Copy,
  X,
  Check,
  UserPlus,
  Settings,
} from "lucide-react-native";
import { router } from "expo-router";
import { useTheme } from "@/utils/useTheme";
import { useRequireAuth } from "@/utils/auth/useAuth";
import ScreenContainer from "@/components/ScreenContainer";
import HeaderBar from "@/components/HeaderBar";
import LoadingScreen from "@/components/LoadingScreen";
import EmptyState from "@/components/EmptyState";
import ActionButton from "@/components/ActionButton";

export default function GroupSavingsScreen() {
  useRequireAuth();

  const insets = useSafeAreaInsets();
  const theme = useTheme();

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  // Mode démo offline : données mock initiales
  const mockGroupSavings = [
    {
      id: "demo-1",
      title: "Voyage à Abidjan",
      description: "Vacances en famille pour Noël 2025",
      current_amount: 125000,
      target_amount: 250000,
      currency: "FCFA",
      member_count: 4,
      target_date: "2025-12-20",
      invite_code: "OWO-ABIDJAN",
      is_completed: false,
      is_private: false,
    },
    {
      id: "demo-2",
      title: "Cadeau anniversaire Maman",
      description: "Surprise pour ses 60 ans",
      current_amount: 75000,
      target_amount: 100000,
      currency: "FCFA",
      member_count: 3,
      target_date: "2025-03-15",
      invite_code: "OWO-MAMAN60",
      is_completed: false,
      is_private: true,
    },
  ];

  const [groupSavings, setGroupSavings] = useState(mockGroupSavings);
  const [loading, setLoading] = useState(false); // Pas de chargement en mode démo
  const [refreshing, setRefreshing] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [creating, setCreating] = useState(false);

  // Mode démo : pas d'appel API
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simuler un refresh
    setTimeout(() => setRefreshing(false), 500);
  }, []);

  // Mode démo : création locale
  const createGroupSaving = () => {
    if (!title.trim() || !targetAmount) {
      Alert.alert("Erreur", "Titre et montant cible requis");
      return;
    }

    setCreating(true);
    
    // Simuler un délai de création
    setTimeout(() => {
      const newSaving = {
        id: `demo-${Date.now()}`,
        title: title.trim(),
        description: description.trim(),
        current_amount: 0,
        target_amount: parseFloat(targetAmount),
        currency: "FCFA",
        member_count: 1,
        target_date: targetDate || null,
        invite_code: `OWO-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        is_completed: false,
        is_private: isPrivate,
      };

      setGroupSavings((prev) => [newSaving, ...prev]);
      setCreateModalVisible(false);
      resetForm();
      setCreating(false);
      Alert.alert("Succès", "Cagnotte créée avec succès!\n\n(Mode démo : données non persistées)");
    }, 500);
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setTargetAmount("");
    setTargetDate("");
    setIsPrivate(false);
  };

  const shareInviteCode = (inviteCode) => {
    Alert.alert("Code d'invitation", `Code: ${inviteCode}`, [
      {
        text: "Copier",
        onPress: () => {
          // En production, utiliser Clipboard
          Alert.alert("Copié", "Code d'invitation copié");
        },
      },
      { text: "Fermer", style: "cancel" },
    ]);
  };

  const getProgressPercentage = (current, target) => {
    return Math.min((current / target) * 100, 100);
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (!fontsLoaded) {
    return <LoadingScreen />;
  }

  return (
    <ScreenContainer>
      <HeaderBar
        title="Cagnottes"
        showBack={true}
        onBack={() => router.back()}
        rightComponent={
          <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
            <TouchableOpacity onPress={() => router.push("/join-group-saving")}>
              <UserPlus size={22} color={theme.colors.textSecondary} strokeWidth={2} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setCreateModalVisible(true)}>
              <Plus size={24} color={theme.colors.primary} strokeWidth={2} />
            </TouchableOpacity>
          </View>
        }
      />

      {loading ? (
        <LoadingScreen />
      ) : groupSavings.length === 0 ? (
        <View style={{ flex: 1, justifyContent: "center" }}>
          <EmptyState
            icon={Users}
            title="Aucune cagnotte"
            description="Créez votre première cagnotte collaborative avec vos amis"
            actionText="Créer une cagnotte"
            onAction={() => setCreateModalVisible(true)}
          />
        </View>
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingVertical: 20,
            paddingBottom: insets.bottom + 20,
          }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
            />
          }
          showsVerticalScrollIndicator={false}
        >
          {groupSavings.map((saving) => (
            <TouchableOpacity
              key={saving.id}
              style={{
                backgroundColor: theme.colors.elevated,
                borderRadius: 20,
                padding: 24,
                marginBottom: 16,
                shadowColor: theme.colors.shadowColor,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 12,
                elevation: 6,
              }}
              onPress={() => router.push(`/group-saving/${saving.id}`)}
            >
              {/* Header */}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: 16,
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontFamily: "Inter_600SemiBold",
                      fontSize: 18,
                      color: theme.colors.text,
                      marginBottom: 4,
                    }}
                  >
                    {saving.title}
                  </Text>
                  {saving.description && (
                    <Text
                      style={{
                        fontFamily: "Inter_400Regular",
                        fontSize: 14,
                        color: theme.colors.textSecondary,
                      }}
                    >
                      {saving.description}
                    </Text>
                  )}
                </View>

                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginLeft: 12,
                  }}
                >
                  <Users
                    size={16}
                    color={theme.colors.textSecondary}
                    strokeWidth={1.5}
                  />
                  <Text
                    style={{
                      fontFamily: "Inter_500Medium",
                      fontSize: 13,
                      color: theme.colors.textSecondary,
                      marginLeft: 4,
                    }}
                  >
                    {saving.member_count}
                  </Text>
                </View>
              </View>

              {/* Progress */}
              <View style={{ marginBottom: 16 }}>
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
                      fontFamily: "Inter_700Bold",
                      fontSize: 20,
                      color: theme.colors.text,
                    }}
                  >
                    {saving.current_amount.toLocaleString()} {saving.currency}
                  </Text>
                  <Text
                    style={{
                      fontFamily: "Inter_500Medium",
                      fontSize: 14,
                      color: theme.colors.textSecondary,
                    }}
                  >
                    sur {saving.target_amount.toLocaleString()}{" "}
                    {saving.currency}
                  </Text>
                </View>

                {/* Progress bar */}
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
                      backgroundColor: saving.is_completed
                        ? theme.colors.success
                        : theme.colors.primary,
                      height: "100%",
                      width: `${getProgressPercentage(saving.current_amount, saving.target_amount)}%`,
                      borderRadius: 10,
                    }}
                  />
                </View>

                <Text
                  style={{
                    fontFamily: "Inter_500Medium",
                    fontSize: 12,
                    color: saving.is_completed
                      ? theme.colors.success
                      : theme.colors.primary,
                    marginTop: 6,
                  }}
                >
                  {getProgressPercentage(
                    saving.current_amount,
                    saving.target_amount,
                  ).toFixed(1)}
                  % atteint
                </Text>
              </View>

              {/* Footer */}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <View>
                  {saving.target_date && (
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <Calendar
                        size={14}
                        color={theme.colors.textSecondary}
                        strokeWidth={1.5}
                      />
                      <Text
                        style={{
                          fontFamily: "Inter_400Regular",
                          fontSize: 12,
                          color: theme.colors.textSecondary,
                          marginLeft: 4,
                        }}
                      >
                        {formatDate(saving.target_date)}
                      </Text>
                    </View>
                  )}
                </View>

                <TouchableOpacity
                  onPress={() => shareInviteCode(saving.invite_code)}
                  style={{
                    backgroundColor: theme.colors.primary,
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 16,
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <Share size={14} color="#FFFFFF" strokeWidth={1.5} />
                  <Text
                    style={{
                      fontFamily: "Inter_500Medium",
                      fontSize: 12,
                      color: "#FFFFFF",
                      marginLeft: 4,
                    }}
                  >
                    Inviter
                  </Text>
                </TouchableOpacity>
              </View>

              {saving.is_completed && (
                <View
                  style={{
                    backgroundColor: `${theme.colors.success}15`,
                    borderRadius: 12,
                    padding: 12,
                    marginTop: 12,
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <Check
                    size={16}
                    color={theme.colors.success}
                    strokeWidth={2}
                  />
                  <Text
                    style={{
                      fontFamily: "Inter_500Medium",
                      fontSize: 14,
                      color: theme.colors.success,
                      marginLeft: 8,
                    }}
                  >
                    Objectif atteint !
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Create Modal */}
      <Modal
        visible={createModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setCreateModalVisible(false)}
      >
        <ScreenContainer>
          <HeaderBar
            title="Nouvelle cagnotte"
            showBack={true}
            onBack={() => setCreateModalVisible(false)}
            rightComponent={
              <TouchableOpacity
                onPress={createGroupSaving}
                disabled={creating}
                style={{ opacity: creating ? 0.5 : 1 }}
              >
                <Text
                  style={{
                    fontFamily: "Inter_600SemiBold",
                    fontSize: 16,
                    color: theme.colors.primary,
                  }}
                >
                  Créer
                </Text>
              </TouchableOpacity>
            }
          />

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
              {/* Titre */}
              <View>
                <Text
                  style={{
                    fontFamily: "Inter_500Medium",
                    fontSize: 16,
                    color: theme.colors.text,
                    marginBottom: 8,
                  }}
                >
                  Titre de la cagnotte *
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
                  value={title}
                  onChangeText={setTitle}
                  placeholder="Ex: Voyage à Paris"
                  placeholderTextColor={theme.colors.textSecondary}
                />
              </View>

              {/* Description */}
              <View>
                <Text
                  style={{
                    fontFamily: "Inter_500Medium",
                    fontSize: 16,
                    color: theme.colors.text,
                    marginBottom: 8,
                  }}
                >
                  Description
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
                    height: 80,
                  }}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Décrivez votre projet..."
                  placeholderTextColor={theme.colors.textSecondary}
                  multiline
                  textAlignVertical="top"
                />
              </View>

              {/* Montant cible */}
              <View>
                <Text
                  style={{
                    fontFamily: "Inter_500Medium",
                    fontSize: 16,
                    color: theme.colors.text,
                    marginBottom: 8,
                  }}
                >
                  Objectif financier *
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
                  value={targetAmount}
                  onChangeText={setTargetAmount}
                  placeholder="100000"
                  placeholderTextColor={theme.colors.textSecondary}
                  keyboardType="numeric"
                />
                <Text
                  style={{
                    fontFamily: "Inter_400Regular",
                    fontSize: 12,
                    color: theme.colors.textSecondary,
                    marginTop: 4,
                  }}
                >
                  Montant en FCFA
                </Text>
              </View>

              {/* Date cible */}
              <View>
                <Text
                  style={{
                    fontFamily: "Inter_500Medium",
                    fontSize: 16,
                    color: theme.colors.text,
                    marginBottom: 8,
                  }}
                >
                  Date limite (optionnel)
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
                  value={targetDate}
                  onChangeText={setTargetDate}
                  placeholder="2024-12-31"
                  placeholderTextColor={theme.colors.textSecondary}
                />
                <Text
                  style={{
                    fontFamily: "Inter_400Regular",
                    fontSize: 12,
                    color: theme.colors.textSecondary,
                    marginTop: 4,
                  }}
                >
                  Format: YYYY-MM-DD
                </Text>
              </View>

              {/* Privée */}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingVertical: 12,
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontFamily: "Inter_500Medium",
                      fontSize: 16,
                      color: theme.colors.text,
                      marginBottom: 4,
                    }}
                  >
                    Cagnotte privée
                  </Text>
                  <Text
                    style={{
                      fontFamily: "Inter_400Regular",
                      fontSize: 14,
                      color: theme.colors.textSecondary,
                    }}
                  >
                    Seules les personnes invitées peuvent voir et rejoindre
                  </Text>
                </View>
                <TouchableOpacity
                  style={{
                    width: 50,
                    height: 30,
                    borderRadius: 15,
                    backgroundColor: isPrivate
                      ? theme.colors.primary
                      : theme.colors.disabled,
                    justifyContent: "center",
                    paddingHorizontal: 2,
                  }}
                  onPress={() => setIsPrivate(!isPrivate)}
                >
                  <View
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: 13,
                      backgroundColor: "#FFFFFF",
                      alignSelf: isPrivate ? "flex-end" : "flex-start",
                    }}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </ScreenContainer>
      </Modal>
    </ScreenContainer>
  );
}
