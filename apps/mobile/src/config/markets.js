export const REGIONS = {
  CEMAC: { code: "CEMAC", name: "Afrique centrale", currency: "XAF" },
  UEMOA: { code: "UEMOA", name: "Afrique de l'Ouest", currency: "XOF" },
};

export const MARKETS = {
  CM: {
    countryCode: "CM",
    countryName: "Cameroun",
    flag: "🇨🇲",
    region: "CEMAC",
    currency: "XAF",
    currencyLabel: "FCFA",
    callingCode: "+237",
    phoneLength: 9,
    phoneExample: "6 99 12 34 56",
    operators: [
      { id: "orange", code: "ORANGE", name: "Orange Money", shortName: "Orange", color: "#FF7900" },
      { id: "mtn", code: "MTN", name: "MTN Mobile Money", shortName: "MTN MoMo", color: "#FFCC00" },
    ],
  },
  BJ: {
    countryCode: "BJ",
    countryName: "Bénin",
    flag: "🇧🇯",
    region: "UEMOA",
    currency: "XOF",
    currencyLabel: "FCFA",
    callingCode: "+229",
    phoneLength: 10,
    phoneExample: "01 96 12 34 56",
    operators: [
      { id: "mtn", code: "MTN", name: "MTN Mobile Money", shortName: "MTN MoMo", color: "#FFCC00" },
      { id: "moov", code: "MOOV", name: "Moov Money", shortName: "Moov", color: "#0066CC" },
      { id: "celtiis", code: "CELTIIS", name: "Celtiis Cash", shortName: "Celtiis", color: "#00A651" },
    ],
  },
  CI: {
    countryCode: "CI",
    countryName: "Côte d'Ivoire",
    flag: "🇨🇮",
    region: "UEMOA",
    currency: "XOF",
    currencyLabel: "FCFA",
    callingCode: "+225",
    phoneLength: 10,
    phoneExample: "07 12 34 56 78",
    operators: [
      { id: "orange", code: "ORANGE", name: "Orange Money", shortName: "Orange", color: "#FF7900" },
      { id: "mtn", code: "MTN", name: "MTN Mobile Money", shortName: "MTN MoMo", color: "#FFCC00" },
      { id: "moov", code: "MOOV", name: "Moov Money", shortName: "Moov", color: "#0066CC" },
      { id: "wave", code: "WAVE", name: "Wave", shortName: "Wave", color: "#1DC4FF" },
    ],
  },
  SN: {
    countryCode: "SN",
    countryName: "Sénégal",
    flag: "🇸🇳",
    region: "UEMOA",
    currency: "XOF",
    currencyLabel: "FCFA",
    callingCode: "+221",
    phoneLength: 9,
    phoneExample: "77 123 45 67",
    operators: [
      { id: "orange", code: "ORANGE", name: "Orange Money", shortName: "Orange", color: "#FF7900" },
      { id: "wave", code: "WAVE", name: "Wave", shortName: "Wave", color: "#1DC4FF" },
      { id: "free", code: "FREE", name: "Free Money", shortName: "Free", color: "#E80070" },
    ],
  },
};

export const DEFAULT_MARKET_CODE = "CM";
export const SUPPORTED_MARKETS = Object.values(MARKETS);

export function getMarket(countryCode) {
  return MARKETS[countryCode] || MARKETS[DEFAULT_MARKET_CODE];
}

export function getOperator(countryCode, operatorId) {
  return getMarket(countryCode).operators.find((operator) => operator.id === operatorId);
}

export function formatMarketMoney(amount, marketOrCode = DEFAULT_MARKET_CODE) {
  const market = typeof marketOrCode === "string" ? getMarket(marketOrCode) : marketOrCode;
  return `${Number(amount || 0).toLocaleString("fr-FR", { maximumFractionDigits: 0 })} ${market.currencyLabel}`;
}

