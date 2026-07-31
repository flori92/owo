import { describe, expect, it } from 'vitest';
import { analyzeFinancialProfile, answerCoachQuestion } from '../src/domain/financial-coach.js';

const profile = {
  monthlyIncomeMinor: 650_000,
  currentSavingsMinor: 450_000,
  debtPaymentsMinor: 45_000,
  emergencyFundMonths: 3,
  dayOfMonth: 15,
  daysInMonth: 30,
  categories: [
    { code: 'housing', name: 'Logement', spentMinor: 150_000, limitMinor: 150_000, essential: true },
    { code: 'food', name: 'Alimentation', spentMinor: 80_000, limitMinor: 120_000, essential: true },
    { code: 'transport', name: 'Transport', spentMinor: 45_000, limitMinor: 70_000, essential: true },
    { code: 'leisure', name: 'Loisirs', spentMinor: 55_000, limitMinor: 40_000 },
  ],
};

describe('financial coach', () => {
  it('calcule un budget et détecte un dépassement', () => {
    const result = analyzeFinancialProfile(profile);
    expect(result.currency).toBe('XAF');
    expect(result.totalSpentMinor).toBe(330_000);
    expect(result.remainingBudgetMinor).toBe(50_000);
    expect(result.recommendations.some((item) => item.code === 'category_overrun')).toBe(true);
    expect(result.healthScore).toBeGreaterThanOrEqual(0);
    expect(result.healthScore).toBeLessThanOrEqual(100);
  });

  it('répond avec des données calculées et non inventées', () => {
    const result = analyzeFinancialProfile(profile);
    const answer = answerCoachQuestion('Combien puis-je dépenser ?', result);
    expect(answer).toContain(result.safeDailySpendMinor.toLocaleString('fr-FR'));
  });

  it('conserve la devise XOF pour un profil UEMOA', () => {
    expect(analyzeFinancialProfile({ ...profile, currency: 'XOF' }).currency).toBe('XOF');
  });
});
