import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from "@expo-google-fonts/inter";
import {
  Calendar,
  ChevronDown,
  TrendingUp,
  TrendingDown,
  PieChart as PieChartIcon,
  BarChart3,
  Target,
  Lightbulb,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
} from "lucide-react-native";
import { useTheme } from "@/utils/useTheme";
import ScreenContainer from "@/components/ScreenContainer";
import LoadingScreen from "@/components/LoadingScreen";
import EmptyState from "@/components/EmptyState";

const { width: screenWidth } = Dimensions.get("window");

export default function StatisticsScreen() {
  const insets = useSafeAreaInsets();
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [statisticsData, setStatisticsData] = useState(null);
  const [aiInsights, setAiInsights] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
  const theme = useTheme();

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  const periodOptions = [
    { key: "week", label: "Cette semaine" },
    { key: "month", label: "Ce mois" },
    { key: "quarter", label: "Ce trimestre" },
    { key: "year", label: "Cette année" },
  ];

  // Mode démo : données mock pour les statistiques
  const getMockStatistics = (period) => {
    const multiplier = period === "week" ? 0.25 : period === "month" ? 1 : period === "quarter" ? 3 : 12;
    return {
      totalIncome: Math.round(450000 * multiplier),
      totalExpenses: Math.round(320000 * multiplier),
      savingsRate: 28.9,
      transactionCount: Math.round(45 * multiplier),
      topCategories: [
        { name: "Alimentation", amount: Math.round(85000 * multiplier), percentage: 26.5, color: "#FF6B6B" },
        { name: "Transport", amount: Math.round(65000 * multiplier), percentage: 20.3, color: "#4ECDC4" },
        { name: "Logement", amount: Math.round(95000 * multiplier), percentage: 29.7, color: "#45B7D1" },
        { name: "Loisirs", amount: Math.round(45000 * multiplier), percentage: 14.1, color: "#96CEB4" },
        { name: "Autres", amount: Math.round(30000 * multiplier), percentage: 9.4, color: "#DDA0DD" },
      ],
      monthlyTrend: [
        { month: "Jan", income: 420000, expenses: 310000 },
        { month: "Fév", income: 380000, expenses: 290000 },
        { month: "Mar", income: 450000, expenses: 320000 },
        { month: "Avr", income: 410000, expenses: 350000 },
        { month: "Mai", income: 480000, expenses: 300000 },
        { month: "Juin", income: 450000, expenses: 320000 },
      ],
      comparison: {
        incomeChange: 12.5,
        expenseChange: -5.2,
        savingsChange: 8.3,
      },
    };
  };

  // Mode démo : insights IA simulés
  const getMockInsights = () => [
    {
      id: 1,
      type: "savings",
      title: "Excellent taux d'épargne !",
      description: "Vous épargnez 28.9% de vos revenus ce mois-ci, c'est au-dessus de la moyenne recommandée de 20%.",
      icon: "trending-up",
      color: "#4ECDC4",
    },
    {
      id: 2,
      type: "expense",
      title: "Dépenses alimentaires stables",
      description: "Vos dépenses en alimentation sont restées constantes. Continuez ainsi !",
      icon: "check",
      color: "#45B7D1",
    },
    {
      id: 3,
      type: "tip",
      title: "Conseil personnalisé",
      description: "En réduisant vos dépenses de transport de 10%, vous pourriez économiser 6 500 FCFA/mois.",
      icon: "lightbulb",
      color: "#FFD93D",
    },
  ];

  // Fetch statistics data (mode démo)
  const fetchStatistics = async (period = selectedPeriod) => {
    // Simuler un délai réseau
    await new Promise(resolve => setTimeout(resolve, 500));
    setStatisticsData(getMockStatistics(period));
  };

  // Generate AI insights (mode démo)
  const generateAiInsights = async () => {
    setIsGeneratingInsights(true);
    // Simuler un délai de génération IA
    await new Promise(resolve => setTimeout(resolve, 800));
    setAiInsights(getMockInsights());
    setIsGeneratingInsights(false);
  };

  // Initial load
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchStatistics(), generateAiInsights()]);
      setIsLoading(false);
    };

    loadData();
  }, [selectedPeriod]);

  // Refresh handler
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([fetchStatistics(), generateAiInsights()]);
    setIsRefreshing(false);
  };

  // Period change handler
  const handlePeriodChange = (newPeriod) => {
    setSelectedPeriod(newPeriod);
    // Data will be fetched via useEffect
  };

  if (!fontsLoaded || isLoading) {
    return <LoadingScreen message="Chargement des statistiques..." />;
  }

  if (!statisticsData || !statisticsData.summary) {
    return (
      <ScreenContainer>
        <View
          style={{
            paddingTop: insets.top + 16,
            paddingHorizontal: 24,
            paddingBottom: 16,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border,
          }}
        >
          <Text
            style={{
              fontFamily: "Inter_600SemiBold",
              fontSize: 24,
              color: theme.colors.text,
            }}
          >
            Statistiques
          </Text>
        </View>
        <EmptyState
          icon={BarChart3}
          title="Pas encore de données"
          description="Commencez à ajouter des transactions pour voir vos statistiques financières"
          containerStyle={{ flex: 1, justifyContent: "center" }}
        />
      </ScreenContainer>
    );
  }

  const savingsPercentage = statisticsData.savingsGoal
    ? (statisticsData.savingsGoal.currentAmount /
        statisticsData.savingsGoal.targetAmount) *
      100
    : 0;
  const chartSize = screenWidth * 0.6;
  const selectedPeriodLabel =
    periodOptions.find((p) => p.key === selectedPeriod)?.label || "Ce mois";

  return (
    <ScreenContainer>
      {/* Header */}
      <View
        style={{
          paddingTop: insets.top + 16,
          paddingHorizontal: 24,
          paddingBottom: 16,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border,
        }}
      >
        <Text
          style={{
            fontFamily: "Inter_600SemiBold",
            fontSize: 24,
            color: theme.colors.text,
            marginBottom: 16,
          }}
        >
          Statistiques
        </Text>

        {/* Period Selector */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <TouchableOpacity
            style={{
              backgroundColor: theme.colors.elevated,
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 12,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              flex: 1,
              marginRight: 12,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Calendar
                size={18}
                color={theme.colors.textSecondary}
                strokeWidth={1.5}
              />
              <Text
                style={{
                  fontFamily: "Inter_500Medium",
                  fontSize: 14,
                  color: theme.colors.text,
                  marginLeft: 8,
                }}
              >
                {selectedPeriodLabel}
              </Text>
            </View>
            <ChevronDown
              size={18}
              color={theme.colors.textSecondary}
              strokeWidth={1.5}
            />
          </TouchableOpacity>

          {/* Generate AI Insights Button */}
          <TouchableOpacity
            style={{
              backgroundColor: theme.colors.primary,
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 12,
              flexDirection: "row",
              alignItems: "center",
            }}
            onPress={generateAiInsights}
            disabled={isGeneratingInsights}
          >
            <RefreshCw
              size={16}
              color="#FFFFFF"
              strokeWidth={1.5}
              style={{
                transform: isGeneratingInsights ? [{ rotate: "360deg" }] : [],
              }}
            />
            <Text
              style={{
                fontFamily: "Inter_600SemiBold",
                fontSize: 13,
                color: "#FFFFFF",
                marginLeft: 6,
              }}
            >
              {isGeneratingInsights ? "Analyse..." : "IA"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingVertical: 20,
          paddingBottom: insets.bottom + 20,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      >
        {/* Financial Summary Cards */}
        <View style={{ marginBottom: 32 }}>
          <View
            style={{
              flexDirection: "row",
              gap: 12,
              marginBottom: 12,
            }}
          >
            {/* Income Card */}
            <View
              style={{
                flex: 1,
                backgroundColor: theme.colors.elevated,
                borderRadius: 12,
                padding: 16,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <ArrowDownLeft
                  size={16}
                  color={theme.colors.success}
                  strokeWidth={1.5}
                />
                <Text
                  style={{
                    fontFamily: "Inter_500Medium",
                    fontSize: 13,
                    color: theme.colors.textSecondary,
                    marginLeft: 6,
                  }}
                >
                  Revenus
                </Text>
              </View>
              <Text
                style={{
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 18,
                  color: theme.colors.success,
                }}
              >
                {statisticsData.summary.totalIncome.toLocaleString()} FCFA
              </Text>
            </View>

            {/* Expenses Card */}
            <View
              style={{
                flex: 1,
                backgroundColor: theme.colors.elevated,
                borderRadius: 12,
                padding: 16,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <ArrowUpRight
                  size={16}
                  color={theme.colors.error}
                  strokeWidth={1.5}
                />
                <Text
                  style={{
                    fontFamily: "Inter_500Medium",
                    fontSize: 13,
                    color: theme.colors.textSecondary,
                    marginLeft: 6,
                  }}
                >
                  Dépenses
                </Text>
              </View>
              <Text
                style={{
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 18,
                  color: theme.colors.error,
                }}
              >
                {statisticsData.summary.totalExpenses.toLocaleString()} FCFA
              </Text>
            </View>
          </View>

          {/* Net Savings Card */}
          <View
            style={{
              backgroundColor: theme.colors.elevated,
              borderRadius: 12,
              padding: 20,
            }}
          >
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
                  fontFamily: "Inter_500Medium",
                  fontSize: 16,
                  color: theme.colors.text,
                }}
              >
                Économies nettes
              </Text>
              <Text
                style={{
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 20,
                  color:
                    statisticsData.summary.netSavings >= 0
                      ? theme.colors.success
                      : theme.colors.error,
                }}
              >
                {statisticsData.summary.netSavings.toLocaleString()} FCFA
              </Text>
            </View>

            {/* Savings Progress */}
            {statisticsData.savingsGoal && (
              <>
                <View style={{ marginBottom: 12 }}>
                  <View
                    style={{
                      height: 8,
                      backgroundColor: `${theme.colors.primary}20`,
                      borderRadius: 4,
                      overflow: "hidden",
                    }}
                  >
                    <View
                      style={{
                        height: "100%",
                        width: `${Math.min(savingsPercentage, 100)}%`,
                        backgroundColor: theme.colors.primary,
                        borderRadius: 4,
                      }}
                    />
                  </View>
                </View>

                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "Inter_400Regular",
                      fontSize: 13,
                      color: theme.colors.textSecondary,
                    }}
                  >
                    Objectif:{" "}
                    {statisticsData.savingsGoal.targetAmount.toLocaleString()}{" "}
                    FCFA
                  </Text>
                  <Text
                    style={{
                      fontFamily: "Inter_600SemiBold",
                      fontSize: 13,
                      color: theme.colors.primary,
                    }}
                  >
                    {Math.round(savingsPercentage)}%
                  </Text>
                </View>
              </>
            )}
          </View>
        </View>

        {/* Expenses by Category */}
        {statisticsData.categories && statisticsData.categories.length > 0 && (
          <View style={{ marginBottom: 32 }}>
            <Text
              style={{
                fontFamily: "Inter_600SemiBold",
                fontSize: 18,
                color: theme.colors.text,
                marginBottom: 20,
              }}
            >
              Dépenses par catégorie
            </Text>

            {/* Simple Donut Chart Representation */}
            <View
              style={{
                alignItems: "center",
                marginBottom: 24,
              }}
            >
              <View
                style={{
                  width: chartSize,
                  height: chartSize,
                  borderRadius: chartSize / 2,
                  position: "relative",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {/* Simplified chart representation using top categories */}
                {statisticsData.categories
                  .slice(0, 3)
                  .map((category, index) => (
                    <View
                      key={category.id}
                      style={{
                        position: "absolute",
                        width: chartSize - index * 15,
                        height: chartSize - index * 15,
                        borderRadius: (chartSize - index * 15) / 2,
                        borderWidth: 12,
                        borderColor: category.color,
                        borderTopColor:
                          index > 0 ? "transparent" : category.color,
                        borderRightColor:
                          index > 1 ? "transparent" : category.color,
                        borderBottomColor:
                          index > 2 ? "transparent" : category.color,
                        transform: [{ rotate: `${index * 90}deg` }],
                      }}
                    />
                  ))}

                {/* Center amount label */}
                <View
                  style={{
                    position: "absolute",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      fontFamily: "Inter_600SemiBold",
                      fontSize: 20,
                      color: theme.colors.text,
                      textAlign: "center",
                    }}
                  >
                    {statisticsData.summary.totalExpenses.toLocaleString()}
                  </Text>
                  <Text
                    style={{
                      fontFamily: "Inter_400Regular",
                      fontSize: 14,
                      color: theme.colors.textSecondary,
                      textAlign: "center",
                    }}
                  >
                    FCFA
                  </Text>
                </View>
              </View>
            </View>

            {/* Category List */}
            <View
              style={{
                backgroundColor: theme.colors.elevated,
                borderRadius: 12,
                padding: 16,
              }}
            >
              {statisticsData.categories.map((category, index) => (
                <View key={`${category.name}-${index}`}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      paddingVertical: 12,
                    }}
                  >
                    <View
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: 6,
                        backgroundColor: category.color,
                        marginRight: 12,
                      }}
                    />

                    <View style={{ flex: 1 }}>
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: 4,
                        }}
                      >
                        <Text
                          style={{
                            fontFamily: "Inter_500Medium",
                            fontSize: 15,
                            color: theme.colors.text,
                          }}
                        >
                          {category.name}
                        </Text>
                        <Text
                          style={{
                            fontFamily: "Inter_600SemiBold",
                            fontSize: 15,
                            color: theme.colors.text,
                          }}
                        >
                          {category.amount.toLocaleString()} FCFA
                        </Text>
                      </View>

                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Text
                          style={{
                            fontFamily: "Inter_400Regular",
                            fontSize: 13,
                            color: theme.colors.textSecondary,
                          }}
                        >
                          {category.transactions} transactions •{" "}
                          {category.percentage}%
                        </Text>
                        <Text
                          style={{
                            fontFamily: "Inter_500Medium",
                            fontSize: 12,
                            color: category.trend.includes("+")
                              ? theme.colors.success
                              : category.trend.includes("-")
                                ? theme.colors.error
                                : theme.colors.textSecondary,
                          }}
                        >
                          {category.trend}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {index < statisticsData.categories.length - 1 && (
                    <View
                      style={{
                        height: 1,
                        backgroundColor: theme.colors.divider,
                        marginVertical: 4,
                      }}
                    />
                  )}
                </View>
              ))}
            </View>
          </View>
        )}

        {/* AI Insights */}
        {aiInsights.length > 0 && (
          <View style={{ marginBottom: 32 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <Lightbulb
                size={20}
                color={theme.colors.primary}
                strokeWidth={1.5}
              />
              <Text
                style={{
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 18,
                  color: theme.colors.text,
                  marginLeft: 8,
                }}
              >
                Insights IA
              </Text>
              {isGeneratingInsights && (
                <Text
                  style={{
                    fontFamily: "Inter_400Regular",
                    fontSize: 12,
                    color: theme.colors.primary,
                    marginLeft: 8,
                  }}
                >
                  (génération en cours...)
                </Text>
              )}
            </View>

            <View style={{ gap: 12 }}>
              {aiInsights.map((insight, index) => (
                <View
                  key={index}
                  style={{
                    backgroundColor: theme.colors.elevated,
                    borderRadius: 12,
                    padding: 16,
                    borderLeftWidth: 4,
                    borderLeftColor:
                      insight.priority === "high"
                        ? theme.colors.error
                        : insight.priority === "medium"
                          ? theme.colors.warning
                          : theme.colors.success,
                  }}
                >
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
                        fontSize: 15,
                        color: theme.colors.text,
                        flex: 1,
                      }}
                    >
                      {insight.title}
                    </Text>
                    {insight.estimatedImpact && (
                      <Text
                        style={{
                          fontFamily: "Inter_600SemiBold",
                          fontSize: 12,
                          color: theme.colors.primary,
                        }}
                      >
                        {insight.estimatedImpact > 0 ? "+" : ""}
                        {insight.estimatedImpact.toLocaleString()} FCFA
                      </Text>
                    )}
                  </View>

                  <Text
                    style={{
                      fontFamily: "Inter_400Regular",
                      fontSize: 14,
                      color: theme.colors.textSecondary,
                      lineHeight: 20,
                    }}
                  >
                    {insight.description}
                  </Text>

                  {insight.category && (
                    <Text
                      style={{
                        fontFamily: "Inter_500Medium",
                        fontSize: 12,
                        color: theme.colors.primary,
                        marginTop: 8,
                      }}
                    >
                      Catégorie: {insight.category}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Weekly Trend */}
        {statisticsData.weeklyTrend &&
          statisticsData.weeklyTrend.length > 0 && (
            <View>
              <Text
                style={{
                  fontFamily: "Inter_600SemiBold",
                  fontSize: 18,
                  color: theme.colors.text,
                  marginBottom: 16,
                }}
              >
                Tendance hebdomadaire
              </Text>

              <View
                style={{
                  backgroundColor: theme.colors.elevated,
                  borderRadius: 12,
                  padding: 20,
                }}
              >
                {statisticsData.weeklyTrend.map((week, index) => (
                  <View key={`week-${index}`} style={{ marginBottom: 16 }}>
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
                          fontFamily: "Inter_500Medium",
                          fontSize: 14,
                          color: theme.colors.text,
                        }}
                      >
                        {week.week}
                      </Text>
                      <View style={{ flexDirection: "row", gap: 12 }}>
                        <Text
                          style={{
                            fontFamily: "Inter_400Regular",
                            fontSize: 13,
                            color: theme.colors.success,
                          }}
                        >
                          +{week.income.toLocaleString()}
                        </Text>
                        <Text
                          style={{
                            fontFamily: "Inter_400Regular",
                            fontSize: 13,
                            color: theme.colors.error,
                          }}
                        >
                          -{week.expenses.toLocaleString()}
                        </Text>
                      </View>
                    </View>

                    {/* Simple bar representation */}
                    <View
                      style={{
                        flexDirection: "row",
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: `${theme.colors.error}20`,
                        overflow: "hidden",
                      }}
                    >
                      <View
                        style={{
                          width: `${Math.min((week.income / Math.max(...statisticsData.weeklyTrend.map((w) => w.income))) * 100, 100)}%`,
                          backgroundColor: theme.colors.success,
                        }}
                      />
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}
      </ScrollView>
    </ScreenContainer>
  );
}
