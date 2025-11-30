import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
  Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from "@expo-google-fonts/inter";
import {
  Smartphone,
  Plus,
  Check,
  Shield,
  AlertCircle,
  RefreshCw,
  Trash2,
} from "lucide-react-native";
import { router } from "expo-router";
import { useTheme } from "@/utils/useTheme";
import ScreenContainer from "@/components/ScreenContainer";
import HeaderBar from "@/components/HeaderBar";
import ActionButton from "@/components/ActionButton";
import LoadingScreen from "@/components/LoadingScreen";

export default function PaymentIntegrationScreen() {
  const insets = useSafeAreaInsets();
  const [isConnecting, setIsConnecting] = useState(false);
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedProvider, setSelectedProvider] = useState("");
  const theme = useTheme();

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  // Mock connected accounts - will be replaced with API calls
  const connectedAccounts = [
    {
      id: 1,
      provider: "MTN Mobile Money",
      phoneNumber: "+229 XX XX XX 45",
      balance: 45250,
      color: theme.colors.mobileMoneyOrange,
      status: "connected",
      lastSync: "5 min",
    },
    {
      id: 2,
      provider: "Moov Money",
      phoneNumber: "+229 XX XX XX 67",
      balance: 25500,
      color: theme.colors.mobileMoneyBlue,
      status: "connected",
      lastSync: "1h",
    },
  ];

  const availableProviders = [
    {
      id: "mtn",
      name: "MTN Mobile Money",
      color: theme.colors.mobileMoneyOrange,
      description: "Le service Mobile Money de MTN",
      connected: connectedAccounts.some(
        (acc) => acc.provider === "MTN Mobile Money",
      ),
    },
    {
      id: "moov",
      name: "Moov Money",
      color: theme.colors.mobileMoneyBlue,
      description: "Le service Mobile Money de Moov",
      connected: connectedAccounts.some((acc) => acc.provider === "Moov Money"),
    },
    {
      id: "celtiis",
      name: "Celtiis Cash",
      color: theme.colors.mobileMoneyGreen,
      description: "Le service Mobile Money de Celtiis",
      connected: false,
    },
  ];

  const handleConnectAccount = async () => {
    if (!selectedProvider || !phoneNumber) {
      Alert.alert(
        "Erreur",
        "Veuillez sélectionner un fournisseur et saisir un numéro de téléphone",
      );
      return;
    }

    setIsConnecting(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      Alert.alert("Succès", "Compte Mobile Money connecté avec succès!", [
        {
          text: "OK",
          onPress: () => {
            setShowAddAccount(false);
            setPhoneNumber("");
            setSelectedProvider("");
          },
        },
      ]);
    } catch (error) {
      Alert.alert(
        "Erreur",
        "Impossible de connecter le compte. Veuillez réessayer.",
      );
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnectAccount = (accountId, providerName) => {
    Alert.alert(
      "Déconnecter le compte",
      `Êtes-vous sûr de vouloir déconnecter votre compte ${providerName} ?`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Déconnecter",
          style: "destructive",
          onPress: () => {
            Alert.alert("Info", "Compte déconnecté avec succès");
          },
        },
      ],
    );
  };

  const handleSyncAccount = async (accountId, providerName) => {
    Alert.alert(
      "Info",
      `Synchronisation du compte ${providerName} en cours...`,
    );
  };

  if (!fontsLoaded) {
    return <LoadingScreen />;
  }

  return (
    <ScreenContainer>
      <HeaderBar title="Mobile Money" />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingVertical: 20,
          paddingBottom: insets.bottom + 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Info */}
        <View
          style={{
            backgroundColor: `${theme.colors.primary}15`,
            borderRadius: 12,
            padding: 20,
            marginBottom: 32,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Shield size={24} color={theme.colors.primary} strokeWidth={1.5} />
          <View style={{ flex: 1, marginLeft: 16 }}>
            <Text
              style={{
                fontFamily: "Inter_600SemiBold",
                fontSize: 16,
                color: theme.colors.text,
                marginBottom: 4,
              }}
            >
              Connexion sécurisée
            </Text>
            <Text
              style={{
                fontFamily: "Inter_400Regular",
                fontSize: 14,
                color: theme.colors.textSecondary,
                lineHeight: 20,
              }}
            >
              Connectez vos comptes Mobile Money pour une synchronisation
              automatique des transactions via KkiaPay et FedaPay.
            </Text>
          </View>
        </View>

        {/* Connected Accounts */}
        {connectedAccounts.length > 0 && (
          <View style={{ marginBottom: 32 }}>
            <Text
              style={{
                fontFamily: "Inter_600SemiBold",
                fontSize: 18,
                color: theme.colors.text,
                marginBottom: 16,
              }}
            >
              Comptes connectés ({connectedAccounts.length})
            </Text>

            <View style={{ gap: 12 }}>
              {connectedAccounts.map((account) => (
                <View
                  key={account.id}
                  style={{
                    backgroundColor: theme.colors.elevated,
                    borderRadius: 12,
                    padding: 20,
                    borderLeftWidth: 4,
                    borderLeftColor: account.color,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: 16,
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          marginBottom: 8,
                        }}
                      >
                        <Text
                          style={{
                            fontFamily: "Inter_600SemiBold",
                            fontSize: 16,
                            color: theme.colors.text,
                          }}
                        >
                          {account.provider}
                        </Text>
                        <View
                          style={{
                            backgroundColor: theme.colors.success,
                            borderRadius: 10,
                            paddingHorizontal: 6,
                            paddingVertical: 2,
                            marginLeft: 8,
                          }}
                        >
                          <Text
                            style={{
                              fontFamily: "Inter_500Medium",
                              fontSize: 10,
                              color: "#FFFFFF",
                            }}
                          >
                            Connecté
                          </Text>
                        </View>
                      </View>

                      <Text
                        style={{
                          fontFamily: "Inter_400Regular",
                          fontSize: 14,
                          color: theme.colors.textSecondary,
                          marginBottom: 4,
                        }}
                      >
                        {account.phoneNumber}
                      </Text>

                      <Text
                        style={{
                          fontFamily: "Inter_600SemiBold",
                          fontSize: 18,
                          color: theme.colors.success,
                          marginBottom: 8,
                        }}
                      >
                        {account.balance.toLocaleString()} FCFA
                      </Text>

                      <Text
                        style={{
                          fontFamily: "Inter_400Regular",
                          fontSize: 12,
                          color: theme.colors.textSecondary,
                        }}
                      >
                        Dernière synchronisation: il y a {account.lastSync}
                      </Text>
                    </View>
                  </View>

                  {/* Account Actions */}
                  <View
                    style={{
                      flexDirection: "row",
                      gap: 12,
                    }}
                  >
                    <TouchableOpacity
                      style={{
                        flex: 1,
                        backgroundColor: `${theme.colors.primary}20`,
                        borderRadius: 8,
                        paddingVertical: 10,
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                      onPress={() =>
                        handleSyncAccount(account.id, account.provider)
                      }
                    >
                      <RefreshCw
                        size={16}
                        color={theme.colors.primary}
                        strokeWidth={1.5}
                      />
                      <Text
                        style={{
                          fontFamily: "Inter_500Medium",
                          fontSize: 13,
                          color: theme.colors.primary,
                          marginLeft: 6,
                        }}
                      >
                        Synchroniser
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={{
                        flex: 1,
                        backgroundColor: `${theme.colors.error}20`,
                        borderRadius: 8,
                        paddingVertical: 10,
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                      onPress={() =>
                        handleDisconnectAccount(account.id, account.provider)
                      }
                    >
                      <Trash2
                        size={16}
                        color={theme.colors.error}
                        strokeWidth={1.5}
                      />
                      <Text
                        style={{
                          fontFamily: "Inter_500Medium",
                          fontSize: 13,
                          color: theme.colors.error,
                          marginLeft: 6,
                        }}
                      >
                        Déconnecter
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Add New Account */}
        <View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <Text
              style={{
                fontFamily: "Inter_600SemiBold",
                fontSize: 18,
                color: theme.colors.text,
              }}
            >
              Fournisseurs disponibles
            </Text>

            {!showAddAccount && (
              <TouchableOpacity
                style={{
                  backgroundColor: theme.colors.primary,
                  borderRadius: 20,
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  flexDirection: "row",
                  alignItems: "center",
                }}
                onPress={() => setShowAddAccount(true)}
              >
                <Plus size={16} color="#FFFFFF" strokeWidth={1.5} />
                <Text
                  style={{
                    fontFamily: "Inter_600SemiBold",
                    fontSize: 13,
                    color: "#FFFFFF",
                    marginLeft: 6,
                  }}
                >
                  Ajouter
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Provider List */}
          <View style={{ gap: 12 }}>
            {availableProviders.map((provider) => (
              <TouchableOpacity
                key={provider.id}
                style={{
                  backgroundColor: theme.colors.elevated,
                  borderRadius: 12,
                  padding: 20,
                  borderWidth:
                    showAddAccount && selectedProvider === provider.id ? 2 : 1,
                  borderColor:
                    showAddAccount && selectedProvider === provider.id
                      ? theme.colors.primary
                      : theme.colors.border,
                  opacity: provider.connected ? 0.5 : 1,
                }}
                onPress={() => {
                  if (!provider.connected && showAddAccount) {
                    setSelectedProvider(provider.id);
                  }
                }}
                disabled={provider.connected}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      flex: 1,
                    }}
                  >
                    <View
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 24,
                        backgroundColor: `${provider.color}20`,
                        justifyContent: "center",
                        alignItems: "center",
                        marginRight: 16,
                      }}
                    >
                      <Smartphone
                        size={24}
                        color={provider.color}
                        strokeWidth={1.5}
                      />
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
                        {provider.name}
                      </Text>
                      <Text
                        style={{
                          fontFamily: "Inter_400Regular",
                          fontSize: 14,
                          color: theme.colors.textSecondary,
                        }}
                      >
                        {provider.description}
                      </Text>
                    </View>
                  </View>

                  {provider.connected ? (
                    <View
                      style={{
                        backgroundColor: theme.colors.success,
                        borderRadius: 12,
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        flexDirection: "row",
                        alignItems: "center",
                      }}
                    >
                      <Check size={14} color="#FFFFFF" strokeWidth={2} />
                      <Text
                        style={{
                          fontFamily: "Inter_500Medium",
                          fontSize: 12,
                          color: "#FFFFFF",
                          marginLeft: 4,
                        }}
                      >
                        Connecté
                      </Text>
                    </View>
                  ) : (
                    showAddAccount &&
                    selectedProvider === provider.id && (
                      <View
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: 10,
                          backgroundColor: theme.colors.primary,
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <View
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: "#FFFFFF",
                          }}
                        />
                      </View>
                    )
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Add Account Form */}
          {showAddAccount && (
            <View
              style={{
                backgroundColor: theme.colors.elevated,
                borderRadius: 12,
                padding: 20,
                marginTop: 16,
                borderWidth: 1,
                borderColor: theme.colors.primary,
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
                Connecter un nouveau compte
              </Text>

              {/* Phone Number Input */}
              <View style={{ marginBottom: 20 }}>
                <Text
                  style={{
                    fontFamily: "Inter_500Medium",
                    fontSize: 14,
                    color: theme.colors.text,
                    marginBottom: 8,
                  }}
                >
                  Numéro de téléphone
                </Text>
                <TextInput
                  style={{
                    backgroundColor: theme.colors.background,
                    borderRadius: 8,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    fontFamily: "Inter_500Medium",
                    fontSize: 16,
                    color: theme.colors.text,
                    borderWidth: 1,
                    borderColor: theme.colors.border,
                  }}
                  placeholder="+229 XX XX XX XX"
                  placeholderTextColor={theme.colors.textSecondary}
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  keyboardType="phone-pad"
                />
              </View>

              {/* Warning */}
              <View
                style={{
                  backgroundColor: `${theme.colors.warning}15`,
                  borderRadius: 8,
                  padding: 12,
                  marginBottom: 20,
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <AlertCircle
                  size={16}
                  color={theme.colors.warning}
                  strokeWidth={1.5}
                />
                <Text
                  style={{
                    fontFamily: "Inter_400Regular",
                    fontSize: 13,
                    color: theme.colors.text,
                    marginLeft: 8,
                    flex: 1,
                    lineHeight: 18,
                  }}
                >
                  Vous devrez authoriser l'accès à vos données Mobile Money via
                  l'API sécurisée.
                </Text>
              </View>

              {/* Action Buttons */}
              <View
                style={{
                  flexDirection: "row",
                  gap: 12,
                }}
              >
                <ActionButton
                  title="Annuler"
                  variant="secondary"
                  style={{ flex: 1 }}
                  onPress={() => {
                    setShowAddAccount(false);
                    setSelectedProvider("");
                    setPhoneNumber("");
                  }}
                />
                <ActionButton
                  title={isConnecting ? "Connexion..." : "Connecter"}
                  style={{ flex: 1 }}
                  onPress={handleConnectAccount}
                  disabled={isConnecting || !selectedProvider || !phoneNumber}
                />
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
