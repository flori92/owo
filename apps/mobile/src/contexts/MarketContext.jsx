import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { DEFAULT_MARKET_CODE, getMarket } from "@/config/markets";
import { synchronizeMarket } from "@/services/markets";

const STORAGE_KEY = "owo.market.v1";
const MarketContext = createContext(null);

export function MarketProvider({ children }) {
  const [countryCode, setCountryCodeState] = useState(DEFAULT_MARKET_CODE);
  const [isMarketReady, setIsMarketReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((storedCode) => setCountryCodeState(getMarket(storedCode).countryCode))
      .finally(() => setIsMarketReady(true));
  }, []);

  const setCountryCode = useCallback(async (nextCode) => {
    const normalizedCode = getMarket(nextCode).countryCode;
    setCountryCodeState(normalizedCode);
    await AsyncStorage.setItem(STORAGE_KEY, normalizedCode);
    synchronizeMarket(normalizedCode).catch((error) => {
      if (__DEV__) console.warn("Synchronisation du marché différée", error);
    });
    return getMarket(normalizedCode);
  }, []);

  const value = useMemo(() => ({
    countryCode,
    market: getMarket(countryCode),
    setCountryCode,
    isMarketReady,
  }), [countryCode, isMarketReady, setCountryCode]);

  return <MarketContext.Provider value={value}>{children}</MarketContext.Provider>;
}

export function useMarket() {
  const context = useContext(MarketContext);
  if (!context) throw new Error("useMarket must be used within a MarketProvider");
  return context;
}
