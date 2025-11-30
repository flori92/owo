import React, { useState } from "react";
import { View, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import { useTheme } from "@/utils/useTheme";
import ScreenContainer from "@/components/ScreenContainer";
import HeaderBar from "@/components/HeaderBar";
import ActionButton from "@/components/ActionButton";
import LoadingScreen from "@/components/LoadingScreen";
import KeyboardAvoidingAnimatedView from "@/components/KeyboardAvoidingAnimatedView";
import { ExchangeRatesOverview } from "@/components/CurrencyExchange/ExchangeRatesOverview";
import { CurrencyExchangeForm } from "@/components/CurrencyExchange/CurrencyExchangeForm";
import { InfoBox } from "@/components/CurrencyExchange/InfoBox";
import { useCurrencyExchange } from "@/hooks/useCurrencyExchange";
import { mockAccounts } from "@/utils/currencyData";

export default function CurrencyExchangeScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const [accounts] = useState(mockAccounts);

  const {
    fromCurrency,
    toCurrency,
    fromAmount,
    toAmount,
    exchangeRate,
    fees,
    isLoading,
    lastUpdated,
    fromAccount,
    toAccount,
    setFromAmount,
    setFromAccount,
    setToAccount,
    handleSwapCurrencies,
    handleExchange,
  } = useCurrencyExchange();

  if (!fontsLoaded) {
    return <LoadingScreen />;
  }

  return (
    <ScreenContainer>
      <HeaderBar title="owo! • Change de devises" />

      <KeyboardAvoidingAnimatedView style={{ flex: 1 }} behavior="padding">
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingVertical: 20,
            paddingBottom: insets.bottom + 100,
          }}
          showsVerticalScrollIndicator={false}
        >
          <ExchangeRatesOverview lastUpdated={lastUpdated} />

          <CurrencyExchangeForm
            fromCurrency={fromCurrency}
            toCurrency={toCurrency}
            fromAmount={fromAmount}
            toAmount={toAmount}
            exchangeRate={exchangeRate}
            fees={fees}
            fromAccount={fromAccount}
            toAccount={toAccount}
            accounts={accounts}
            onChangeFromAmount={setFromAmount}
            onSelectFromAccount={setFromAccount}
            onSelectToAccount={setToAccount}
            onSwapCurrencies={handleSwapCurrencies}
          />

          <InfoBox />
        </ScrollView>

        <View
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            padding: 24,
            paddingBottom: insets.bottom + 24,
            backgroundColor: theme.colors.background,
            borderTopWidth: 1,
            borderTopColor: theme.colors.border,
          }}
        >
          <ActionButton
            title={isLoading ? "Échange en cours..." : "Confirmer l'échange"}
            onPress={handleExchange}
            disabled={isLoading || !fromAmount || !fromAccount || !toAccount}
          />
        </View>
      </KeyboardAvoidingAnimatedView>
    </ScreenContainer>
  );
}
