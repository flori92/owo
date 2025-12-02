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
  ArrowLeft,
  Lock,
  TrendingUp,
  Calendar,
  Shield,
  AlertTriangle,
  Clock,
  DollarSign,
  Trophy,
  Target,
  Timer,
} from "lucide-react-native";
import { router } from "expo-router";
import { useTheme } from "@/utils/useTheme";
import { useRequireAuth } from "@/utils/auth/useAuth";
import ScreenContainer from "@/components/ScreenContainer";
import HeaderBar from "@/components/HeaderBar";
import LoadingScreen from "@/components/LoadingScreen";
import EmptyState from "@/components/EmptyState";

export default function LockedSavingsScreen() {
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
  const mockLockedSavings = [
    {
      id: "demo-locked-1",
      title: "Achat voiture",
      description: "Économies pour une Toyota Corolla",
      amount: 500000,
      currency: "FCFA",
      unlock_date: "2025-06-30",
      is_unlocked: false,
      emergency_pin_hash: "demo-pin",
      created_at: "2024-11-01",
    },
    {
      id: "demo-locked-2",
      title: "Fonds d'urgence",
      description: "Réserve de sécurité familiale",
      amount: 200000,
      currency: "FCFA",
      unlock_date: "2025-12-31",
      is_unlocked: false,
      emergency_pin_hash: null,
      created_at: "2024-10-15",
    },
    {
      id: "demo-locked-3",
      title: "Études enfants",
      description: "Frais de scolarité 2024",
      amount: 150000,
      currency: "FCFA",
      unlock_date: "2024-09-01",
      is_unlocked: true,
      unlock_reason: "mature",
      unlocked_at: "2024-09-01",
      emergency_pin_hash: "demo-pin",
      created_at: "2024-01-15",
    },
  ];

  const [lockedSavings, setLockedSavings] = useState(mockLockedSavings);
  const [loading, setLoading] = useState(false); // Pas de chargement en mode démo
  const [refreshing, setRefreshing] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [targetAmount, setTargetAmount] = useState(""); // Objectif cible
  const [unlockDate, setUnlockDate] = useState("");
  const [selectedDuration, setSelectedDuration] = useState(null); // Durée prédéfinie
  const [emergencyPin, setEmergencyPin] = useState("");
  const [confirmPin, setConfirmPin] = useState(""); // Confirmation PIN
  const [creating, setCreating] = useState(false);

  // Durées prédéfinies
  const durations = [
    { label: "3 mois", months: 3 },
    { label: "6 mois", months: 6 },
    { label: "1 an", months: 12 },
    { label: "2 ans", months: 24 },
    { label: "Personnalisé", months: null },
  ];

  // Calculer la date de déblocage selon la durée
  const setDuration = (months) => {
    setSelectedDuration(months);
    if (months) {
      const date = new Date();
      date.setMonth(date.getMonth() + months);
      setUnlockDate(date.toISOString().split("T")[0]);
    } else {
      setUnlockDate("");
    }
  };

  // Unlock modal states
  const [unlockModalVisible, setUnlockModalVisible] = useState(false);
  const [selectedSaving, setSelectedSaving] = useState(null);
  const [unlockPin, setUnlockPin] = useState("");
  const [unlocking, setUnlocking] = useState(false);

  // Mode démo : pas d'appel API
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 500);
  }, []);

  // Mode démo : création locale
  const createLockedSaving = () => {
    if (!title.trim() || !unlockDate) {
      Alert.alert("Erreur", "Titre et durée de blocage requis");
      return;
    }

    // Vérifier qu'au moins un montant est renseigné
    if (!amount && !targetAmount) {
      Alert.alert("Erreur", "Renseignez un montant initial ou un objectif cible");
      return;
    }

    // Vérifier la date
    const unlockDateObj = new Date(unlockDate);
    if (unlockDateObj <= new Date()) {
      Alert.alert("Erreur", "La date de déblocage doit être dans le futur");
      return;
    }

    // Vérifier la confirmation du PIN
    if (emergencyPin && emergencyPin !== confirmPin) {
      Alert.alert("Erreur", "Les codes PIN ne correspondent pas");
      return;
    }

    if (emergencyPin && emergencyPin.length < 4) {
      Alert.alert("Erreur", "Le PIN doit contenir au moins 4 caractères");
      return;
    }

    setCreating(true);
    
    setTimeout(() => {
      const initialAmount = parseFloat(amount) || 0;
      const target = parseFloat(targetAmount) || initialAmount;
      
      const newSaving = {
        id: `demo-locked-${Date.now()}`,
        title: title.trim(),
        description: description.trim(),
        amount: initialAmount,
        target_amount: target,
        currency: "FCFA",
        unlock_date: unlockDate,
        is_unlocked: false,
        emergency_pin_hash: emergencyPin ? "demo-pin" : null,
        created_at: new Date().toISOString(),
      };

      setLockedSavings((prev) => [newSaving, ...prev]);
      setCreateModalVisible(false);
      resetForm();
      setCreating(false);
      Alert.alert(
        "Épargne créée !",
        `Votre épargne "${title}" a été créée avec succès.\n\n` +
        `Montant initial : ${initialAmount.toLocaleString()} FCFA\n` +
        `Objectif : ${target.toLocaleString()} FCFA\n` +
        `Déblocage : ${formatDate(unlockDate)}\n\n` +
        `(Mode démo : données non persistées)`
      );
    }, 500);
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setAmount("");
    setTargetAmount("");
    setUnlockDate("");
    setSelectedDuration(null);
    setEmergencyPin("");
    setConfirmPin("");
  };

  // Mode démo : déblocage local
  const attemptUnlock = (saving, isEmergency = false) => {
    if (isEmergency && !unlockPin.trim()) {
      Alert.alert("Erreur", "PIN d'urgence requis");
      return;
    }

    // En mode démo, on accepte n'importe quel PIN de 4+ caractères
    if (isEmergency && unlockPin.length < 4) {
      Alert.alert("Erreur", "Le PIN doit contenir au moins 4 caractères");
      return;
    }

    // Confirmation avant déblocage d'urgence
    if (isEmergency) {
      Alert.alert(
        "Déblocage d'urgence",
        `Êtes-vous sûr de vouloir débloquer "${saving.title}" avant la date prévue ?\n\nMontant : ${saving.amount?.toLocaleString() || 0} FCFA\nDate prévue : ${formatDate(saving.unlock_date)}`,
        [
          { text: "Annuler", style: "cancel" },
          {
            text: "Confirmer",
            style: "destructive",
            onPress: () => performUnlock(saving, true),
          },
        ]
      );
    } else {
      performUnlock(saving, false);
    }
  };

  const performUnlock = (saving, isEmergency) => {
    setUnlocking(true);
    
    setTimeout(() => {
      const updatedSaving = {
        ...saving,
        is_unlocked: true,
        unlock_reason: isEmergency ? "emergency" : "mature",
        unlocked_at: new Date().toISOString(),
      };

      setLockedSavings((prev) =>
        prev.map((s) => (s.id === saving.id ? updatedSaving : s)),
      );
      setUnlockModalVisible(false);
      setUnlockPin("");
      setUnlocking(false);
      
      Alert.alert(
        "Épargne débloquée !",
        `Votre épargne "${saving.title}" a été débloquée.\n\n` +
        `Montant disponible : ${saving.amount?.toLocaleString() || 0} FCFA\n` +
        (isEmergency ? "Déblocage anticipé (urgence)\n\n" : "") +
        "(Mode démo : données non persistées)"
      );
    }, 500);
  };

  const openUnlockModal = (saving) => {
    setSelectedSaving(saving);
    setUnlockModalVisible(true);
    setUnlockPin("");
  };

  const getStatusInfo = (saving) => {
    const now = new Date();
    const unlockDate = new Date(saving.unlock_date);

    if (saving.is_unlocked) {
      return {
        status: "unlocked",
        label: "Débloquée",
        color: theme.colors.success,
        icon: CheckCircle,
        description: `Débloquée ${saving.unlock_reason === "emergency" ? "en urgence" : "à maturité"}`,
      };
    } else if (now >= unlockDate) {
      return {
        status: "mature",
        label: "Prête",
        color: theme.colors.accent,
        icon: Unlock,
        description: "Peut être débloquée maintenant",
      };
    } else {
      const daysLeft = Math.ceil((unlockDate - now) / (1000 * 60 * 60 * 24));
      return {
        status: "locked",
        label: "Verrouillée",
        color: theme.colors.primary,
        icon: Lock,
        description: `${daysLeft} jour${daysLeft > 1 ? "s" : ""} restant${daysLeft > 1 ? "s" : ""}`,
      };
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  if (!fontsLoaded) {
    return <LoadingScreen />;
  }

  return (
    <ScreenContainer>
      <HeaderBar
        title="Épargnes bloquées"
        showBack={true}
        onBack={() => router.back()}
        rightComponent={
          <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
            <TouchableOpacity onPress={() => router.push("/savings-settings")}>
              <Settings size={22} color={theme.colors.textSecondary} strokeWidth={2} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setCreateModalVisible(true)}>
              <Plus size={24} color={theme.colors.primary} strokeWidth={2} />
            </TouchableOpacity>
          </View>
        }
      />

      {loading ? (
        <LoadingScreen />
      ) : lockedSavings.length === 0 ? (
        <View style={{ flex: 1, justifyContent: "center" }}>
          <EmptyState
            icon={Lock}
            title="Aucune épargne bloquée"
            description="Créez votre première épargne sécurisée avec une date de déblocage"
            actionText="Créer une épargne"
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
          {lockedSavings.map((saving) => {
            const statusInfo = getStatusInfo(saving);
            const StatusIcon = statusInfo.icon;

            return (
              <View
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
                      backgroundColor: `${statusInfo.color}15`,
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 20,
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <StatusIcon
                      size={16}
                      color={statusInfo.color}
                      strokeWidth={1.5}
                    />
                    <Text
                      style={{
                        fontFamily: "Inter_500Medium",
                        fontSize: 12,
                        color: statusInfo.color,
                        marginLeft: 4,
                      }}
                    >
                      {statusInfo.label}
                    </Text>
                  </View>
                </View>

                {/* Amount */}
                <View style={{ marginBottom: 16 }}>
                  <Text
                    style={{
                      fontFamily: "Inter_700Bold",
                      fontSize: 28,
                      color: theme.colors.text,
                      marginBottom: 4,
                    }}
                  >
                    {saving.amount.toLocaleString()} {saving.currency}
                  </Text>
                  <Text
                    style={{
                      fontFamily: "Inter_400Regular",
                      fontSize: 14,
                      color: statusInfo.color,
                    }}
                  >
                    {statusInfo.description}
                  </Text>
                </View>

                {/* Unlock date */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 16,
                  }}
                >
                  <Calendar
                    size={16}
                    color={theme.colors.textSecondary}
                    strokeWidth={1.5}
                  />
                  <Text
                    style={{
                      fontFamily: "Inter_500Medium",
                      fontSize: 14,
                      color: theme.colors.textSecondary,
                      marginLeft: 8,
                    }}
                  >
                    Déblocage prévu : {formatDate(saving.unlock_date)}
                  </Text>
                </View>

                {/* Actions */}
                {!saving.is_unlocked && (
                  <View style={{ flexDirection: "row", gap: 12 }}>
                    {/* Normal unlock (if mature) */}
                    {statusInfo.status === "mature" && (
                      <TouchableOpacity
                        style={{
                          flex: 1,
                          backgroundColor: theme.colors.success,
                          borderRadius: 16,
                          paddingVertical: 14,
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                        onPress={() => attemptUnlock(saving, false)}
                      >
                        <Unlock size={18} color="#FFFFFF" strokeWidth={1.5} />
                        <Text
                          style={{
                            fontFamily: "Inter_600SemiBold",
                            fontSize: 14,
                            color: "#FFFFFF",
                            marginLeft: 8,
                          }}
                        >
                          Débloquer
                        </Text>
                      </TouchableOpacity>
                    )}

                    {/* Emergency unlock (if PIN configured) */}
                    {saving.emergency_pin_hash && (
                      <TouchableOpacity
                        style={{
                          flex: statusInfo.status === "mature" ? 1 : 2,
                          backgroundColor: theme.colors.accent,
                          borderRadius: 16,
                          paddingVertical: 14,
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                        onPress={() => openUnlockModal(saving)}
                      >
                        <Key size={18} color="#FFFFFF" strokeWidth={1.5} />
                        <Text
                          style={{
                            fontFamily: "Inter_600SemiBold",
                            fontSize: 14,
                            color: "#FFFFFF",
                            marginLeft: 8,
                          }}
                        >
                          Urgence
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}

                {saving.is_unlocked && (
                  <View
                    style={{
                      backgroundColor: `${theme.colors.success}15`,
                      borderRadius: 12,
                      padding: 12,
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <CheckCircle
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
                      Débloquée le {formatDate(saving.unlocked_at)}
                    </Text>
                  </View>
                )}
              </View>
            );
          })}
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
            title="Nouvelle épargne bloquée"
            showBack={true}
            onBack={() => setCreateModalVisible(false)}
            rightComponent={
              <TouchableOpacity
                onPress={createLockedSaving}
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
              {/* Info Banner */}
              <View
                style={{
                  backgroundColor: `${theme.colors.primary}15`,
                  borderRadius: 12,
                  padding: 16,
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <Shield
                  size={20}
                  color={theme.colors.primary}
                  strokeWidth={1.5}
                />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text
                    style={{
                      fontFamily: "Inter_500Medium",
                      fontSize: 14,
                      color: theme.colors.primary,
                      marginBottom: 2,
                    }}
                  >
                    Épargne sécurisée
                  </Text>
                  <Text
                    style={{
                      fontFamily: "Inter_400Regular",
                      fontSize: 12,
                      color: theme.colors.textSecondary,
                    }}
                  >
                    Votre argent sera inaccessible jusqu'à la date choisie
                  </Text>
                </View>
              </View>

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
                  Objectif d'épargne *
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
                  placeholder="Ex: Achat voiture"
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
                  placeholder="Décrivez votre objectif..."
                  placeholderTextColor={theme.colors.textSecondary}
                  multiline
                  textAlignVertical="top"
                />
              </View>

              {/* Objectif cible */}
              <View>
                <Text
                  style={{
                    fontFamily: "Inter_500Medium",
                    fontSize: 16,
                    color: theme.colors.text,
                    marginBottom: 8,
                  }}
                >
                  Objectif à atteindre *
                </Text>
                <TextInput
                  style={{
                    backgroundColor: theme.colors.elevated,
                    borderRadius: 12,
                    padding: 16,
                    fontSize: 20,
                    fontWeight: "700",
                    color: theme.colors.text,
                    borderWidth: 1,
                    borderColor: theme.colors.border,
                  }}
                  value={targetAmount}
                  onChangeText={setTargetAmount}
                  placeholder="500000"
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
                  Montant que vous souhaitez économiser (FCFA)
                </Text>
              </View>

              {/* Montant initial */}
              <View>
                <Text
                  style={{
                    fontFamily: "Inter_500Medium",
                    fontSize: 16,
                    color: theme.colors.text,
                    marginBottom: 8,
                  }}
                >
                  Montant initial (optionnel)
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
                  value={amount}
                  onChangeText={setAmount}
                  placeholder="50000"
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
                  Premier versement pour démarrer l'épargne
                </Text>
              </View>

              {/* Durée de blocage */}
              <View>
                <Text
                  style={{
                    fontFamily: "Inter_500Medium",
                    fontSize: 16,
                    color: theme.colors.text,
                    marginBottom: 12,
                  }}
                >
                  Durée de blocage *
                </Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
                  {durations.map((duration) => (
                    <TouchableOpacity
                      key={duration.label}
                      onPress={() => setDuration(duration.months)}
                      style={{
                        paddingHorizontal: 16,
                        paddingVertical: 12,
                        borderRadius: 12,
                        backgroundColor: selectedDuration === duration.months
                          ? theme.colors.primary
                          : theme.colors.elevated,
                        borderWidth: 1,
                        borderColor: selectedDuration === duration.months
                          ? theme.colors.primary
                          : theme.colors.border,
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: "Inter_500Medium",
                          fontSize: 14,
                          color: selectedDuration === duration.months
                            ? "#FFFFFF"
                            : theme.colors.text,
                        }}
                      >
                        {duration.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Date personnalisée (si "Personnalisé" sélectionné) */}
              {selectedDuration === null && (
                <View>
                  <Text
                    style={{
                      fontFamily: "Inter_500Medium",
                      fontSize: 16,
                      color: theme.colors.text,
                      marginBottom: 8,
                    }}
                  >
                    📅 Date de déblocage
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
                    value={unlockDate}
                    onChangeText={setUnlockDate}
                    placeholder="2025-12-31"
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
                    Format: AAAA-MM-JJ
                  </Text>
                </View>
              )}

              {/* Affichage de la date calculée */}
              {selectedDuration && unlockDate && (
                <View
                  style={{
                    backgroundColor: `${theme.colors.success}15`,
                    borderRadius: 12,
                    padding: 16,
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <Calendar size={20} color={theme.colors.success} strokeWidth={1.5} />
                  <View style={{ marginLeft: 12 }}>
                    <Text
                      style={{
                        fontFamily: "Inter_400Regular",
                        fontSize: 12,
                        color: theme.colors.textSecondary,
                      }}
                    >
                      Déblocage prévu le
                    </Text>
                    <Text
                      style={{
                        fontFamily: "Inter_600SemiBold",
                        fontSize: 16,
                        color: theme.colors.success,
                      }}
                    >
                      {formatDate(unlockDate)}
                    </Text>
                  </View>
                </View>
              )}

              {/* Section PIN d'urgence */}
              <View
                style={{
                  backgroundColor: `${theme.colors.accent}10`,
                  borderRadius: 16,
                  padding: 16,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
                  <Key size={20} color={theme.colors.accent} strokeWidth={1.5} />
                  <Text
                    style={{
                      fontFamily: "Inter_600SemiBold",
                      fontSize: 16,
                      color: theme.colors.text,
                      marginLeft: 10,
                    }}
                  >
                    PIN d'urgence (optionnel)
                  </Text>
                </View>
                <Text
                  style={{
                    fontFamily: "Inter_400Regular",
                    fontSize: 13,
                    color: theme.colors.textSecondary,
                    marginBottom: 16,
                  }}
                >
                  Définissez un code secret pour débloquer votre épargne en cas d'urgence absolue avant la date prévue.
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
                    marginBottom: 12,
                  }}
                  value={emergencyPin}
                  onChangeText={setEmergencyPin}
                  placeholder="Créer un PIN (4-8 caractères)"
                  placeholderTextColor={theme.colors.textSecondary}
                  secureTextEntry
                  maxLength={8}
                />
                
                {emergencyPin.length > 0 && (
                  <TextInput
                    style={{
                      backgroundColor: theme.colors.elevated,
                      borderRadius: 12,
                      padding: 16,
                      fontSize: 16,
                      color: theme.colors.text,
                      borderWidth: 1,
                      borderColor: confirmPin === emergencyPin && confirmPin.length > 0
                        ? theme.colors.success
                        : theme.colors.border,
                    }}
                    value={confirmPin}
                    onChangeText={setConfirmPin}
                    placeholder="Confirmer le PIN"
                    placeholderTextColor={theme.colors.textSecondary}
                    secureTextEntry
                    maxLength={8}
                  />
                )}
                
                {emergencyPin.length > 0 && confirmPin.length > 0 && (
                  <View style={{ flexDirection: "row", alignItems: "center", marginTop: 8 }}>
                    {confirmPin === emergencyPin ? (
                      <>
                        <CheckCircle size={16} color={theme.colors.success} strokeWidth={2} />
                        <Text style={{ fontFamily: "Inter_400Regular", fontSize: 12, color: theme.colors.success, marginLeft: 6 }}>
                          PIN confirmé
                        </Text>
                      </>
                    ) : (
                      <>
                        <AlertTriangle size={16} color={theme.colors.error} strokeWidth={2} />
                        <Text style={{ fontFamily: "Inter_400Regular", fontSize: 12, color: theme.colors.error, marginLeft: 6 }}>
                          Les PIN ne correspondent pas
                        </Text>
                      </>
                    )}
                  </View>
                )}
              </View>
            </View>
          </ScrollView>
        </ScreenContainer>
      </Modal>

      {/* Unlock Emergency Modal */}
      <Modal
        visible={unlockModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setUnlockModalVisible(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 24,
          }}
        >
          <View
            style={{
              backgroundColor: theme.colors.elevated,
              borderRadius: 20,
              padding: 24,
              width: "100%",
              maxWidth: 400,
            }}
          >
            <View style={{ alignItems: "center", marginBottom: 20 }}>
              <AlertTriangle
                size={48}
                color={theme.colors.accent}
                strokeWidth={1.5}
              />
              <Text
                style={{
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 18,
                  color: theme.colors.text,
                  textAlign: "center",
                  marginTop: 12,
                }}
              >
                Déblocage d'urgence
              </Text>
              <Text
                style={{
                  fontFamily: "Inter_400Regular",
                  fontSize: 14,
                  color: theme.colors.textSecondary,
                  textAlign: "center",
                  marginTop: 8,
                }}
              >
                Entrez votre PIN d'urgence pour débloquer cette épargne avant la
                date prévue
              </Text>
            </View>

            <TextInput
              style={{
                backgroundColor: theme.colors.background,
                borderRadius: 12,
                padding: 16,
                fontSize: 18,
                color: theme.colors.text,
                borderWidth: 1,
                borderColor: theme.colors.border,
                textAlign: "center",
                marginBottom: 20,
                letterSpacing: 4,
              }}
              value={unlockPin}
              onChangeText={setUnlockPin}
              placeholder="PIN"
              placeholderTextColor={theme.colors.textSecondary}
              secureTextEntry
              maxLength={8}
              keyboardType="ascii-capable"
            />

            <View style={{ flexDirection: "row", gap: 12 }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: theme.colors.background,
                  borderRadius: 16,
                  paddingVertical: 14,
                  alignItems: "center",
                }}
                onPress={() => setUnlockModalVisible(false)}
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
                style={{
                  flex: 1,
                  backgroundColor: theme.colors.accent,
                  borderRadius: 16,
                  paddingVertical: 14,
                  alignItems: "center",
                  opacity: unlocking ? 0.5 : 1,
                }}
                onPress={() => attemptUnlock(selectedSaving, true)}
                disabled={unlocking}
              >
                <Text
                  style={{
                    fontFamily: "Inter_600SemiBold",
                    fontSize: 16,
                    color: "#FFFFFF",
                  }}
                >
                  Débloquer
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
