import React, { useMemo, useState } from "react";
import { Linking, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import {
  ArrowLeft,
  BookOpen,
  Building2,
  ChevronRight,
  CircleDollarSign,
  ExternalLink,
  LockKeyhole,
  Scale,
  ShieldCheck,
  TrendingUp,
} from "lucide-react-native";
import ScreenContainer from "@/components/ScreenContainer";
import { useTheme } from "@/utils/useTheme";
import { useMarket } from "@/contexts/MarketContext";
import { formatMarketMoney } from "@/config/markets";

const parseNumber = (value) => Math.max(0, Number(String(value).replace(/[^0-9.,]/g, "").replace(",", ".")) || 0);

const PRODUCTS = [
  {
    icon: ShieldCheck,
    title: "Obligations",
    risk: "Risque généralement modéré",
    description: "Titres de dette d'États ou d'entreprises. Le capital reste exposé au risque de l'émetteur et à la liquidité.",
    color: "#20B2AA",
  },
  {
    icon: Building2,
    title: "OPCVM",
    risk: "Risque variable",
    description: "Portefeuilles collectifs gérés par une société agréée. Vérifiez stratégie, frais, historique et dépositaire.",
    color: "#8B5CF6",
  },
  {
    icon: TrendingUp,
    title: "Actions BVMAC",
    risk: "Risque élevé",
    description: "Participation au capital d'une entreprise cotée. Le cours et les dividendes ne sont jamais garantis.",
    color: "#DAA520",
  },
];

export default function InvestScreen() {
  const theme = useTheme();
  const { market } = useMarket();
  const isCentralAfrica = market.region === "CEMAC";
  const exchangeName = isCentralAfrica ? "BVMAC" : "BRVM";
  const regulatorName = isCentralAfrica ? "COSUMAF" : "AMF-UMOA";
  const investorGuideUrl = isCentralAfrica
    ? "https://www.bvm-ac.org/espace-investisseurs-fr/investisseurs-acces-aux-produits-boursiers/"
    : "https://www.brvm.org/fr/comment-investir-la-brvm";
  const regulatorUrl = isCentralAfrica
    ? "https://cnet.cosumaf.org/external/agreement-visa"
    : "https://www.brvm.org/fr/conseils-en-investissements-boursiers";
  const formatXaf = (value) => formatMarketMoney(value, market);
  const products = PRODUCTS.map((product) => product.title === "Actions BVMAC"
    ? { ...product, title: `Actions ${exchangeName}` }
    : product);
  const insets = useSafeAreaInsets();
  const [initial, setInitial] = useState("100000");
  const [monthly, setMonthly] = useState("25000");
  const [years, setYears] = useState("5");
  const [annualRate, setAnnualRate] = useState("5");

  const simulation = useMemo(() => {
    const principal = parseNumber(initial);
    const monthlyContribution = parseNumber(monthly);
    const durationMonths = Math.min(600, Math.round(parseNumber(years) * 12));
    const monthlyRate = Math.min(1, parseNumber(annualRate) / 100) / 12;
    let projected = principal;
    for (let month = 0; month < durationMonths; month += 1) {
      projected = projected * (1 + monthlyRate) + monthlyContribution;
    }
    const contributed = principal + monthlyContribution * durationMonths;
    return { projected, contributed, gain: projected - contributed };
  }, [annualRate, initial, monthly, years]);

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 14, paddingHorizontal: 20, paddingBottom: insets.bottom + 90 }} showsVerticalScrollIndicator={false}>
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 22 }}>
          <TouchableOpacity onPress={() => router.back()} style={{ width: 44, height: 44, borderRadius: 22, borderWidth: 1, borderColor: theme.colors.border, alignItems: "center", justifyContent: "center" }}>
            <ArrowLeft color={theme.colors.text} size={21} />
          </TouchableOpacity>
          <View style={{ flex: 1, marginLeft: 13 }}>
            <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>Apprendre avant d'investir</Text>
            <Text style={{ color: theme.colors.text, fontSize: 25, fontWeight: "800", marginTop: 2 }}>Investir avec owo!</Text>
          </View>
        </View>

        <View style={{ padding: 18, borderRadius: 20, borderWidth: 2, borderColor: theme.colors.accent, backgroundColor: `${theme.colors.accent}0D`, marginBottom: 24 }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <LockKeyhole color={theme.colors.accent} size={23} />
            <Text style={{ color: theme.colors.text, fontWeight: "700", fontSize: 16, marginLeft: 10 }}>Mode éducatif sécurisé</Text>
          </View>
          <Text style={{ color: theme.colors.textSecondary, fontSize: 13, lineHeight: 20, marginTop: 10 }}>Aucun argent n'est investi depuis cet écran. Les futurs ordres passeront uniquement par une société de bourse ou un intermédiaire agréé {regulatorName}.</Text>
        </View>

        <Text style={{ color: theme.colors.text, fontSize: 19, fontWeight: "700", marginBottom: 12 }}>Simuler un objectif</Text>
        <View style={{ padding: 18, borderRadius: 20, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.cardBackground, marginBottom: 24 }}>
          {[
            ["Montant de départ", initial, setInitial, market.currency],
            ["Versement mensuel", monthly, setMonthly, market.currency],
            ["Durée", years, setYears, "années"],
            ["Hypothèse annuelle", annualRate, setAnnualRate, "%"],
          ].map(([label, value, setter, suffix]) => (
            <View key={label} style={{ marginBottom: 13 }}>
              <Text style={{ color: theme.colors.textSecondary, fontSize: 12, marginBottom: 6 }}>{label}</Text>
              <View style={{ flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: theme.colors.border, borderRadius: 13, backgroundColor: theme.colors.elevated, paddingHorizontal: 13 }}>
                <TextInput value={value} onChangeText={setter} keyboardType="decimal-pad" style={{ flex: 1, color: theme.colors.text, paddingVertical: 11, fontWeight: "600" }} />
                <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>{suffix}</Text>
              </View>
            </View>
          ))}
          <View style={{ borderRadius: 16, backgroundColor: `${theme.colors.primary}10`, borderWidth: 1, borderColor: theme.colors.primary, padding: 16, marginTop: 5 }}>
            <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>Valeur simulée</Text>
            <Text style={{ color: theme.colors.primary, fontSize: 26, fontWeight: "800", marginTop: 4 }}>{formatXaf(simulation.projected)}</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 18, marginTop: 12 }}>
              <View><Text style={{ color: theme.colors.textTertiary, fontSize: 11 }}>Versements</Text><Text style={{ color: theme.colors.text, fontWeight: "600", marginTop: 3 }}>{formatXaf(simulation.contributed)}</Text></View>
              <View><Text style={{ color: theme.colors.textTertiary, fontSize: 11 }}>Gain hypothétique</Text><Text style={{ color: theme.colors.text, fontWeight: "600", marginTop: 3 }}>{formatXaf(simulation.gain)}</Text></View>
            </View>
          </View>
          <Text style={{ color: theme.colors.textTertiary, fontSize: 11, lineHeight: 16, marginTop: 12 }}>Simulation mathématique sans frais, fiscalité ni inflation. Une hypothèse de rendement ne constitue ni une promesse ni une prévision.</Text>
        </View>

        <Text style={{ color: theme.colors.text, fontSize: 19, fontWeight: "700", marginBottom: 12 }}>Comprendre les placements</Text>
        {products.map((product) => (
          <View key={product.title} style={{ padding: 17, borderRadius: 18, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.cardBackground, marginBottom: 10 }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: `${product.color}18`, alignItems: "center", justifyContent: "center" }}>
                <product.icon color={product.color} size={21} />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={{ color: theme.colors.text, fontWeight: "700", fontSize: 16 }}>{product.title}</Text>
                <Text style={{ color: product.color, fontSize: 11, marginTop: 3 }}>{product.risk}</Text>
              </View>
            </View>
            <Text style={{ color: theme.colors.textSecondary, fontSize: 13, lineHeight: 19, marginTop: 12 }}>{product.description}</Text>
          </View>
        ))}

        <Text style={{ color: theme.colors.text, fontSize: 19, fontWeight: "700", marginTop: 14, marginBottom: 12 }}>Parcours avant investissement</Text>
        <View style={{ borderRadius: 18, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.cardBackground, overflow: "hidden", marginBottom: 24 }}>
          {[
            [CircleDollarSign, "Stabiliser le budget", "Conserver une marge mensuelle positive"],
            [ShieldCheck, "Constituer une réserve", "Viser 3 à 6 mois de dépenses essentielles"],
            [Scale, "Définir le risque", "Choisir horizon, pertes acceptables et liquidité"],
            [Building2, "Choisir un intermédiaire", `Vérifier son agrément auprès de la ${regulatorName}`],
          ].map(([Icon, title, subtitle], index) => (
            <View key={title} style={{ flexDirection: "row", alignItems: "center", padding: 16, borderBottomWidth: index === 3 ? 0 : 1, borderBottomColor: theme.colors.divider }}>
              <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: `${theme.colors.primary}14`, alignItems: "center", justifyContent: "center" }}><Icon color={theme.colors.primary} size={17} /></View>
              <View style={{ flex: 1, marginLeft: 12 }}><Text style={{ color: theme.colors.text, fontWeight: "600" }}>{title}</Text><Text style={{ color: theme.colors.textSecondary, fontSize: 12, marginTop: 3 }}>{subtitle}</Text></View>
              <Text style={{ color: theme.colors.textTertiary, fontSize: 12 }}>{index + 1}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity onPress={() => Linking.openURL(investorGuideUrl)} style={{ flexDirection: "row", alignItems: "center", padding: 16, borderRadius: 16, borderWidth: 1, borderColor: theme.colors.border, marginBottom: 10 }}>
          <BookOpen color={theme.colors.primary} size={20} />
          <Text style={{ flex: 1, color: theme.colors.text, fontWeight: "600", marginLeft: 12 }}>Guide officiel des investisseurs {exchangeName}</Text>
          <ExternalLink color={theme.colors.textSecondary} size={18} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => Linking.openURL(regulatorUrl)} style={{ flexDirection: "row", alignItems: "center", padding: 16, borderRadius: 16, borderWidth: 1, borderColor: theme.colors.border, marginBottom: 20 }}>
          <ShieldCheck color={theme.colors.primary} size={20} />
          <Text style={{ flex: 1, color: theme.colors.text, fontWeight: "600", marginLeft: 12 }}>Vérifier les intermédiaires agréés</Text>
          <ChevronRight color={theme.colors.textSecondary} size={18} />
        </TouchableOpacity>

        <View style={{ padding: 16, borderRadius: 16, backgroundColor: theme.colors.elevated }}>
          <Text style={{ color: theme.colors.textSecondary, fontSize: 11, lineHeight: 17, textAlign: "center" }}>Les placements présentent un risque de perte en capital. owo! ne fournit pas encore de conseil personnalisé et ne reçoit aucun ordre de bourse.</Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
