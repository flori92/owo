export const currencies = [
  { code: "EUR", name: "Euro", symbol: "€", flag: "🇪🇺" },
  { code: "FCFA", name: "Franc CFA", symbol: "CFA", flag: "🇧🇯" },
  { code: "USD", name: "Dollar US", symbol: "$", flag: "🇺🇸" },
];

export const mockAccounts = {
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
  mobile_money: [
    {
      id: 1,
      provider: "MTN Mobile Money",
      phone_number: "+229 XX XX XX 45",
      currency: "FCFA",
      balance: 125000,
    },
    {
      id: 2,
      provider: "Moov Money",
      phone_number: "+229 XX XX XX 67",
      currency: "FCFA",
      balance: 89000,
    },
  ],
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
