import { useState, useEffect } from "react";
import { Alert } from "react-native";

export function useCurrencyExchange() {
  const [fromCurrency, setFromCurrency] = useState("EUR");
  const [toCurrency, setToCurrency] = useState("FCFA");
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [exchangeRate, setExchangeRate] = useState(655.957);
  const [fees, setFees] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [fromAccount, setFromAccount] = useState(null);
  const [toAccount, setToAccount] = useState(null);

  useEffect(() => {
    if (fromAmount && !isNaN(fromAmount)) {
      const amount = parseFloat(fromAmount);
      const converted = amount * exchangeRate;
      const feeAmount = converted * 0.015;
      setFees(feeAmount);
      setToAmount((converted - feeAmount).toFixed(2));
    } else {
      setToAmount("");
      setFees(0);
    }
  }, [fromAmount, exchangeRate]);

  const handleSwapCurrencies = () => {
    const tempCurrency = fromCurrency;
    const tempAmount = fromAmount;
    const tempAccount = fromAccount;

    setFromCurrency(toCurrency);
    setToCurrency(tempCurrency);
    setFromAmount(toAmount);
    setFromAccount(toAccount);
    setToAccount(tempAccount);

    setExchangeRate(1 / exchangeRate);
  };

  const handleExchange = async () => {
    if (!fromAccount || !toAccount || !fromAmount) {
      Alert.alert(
        "Erreur",
        "Veuillez sélectionner les comptes et saisir le montant",
      );
      return;
    }

    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      Alert.alert(
        "Échange réussi!",
        `${fromAmount} ${fromCurrency} ont été convertis en ${toAmount} ${toCurrency}`,
        [
          {
            text: "OK",
            onPress: () => {
              setFromAmount("");
              setToAmount("");
              setFromAccount(null);
              setToAccount(null);
            },
          },
        ],
      );
    } catch (error) {
      Alert.alert(
        "Erreur",
        "Impossible d'effectuer l'échange. Veuillez réessayer.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return {
    fromCurrency,
    setFromCurrency,
    toCurrency,
    setToCurrency,
    fromAmount,
    setFromAmount,
    toAmount,
    setToAmount,
    exchangeRate,
    setExchangeRate,
    fees,
    isLoading,
    lastUpdated,
    fromAccount,
    setFromAccount,
    toAccount,
    setToAccount,
    handleSwapCurrencies,
    handleExchange,
  };
}
