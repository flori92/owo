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
  Lock,
  Unlock,
  Plus,
  Calendar,
  Shield,
  AlertTriangle,
  Clock,
  CheckCircle,
  Key,
  Settings,
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
  const [unlockDate, setUnlockDate] = useState("");
  const [emergencyPin, setEmergencyPin] = useState("");
  const [creating, setCreating] = useState(false);

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
    if (!title.trim() || !amount || !unlockDate) {
      Alert.alert("Erreur", "Titre, montant et date de déblocage requis");
      return;
    }

    // Vérifier la date
    const targetDate = new Date(unlockDate);
    if (targetDate <= new Date()) {
      Alert.alert("Erreur", "La date de déblocage doit être dans le futur");
      return;
    }

    setCreating(true);
    
    setTimeout(() => {
      const newSaving = {
        id: `demo-locked-${Date.now()}`,
        title: title.trim(),
        description: description.trim(),
        amount: parseFloat(amount),
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
      Alert.alert("Succès", "Épargne bloquée créée avec succès!\n\n(Mode démo : données non persistées)");
    }, 500);
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setAmount("");
    setUnlockDate("");
    setEmergencyPin("");
  };

  // Mode démo : déblocage local
  const attemptUnlock = (saving, isEmergency = false) => {
    if (isEmergency && !unlockPin.trim()) {
      Alert.alert("Erreur", "PIN d'urgence requis");
      return;
    }

    // En mode démo, on accepte n'importe quel PIN
    if (isEmergency && unlockPin !== "1234") {
      Alert.alert("Info démo", "En mode démo, utilisez le PIN: 1234");
      return;
    }

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
        "Succès",
        isEmergency
          ? "Épargne débloquée en urgence!\n\n(Mode démo : données non persistées)"
          : "Épargne débloquée avec succès!\n\n(Mode démo : données non persistées)"
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

              {/* Montant */}
              <View>
                <Text
                  style={{
                    fontFamily: "Inter_500Medium",
                    fontSize: 16,
                    color: theme.colors.text,
                    marginBottom: 8,
                  }}
                >
                  Montant à bloquer *
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
                  Montant en FCFA
                </Text>
              </View>

              {/* Date de déblocage */}
              <View>
                <Text
                  style={{
                    fontFamily: "Inter_500Medium",
                    fontSize: 16,
                    color: theme.colors.text,
                    marginBottom: 8,
                  }}
                >
                  Date de déblocage *
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
                  Format: YYYY-MM-DD
                </Text>
              </View>

              {/* PIN d'urgence */}
              <View>
                <Text
                  style={{
                    fontFamily: "Inter_500Medium",
                    fontSize: 16,
                    color: theme.colors.text,
                    marginBottom: 8,
                  }}
                >
                  PIN d'urgence (optionnel)
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
                  value={emergencyPin}
                  onChangeText={setEmergencyPin}
                  placeholder="Code à 4-8 caractères"
                  placeholderTextColor={theme.colors.textSecondary}
                  secureTextEntry
                  maxLength={8}
                />
                <Text
                  style={{
                    fontFamily: "Inter_400Regular",
                    fontSize: 12,
                    color: theme.colors.textSecondary,
                    marginTop: 4,
                  }}
                >
                  Permet de débloquer en cas d'extrême urgence avant la date
                </Text>
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
