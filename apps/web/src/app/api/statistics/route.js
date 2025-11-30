import sql from "@/app/api/utils/sql";

// GET /api/statistics - Get financial statistics for a user
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || 1; // Default to test user
    const period = searchParams.get("period") || "month"; // 'week', 'month', 'quarter', 'year'

    // Calculate date range based on period
    const now = new Date();
    let startDate;

    switch (period) {
      case "week":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "quarter":
        startDate = new Date(
          now.getFullYear(),
          Math.floor(now.getMonth() / 3) * 3,
          1,
        );
        break;
      case "year":
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      case "month":
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
    }

    // Get total income and expenses for the period
    const totals = await sql`
      SELECT 
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
        SUM(CASE WHEN type = 'expense' THEN ABS(amount) ELSE 0 END) as total_expenses,
        COUNT(CASE WHEN type = 'income' THEN 1 END) as income_transactions,
        COUNT(CASE WHEN type = 'expense' THEN 1 END) as expense_transactions
      FROM transactions 
      WHERE user_id = ${userId} 
        AND transaction_date >= ${startDate.toISOString()}
        AND transaction_date <= ${now.toISOString()}
    `;

    const totalIncome = parseFloat(totals[0].total_income) || 0;
    const totalExpenses = parseFloat(totals[0].total_expenses) || 0;
    const netSavings = totalIncome - totalExpenses;

    // Get expenses by category
    const categoryStats = await sql`
      SELECT 
        tc.id,
        tc.name,
        tc.color,
        tc.icon,
        tc.type,
        SUM(ABS(t.amount)) as total_amount,
        COUNT(t.id) as transaction_count,
        AVG(ABS(t.amount)) as avg_amount
      FROM transactions t
      JOIN transaction_categories tc ON t.category_id = tc.id
      WHERE t.user_id = ${userId}
        AND t.transaction_date >= ${startDate.toISOString()}
        AND t.transaction_date <= ${now.toISOString()}
        AND t.type = 'expense'
      GROUP BY tc.id, tc.name, tc.color, tc.icon, tc.type
      ORDER BY total_amount DESC
    `;

    // Calculate percentages and trends for categories
    const categoriesWithPercentage = categoryStats.map((category) => {
      const percentage =
        totalExpenses > 0
          ? (parseFloat(category.total_amount) / totalExpenses) * 100
          : 0;

      // Mock trend calculation (in a real app, you'd compare with previous period)
      const trendOptions = [
        "+5%",
        "-3%",
        "+8%",
        "-2%",
        "+1%",
        "0%",
        "+12%",
        "-5%",
      ];
      const trend =
        trendOptions[Math.floor(Math.random() * trendOptions.length)];

      return {
        id: category.id,
        name: category.name,
        color: category.color,
        icon: category.icon,
        amount: parseFloat(category.total_amount),
        percentage: Math.round(percentage * 10) / 10,
        transactions: parseInt(category.transaction_count),
        avgAmount: parseFloat(category.avg_amount),
        trend,
      };
    });

    // Get weekly trend data for the current month
    const weeklyTrend = await sql`
      SELECT 
        DATE_TRUNC('week', transaction_date) as week_start,
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as week_income,
        SUM(CASE WHEN type = 'expense' THEN ABS(amount) ELSE 0 END) as week_expenses
      FROM transactions
      WHERE user_id = ${userId}
        AND transaction_date >= ${startDate.toISOString()}
        AND transaction_date <= ${now.toISOString()}
      GROUP BY DATE_TRUNC('week', transaction_date)
      ORDER BY week_start DESC
      LIMIT 4
    `;

    // Format weekly trend data
    const weeklyTrendFormatted = weeklyTrend
      .map((week, index) => ({
        week: `S${weeklyTrend.length - index}`,
        income: parseFloat(week.week_income) || 0,
        expenses: parseFloat(week.week_expenses) || 0,
      }))
      .reverse();

    // Get savings goal progress
    const savingsGoal = await sql`
      SELECT 
        target_amount,
        current_amount,
        title,
        target_date,
        is_completed
      FROM savings_goals 
      WHERE user_id = ${userId} 
        AND is_completed = false
      ORDER BY created_at DESC
      LIMIT 1
    `;

    let savingsGoalData = null;
    if (savingsGoal.length > 0) {
      const goal = savingsGoal[0];
      const targetAmount = parseFloat(goal.target_amount);
      const currentAmount = parseFloat(goal.current_amount);
      const progress =
        targetAmount > 0 ? (currentAmount / targetAmount) * 100 : 0;

      savingsGoalData = {
        title: goal.title,
        targetAmount,
        currentAmount,
        progress: Math.round(progress),
        targetDate: goal.target_date,
        isCompleted: goal.is_completed,
      };
    }

    // Get recent AI insights
    const aiInsights = await sql`
      SELECT 
        insight_type,
        title,
        description,
        priority,
        category,
        amount,
        created_at
      FROM ai_insights
      WHERE user_id = ${userId}
        AND is_dismissed = false
        AND (valid_until IS NULL OR valid_until >= CURRENT_DATE)
      ORDER BY 
        CASE priority 
          WHEN 'high' THEN 1
          WHEN 'medium' THEN 2
          WHEN 'low' THEN 3
        END,
        created_at DESC
      LIMIT 5
    `;

    const insightsFormatted = aiInsights.map((insight) => ({
      type: insight.insight_type,
      title: insight.title,
      description: insight.description,
      priority: insight.priority,
      category: insight.category,
      amount: insight.amount ? parseFloat(insight.amount) : null,
      createdAt: insight.created_at,
    }));

    // Get mobile money account balances
    const accountBalances = await sql`
      SELECT 
        provider,
        balance,
        currency,
        phone_number
      FROM mobile_money_accounts
      WHERE user_id = ${userId} AND is_active = true
      ORDER BY balance DESC
    `;

    const totalBalance = accountBalances.reduce(
      (sum, account) => sum + parseFloat(account.balance),
      0,
    );

    const response = {
      period,
      dateRange: {
        startDate: startDate.toISOString(),
        endDate: now.toISOString(),
      },
      summary: {
        totalIncome,
        totalExpenses,
        netSavings,
        totalBalance,
        incomeTransactions: parseInt(totals[0].income_transactions),
        expenseTransactions: parseInt(totals[0].expense_transactions),
      },
      categories: categoriesWithPercentage,
      weeklyTrend: weeklyTrendFormatted,
      savingsGoal: savingsGoalData,
      aiInsights: insightsFormatted,
      accountBalances: accountBalances.map((account) => ({
        provider: account.provider,
        balance: parseFloat(account.balance),
        currency: account.currency,
        phoneNumber: account.phone_number,
      })),
    };

    return Response.json(response);
  } catch (error) {
    console.error("Error fetching statistics:", error);
    return Response.json(
      { error: "Failed to fetch statistics" },
      { status: 500 },
    );
  }
}
