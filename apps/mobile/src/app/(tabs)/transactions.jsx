import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from "@expo-google-fonts/inter";
import {
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  Receipt,
} from "lucide-react-native";
import { router } from "expo-router";
import { useTheme } from "@/utils/useTheme";
import ScreenContainer from "@/components/ScreenContainer";
import LoadingScreen from "@/components/LoadingScreen";
import EmptyState from "@/components/EmptyState";

export default function TransactionsScreen() {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("Tous");
  const theme = useTheme();

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  const filterOptions = [
    "Tous",
    "Revenus",
    "Dépenses",
    "Cette semaine",
    "Ce mois",
  ];

  // Mock data - will be replaced with API calls
  const allTransactions = [
    {
      id: 1,
      title: "Achat supermarché Erevan",
      category: "Alimentation",
      amount: -12500,
      date: "23 Nov 2024",
      time: "14:30",
      type: "expense",
      categoryColor: theme.colors.categoryFood,
      provider: "MTN Mobile Money",
      description: "Achat de provisions alimentaires",
      reference: "MM123456789",
    },
    {
      id: 2,
      title: "Recharge téléphonique",
      category: "Communications",
      amount: -2000,
      date: "22 Nov 2024",
      time: "10:15",
      type: "expense",
      categoryColor: theme.colors.categoryUtilities,
      provider: "Moov Money",
      description: "Recharge crédit mobile",
      reference: "MV987654321",
    },
    {
      id: 3,
      title: "Salaire mensuel",
      category: "Revenus",
      amount: 250000,
      date: "21 Nov 2024",
      time: "09:00",
      type: "income",
      categoryColor: theme.colors.success,
      provider: "Virement bancaire",
      description: "Salaire du mois de novembre",
      reference: "SAL2024110001",
    },
    {
      id: 4,
      title: "Transport taxi",
      category: "Transport",
      amount: -1500,
      date: "20 Nov 2024",
      time: "17:45",
      type: "expense",
      categoryColor: theme.colors.categoryTransport,
      provider: "MTN Mobile Money",
      description: "Course en taxi",
      reference: "MM234567890",
    },
    {
      id: 5,
      title: "Facture électricité",
      category: "Factures",
      amount: -15000,
      date: "19 Nov 2024",
      time: "16:20",
      type: "expense",
      categoryColor: theme.colors.categoryUtilities,
      provider: "Celtiis Cash",
      description: "Facture SBEE novembre",
      reference: "CC345678901",
    },
    {
      id: 6,
      title: "Freelance projet",
      category: "Revenus",
      amount: 75000,
      date: "18 Nov 2024",
      time: "20:10",
      type: "income",
      categoryColor: theme.colors.success,
      provider: "MTN Mobile Money",
      description: "Paiement projet développement",
      reference: "MM456789012",
    },
    {
      id: 7,
      title: "Achat vêtements",
      category: "Shopping",
      amount: -35000,
      date: "17 Nov 2024",
      time: "13:25",
      type: "expense",
      categoryColor: theme.colors.categoryShopping,
      provider: "Moov Money",
      description: "Achat de vêtements au marché",
      reference: "MV567890123",
    },
    {
      id: 8,
      title: "Restaurant",
      category: "Alimentation",
      amount: -8500,
      date: "16 Nov 2024",
      time: "19:30",
      type: "expense",
      categoryColor: theme.colors.categoryFood,
      provider: "MTN Mobile Money",
      description: "Dîner au restaurant",
      reference: "MM678901234",
    },
  ];

  const filteredTransactions = allTransactions.filter((transaction) => {
    const matchesSearch =
      transaction.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.category.toLowerCase().includes(searchQuery.toLowerCase());

    let matchesFilter = true;
    if (selectedFilter === "Revenus") {
      matchesFilter = transaction.type === "income";
    } else if (selectedFilter === "Dépenses") {
      matchesFilter = transaction.type === "expense";
    }
    // Additional date filters can be added here

    return matchesSearch && matchesFilter;
  });

  if (!fontsLoaded) {
    return <LoadingScreen />;
  }

  const groupTransactionsByDate = (transactions) => {
    const groups = {};
    transactions.forEach((transaction) => {
      const date =
        transaction.date.split(" ")[0] + " " + transaction.date.split(" ")[1]; // "23 Nov"
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(transaction);
    });
    return groups;
  };

  const groupedTransactions = groupTransactionsByDate(filteredTransactions);

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
          Transactions
        </Text>

        {/* Search Bar */}
        <View
          style={{
            flexDirection: "row",
            backgroundColor: theme.colors.elevated,
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 12,
            alignItems: "center",
            marginBottom: 16,
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
            placeholder="Rechercher une transaction..."
            placeholderTextColor={theme.colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8 }}
        >
          {filterOptions.map((option) => (
            <TouchableOpacity
              key={option}
              style={{
                backgroundColor:
                  selectedFilter === option
                    ? theme.colors.primary
                    : theme.colors.elevated,
                borderRadius: 20,
                paddingHorizontal: 16,
                paddingVertical: 8,
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
              }}
              onPress={() => setSelectedFilter(option)}
            >
              <Text
                style={{
                  fontFamily: "Inter_500Medium",
                  fontSize: 14,
                  color:
                    selectedFilter === option ? "#FFFFFF" : theme.colors.text,
                }}
              >
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Transactions List */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingVertical: 16,
          paddingBottom: insets.bottom + 16,
        }}
        showsVerticalScrollIndicator={false}
      >
        {Object.keys(groupedTransactions).length > 0 ? (
          Object.entries(groupedTransactions).map(([date, transactions]) => (
            <View key={date} style={{ marginBottom: 24 }}>
              {/* Date Header */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 12,
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
                  {date}
                </Text>
                <View
                  style={{
                    flex: 1,
                    height: 1,
                    backgroundColor: theme.colors.divider,
                    marginLeft: 12,
                  }}
                />
                <Text
                  style={{
                    fontFamily: "Inter_500Medium",
                    fontSize: 12,
                    color: theme.colors.textSecondary,
                    marginLeft: 8,
                  }}
                >
                  {transactions.length} transaction
                  {transactions.length > 1 ? "s" : ""}
                </Text>
              </View>

              {/* Transactions for this date */}
              <View
                style={{
                  backgroundColor: theme.colors.elevated,
                  borderRadius: 12,
                  padding: 16,
                }}
              >
                {transactions.map((transaction, index) => (
                  <View key={transaction.id}>
                    <TouchableOpacity
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        paddingVertical: 12,
                      }}
                      onPress={() =>
                        router.push(`/transaction-details?id=${transaction.id}`)
                      }
                    >
                      <View
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 22,
                          backgroundColor: `${transaction.categoryColor}20`,
                          justifyContent: "center",
                          alignItems: "center",
                          marginRight: 12,
                        }}
                      >
                        {transaction.type === "income" ? (
                          <ArrowDownLeft
                            size={20}
                            color={transaction.categoryColor}
                            strokeWidth={1.5}
                          />
                        ) : (
                          <ArrowUpRight
                            size={20}
                            color={transaction.categoryColor}
                            strokeWidth={1.5}
                          />
                        )}
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
                          {transaction.title}
                        </Text>
                        <View
                          style={{
                            flexDirection: "row",
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
                            {transaction.category} • {transaction.time}
                          </Text>
                        </View>
                        <Text
                          style={{
                            fontFamily: "Inter_400Regular",
                            fontSize: 12,
                            color: theme.colors.textSecondary,
                            marginTop: 2,
                          }}
                        >
                          {transaction.provider}
                        </Text>
                      </View>

                      <View style={{ alignItems: "flex-end" }}>
                        <Text
                          style={{
                            fontFamily: "Inter_600SemiBold",
                            fontSize: 16,
                            color:
                              transaction.amount > 0
                                ? theme.colors.success
                                : theme.colors.error,
                            marginBottom: 2,
                          }}
                        >
                          {transaction.amount > 0 ? "+" : ""}
                          {transaction.amount.toLocaleString()} FCFA
                        </Text>
                        <Text
                          style={{
                            fontFamily: "Inter_400Regular",
                            fontSize: 11,
                            color: theme.colors.textSecondary,
                          }}
                        >
                          {transaction.reference}
                        </Text>
                      </View>
                    </TouchableOpacity>

                    {index < transactions.length - 1 && (
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
          ))
        ) : (
          <EmptyState
            icon={Receipt}
            title="Aucune transaction trouvée"
            description={
              searchQuery
                ? "Aucune transaction ne correspond à votre recherche"
                : "Vous n'avez pas encore de transactions"
            }
            containerStyle={{ paddingVertical: 60 }}
          />
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={{
          position: "absolute",
          bottom: insets.bottom + 20,
          right: 20,
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: theme.colors.primary,
          justifyContent: "center",
          alignItems: "center",
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: 4,
          },
          shadowOpacity: 0.3,
          shadowRadius: 4.65,
          elevation: 8,
        }}
        onPress={() => router.push("/(tabs)/add-transaction")}
      >
        <Filter size={24} color="#FFFFFF" strokeWidth={1.5} />
      </TouchableOpacity>
    </ScreenContainer>
  );
}
