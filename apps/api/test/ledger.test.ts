import { describe, expect, it } from 'vitest';
import { assertBalanced, majorToMinor } from '../src/domain/ledger.js';

describe('registre comptable', () => {
  it('accepte une écriture équilibrée par devise', () => {
    expect(() =>
      assertBalanced([
        { side: 'debit', amountMinor: 15_000n, currency: 'XOF' },
        { side: 'credit', amountMinor: 15_000n, currency: 'XOF' },
      ]),
    ).not.toThrow();
  });

  it('refuse une écriture déséquilibrée', () => {
    expect(() =>
      assertBalanced([
        { side: 'debit', amountMinor: 15_000n, currency: 'XOF' },
        { side: 'credit', amountMinor: 14_999n, currency: 'XOF' },
      ]),
    ).toThrow('déséquilibrée');
  });

  it('convertit sans nombres flottants', () => {
    expect(majorToMinor('19.95', 2)).toBe(1995n);
    expect(majorToMinor('15000', 0)).toBe(15000n);
    expect(() => majorToMinor('1.001', 2)).toThrow('trop de décimales');
  });
});
