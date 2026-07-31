export const currencies = [
  { code: "EUR", name: "Euro", symbol: "€", flag: "🇪🇺" },
  { code: "FCFA", name: "Franc CFA", symbol: "CFA", flag: "🇧🇯" },
  { code: "USD", name: "Dollar US", symbol: "$", flag: "🇺🇸" },
];

export function getMockAccounts(market) {
  return {
  european_banks: [
    {
      id: 1,
      bank_name: "BNP Paribas",
      account_number: "****1234",
      currency: "EUR",
      balance: 2500.0,
      country: "France",
    },
    {
      id: 2,
      bank_name: "Deutsche Bank",
      account_number: "****5678",
      currency: "EUR",
      balance: 1800.0,
      country: "Allemagne",
    },
  ],
  mobile_money: market.operators.map((operator, index) => ({
    id: index + 1,
    provider: operator.name,
    phone_number: `${market.callingCode} •• •• •• ${index === 0 ? "45" : "67"}`,
    currency: market.currency,
    balance: index === 0 ? 125000 : 89000,
  })),
  virtual_cards: [
    {
      id: 1,
      card_number: "****1234",
      currency: "EUR",
      balance: 500.0,
      provider: "owo! Visa",
    },
  ],
  };
}
