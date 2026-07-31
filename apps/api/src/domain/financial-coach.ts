export type BudgetCategoryInput = {
  code: string;
  name: string;
  spentMinor: number;
  limitMinor: number;
  essential?: boolean;
};

export type FinancialProfileInput = {
  currency?: 'XAF' | 'XOF';
  monthlyIncomeMinor: number;
  currentSavingsMinor: number;
  debtPaymentsMinor: number;
  emergencyFundMonths: number;
  dayOfMonth: number;
  daysInMonth: number;
  categories: BudgetCategoryInput[];
};

export type CoachRecommendation = {
  code: string;
  priority: 'high' | 'medium' | 'low';
  title: string;
  message: string;
  actionLabel?: string;
};

const clamp = (value: number, minimum: number, maximum: number) =>
  Math.min(maximum, Math.max(minimum, Math.round(value)));

export function analyzeFinancialProfile(input: FinancialProfileInput) {
  const currency = input.currency ?? 'XAF';
  const totalSpentMinor = input.categories.reduce((sum, category) => sum + category.spentMinor, 0);
  const totalBudgetMinor = input.categories.reduce((sum, category) => sum + category.limitMinor, 0);
  const essentialMonthlyMinor = input.categories
    .filter((category) => category.essential)
    .reduce((sum, category) => sum + Math.max(category.spentMinor, category.limitMinor), 0);
  const remainingBudgetMinor = Math.max(0, totalBudgetMinor - totalSpentMinor);
  const daysRemaining = Math.max(1, input.daysInMonth - input.dayOfMonth + 1);
  const safeDailySpendMinor = Math.floor(remainingBudgetMinor / daysRemaining);
  const projectedMonthlySpendMinor = input.dayOfMonth > 0
    ? Math.round((totalSpentMinor / input.dayOfMonth) * input.daysInMonth)
    : totalSpentMinor;
  const projectedBalanceMinor = input.monthlyIncomeMinor - projectedMonthlySpendMinor - input.debtPaymentsMinor;
  const savingsCapacityMinor = Math.max(0, input.monthlyIncomeMinor - totalSpentMinor - input.debtPaymentsMinor);
  const savingsRatePercent = input.monthlyIncomeMinor > 0
    ? clamp((savingsCapacityMinor / input.monthlyIncomeMinor) * 100, 0, 100)
    : 0;
  const emergencyFundTargetMinor = essentialMonthlyMinor * input.emergencyFundMonths;
  const emergencyFundProgressPercent = emergencyFundTargetMinor > 0
    ? clamp((input.currentSavingsMinor / emergencyFundTargetMinor) * 100, 0, 100)
    : 100;
  const debtRatioPercent = input.monthlyIncomeMinor > 0
    ? clamp((input.debtPaymentsMinor / input.monthlyIncomeMinor) * 100, 0, 100)
    : 0;
  const budgetUsagePercent = totalBudgetMinor > 0
    ? clamp((totalSpentMinor / totalBudgetMinor) * 100, 0, 999)
    : 0;

  let healthScore = 55;
  healthScore += savingsRatePercent >= 20 ? 18 : savingsRatePercent >= 10 ? 10 : savingsRatePercent > 0 ? 4 : -12;
  healthScore += emergencyFundProgressPercent >= 100 ? 15 : emergencyFundProgressPercent >= 50 ? 8 : -5;
  healthScore += debtRatioPercent <= 20 ? 8 : debtRatioPercent <= 35 ? 0 : -15;
  healthScore += budgetUsagePercent <= 90 ? 8 : budgetUsagePercent <= 100 ? 0 : -15;
  healthScore = clamp(healthScore, 0, 100);

  const recommendations: CoachRecommendation[] = [];
  const overspentCategories = input.categories.filter((category) => category.spentMinor > category.limitMinor);
  if (overspentCategories.length > 0) {
    recommendations.push({
      code: 'category_overrun',
      priority: 'high',
      title: 'Budget dépassé',
      message: `${overspentCategories.map((category) => category.name).join(', ')} dépasse le plafond prévu. Réduisez les dépenses flexibles jusqu'à la fin du mois.`,
      actionLabel: 'Voir les catégories',
    });
  }
  if (projectedBalanceMinor < 0) {
    recommendations.push({
      code: 'negative_forecast',
      priority: 'high',
      title: 'Fin de mois sous tension',
      message: 'Au rythme actuel, vos sorties dépasseront vos revenus. owo! recommande de reporter les achats non essentiels.',
      actionLabel: 'Simuler un ajustement',
    });
  }
  if (emergencyFundProgressPercent < 100) {
    const suggestedContributionMinor = Math.min(
      Math.max(Math.round(input.monthlyIncomeMinor * 0.1), 5_000),
      Math.max(0, emergencyFundTargetMinor - input.currentSavingsMinor),
    );
    recommendations.push({
      code: 'emergency_fund',
      priority: emergencyFundProgressPercent < 25 ? 'medium' : 'low',
      title: "Renforcer le fonds d'urgence",
      message: `Une contribution de ${suggestedContributionMinor.toLocaleString('fr-FR')} FCFA ce mois vous rapprocherait de votre réserve de sécurité.`,
      actionLabel: 'Créer un objectif',
    });
  }
  if (debtRatioPercent > 35) {
    recommendations.push({
      code: 'debt_ratio',
      priority: 'high',
      title: 'Mensualités élevées',
      message: 'Vos remboursements dépassent 35 % de vos revenus. Priorisez les dettes les plus coûteuses avant tout placement risqué.',
      actionLabel: 'Préparer un plan',
    });
  }
  if (savingsRatePercent >= 20 && emergencyFundProgressPercent >= 100) {
    recommendations.push({
      code: 'investment_ready',
      priority: 'low',
      title: 'Capacité de placement détectée',
      message: "Votre réserve de sécurité et votre taux d'épargne permettent d'étudier des placements réglementés adaptés à votre horizon.",
      actionLabel: 'Découvrir les placements',
    });
  }
  if (recommendations.length === 0) {
    recommendations.push({
      code: 'on_track',
      priority: 'low',
      title: 'Budget sous contrôle',
      message: 'Vos dépenses restent cohérentes avec votre budget. Continuez à enregistrer vos opérations pour améliorer les prévisions.',
    });
  }

  return {
    currency,
    healthScore,
    status: healthScore >= 75 ? 'good' : healthScore >= 50 ? 'watch' : 'critical',
    totalSpentMinor,
    totalBudgetMinor,
    remainingBudgetMinor,
    safeDailySpendMinor,
    projectedMonthlySpendMinor,
    projectedBalanceMinor,
    savingsCapacityMinor,
    savingsRatePercent,
    debtRatioPercent,
    emergencyFundTargetMinor,
    emergencyFundProgressPercent,
    categories: input.categories.map((category) => ({
      ...category,
      remainingMinor: category.limitMinor - category.spentMinor,
      usagePercent: category.limitMinor > 0
        ? clamp((category.spentMinor / category.limitMinor) * 100, 0, 999)
        : 0,
    })),
    recommendations,
    generatedAt: new Date().toISOString(),
    methodology: 'deterministic-v1',
  };
}

export function answerCoachQuestion(question: string, analysis: ReturnType<typeof analyzeFinancialProfile>) {
  const normalized = question.toLocaleLowerCase('fr');
  if (/dépenser|disponible|reste|semaine/.test(normalized)) {
    return `Vous pouvez viser environ ${analysis.safeDailySpendMinor.toLocaleString('fr-FR')} FCFA par jour jusqu'à la fin du mois, soit ${analysis.remainingBudgetMinor.toLocaleString('fr-FR')} FCFA au total dans votre budget actuel.`;
  }
  if (/éparg|econom|économ/.test(normalized)) {
    return `Votre capacité d'épargne estimée ce mois est de ${analysis.savingsCapacityMinor.toLocaleString('fr-FR')} FCFA. Commencez par compléter le fonds d'urgence avant un placement risqué.`;
  }
  if (/invest|bourse|placement|action|obligation/.test(normalized)) {
    const regulator = analysis.currency === 'XOF' ? 'AMF-UMOA' : 'COSUMAF';
    return analysis.emergencyFundProgressPercent >= 100 && analysis.savingsRatePercent >= 20
      ? `Votre situation permet d'étudier des placements. Comparez d'abord les obligations, OPCVM et actions proposés par des intermédiaires agréés ${regulator}. owo! ne passe aucun ordre sans partenaire agréé et votre confirmation.`
      : "Avant d'investir, owo! recommande de consolider votre fonds d'urgence et de stabiliser votre budget. Vous pouvez utiliser le simulateur éducatif sans engager d'argent réel.";
  }
  if (/dette|crédit|rembours/.test(normalized)) {
    return `Vos remboursements représentent environ ${analysis.debtRatioPercent} % de vos revenus. Au-delà de 35 %, réduisez d'abord les dettes coûteuses avant de prendre un risque de marché.`;
  }
  return `Votre score financier est de ${analysis.healthScore}/100. La priorité actuelle est : ${analysis.recommendations[0]?.title ?? 'maintenir votre budget'}.`;
}
