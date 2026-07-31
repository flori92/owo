import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Check, Globe2, ShieldCheck } from "lucide-react-native";
import { router } from "expo-router";
import HeaderBar from "@/components/HeaderBar";
import ScreenContainer from "@/components/ScreenContainer";
import { REGIONS, SUPPORTED_MARKETS } from "@/config/markets";
import { useMarket } from "@/contexts/MarketContext";
import { useTheme } from "@/utils/useTheme";

export default function MarketSettingsScreen() {
  const theme = useTheme();
  const { countryCode, setCountryCode } = useMarket();

  const selectMarket = async (nextCode) => {
    await setCountryCode(nextCode);
    if (router.canGoBack()) router.back();
    else router.replace("/(tabs)/home");
  };

  return (
    <ScreenContainer>
      <HeaderBar title="Pays et région" />
      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 48 }}>
        <View style={{ padding: 18, borderRadius: 16, borderWidth: 1, borderColor: theme.colors.primary, backgroundColor: `${theme.colors.primary}12`, marginBottom: 24 }}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
            <Globe2 size={20} color={theme.colors.primary} />
            <Text style={{ marginLeft: 10, color: theme.colors.text, fontFamily: "Inter_600SemiBold", fontSize: 16 }}>owo! s'adapte à votre marché</Text>
          </View>
          <Text style={{ color: theme.colors.textSecondary, lineHeight: 20 }}>
            La devise, l'indicatif et les opérateurs disponibles changent ensemble. Le Cameroun utilise le XAF ; les pays UEMOA utilisent le XOF.
          </Text>
        </View>

        {Object.values(REGIONS).map((region) => {
          const markets = SUPPORTED_MARKETS.filter((market) => market.region === region.code);
          if (!markets.length) return null;
          return (
            <View key={region.code} style={{ marginBottom: 24 }}>
              <Text style={{ color: theme.colors.text, fontFamily: "Inter_600SemiBold", fontSize: 18, marginBottom: 12 }}>{region.name}</Text>
              <View style={{ gap: 10 }}>
                {markets.map((market) => {
                  const selected = countryCode === market.countryCode;
                  return (
                    <TouchableOpacity
                      key={market.countryCode}
                      accessibilityRole="radio"
                      accessibilityState={{ checked: selected }}
                      onPress={() => selectMarket(market.countryCode)}
                      style={{ flexDirection: "row", alignItems: "center", padding: 16, borderRadius: 14, borderWidth: selected ? 2 : 1, borderColor: selected ? theme.colors.primary : theme.colors.border, backgroundColor: theme.colors.elevated }}
                    >
                      <Text style={{ fontSize: 28, marginRight: 14 }}>{market.flag}</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: theme.colors.text, fontFamily: "Inter_600SemiBold", fontSize: 16 }}>{market.countryName}</Text>
                        <Text style={{ color: theme.colors.textSecondary, marginTop: 3 }}>{market.currency} · {market.operators.map((operator) => operator.shortName).join(" · ")}</Text>
                      </View>
                      {selected && <Check size={22} color={theme.colors.primary} />}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          );
        })}

        <View style={{ flexDirection: "row", alignItems: "flex-start", padding: 16 }}>
          <ShieldCheck size={18} color={theme.colors.success} />
          <Text style={{ flex: 1, marginLeft: 10, color: theme.colors.textSecondary, lineHeight: 19 }}>
            Un opérateur n'est activé pour les transactions réelles qu'après validation du partenaire et des exigences réglementaires locales.
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
