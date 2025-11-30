import React from "react";
import { View, Text } from "react-native";
import { Euro, DollarSign } from "lucide-react-native";
import { useTheme } from "@/utils/useTheme";
import { CurrencyInput } from "./CurrencyInput";
import { AccountSelector } from "./AccountSelector";
import { SwapButton } from "./SwapButton";
import { ExchangeDetails } from "./ExchangeDetails";
import { getAccountsByType } from "@/utils/getAccountsByType";

export function CurrencyExchangeForm({
  fromCurrency,
  toCurrency,
  fromAmount,
  toAmount,
  exchangeRate,
  fees,
  fromAccount,
  toAccount,
  accounts,
  onChangeFromAmount,
  onSelectFromAccount,
  onSelectToAccount,
  onSwapCurrencies,
}) {
  const theme = useTheme();

  return (
    <View
      style={{
        backgroundColor: theme.colors.elevated,
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
      }}
    >
      <Text
        style={{
          fontFamily: "Inter_600SemiBold",
          fontSize: 18,
          color: theme.colors.text,
          marginBottom: 20,
        }}
      >
        Convertir vos devises
      </Text>

      <CurrencyInput
        label="De"
        currency={fromCurrency}
        amount={fromAmount}
        onChangeAmount={onChangeFromAmount}
        icon={Euro}
      />

      <AccountSelector
        label="Compte source"
        accounts={getAccountsByType(fromCurrency, accounts)}
        selectedAccount={fromAccount}
        onSelectAccount={onSelectFromAccount}
        accentColor="primary"
      />

      <SwapButton onPress={onSwapCurrencies} />

      <CurrencyInput
        label="Vers"
        currency={toCurrency}
        amount={toAmount}
        isOutput={true}
        icon={DollarSign}
      />

      <AccountSelector
        label="Compte destination"
        accounts={getAccountsByType(toCurrency, accounts)}
        selectedAccount={toAccount}
        onSelectAccount={onSelectToAccount}
        accentColor="success"
      />

      <ExchangeDetails
        fromAmount={fromAmount}
        toAmount={toAmount}
        fromCurrency={fromCurrency}
        toCurrency={toCurrency}
        exchangeRate={exchangeRate}
        fees={fees}
      />
    </View>
  );
}
