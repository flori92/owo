// Taux de change EUR/FCFA
export const EXCHANGE_RATE = 655.96;

export const getMockTransactions = (theme) => [
  {
    id: 1,
    title: "Achat Amazon",
    category: "Shopping",
    amount: -89.99,
    date: "23 Nov",
    type: "expense",
    categoryColor: theme.colors.categoryShopping,
    currency: "EUR",
    isVirtualCard: true,
  },
  {
    id: 2,
    title: "Transfert EUR→FCFA",
    category: "Change",
    amount: -200,
    date: "22 Nov",
    type: "expense",
    categoryColor: theme.colors.primary,
    currency: "EUR",
  },
  {
    id: 3,
    title: "Virement reçu",
    category: "Revenus",
    amount: 50000,
    date: "21 Nov",
    type: "income",
    categoryColor: theme.colors.success,
    currency: "FCFA",
  },
  {
    id: 4,
    title: "Transport taxi",
    category: "Transport",
    amount: -1500,
    date: "20 Nov",
    type: "expense",
    categoryColor: theme.colors.categoryTransport,
    currency: "FCFA",
  },
];

export const getQuickStats = (theme) => [
  {
    title: "Économies ce mois",
    value: "15 250 FCFA",
    icon: "PiggyBank",
    color: theme.colors.accent,
    change: "+12%",
    sparkle: true,
  },
  {
    title: "Change EUR↔FCFA",
    value: "655.96",
    icon: "Repeat",
    color: theme.colors.primary,
    change: "Taux actuel",
    sparkle: false,
  },
  {
    title: "Carte virtuelle owo!",
    value: "Active",
    icon: "CreditCard",
    color: theme.colors.success,
    change: "Visa Européenne",
    sparkle: true,
  },
];
