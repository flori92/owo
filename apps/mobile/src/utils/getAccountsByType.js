import { Building, Smartphone, CreditCard } from "lucide-react-native";

export function getAccountsByType(currency, accounts) {
  const allAccounts = [];

  if (currency === "EUR") {
    accounts.european_banks.forEach((acc) =>
      allAccounts.push({
        ...acc,
        type: "european_bank",
        icon: Building,
        displayName: `${acc.bank_name} (${acc.account_number})`,
        subtitle: `${acc.balance.toLocaleString()} EUR`,
      }),
    );
    accounts.virtual_cards.forEach((acc) =>
      allAccounts.push({
        ...acc,
        type: "virtual_card",
        icon: CreditCard,
        displayName: `Carte owo! (${acc.card_number})`,
        subtitle: `${acc.balance.toLocaleString()} EUR`,
      }),
    );
  } else if (currency === "FCFA") {
    accounts.mobile_money.forEach((acc) =>
      allAccounts.push({
        ...acc,
        type: "mobile_money",
        icon: Smartphone,
        displayName: `${acc.provider}`,
        subtitle: `${acc.balance.toLocaleString()} FCFA`,
      }),
    );
  }

  return allAccounts;
}
