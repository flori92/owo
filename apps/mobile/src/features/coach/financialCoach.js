export const DEFAULT_COACH_PROFILE = {
  currency: "XAF",
  monthlyIncomeMinor: 650000,
  currentSavingsMinor: 450000,
  debtPaymentsMinor: 45000,
  emergencyFundMonths: 3,
  categories: [
    { code: "housing", name: "Logement", spentMinor: 150000, limitMinor: 150000, essential: true, color: "#20B2AA" },
    { code: "food", name: "Alimentation", spentMinor: 80000, limitMinor: 120000, essential: true, color: "#DAA520" },
    { code: "transport", name: "Transport", spentMinor: 45000, limitMinor: 70000, essential: true, color: "#3B82F6" },
    { code: "bills", name: "Factures & télécoms", spentMinor: 35000, limitMinor: 60000, essential: true, color: "#8B5CF6" },
    { code: "leisure", name: "Loisirs", spentMinor: 55000, limitMinor: 40000, essential: false, color: "#EC4899" },
  ],
};

const clamp = (value, minimum, maximum) => Math.min(maximum, Math.max(minimum, Math.round(value)));

export function analyzeCoachProfile(profile, now = new Date()) {
  const dayOfMonth = now.getDate();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const totalSpentMinor = profile.categories.reduce((sum, item) => sum + item.spentMinor, 0);
  const totalBudgetMinor = profile.categories.reduce((sum, item) => sum + item.limitMinor, 0);
  const remainingBudgetMinor = Math.max(0, totalBudgetMinor - totalSpentMinor);
  const daysRemaining = Math.max(1, daysInMonth - dayOfMonth + 1);
  const safeDailySpendMinor = Math.floor(remainingBudgetMinor / daysRemaining);
  const projectedMonthlySpendMinor = Math.round((totalSpentMinor / Math.max(1, dayOfMonth)) * daysInMonth);
  const projectedBalanceMinor = profile.monthlyIncomeMinor - projectedMonthlySpendMinor - profile.debtPaymentsMinor;
  const savingsCapacityMinor = Math.max(0, profile.monthlyIncomeMinor - totalSpentMinor - profile.debtPaymentsMinor);
  const savingsRatePercent = profile.monthlyIncomeMinor > 0
    ? clamp((savingsCapacityMinor / profile.monthlyIncomeMinor) * 100, 0, 100)
    : 0;
  const essentialMonthlyMinor = profile.categories
    .filter((item) => item.essential)
    .reduce((sum, item) => sum + Math.max(item.spentMinor, item.limitMinor), 0);
  const emergencyFundTargetMinor = essentialMonthlyMinor * profile.emergencyFundMonths;
  const emergencyFundProgressPercent = emergencyFundTargetMinor > 0
    ? clamp((profile.currentSavingsMinor / emergencyFundTargetMinor) * 100, 0, 100)
    : 100;
  const debtRatioPercent = profile.monthlyIncomeMinor > 0
    ? clamp((profile.debtPaymentsMinor / profile.monthlyIncomeMinor) * 100, 0, 100)
    : 0;
  const budgetUsagePercent = totalBudgetMinor > 0 ? clamp((totalSpentMinor / totalBudgetMinor) * 100, 0, 999) : 0;

  let healthScore = 55;
  healthScore += savingsRatePercent >= 20 ? 18 : savingsRatePercent >= 10 ? 10 : savingsRatePercent > 0 ? 4 : -12;
  healthScore += emergencyFundProgressPercent >= 100 ? 15 : emergencyFundProgressPercent >= 50 ? 8 : -5;
  healthScore += debtRatioPercent <= 20 ? 8 : debtRatioPercent <= 35 ? 0 : -15;
  healthScore += budgetUsagePercent <= 90 ? 8 : budgetUsagePercent <= 100 ? 0 : -15;
  healthScore = clamp(healthScore, 0, 100);

  const recommendations = [];
  const overrun = profile.categories.filter((item) => item.spentMinor > item.limitMinor);
  if (overrun.length) recommendations.push({
    code: "category_overrun",
    priority: "high",
    title: "Dépassement détecté",
    message: `${overrun.map((item) => item.name).join(", ")} dépasse le plafond. Réduisez temporairement les dépenses flexibles.`,
  });
  if (projectedBalanceMinor < 0) recommendations.push({
    code: "negative_forecast",
    priority: "high",
    title: "Fin de mois sous tension",
    message: "Au rythme actuel, vos sorties pourraient dépasser vos revenus. Reportez les achats non essentiels.",
  });
  if (emergencyFundProgressPercent < 100) recommendations.push({
    code: "emergency_fund",
    priority: "medium",
    title: "Compléter la réserve de sécurité",
    message: `Votre fonds d'urgence couvre ${emergencyFundProgressPercent}% de l'objectif de ${profile.emergencyFundMonths} mois.`,
  });
  if (debtRatioPercent > 35) recommendations.push({
    code: "debt_ratio",
    priority: "high",
    title: "Mensualités élevées",
    message: "Réduisez les dettes coûteuses avant d'envisager un placement risqué.",
  });
  if (!recommendations.length) recommendations.push({
    code: "on_track",
    priority: "low",
    title: "Budget sous contrôle",
    message: "Votre trajectoire est cohérente. Continuez à enregistrer vos opérations pour affiner les prévisions.",
  });

  return {
    currency: profile.currency || "XAF",
    healthScore,
    status: healthScore >= 75 ? "Bonne trajectoire" : healthScore >= 50 ? "À surveiller" : "Action requise",
    totalSpentMinor,
    totalBudgetMinor,
    remainingBudgetMinor,
    safeDailySpendMinor,
    projectedMonthlySpendMinor,
    projectedBalanceMinor,
    savingsCapacityMinor,
    savingsRatePercent,
    emergencyFundTargetMinor,
    emergencyFundProgressPercent,
    debtRatioPercent,
    categories: profile.categories.map((item) => ({
      ...item,
      remainingMinor: item.limitMinor - item.spentMinor,
      usagePercent: item.limitMinor > 0 ? clamp((item.spentMinor / item.limitMinor) * 100, 0, 999) : 0,
    })),
    recommendations,
  };
}

export function answerCoachQuestion(question, analysis) {
  const normalized = question.toLocaleLowerCase("fr");
  if (/dépenser|disponible|reste|semaine/.test(normalized)) {
    return `Vous pouvez viser ${analysis.safeDailySpendMinor.toLocaleString("fr-FR")} FCFA par jour jusqu'à la fin du mois. Il reste ${analysis.remainingBudgetMinor.toLocaleString("fr-FR")} FCFA dans le budget.`;
  }
  if (/éparg|econom|économ/.test(normalized)) {
    return `Votre capacité d'épargne estimée est de ${analysis.savingsCapacityMinor.toLocaleString("fr-FR")} FCFA. Priorisez le fonds d'urgence avant les placements risqués.`;
  }
  if (/invest|bourse|placement|action|obligation/.test(normalized)) {
    const regulator = analysis.currency === "XOF" ? "AMF-UMOA" : "COSUMAF";
    return analysis.emergencyFundProgressPercent >= 100 && analysis.savingsRatePercent >= 20
      ? `Votre profil permet d'étudier des placements. Comparez les produits réglementés et passez toujours par un intermédiaire agréé ${regulator}.`
      : "Commencez par stabiliser votre budget et votre fonds d'urgence. Le simulateur d'investissement reste disponible pour apprendre sans engager d'argent.";
  }
  if (/dette|crédit|rembours/.test(normalized)) {
    return `Vos mensualités représentent environ ${analysis.debtRatioPercent}% des revenus. Si ce ratio dépasse 35%, remboursez les dettes coûteuses en priorité.`;
  }
  return `Votre score est de ${analysis.healthScore}/100. Ma recommandation prioritaire : ${analysis.recommendations[0].title.toLocaleLowerCase("fr")}.`;
}
