export const marketCatalog = {
  CM: { countryCode: 'CM', countryName: 'Cameroun', region: 'CEMAC', currency: 'XAF', providers: ['orange', 'mtn'] },
  BJ: { countryCode: 'BJ', countryName: 'Bénin', region: 'UEMOA', currency: 'XOF', providers: ['mtn', 'moov', 'celtiis'] },
  CI: { countryCode: 'CI', countryName: "Côte d'Ivoire", region: 'UEMOA', currency: 'XOF', providers: ['orange', 'mtn', 'moov', 'wave'] },
  SN: { countryCode: 'SN', countryName: 'Sénégal', region: 'UEMOA', currency: 'XOF', providers: ['orange', 'wave', 'free'] },
} as const;

export type MarketCode = keyof typeof marketCatalog;
export type SupportedCurrency = 'XAF' | 'XOF';

export function getMarket(countryCode: string) {
  return marketCatalog[countryCode as MarketCode] ?? null;
}

export function isProviderAvailable(countryCode: string, provider: string) {
  const market = getMarket(countryCode);
  return Boolean(market?.providers.includes(provider.toLowerCase() as never));
}

