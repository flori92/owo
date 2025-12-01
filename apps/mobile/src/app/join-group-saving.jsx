import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import { Users, Search, ArrowRight, QrCode, Camera } from "lucide-react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useTheme } from "@/utils/useTheme";
import ScreenContainer from "@/components/ScreenContainer";
import HeaderBar from "@/components/HeaderBar";
import LoadingScreen from "@/components/LoadingScreen";
import { IS_DEMO_MODE, getDemoMessage } from "@/config/appConfig";

export default function JoinGroupSavingScreen() {
  const { code: initialCode } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const [inviteCode, setInviteCode] = useState(initialCode || "");
  const [searching, setSearching] = useState(false);
  const [foundSaving, setFoundSaving] = useState(null);

  // Si un code est passé en paramètre, lancer la recherche automatiquement
  useEffect(() => {
    if (initialCode) {
      setInviteCode(initialCode);
      // Petit délai pour que l'UI se charge
      setTimeout(() => searchSaving(), 500);
    }
  }, [initialCode]);

  // Cagnottes démo disponibles pour rejoindre
  const demoSavings = {
    "OWO-ABIDJAN": {
      id: "demo-1",
      title: "Voyage à Abidjan",
      description: "Vacances en famille pour Noël 2025",
      current_amount: 125000,
      target_amount: 250000,
      currency: "FCFA",
      member_count: 4,
      organizer: "Kofi A.",
    },
    "OWO-MAMAN60": {
      id: "demo-2",
      title: "Cadeau anniversaire Maman",
      description: "Surprise pour ses 60 ans",
      current_amount: 75000,
      target_amount: 100000,
      currency: "FCFA",
      member_count: 3,
      organizer: "Ama K.",
    },
    "OWO-TEST123": {
      id: "demo-3",
      title: "Cagnotte Test",
      description: "Pour tester le système de cagnottes",
      current_amount: 50000,
      target_amount: 200000,
      currency: "FCFA",
      member_count: 2,
      organizer: "Demo User",
    },
  };

  const searchSaving = () => {
    if (!inviteCode.trim()) {
      Alert.alert("Erreur", "Veuillez entrer un code d'invitation");
      return;
    }

    setSearching(true);
    setFoundSaving(null);

    // Simuler une recherche
    setTimeout(() => {
      const code = inviteCode.trim().toUpperCase();
      const saving = demoSavings[code];

      if (saving) {
        setFoundSaving(saving);
      } else {
        Alert.alert(
          "Cagnotte introuvable",
          `Aucune cagnotte trouvée avec le code "${code}".\n\nCodes de test disponibles :\n• OWO-ABIDJAN\n• OWO-MAMAN60\n• OWO-TEST123`
        );
      }
      setSearching(false);
    }, 800);
  };

  const joinSaving = () => {
    if (!foundSaving) return;

    Alert.alert(
      "Rejoindre la cagnotte",
      `Voulez-vous rejoindre "${foundSaving.title}" ?`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Rejoindre",
          onPress: () => {
            Alert.alert(
              "Succès",
              `Vous avez rejoint la cagnotte "${foundSaving.title}" !${getDemoMessage("dataNotPersisted")}`,
              [
                {
                  text: "OK",
                  onPress: () => router.replace("/group-savings"),
                },
              ]
            );
          },
        },
      ]
    );
  };

  if (!fontsLoaded) {
    return <LoadingScreen />;
  }

  return (
    <ScreenContainer>
      <HeaderBar
        title="Rejoindre une cagnotte"
        showBack={true}
        onBack={() => router.back()}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View
          style={{
            flex: 1,
            paddingHorizontal: 24,
            paddingTop: 20,
          }}
        >
          {/* Illustration */}
          <View
            style={{
              alignItems: "center",
              marginBottom: 32,
            }}
          >
            <View
              style={{
                width: 100,
                height: 100,
                borderRadius: 50,
                backgroundColor: `${theme.colors.primary}15`,
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <Users size={48} color={theme.colors.primary} strokeWidth={1.5} />
            </View>
            <Text
              style={{
                fontFamily: "Inter_600SemiBold",
                fontSize: 20,
                color: theme.colors.text,
                textAlign: "center",
                marginBottom: 8,
              }}
            >
              Rejoindre une cagnotte
            </Text>
            <Text
              style={{
                fontFamily: "Inter_400Regular",
                fontSize: 14,
                color: theme.colors.textSecondary,
                textAlign: "center",
                paddingHorizontal: 20,
              }}
            >
              Entrez le code d'invitation partagé par l'organisateur de la cagnotte
            </Text>
          </View>

          {/* Input code */}
          <View style={{ marginBottom: 24 }}>
            <Text
              style={{
                fontFamily: "Inter_500Medium",
                fontSize: 14,
                color: theme.colors.text,
                marginBottom: 8,
              }}
            >
              Code d'invitation
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: theme.colors.elevated,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: theme.colors.border,
                paddingHorizontal: 16,
              }}
            >
              <TextInput
                style={{
                  flex: 1,
                  paddingVertical: 16,
                  fontSize: 18,
                  fontFamily: "Inter_600SemiBold",
                  color: theme.colors.text,
                  letterSpacing: 2,
                }}
                value={inviteCode}
                onChangeText={(text) => setInviteCode(text.toUpperCase())}
                placeholder="OWO-XXXXXX"
                placeholderTextColor={theme.colors.textSecondary}
                autoCapitalize="characters"
                autoCorrect={false}
              />
              <TouchableOpacity
                onPress={() => router.push("/qr-scanner?mode=cagnotte")}
                style={{ padding: 8 }}
              >
                <Camera size={24} color={theme.colors.primary} strokeWidth={1.5} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Search button */}
          <TouchableOpacity
            onPress={searchSaving}
            disabled={searching || !inviteCode.trim()}
            style={{
              backgroundColor: theme.colors.primary,
              borderRadius: 16,
              paddingVertical: 16,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              opacity: searching || !inviteCode.trim() ? 0.6 : 1,
              marginBottom: 24,
            }}
          >
            <Search size={20} color="#FFFFFF" strokeWidth={2} />
            <Text
              style={{
                fontFamily: "Inter_600SemiBold",
                fontSize: 16,
                color: "#FFFFFF",
                marginLeft: 8,
              }}
            >
              {searching ? "Recherche..." : "Rechercher la cagnotte"}
            </Text>
          </TouchableOpacity>

          {/* Found saving card */}
          {foundSaving && (
            <View
              style={{
                backgroundColor: theme.colors.elevated,
                borderRadius: 20,
                padding: 20,
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
                <View
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: 6,
                    backgroundColor: theme.colors.success,
                    marginRight: 8,
                  }}
                />
                <Text
                  style={{
                    fontFamily: "Inter_500Medium",
                    fontSize: 13,
                    color: theme.colors.success,
                  }}
                >
                  Cagnotte trouvée !
                </Text>
              </View>

              <Text
                style={{
                  fontFamily: "Inter_700Bold",
                  fontSize: 20,
                  color: theme.colors.text,
                  marginBottom: 4,
                }}
              >
                {foundSaving.title}
              </Text>

              <Text
                style={{
                  fontFamily: "Inter_400Regular",
                  fontSize: 14,
                  color: theme.colors.textSecondary,
                  marginBottom: 16,
                }}
              >
                {foundSaving.description}
              </Text>

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginBottom: 16,
                }}
              >
                <View>
                  <Text
                    style={{
                      fontFamily: "Inter_400Regular",
                      fontSize: 12,
                      color: theme.colors.textSecondary,
                    }}
                  >
                    Objectif
                  </Text>
                  <Text
                    style={{
                      fontFamily: "Inter_600SemiBold",
                      fontSize: 16,
                      color: theme.colors.text,
                    }}
                  >
                    {foundSaving.target_amount.toLocaleString()} {foundSaving.currency}
                  </Text>
                </View>
                <View>
                  <Text
                    style={{
                      fontFamily: "Inter_400Regular",
                      fontSize: 12,
                      color: theme.colors.textSecondary,
                    }}
                  >
                    Participants
                  </Text>
                  <Text
                    style={{
                      fontFamily: "Inter_600SemiBold",
                      fontSize: 16,
                      color: theme.colors.text,
                    }}
                  >
                    {foundSaving.member_count} personnes
                  </Text>
                </View>
                <View>
                  <Text
                    style={{
                      fontFamily: "Inter_400Regular",
                      fontSize: 12,
                      color: theme.colors.textSecondary,
                    }}
                  >
                    Organisateur
                  </Text>
                  <Text
                    style={{
                      fontFamily: "Inter_600SemiBold",
                      fontSize: 16,
                      color: theme.colors.text,
                    }}
                  >
                    {foundSaving.organizer}
                  </Text>
                </View>
              </View>

              {/* Progress */}
              <View style={{ marginBottom: 16 }}>
                <View
                  style={{
                    backgroundColor: theme.colors.background,
                    borderRadius: 8,
                    height: 8,
                    overflow: "hidden",
                  }}
                >
                  <View
                    style={{
                      backgroundColor: theme.colors.primary,
                      height: "100%",
                      width: `${(foundSaving.current_amount / foundSaving.target_amount) * 100}%`,
                      borderRadius: 8,
                    }}
                  />
                </View>
                <Text
                  style={{
                    fontFamily: "Inter_400Regular",
                    fontSize: 12,
                    color: theme.colors.textSecondary,
                    marginTop: 4,
                  }}
                >
                  {foundSaving.current_amount.toLocaleString()} {foundSaving.currency} collectés
                </Text>
              </View>

              {/* Join button */}
              <TouchableOpacity
                onPress={joinSaving}
                style={{
                  backgroundColor: theme.colors.success,
                  borderRadius: 12,
                  paddingVertical: 14,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    fontFamily: "Inter_600SemiBold",
                    fontSize: 16,
                    color: "#FFFFFF",
                  }}
                >
                  Rejoindre cette cagnotte
                </Text>
                <ArrowRight size={20} color="#FFFFFF" strokeWidth={2} style={{ marginLeft: 8 }} />
              </TouchableOpacity>
            </View>
          )}

          {/* Demo hint */}
          {IS_DEMO_MODE && !foundSaving && (
            <View
              style={{
                backgroundColor: `${theme.colors.accent}10`,
                borderRadius: 12,
                padding: 16,
                marginTop: 20,
              }}
            >
              <Text
                style={{
                  fontFamily: "Inter_500Medium",
                  fontSize: 13,
                  color: theme.colors.accent,
                  marginBottom: 4,
                }}
              >
                💡 Mode démo
              </Text>
              <Text
                style={{
                  fontFamily: "Inter_400Regular",
                  fontSize: 12,
                  color: theme.colors.textSecondary,
                }}
              >
                Codes de test : OWO-ABIDJAN, OWO-MAMAN60, OWO-TEST123
              </Text>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
