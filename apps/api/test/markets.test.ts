import { describe, expect, it } from 'vitest';
import { getMarket, isProviderAvailable, marketCatalog } from '../src/domain/markets.js';

describe('regional markets', () => {
  it('configure le Cameroun en XAF avec Orange Money et MTN MoMo uniquement', () => {
    expect(marketCatalog.CM.currency).toBe('XAF');
    expect(marketCatalog.CM.region).toBe('CEMAC');
    expect(marketCatalog.CM.providers).toEqual(['orange', 'mtn']);
    expect(isProviderAvailable('CM', 'orange')).toBe(true);
    expect(isProviderAvailable('CM', 'moov')).toBe(false);
  });

  it('sépare la devise UEMOA de la devise CEMAC', () => {
    expect(getMarket('BJ')?.currency).toBe('XOF');
    expect(getMarket('CI')?.currency).toBe('XOF');
    expect(getMarket('SN')?.currency).toBe('XOF');
    expect(getMarket('XX')).toBeNull();
  });
});
