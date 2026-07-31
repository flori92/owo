import type { Database } from '../database.js';
import type { FinancialProfileInput } from '../domain/financial-coach.js';

type ProfileRow = {
  currency: string;
  monthly_income_minor: string;
  current_savings_minor: string;
  debt_payments_minor: string;
  emergency_fund_months: number;
};

type CategoryRow = {
  code: string;
  name: string;
  spent_minor: string;
  limit_minor: string;
  essential: boolean;
};

export async function getFinancialProfile(database: Database, firebaseUid: string) {
  const profileResult = await database.query<ProfileRow>(
    `SELECT p.currency,
            p.monthly_income_minor::text,
            p.current_savings_minor::text,
            p.debt_payments_minor::text,
            p.emergency_fund_months
       FROM financial_profiles p
       JOIN app_users u ON u.id = p.user_id
      WHERE u.firebase_uid = $1`,
    [firebaseUid],
  );
  const profile = profileResult.rows[0];
  if (!profile) return null;

  const categoriesResult = await database.query<CategoryRow>(
    `SELECT c.code, c.name, c.spent_minor::text, c.limit_minor::text, c.essential
       FROM budget_categories c
       JOIN app_users u ON u.id = c.user_id
      WHERE u.firebase_uid = $1
      ORDER BY c.display_order, c.code`,
    [firebaseUid],
  );

  return {
    currency: profile.currency.trim(),
    monthlyIncomeMinor: Number(profile.monthly_income_minor),
    currentSavingsMinor: Number(profile.current_savings_minor),
    debtPaymentsMinor: Number(profile.debt_payments_minor),
    emergencyFundMonths: profile.emergency_fund_months,
    categories: categoriesResult.rows.map((category) => ({
      code: category.code,
      name: category.name,
      spentMinor: Number(category.spent_minor),
      limitMinor: Number(category.limit_minor),
      essential: category.essential,
    })),
  };
}

export async function saveFinancialProfile(
  database: Database,
  firebaseUid: string,
  profile: Omit<FinancialProfileInput, 'dayOfMonth' | 'daysInMonth'>,
) {
  await database.transaction(async (client) => {
    const userResult = await client.query<{ id: string }>(
      `SELECT id FROM app_users WHERE firebase_uid = $1 FOR UPDATE`,
      [firebaseUid],
    );
    const userId = userResult.rows[0]?.id;
    if (!userId) throw new Error('financial_profile_user_not_found');

    await client.query(
      `INSERT INTO financial_profiles (
         user_id, currency, monthly_income_minor, current_savings_minor,
         debt_payments_minor, emergency_fund_months
       ) VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (user_id) DO UPDATE SET
         currency = EXCLUDED.currency,
         monthly_income_minor = EXCLUDED.monthly_income_minor,
         current_savings_minor = EXCLUDED.current_savings_minor,
         debt_payments_minor = EXCLUDED.debt_payments_minor,
         emergency_fund_months = EXCLUDED.emergency_fund_months,
         updated_at = now()`,
      [
        userId,
        profile.currency ?? 'XAF',
        profile.monthlyIncomeMinor,
        profile.currentSavingsMinor,
        profile.debtPaymentsMinor,
        profile.emergencyFundMonths,
      ],
    );

    await client.query(`DELETE FROM budget_categories WHERE user_id = $1`, [userId]);
    for (const [index, category] of profile.categories.entries()) {
      await client.query(
        `INSERT INTO budget_categories (
           user_id, code, name, spent_minor, limit_minor, essential, display_order
         ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          userId,
          category.code,
          category.name,
          category.spentMinor,
          category.limitMinor,
          category.essential ?? false,
          index,
        ],
      );
    }
  });
  return getFinancialProfile(database, firebaseUid);
}
