import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Switch,
  Alert,
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
  Settings,
  Clock,
  Calendar,
  Lock,
  Repeat,
  PiggyBank,
  ChevronRight,
  Bell,
  Shield,
  Percent,
} from "lucide-react-native";
import { router } from "expo-router";
import { useTheme } from "@/utils/useTheme";
import ScreenContainer from "@/components/ScreenContainer";
import HeaderBar from "@/components/HeaderBar";
import LoadingScreen from "@/components/LoadingScreen";
import { IS_DEMO_MODE, getDemoMessage } from "@/config/appConfig";

export default function SavingsSettingsScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  // États des paramètres d'épargne
  const [settings, setSettings] = useState({
    // Paramètres généraux
    defaultCurrency: "FCFA",
    defaultDuration: "6", // mois
    
    // Sécurité
    requirePinForWithdraw: true,
    savingsPin: "",
    confirmPinOnCreate: true,
    
    // Virements automatiques
    autoTransferEnabled: false,
    autoTransferAmount: "",
    autoTransferFrequency: "monthly", // weekly, biweekly, monthly
    autoTransferDay: "1", // jour du mois ou de la semaine
    autoTransferSource: "mobileMoney", // mobileMoney, europeanBank
    
    // Notifications
    notifyOnDeposit: true,
    notifyOnMaturity: true,
    notifyBeforeMaturity: true,
    notifyDaysBefore: "7",
    
    // Objectifs
    showProgressBar: true,
    celebrateGoals: true,
  });

  // Options de fréquence
  const frequencyOptions = [
    { value: "weekly", label: "Chaque semaine" },
    { value: "biweekly", label: "Toutes les 2 semaines" },
    { value: "monthly", label: "Chaque mois" },
  ];

  // Options de source
  const sourceOptions = [
    { value: "mobileMoney", label: "Mobile Money" },
    { value: "europeanBank", label: "Compte européen" },
    { value: "total", label: "Solde total (priorité Mobile Money)" },
  ];

  const updateSetting = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const saveSettings = () => {
    // Validation
    if (settings.autoTransferEnabled && !settings.autoTransferAmount) {
      Alert.alert("Erreur", "Veuillez définir un montant pour le virement automatique");
      return;
    }

    if (settings.requirePinForWithdraw && !settings.savingsPin && settings.savingsPin !== "") {
      // Le PIN peut être vide si on ne veut pas le changer
    }

    // En mode démo, on simule la sauvegarde
    Alert.alert(
      "Paramètres sauvegardés",
      `Vos préférences d'épargne ont été mises à jour.${getDemoMessage("dataNotPersisted")}`
    );
  };

  const setupAutoTransfer = () => {
    if (!settings.autoTransferAmount || parseFloat(settings.autoTransferAmount) <= 0) {
      Alert.alert("Erreur", "Veuillez définir un montant valide");
      return;
    }

    const frequencyLabel = frequencyOptions.find(f => f.value === settings.autoTransferFrequency)?.label;
    const sourceLabel = sourceOptions.find(s => s.value === settings.autoTransferSource)?.label;

    Alert.alert(
      "Virement automatique configuré",
      `${settings.autoTransferAmount} FCFA seront prélevés ${frequencyLabel?.toLowerCase()} depuis "${sourceLabel}" vers votre épargne.${getDemoMessage("dataNotPersisted")}`,
      [{ text: "OK" }]
    );
  };

  if (!fontsLoaded) {
    return <LoadingScreen />;
  }

  const SectionTitle = ({ icon: Icon, title }) => (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
        marginTop: 24,
      }}
    >
      <Icon size={20} color={theme.colors.primary} strokeWidth={2} />
      <Text
        style={{
          fontFamily: "Inter_600SemiBold",
          fontSize: 16,
          color: theme.colors.text,
          marginLeft: 10,
        }}
      >
        {title}
      </Text>
    </View>
  );

  const SettingRow = ({ label, description, children }) => (
    <View
      style={{
        backgroundColor: theme.colors.elevated,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <View style={{ flex: 1, marginRight: 12 }}>
          <Text
            style={{
              fontFamily: "Inter_500Medium",
              fontSize: 15,
              color: theme.colors.text,
            }}
          >
            {label}
          </Text>
          {description && (
            <Text
              style={{
                fontFamily: "Inter_400Regular",
                fontSize: 13,
                color: theme.colors.textSecondary,
                marginTop: 4,
              }}
            >
              {description}
            </Text>
          )}
        </View>
        {children}
      </View>
    </View>
  );

  const SelectOption = ({ options, value, onChange }) => (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
      {options.map((option) => (
        <TouchableOpacity
          key={option.value}
          onPress={() => onChange(option.value)}
          style={{
            paddingHorizontal: 14,
            paddingVertical: 8,
            borderRadius: 20,
            backgroundColor:
              value === option.value
                ? theme.colors.primary
                : theme.colors.background,
            borderWidth: 1,
            borderColor:
              value === option.value
                ? theme.colors.primary
                : theme.colors.border,
          }}
        >
          <Text
            style={{
              fontFamily: "Inter_500Medium",
              fontSize: 13,
              color:
                value === option.value ? "#FFFFFF" : theme.colors.textSecondary,
            }}
          >
            {option.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <ScreenContainer>
      <HeaderBar
        title="Paramètres d'épargne"
        showBack={true}
        onBack={() => router.back()}
      />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingBottom: insets.bottom + 100,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Mode démo banner */}
        {IS_DEMO_MODE && (
          <View
            style={{
              backgroundColor: `${theme.colors.accent}15`,
              borderRadius: 12,
              padding: 12,
              marginTop: 16,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Settings size={18} color={theme.colors.accent} strokeWidth={2} />
            <Text
              style={{
                fontFamily: "Inter_400Regular",
                fontSize: 13,
                color: theme.colors.accent,
                marginLeft: 10,
                flex: 1,
              }}
            >
              Mode démo : les paramètres sont simulés localement
            </Text>
          </View>
        )}

        {/* Section Durée par défaut */}
        <SectionTitle icon={Clock} title="Durée par défaut" />
        
        <SettingRow
          label="Durée de blocage"
          description="Durée par défaut pour les nouvelles épargnes"
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <TextInput
              style={{
                backgroundColor: theme.colors.background,
                borderRadius: 8,
                paddingHorizontal: 12,
                paddingVertical: 8,
                width: 60,
                textAlign: "center",
                color: theme.colors.text,
                fontFamily: "Inter_500Medium",
                fontSize: 16,
              }}
              value={settings.defaultDuration}
              onChangeText={(v) => updateSetting("defaultDuration", v)}
              keyboardType="numeric"
              maxLength={2}
            />
            <Text
              style={{
                fontFamily: "Inter_400Regular",
                fontSize: 14,
                color: theme.colors.textSecondary,
                marginLeft: 8,
              }}
            >
              mois
            </Text>
          </View>
        </SettingRow>

        {/* Section Sécurité */}
        <SectionTitle icon={Shield} title="Sécurité" />

        <SettingRow
          label="PIN pour retrait"
          description="Exiger un code PIN pour débloquer une épargne"
        >
          <Switch
            value={settings.requirePinForWithdraw}
            onValueChange={(v) => updateSetting("requirePinForWithdraw", v)}
            trackColor={{
              false: theme.colors.border,
              true: theme.colors.primary,
            }}
            thumbColor="#FFFFFF"
          />
        </SettingRow>

        {settings.requirePinForWithdraw && (
          <SettingRow
            label="Définir le PIN d'épargne"
            description="Code à 4-6 chiffres pour sécuriser vos retraits"
          >
            <TextInput
              style={{
                backgroundColor: theme.colors.background,
                borderRadius: 8,
                paddingHorizontal: 16,
                paddingVertical: 10,
                width: 120,
                textAlign: "center",
                color: theme.colors.text,
                fontFamily: "Inter_500Medium",
                fontSize: 18,
                letterSpacing: 4,
              }}
              value={settings.savingsPin}
              onChangeText={(v) => updateSetting("savingsPin", v)}
              keyboardType="numeric"
              secureTextEntry
              maxLength={6}
              placeholder="••••"
              placeholderTextColor={theme.colors.textSecondary}
            />
          </SettingRow>
        )}

        <SettingRow
          label="Confirmer PIN à la création"
          description="Demander le PIN lors de la création d'une épargne"
        >
          <Switch
            value={settings.confirmPinOnCreate}
            onValueChange={(v) => updateSetting("confirmPinOnCreate", v)}
            trackColor={{
              false: theme.colors.border,
              true: theme.colors.primary,
            }}
            thumbColor="#FFFFFF"
          />
        </SettingRow>

        {/* Section Virements automatiques */}
        <SectionTitle icon={Repeat} title="Virements automatiques" />

        <SettingRow
          label="Activer les virements auto"
          description="Alimenter automatiquement votre épargne"
        >
          <Switch
            value={settings.autoTransferEnabled}
            onValueChange={(v) => updateSetting("autoTransferEnabled", v)}
            trackColor={{
              false: theme.colors.border,
              true: theme.colors.success,
            }}
            thumbColor="#FFFFFF"
          />
        </SettingRow>

        {settings.autoTransferEnabled && (
          <>
            <SettingRow
              label="Montant à virer"
              description="Montant prélevé à chaque virement"
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <TextInput
                  style={{
                    backgroundColor: theme.colors.background,
                    borderRadius: 8,
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    width: 100,
                    textAlign: "right",
                    color: theme.colors.text,
                    fontFamily: "Inter_500Medium",
                    fontSize: 16,
                  }}
                  value={settings.autoTransferAmount}
                  onChangeText={(v) => updateSetting("autoTransferAmount", v)}
                  keyboardType="numeric"
                  placeholder="10000"
                  placeholderTextColor={theme.colors.textSecondary}
                />
                <Text
                  style={{
                    fontFamily: "Inter_500Medium",
                    fontSize: 14,
                    color: theme.colors.textSecondary,
                    marginLeft: 8,
                  }}
                >
                  FCFA
                </Text>
              </View>
            </SettingRow>

            <View
              style={{
                backgroundColor: theme.colors.elevated,
                borderRadius: 12,
                padding: 16,
                marginBottom: 12,
              }}
            >
              <Text
                style={{
                  fontFamily: "Inter_500Medium",
                  fontSize: 15,
                  color: theme.colors.text,
                  marginBottom: 4,
                }}
              >
                Fréquence
              </Text>
              <Text
                style={{
                  fontFamily: "Inter_400Regular",
                  fontSize: 13,
                  color: theme.colors.textSecondary,
                  marginBottom: 8,
                }}
              >
                À quelle fréquence effectuer le virement ?
              </Text>
              <SelectOption
                options={frequencyOptions}
                value={settings.autoTransferFrequency}
                onChange={(v) => updateSetting("autoTransferFrequency", v)}
              />
            </View>

            <View
              style={{
                backgroundColor: theme.colors.elevated,
                borderRadius: 12,
                padding: 16,
                marginBottom: 12,
              }}
            >
              <Text
                style={{
                  fontFamily: "Inter_500Medium",
                  fontSize: 15,
                  color: theme.colors.text,
                  marginBottom: 4,
                }}
              >
                Source du prélèvement
              </Text>
              <Text
                style={{
                  fontFamily: "Inter_400Regular",
                  fontSize: 13,
                  color: theme.colors.textSecondary,
                  marginBottom: 8,
                }}
              >
                D'où prélever le montant ?
              </Text>
              <SelectOption
                options={sourceOptions}
                value={settings.autoTransferSource}
                onChange={(v) => updateSetting("autoTransferSource", v)}
              />
            </View>

            <SettingRow
              label="Jour du prélèvement"
              description={
                settings.autoTransferFrequency === "weekly"
                  ? "Jour de la semaine (1=Lundi, 7=Dimanche)"
                  : "Jour du mois (1-28)"
              }
            >
              <TextInput
                style={{
                  backgroundColor: theme.colors.background,
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  width: 60,
                  textAlign: "center",
                  color: theme.colors.text,
                  fontFamily: "Inter_500Medium",
                  fontSize: 16,
                }}
                value={settings.autoTransferDay}
                onChangeText={(v) => updateSetting("autoTransferDay", v)}
                keyboardType="numeric"
                maxLength={2}
              />
            </SettingRow>

            <TouchableOpacity
              onPress={setupAutoTransfer}
              style={{
                backgroundColor: theme.colors.success,
                borderRadius: 12,
                paddingVertical: 14,
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <Text
                style={{
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 15,
                  color: "#FFFFFF",
                }}
              >
                Configurer le virement automatique
              </Text>
            </TouchableOpacity>
          </>
        )}

        {/* Section Notifications */}
        <SectionTitle icon={Bell} title="Notifications" />

        <SettingRow
          label="Notification de dépôt"
          description="Être notifié à chaque versement"
        >
          <Switch
            value={settings.notifyOnDeposit}
            onValueChange={(v) => updateSetting("notifyOnDeposit", v)}
            trackColor={{
              false: theme.colors.border,
              true: theme.colors.primary,
            }}
            thumbColor="#FFFFFF"
          />
        </SettingRow>

        <SettingRow
          label="Notification de maturité"
          description="Être notifié quand une épargne est débloquable"
        >
          <Switch
            value={settings.notifyOnMaturity}
            onValueChange={(v) => updateSetting("notifyOnMaturity", v)}
            trackColor={{
              false: theme.colors.border,
              true: theme.colors.primary,
            }}
            thumbColor="#FFFFFF"
          />
        </SettingRow>

        <SettingRow
          label="Rappel avant maturité"
          description="Être notifié quelques jours avant le déblocage"
        >
          <Switch
            value={settings.notifyBeforeMaturity}
            onValueChange={(v) => updateSetting("notifyBeforeMaturity", v)}
            trackColor={{
              false: theme.colors.border,
              true: theme.colors.primary,
            }}
            thumbColor="#FFFFFF"
          />
        </SettingRow>

        {settings.notifyBeforeMaturity && (
          <SettingRow
            label="Jours avant rappel"
            description="Combien de jours avant la date de déblocage"
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <TextInput
                style={{
                  backgroundColor: theme.colors.background,
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  width: 60,
                  textAlign: "center",
                  color: theme.colors.text,
                  fontFamily: "Inter_500Medium",
                  fontSize: 16,
                }}
                value={settings.notifyDaysBefore}
                onChangeText={(v) => updateSetting("notifyDaysBefore", v)}
                keyboardType="numeric"
                maxLength={2}
              />
              <Text
                style={{
                  fontFamily: "Inter_400Regular",
                  fontSize: 14,
                  color: theme.colors.textSecondary,
                  marginLeft: 8,
                }}
              >
                jours
              </Text>
            </View>
          </SettingRow>
        )}

        {/* Section Affichage */}
        <SectionTitle icon={PiggyBank} title="Affichage" />

        <SettingRow
          label="Barre de progression"
          description="Afficher la progression vers l'objectif"
        >
          <Switch
            value={settings.showProgressBar}
            onValueChange={(v) => updateSetting("showProgressBar", v)}
            trackColor={{
              false: theme.colors.border,
              true: theme.colors.primary,
            }}
            thumbColor="#FFFFFF"
          />
        </SettingRow>

        <SettingRow
          label="Célébrer les objectifs"
          description="Animation quand un objectif est atteint"
        >
          <Switch
            value={settings.celebrateGoals}
            onValueChange={(v) => updateSetting("celebrateGoals", v)}
            trackColor={{
              false: theme.colors.border,
              true: theme.colors.primary,
            }}
            thumbColor="#FFFFFF"
          />
        </SettingRow>

        {/* Bouton Sauvegarder */}
        <TouchableOpacity
          onPress={saveSettings}
          style={{
            backgroundColor: theme.colors.primary,
            borderRadius: 16,
            paddingVertical: 16,
            alignItems: "center",
            marginTop: 32,
            marginBottom: 20,
          }}
        >
          <Text
            style={{
              fontFamily: "Inter_600SemiBold",
              fontSize: 16,
              color: "#FFFFFF",
            }}
          >
            Sauvegarder les paramètres
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenContainer>
  );
}
