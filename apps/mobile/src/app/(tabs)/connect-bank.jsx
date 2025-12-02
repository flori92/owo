import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
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
  Building2,
  Search,
  CheckCircle,
  Trophy,
  ArrowRight,
  Shield,
  Eye,
  Clock,
  AlertCircle,
  Plus,
  ChevronRight,
  Globe,
  Lock,
  Users,
} from "lucide-react-native";
import { useTheme } from "@/utils/useTheme";
import ScreenContainer from "@/components/ScreenContainer";
import HeaderBar from "@/components/HeaderBar";
import LoadingScreen from "@/components/LoadingScreen";

export default function ConnectBankScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("FR");
  const [availableBanks, setAvailableBanks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [connectingBank, setConnectingBank] = useState(null);

  // European countries with banking support
  const countries = [
    { code: "FR", name: "France", flag: "🇫🇷" },
    { code: "DE", name: "Allemagne", flag: "🇩🇪" },
    { code: "ES", name: "Espagne", flag: "🇪🇸" },
    { code: "IT", name: "Italie", flag: "🇮🇹" },
    { code: "NL", name: "Pays-Bas", flag: "🇳🇱" },
    { code: "BE", name: "Belgique", flag: "🇧🇪" },
    { code: "CH", name: "Suisse", flag: "🇨🇭" },
  ];

  // Popular banks by country
  const banksByCountry = {
    FR: [
      {
        id: "CREDIT_AGRICOLE_FR",
        name: "Crédit Agricole",
        logo: "🏦",
        color: "#00A651",
        customers: "20M clients",
        description: "Banque coopérative française",
      },
      {
        id: "LCL_FR",
        name: "LCL",
        logo: "🏛️",
        color: "#E31E24",
        customers: "6M clients",
        description: "Le Crédit Lyonnais",
      },
      {
        id: "BNP_PARIBAS_FR",
        name: "BNP Paribas",
        logo: "🏦",
        color: "#009639",
        customers: "31M clients",
        description: "Banque internationale",
      },
      {
        id: "SOCIETE_GENERALE_FR",
        name: "Société Générale",
        logo: "🏛️",
        color: "#E4002B",
        customers: "25M clients",
        description: "Banque française d'investissement",
      },
      {
        id: "BOURSORAMA_FR",
        name: "Boursorama Banque",
        logo: "📱",
        color: "#00B2A9",
        customers: "3M clients",
        description: "Banque 100% en ligne",
      },
      {
        id: "REVOLUT_FR",
        name: "Revolut",
        logo: "🌐",
        color: "#0075EB",
        customers: "20M clients",
        description: "Banque digitale européenne",
      },
      {
        id: "N26_FR",
        name: "N26",
        logo: "🚀",
        color: "#36A8B0",
        customers: "8M clients",
        description: "Banque mobile",
      },
    ],
    DE: [
      {
        id: "DEUTSCHE_BANK_DE",
        name: "Deutsche Bank",
        logo: "🏦",
        color: "#0018A8",
        customers: "22M clients",
        description: "Banque allemande internationale",
      },
      {
        id: "COMMERZBANK_DE",
        name: "Commerzbank",
        logo: "🏛️",
        color: "#FFD800",
        customers: "11M clients",
        description: "Banque commerciale allemande",
      },
      {
        id: "ING_DE",
        name: "ING",
        logo: "🦁",
        color: "#FF6200",
        customers: "39M clients",
        description: "Banque néerlandaise en Allemagne",
      },
    ],
    ES: [
      {
        id: "SANTANDER_ES",
        name: "Banco Santander",
        logo: "🏦",
        color: "#EC0000",
        customers: "153M clients",
        description: "Banque espagnole internationale",
      },
      {
        id: "BBVA_ES",
        name: "BBVA",
        logo: "🏛️",
        color: "#004481",
        customers: "80M clients",
        description: "Banco Bilbao Vizcaya Argentaria",
      },
    ],
  };

  useEffect(() => {
    loadAvailableBanks();
  }, [selectedCountry]);

  const loadAvailableBanks = async () => {
    setIsLoading(true);
    try {
      // Simulate API call to fetch available banks
      const banks = banksByCountry[selectedCountry] || [];
      setAvailableBanks(banks);
    } catch (error) {
      console.error("Error loading banks:", error);
      Alert.alert("Erreur", "Impossible de charger la liste des banques");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBankConnection = async (bank) => {
    setConnectingBank(bank.id);

    try {
      // Simulate bank connection process
      await new Promise((resolve) => setTimeout(resolve, 2000));

      Alert.alert(
        "Connexion réussie !",
        `Votre compte ${bank.name} a été connecté avec succès à owo!`,
        [
          {
            text: "Parfait!",
            onPress: () => {
              // Navigate back or to account overview
              console.log("Bank connected:", bank.name);
            },
          },
        ],
      );
    } catch (error) {
      Alert.alert(
        "Erreur",
        "Impossible de se connecter à votre banque. Veuillez réessayer.",
      );
    } finally {
      setConnectingBank(null);
    }
  };

  const filteredBanks = availableBanks.filter((bank) =>
    bank.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (!fontsLoaded) {
    return <LoadingScreen />;
  }

  return (
    <ScreenContainer>
      <HeaderBar title="Connecter une banque européenne" />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingVertical: 20,
          paddingBottom: insets.bottom + 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Security Banner */}
        <View
          style={{
            backgroundColor: `${theme.colors.success}15`,
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
              backgroundColor: theme.colors.success,
              justifyContent: "center",
              alignItems: "center",
              marginRight: 16,
            }}
          >
            <Shield size={24} color="#FFFFFF" strokeWidth={1.5} />
          </View>

          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontFamily: "Inter_600SemiBold",
                fontSize: 16,
                color: theme.colors.text,
                marginBottom: 4,
              }}
            >
              Connexion sécurisée Open Banking
            </Text>
            <Text
              style={{
                fontFamily: "Inter_400Regular",
                fontSize: 13,
                color: theme.colors.textSecondary,
                lineHeight: 18,
              }}
            >
              owo! utilise la réglementation européenne PSD2 pour une connexion
              sécurisée et réglementée
            </Text>
          </View>
        </View>

        {/* Country Selector */}
        <View style={{ marginBottom: 24 }}>
          <Text
            style={{
              fontFamily: "Inter_600SemiBold",
              fontSize: 16,
              color: theme.colors.text,
              marginBottom: 12,
            }}
          >
            Sélectionnez votre pays
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: 20 }}
          >
            <View style={{ flexDirection: "row", gap: 12 }}>
              {countries.map((country) => (
                <TouchableOpacity
                  key={country.code}
                  style={{
                    backgroundColor:
                      selectedCountry === country.code
                        ? theme.colors.primary
                        : theme.colors.elevated,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    borderRadius: 25,
                    flexDirection: "row",
                    alignItems: "center",
                    minWidth: 100,
                  }}
                  onPress={() => setSelectedCountry(country.code)}
                >
                  <Text style={{ fontSize: 16, marginRight: 8 }}>
                    {country.flag}
                  </Text>
                  <Text
                    style={{
                      fontFamily: "Inter_500Medium",
                      fontSize: 13,
                      color:
                        selectedCountry === country.code
                          ? "#FFFFFF"
                          : theme.colors.text,
                    }}
                  >
                    {country.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Search Bar */}
        <View style={{ marginBottom: 24 }}>
          <View
            style={{
              backgroundColor: theme.colors.elevated,
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 12,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Search
              size={20}
              color={theme.colors.textSecondary}
              strokeWidth={1.5}
            />
            <TextInput
              style={{
                flex: 1,
                marginLeft: 12,
                fontFamily: "Inter_400Regular",
                fontSize: 16,
                color: theme.colors.text,
              }}
              placeholder="Rechercher votre banque..."
              placeholderTextColor={theme.colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Available Banks */}
        <View style={{ marginBottom: 24 }}>
          <Text
            style={{
              fontFamily: "Inter_600SemiBold",
              fontSize: 18,
              color: theme.colors.text,
              marginBottom: 16,
            }}
          >
            Banques disponibles
          </Text>

          {isLoading ? (
            <View style={{ alignItems: "center", paddingVertical: 40 }}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text
                style={{
                  fontFamily: "Inter_400Regular",
                  fontSize: 14,
                  color: theme.colors.textSecondary,
                  marginTop: 12,
                }}
              >
                Chargement des banques...
              </Text>
            </View>
          ) : (
            <View style={{ gap: 12 }}>
              {filteredBanks.map((bank) => (
                <TouchableOpacity
                  key={bank.id}
                  style={{
                    backgroundColor: theme.colors.elevated,
                    borderRadius: 16,
                    padding: 20,
                    flexDirection: "row",
                    alignItems: "center",
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.05,
                    shadowRadius: 8,
                    elevation: 2,
                    borderWidth: connectingBank === bank.id ? 2 : 0,
                    borderColor:
                      connectingBank === bank.id
                        ? theme.colors.primary
                        : "transparent",
                  }}
                  onPress={() => handleBankConnection(bank)}
                  disabled={connectingBank !== null}
                >
                  <View
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 28,
                      backgroundColor: `${bank.color}15`,
                      justifyContent: "center",
                      alignItems: "center",
                      marginRight: 16,
                    }}
                  >
                    <Text style={{ fontSize: 24 }}>{bank.logo}</Text>
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontFamily: "Inter_600SemiBold",
                        fontSize: 16,
                        color: theme.colors.text,
                        marginBottom: 4,
                      }}
                    >
                      {bank.name}
                    </Text>
                    <Text
                      style={{
                        fontFamily: "Inter_400Regular",
                        fontSize: 13,
                        color: theme.colors.textSecondary,
                        marginBottom: 2,
                      }}
                    >
                      {bank.description}
                    </Text>
                    <Text
                      style={{
                        fontFamily: "Inter_500Medium",
                        fontSize: 11,
                        color: bank.color,
                      }}
                    >
                      {bank.customers}
                    </Text>
                  </View>

                  {connectingBank === bank.id ? (
                    <ActivityIndicator
                      size="small"
                      color={theme.colors.primary}
                    />
                  ) : (
                    <ChevronRight
                      size={20}
                      color={theme.colors.textSecondary}
                      strokeWidth={1.5}
                    />
                  )}
                </TouchableOpacity>
              ))}

              {filteredBanks.length === 0 && !isLoading && (
                <View style={{ alignItems: "center", paddingVertical: 40 }}>
                  <Building2
                    size={48}
                    color={theme.colors.textSecondary}
                    strokeWidth={1}
                  />
                  <Text
                    style={{
                      fontFamily: "Inter_600SemiBold",
                      fontSize: 16,
                      color: theme.colors.text,
                      marginTop: 12,
                      marginBottom: 4,
                    }}
                  >
                    Aucune banque trouvée
                  </Text>
                  <Text
                    style={{
                      fontFamily: "Inter_400Regular",
                      fontSize: 14,
                      color: theme.colors.textSecondary,
                      textAlign: "center",
                    }}
                  >
                    Essayez de modifier votre recherche ou sélectionnez un autre
                    pays
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Features Info */}
        <View
          style={{
            backgroundColor: theme.colors.elevated,
            borderRadius: 16,
            padding: 20,
            marginBottom: 24,
          }}
        >
          <Text
            style={{
              fontFamily: "Inter_600SemiBold",
              fontSize: 16,
              color: theme.colors.text,
              marginBottom: 16,
            }}
          >
            Pourquoi connecter vos comptes européens ?
          </Text>

          <View style={{ gap: 12 }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Eye size={16} color={theme.colors.primary} strokeWidth={1.5} />
              <Text
                style={{
                  fontFamily: "Inter_400Regular",
                  fontSize: 14,
                  color: theme.colors.text,
                  marginLeft: 12,
                  flex: 1,
                }}
              >
                Vision unifiée de tous vos comptes
              </Text>
            </View>

            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Globe size={16} color={theme.colors.primary} strokeWidth={1.5} />
              <Text
                style={{
                  fontFamily: "Inter_400Regular",
                  fontSize: 14,
                  color: theme.colors.text,
                  marginLeft: 12,
                  flex: 1,
                }}
              >
                Transferts directs EUR ↔ FCFA
              </Text>
            </View>

            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Clock size={16} color={theme.colors.primary} strokeWidth={1.5} />
              <Text
                style={{
                  fontFamily: "Inter_400Regular",
                  fontSize: 14,
                  color: theme.colors.text,
                  marginLeft: 12,
                  flex: 1,
                }}
              >
                Synchronisation automatique en temps réel
              </Text>
            </View>

            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Lock size={16} color={theme.colors.primary} strokeWidth={1.5} />
              <Text
                style={{
                  fontFamily: "Inter_400Regular",
                  fontSize: 14,
                  color: theme.colors.text,
                  marginLeft: 12,
                  flex: 1,
                }}
              >
                Sécurité bancaire maximale avec PSD2
              </Text>
            </View>
          </View>
        </View>

        {/* Security Notice */}
        <View
          style={{
            backgroundColor: `${theme.colors.warning}15`,
            borderRadius: 12,
            padding: 16,
            flexDirection: "row",
            alignItems: "flex-start",
          }}
        >
          <AlertCircle
            size={20}
            color={theme.colors.warning}
            strokeWidth={1.5}
            style={{ marginTop: 2, marginRight: 12 }}
          />
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontFamily: "Inter_600SemiBold",
                fontSize: 14,
                color: theme.colors.warning,
                marginBottom: 4,
              }}
            >
              Information de sécurité
            </Text>
            <Text
              style={{
                fontFamily: "Inter_400Regular",
                fontSize: 13,
                color: theme.colors.text,
                lineHeight: 18,
              }}
            >
              owo! n'a jamais accès à vos identifiants bancaires. La connexion
              se fait via Open Banking européen (PSD2) avec un système
              d'autorisation sécurisé.
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
