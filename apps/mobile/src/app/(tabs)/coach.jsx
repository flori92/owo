import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import {
  AlertTriangle,
  Brain,
  ChevronRight,
  PiggyBank,
  Send,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  WalletCards,
} from "lucide-react-native";
import ScreenContainer from "@/components/ScreenContainer";
import { useTheme } from "@/utils/useTheme";
import {
  DEFAULT_COACH_PROFILE,
  analyzeCoachProfile,
  answerCoachQuestion,
} from "@/features/coach/financialCoach";
import { apiRequest, isApiConfigured } from "@/services/api/client";
import { useMarket } from "@/contexts/MarketContext";
import { formatMarketMoney } from "@/config/markets";

const STORAGE_KEY = "owo.financial-coach.profile.v2";
const parseAmount = (value) => Math.max(0, Number(String(value).replace(/[^0-9]/g, "")) || 0);

function Metric({ theme, icon: Icon, label, value, color }) {
  return (
    <View style={{ flex: 1, minWidth: 150, padding: 16, borderRadius: 18, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.cardBackground }}>
      <View style={{ width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center", backgroundColor: `${color}18`, marginBottom: 12 }}>
        <Icon size={19} color={color} />
      </View>
      <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>{label}</Text>
      <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: "700", marginTop: 4 }}>{value}</Text>
    </View>
  );
}

export default function CoachScreen() {
  const theme = useTheme();
  const { market } = useMarket();
  const storageKey = `${STORAGE_KEY}.${market.countryCode}`;
  const formatXaf = (value) => formatMarketMoney(value, market);
  const insets = useSafeAreaInsets();
  const [profile, setProfile] = useState(DEFAULT_COACH_PROFILE);
  const [draft, setDraft] = useState(DEFAULT_COACH_PROFILE);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Bonjour, je suis Coach owo!. Posez-moi une question sur votre budget, votre épargne ou vos placements." },
  ]);

  useEffect(() => {
    AsyncStorage.getItem(storageKey)
      .then((saved) => {
        if (saved) {
          const parsed = JSON.parse(saved);
          setProfile({ ...DEFAULT_COACH_PROFILE, ...parsed, currency: market.currency });
          setDraft({ ...DEFAULT_COACH_PROFILE, ...parsed, currency: market.currency });
        }
      })
      .then(async () => {
        if (!isApiConfigured()) return;
        const result = await apiRequest("/v1/financial-coach/profile");
        if (!result?.profile?.categories?.length) return;
        const colors = Object.fromEntries(DEFAULT_COACH_PROFILE.categories.map((item) => [item.code, item.color]));
        const remoteProfile = {
          ...DEFAULT_COACH_PROFILE,
          ...result.profile,
          currency: market.currency,
          categories: result.profile.categories.map((item) => ({
            ...item,
            color: colors[item.code] || theme.colors.primary,
          })),
        };
        setProfile(remoteProfile);
        setDraft(remoteProfile);
        await AsyncStorage.setItem(storageKey, JSON.stringify({ ...remoteProfile, currency: market.currency }));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [market.currency, storageKey, theme.colors.primary]);

  const analysis = useMemo(() => analyzeCoachProfile(profile), [profile]);

  const saveProfile = async () => {
    setProfile(draft);
    setEditing(false);
    await AsyncStorage.setItem(storageKey, JSON.stringify({ ...draft, currency: market.currency }));
    if (isApiConfigured()) {
      apiRequest("/v1/financial-coach/profile", {
        method: "PUT",
        body: JSON.stringify({
          currency: market.currency,
          monthlyIncomeMinor: draft.monthlyIncomeMinor,
          currentSavingsMinor: draft.currentSavingsMinor,
          debtPaymentsMinor: draft.debtPaymentsMinor,
          emergencyFundMonths: draft.emergencyFundMonths,
          categories: draft.categories.map(({ color: _color, ...category }) => category),
        }),
      }).catch(() => {});
    }
  };

  const ask = (text = question) => {
    const clean = text.trim();
    if (!clean) return;
    const answer = answerCoachQuestion(clean, analysis);
    setMessages((items) => [...items, { role: "user", text: clean }, { role: "assistant", text: answer }]);
    setQuestion("");
  };

  if (loading) return <ScreenContainer><ActivityIndicator color={theme.colors.primary} style={{ flex: 1 }} /></ScreenContainer>;

  const scoreColor = analysis.healthScore >= 75 ? theme.colors.success : analysis.healthScore >= 50 ? theme.colors.warning : theme.colors.error;

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 18, paddingHorizontal: 20, paddingBottom: insets.bottom + 120 }} showsVerticalScrollIndicator={false}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
          <View>
            <Text style={{ color: theme.colors.textSecondary, fontSize: 13 }}>Votre copilote financier</Text>
            <Text style={{ color: theme.colors.text, fontSize: 28, fontWeight: "800", marginTop: 3 }}>Coach owo!</Text>
          </View>
          <View style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: `${theme.colors.primary}18`, alignItems: "center", justifyContent: "center" }}>
            <Brain color={theme.colors.primary} size={25} />
          </View>
        </View>

        <View style={{ padding: 20, borderRadius: 22, borderWidth: 2, borderColor: scoreColor, backgroundColor: `${scoreColor}0D`, marginBottom: 16 }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View style={{ width: 82, height: 82, borderRadius: 41, borderWidth: 8, borderColor: scoreColor, alignItems: "center", justifyContent: "center", backgroundColor: theme.colors.cardBackground }}>
              <Text style={{ color: theme.colors.text, fontSize: 24, fontWeight: "800" }}>{analysis.healthScore}</Text>
              <Text style={{ color: theme.colors.textSecondary, fontSize: 10 }}>/ 100</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 18 }}>
              <Text style={{ color: scoreColor, fontSize: 18, fontWeight: "700" }}>{analysis.status}</Text>
              <Text style={{ color: theme.colors.textSecondary, fontSize: 13, lineHeight: 19, marginTop: 5 }}>Score calculé à partir du budget, de l'épargne, des dettes et de la réserve de sécurité.</Text>
            </View>
          </View>
        </View>

        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 24 }}>
          <Metric theme={theme} icon={WalletCards} label="Reste budgétaire" value={formatXaf(analysis.remainingBudgetMinor)} color={theme.colors.primary} />
          <Metric theme={theme} icon={Target} label="Dépense sûre / jour" value={formatXaf(analysis.safeDailySpendMinor)} color={theme.colors.accent} />
          <Metric theme={theme} icon={PiggyBank} label="Capacité d'épargne" value={formatXaf(analysis.savingsCapacityMinor)} color={theme.colors.success} />
          <Metric theme={theme} icon={ShieldCheck} label="Fonds d'urgence" value={`${analysis.emergencyFundProgressPercent}%`} color="#8B5CF6" />
        </View>

        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <Text style={{ color: theme.colors.text, fontSize: 19, fontWeight: "700" }}>Budget du mois</Text>
          <TouchableOpacity onPress={() => { setDraft(profile); setEditing((value) => !value); }}>
            <Text style={{ color: theme.colors.primary, fontWeight: "700" }}>{editing ? "Annuler" : "Modifier"}</Text>
          </TouchableOpacity>
        </View>

        {editing && (
          <View style={{ padding: 18, borderRadius: 18, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.cardBackground, marginBottom: 14 }}>
            {[
              ["Revenus mensuels", "monthlyIncomeMinor"],
              ["Épargne disponible", "currentSavingsMinor"],
              ["Mensualités de dettes", "debtPaymentsMinor"],
            ].map(([label, key]) => (
              <View key={key} style={{ marginBottom: 13 }}>
                <Text style={{ color: theme.colors.textSecondary, fontSize: 12, marginBottom: 6 }}>{label}</Text>
                <TextInput
                  value={String(draft[key])}
                  onChangeText={(value) => setDraft((current) => ({ ...current, [key]: parseAmount(value) }))}
                  keyboardType="numeric"
                  style={{ borderWidth: 1, borderColor: theme.colors.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11, color: theme.colors.text, backgroundColor: theme.colors.elevated }}
                />
              </View>
            ))}
            <TouchableOpacity onPress={saveProfile} style={{ backgroundColor: theme.colors.primary, borderRadius: 13, paddingVertical: 13, alignItems: "center" }}>
              <Text style={{ color: "#FFFFFF", fontWeight: "700" }}>Enregistrer le profil</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ borderRadius: 20, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.cardBackground, padding: 18, marginBottom: 24 }}>
          {analysis.categories.map((category, index) => (
            <View key={category.code} style={{ marginBottom: index === analysis.categories.length - 1 ? 0 : 18 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
                <Text style={{ color: theme.colors.text, fontWeight: "600" }}>{category.name}</Text>
                <Text style={{ color: category.usagePercent > 100 ? theme.colors.error : theme.colors.textSecondary, fontSize: 12 }}>{formatXaf(category.spentMinor)} / {formatXaf(category.limitMinor)}</Text>
              </View>
              <View style={{ height: 8, borderRadius: 4, overflow: "hidden", backgroundColor: theme.colors.borderLight }}>
                <View style={{ width: `${Math.min(100, category.usagePercent)}%`, height: "100%", borderRadius: 4, backgroundColor: category.usagePercent > 100 ? theme.colors.error : category.color }} />
              </View>
            </View>
          ))}
        </View>

        <Text style={{ color: theme.colors.text, fontSize: 19, fontWeight: "700", marginBottom: 12 }}>Conseils prioritaires</Text>
        {analysis.recommendations.map((item) => (
          <View key={item.code} style={{ flexDirection: "row", padding: 17, borderRadius: 18, borderWidth: 1, borderColor: item.priority === "high" ? theme.colors.error : theme.colors.border, backgroundColor: theme.colors.cardBackground, marginBottom: 10 }}>
            <View style={{ width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center", backgroundColor: item.priority === "high" ? `${theme.colors.error}16` : `${theme.colors.primary}16` }}>
              {item.priority === "high" ? <AlertTriangle color={theme.colors.error} size={19} /> : <Sparkles color={theme.colors.primary} size={19} />}
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={{ color: theme.colors.text, fontWeight: "700" }}>{item.title}</Text>
              <Text style={{ color: theme.colors.textSecondary, fontSize: 13, lineHeight: 19, marginTop: 4 }}>{item.message}</Text>
            </View>
          </View>
        ))}

        <TouchableOpacity onPress={() => router.push("/(tabs)/invest")} style={{ flexDirection: "row", alignItems: "center", padding: 18, marginTop: 14, marginBottom: 26, borderRadius: 18, borderWidth: 2, borderColor: theme.colors.accent, backgroundColor: `${theme.colors.accent}0D` }}>
          <View style={{ width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", backgroundColor: `${theme.colors.accent}18` }}>
            <TrendingUp color={theme.colors.accent} size={22} />
          </View>
          <View style={{ flex: 1, marginLeft: 13 }}>
            <Text style={{ color: theme.colors.text, fontWeight: "700", fontSize: 16 }}>Découvrir l'investissement</Text>
            <Text style={{ color: theme.colors.textSecondary, fontSize: 12, marginTop: 3 }}>Simulateur éducatif BVMAC et produits réglementés</Text>
          </View>
          <ChevronRight color={theme.colors.textSecondary} size={20} />
        </TouchableOpacity>

        <Text style={{ color: theme.colors.text, fontSize: 19, fontWeight: "700", marginBottom: 12 }}>Parler au Coach</Text>
        <View style={{ borderWidth: 1, borderColor: theme.colors.border, borderRadius: 20, backgroundColor: theme.colors.cardBackground, padding: 16 }}>
          {messages.slice(-6).map((message, index) => (
            <View key={`${message.role}-${index}`} style={{ alignSelf: message.role === "user" ? "flex-end" : "flex-start", maxWidth: "88%", borderRadius: 15, paddingHorizontal: 13, paddingVertical: 10, marginBottom: 9, backgroundColor: message.role === "user" ? theme.colors.primary : theme.colors.elevated }}>
              <Text style={{ color: message.role === "user" ? "#FFFFFF" : theme.colors.text, fontSize: 13, lineHeight: 19 }}>{message.text}</Text>
            </View>
          ))}
          <View style={{ flexDirection: "row", gap: 8, marginTop: 5 }}>
            <TextInput value={question} onChangeText={setQuestion} onSubmitEditing={() => ask()} placeholder="Posez votre question..." placeholderTextColor={theme.colors.textTertiary} style={{ flex: 1, color: theme.colors.text, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 14, paddingHorizontal: 13, paddingVertical: 10 }} />
            <TouchableOpacity onPress={() => ask()} style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: theme.colors.primary, alignItems: "center", justifyContent: "center" }}>
              <Send color="#FFFFFF" size={18} />
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, marginTop: 12 }}>
            {["Combien puis-je dépenser ?", "Puis-je investir ?", "Comment mieux épargner ?"].map((item) => (
              <TouchableOpacity key={item} onPress={() => ask(item)} style={{ borderWidth: 1, borderColor: theme.colors.border, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 8 }}>
                <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>{item}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        <Text style={{ color: theme.colors.textTertiary, textAlign: "center", fontSize: 11, lineHeight: 16, marginTop: 16 }}>Coach owo! fournit des informations éducatives. Les actions financières nécessitent toujours votre confirmation.</Text>
      </ScrollView>
    </ScreenContainer>
  );
}
