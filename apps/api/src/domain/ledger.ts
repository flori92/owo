export type LedgerSide = 'debit' | 'credit';

export type LedgerEntry = {
  side: LedgerSide;
  amountMinor: bigint;
  currency: string;
};

export function assertBalanced(entries: readonly LedgerEntry[]): void {
  if (entries.length < 2) {
    throw new Error('Une écriture comptable doit contenir au moins deux lignes.');
  }

  const totals = new Map<string, bigint>();
  for (const entry of entries) {
    if (entry.amountMinor <= 0n) {
      throw new Error('Chaque montant comptable doit être strictement positif.');
    }
    const currency = entry.currency.toUpperCase();
    const signedAmount = entry.side === 'debit' ? entry.amountMinor : -entry.amountMinor;
    totals.set(currency, (totals.get(currency) ?? 0n) + signedAmount);
  }

  for (const [currency, total] of totals) {
    if (total !== 0n) {
      throw new Error(`Écriture déséquilibrée pour ${currency}.`);
    }
  }
}

export function majorToMinor(amount: string, exponent: number): bigint {
  if (!/^\d+(?:\.\d+)?$/.test(amount) || exponent < 0 || !Number.isInteger(exponent)) {
    throw new Error('Montant invalide.');
  }
  const [whole = '0', fraction = ''] = amount.split('.');
  if (fraction.length > exponent) {
    throw new Error('Le montant contient trop de décimales.');
  }
  return BigInt(whole) * 10n ** BigInt(exponent) + BigInt(fraction.padEnd(exponent, '0') || '0');
}
