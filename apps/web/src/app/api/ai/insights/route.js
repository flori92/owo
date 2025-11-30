import sql from "@/app/api/utils/sql";

// POST /api/ai/insights - Generate AI-powered financial insights
export async function POST(request) {
  try {
    const body = await request.json();
    const { userId = 1, period = "month" } = body;

    // Calculate date range for analysis
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

    // Gather financial data for analysis
    const [
      financialSummary,
      categoryBreakdown,
      recentTransactions,
      savingsGoal,
      userPreferences,
    ] = await sql.transaction([
      // Financial summary
      sql`
        SELECT 
          SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
          SUM(CASE WHEN type = 'expense' THEN ABS(amount) ELSE 0 END) as total_expenses,
          COUNT(CASE WHEN type = 'income' THEN 1 END) as income_count,
          COUNT(CASE WHEN type = 'expense' THEN 1 END) as expense_count,
          AVG(CASE WHEN type = 'expense' THEN ABS(amount) END) as avg_expense_amount
        FROM transactions 
        WHERE user_id = ${userId} 
          AND transaction_date >= ${startDate.toISOString()}
          AND transaction_date <= ${now.toISOString()}
      `,

      // Category breakdown
      sql`
        SELECT 
          tc.name as category_name,
          SUM(ABS(t.amount)) as total_amount,
          COUNT(t.id) as transaction_count,
          AVG(ABS(t.amount)) as avg_amount
        FROM transactions t
        JOIN transaction_categories tc ON t.category_id = tc.id
        WHERE t.user_id = ${userId}
          AND t.transaction_date >= ${startDate.toISOString()}
          AND t.transaction_date <= ${now.toISOString()}
          AND t.type = 'expense'
        GROUP BY tc.id, tc.name
        ORDER BY total_amount DESC
      `,

      // Recent high-value transactions
      sql`
        SELECT title, amount, transaction_date, tc.name as category
        FROM transactions t
        LEFT JOIN transaction_categories tc ON t.category_id = tc.id
        WHERE t.user_id = ${userId}
          AND t.transaction_date >= ${startDate.toISOString()}
          AND ABS(t.amount) > 10000
        ORDER BY ABS(t.amount) DESC
        LIMIT 5
      `,

      // Savings goal
      sql`
        SELECT target_amount, current_amount, title
        FROM savings_goals 
        WHERE user_id = ${userId} AND is_completed = false
        ORDER BY created_at DESC
        LIMIT 1
      `,

      // User preferences
      sql`
        SELECT monthly_budget, currency
        FROM user_preferences
        WHERE user_id = ${userId}
      `,
    ]);

    const summary = financialSummary[0];
    const totalIncome = parseFloat(summary.total_income) || 0;
    const totalExpenses = parseFloat(summary.total_expenses) || 0;
    const netSavings = totalIncome - totalExpenses;
    const budget = userPreferences[0]?.monthly_budget
      ? parseFloat(userPreferences[0].monthly_budget)
      : null;

    // Prepare data for AI analysis
    const analysisData = {
      period,
      totalIncome,
      totalExpenses,
      netSavings,
      monthlyBudget: budget,
      expenseCount: parseInt(summary.expense_count),
      incomeCount: parseInt(summary.income_count),
      avgExpenseAmount: parseFloat(summary.avg_expense_amount) || 0,
      topCategories: categoryBreakdown.slice(0, 5).map((cat) => ({
        category: cat.category_name,
        amount: parseFloat(cat.total_amount),
        transactions: parseInt(cat.transaction_count),
        avgAmount: parseFloat(cat.avg_amount),
      })),
      highValueTransactions: recentTransactions.map((tx) => ({
        title: tx.title,
        amount: parseFloat(tx.amount),
        category: tx.category,
        date: tx.transaction_date,
      })),
      savingsGoal: savingsGoal[0]
        ? {
            target: parseFloat(savingsGoal[0].target_amount),
            current: parseFloat(savingsGoal[0].current_amount),
            title: savingsGoal[0].title,
          }
        : null,
    };

    // Call Claude Sonnet 4 for financial insights
    const aiResponse = await fetch("/integrations/anthropic-claude-sonnet-4/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content: `You are a financial advisor specializing in personal finance management for West African users, particularly in Benin. You understand:
            - Mobile Money usage patterns (MTN Mobile Money, Moov Money, Celtiis Cash)
            - Local economic context and spending habits in Benin
            - FCFA currency and typical expense ranges
            - Common financial challenges and opportunities in West Africa
            - French language financial terms commonly used in Benin

            Analyze the provided financial data and generate actionable insights that are:
            - Culturally relevant and appropriate for the Benin context
            - Practical and achievable given local economic conditions
            - Focused on mobile money optimization and financial inclusion
            - Sensitive to typical income levels and living costs in Benin

            Generate insights in French when appropriate, but keep technical terms clear.`,
          },
          {
            role: "user",
            content: `Analyze this financial data for ${period} period and provide insights:

            Financial Summary:
            - Total Income: ${totalIncome.toLocaleString()} FCFA
            - Total Expenses: ${totalExpenses.toLocaleString()} FCFA
            - Net Savings: ${netSavings.toLocaleString()} FCFA
            - Monthly Budget: ${budget ? budget.toLocaleString() : "Not set"} FCFA
            - Transaction Count: ${summary.expense_count} expenses, ${summary.income_count} income
            - Average Expense: ${analysisData.avgExpenseAmount.toLocaleString()} FCFA

            Top Expense Categories:
            ${analysisData.topCategories
              .map(
                (cat) =>
                  `- ${cat.category}: ${cat.amount.toLocaleString()} FCFA (${cat.transactions} transactions)`,
              )
              .join("\n")}

            High-Value Recent Transactions:
            ${analysisData.highValueTransactions
              .map(
                (tx) =>
                  `- ${tx.title}: ${Math.abs(tx.amount).toLocaleString()} FCFA (${tx.category})`,
              )
              .join("\n")}

            ${analysisData.savingsGoal ? `Savings Goal: ${analysisData.savingsGoal.title} - ${analysisData.savingsGoal.current.toLocaleString()}/${analysisData.savingsGoal.target.toLocaleString()} FCFA` : ""}

            Please provide 3-5 specific, actionable financial insights.`,
          },
        ],
        json_schema: {
          name: "financial_insights",
          schema: {
            type: "object",
            properties: {
              insights: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    type: {
                      type: "string",
                      enum: [
                        "saving_suggestion",
                        "budget_alert",
                        "spending_pattern",
                        "goal_progress",
                        "optimization_tip",
                      ],
                    },
                    priority: {
                      type: "string",
                      enum: ["low", "medium", "high"],
                    },
                    title: {
                      type: "string",
                      description: "Short, compelling title for the insight",
                    },
                    description: {
                      type: "string",
                      description:
                        "Detailed explanation with actionable advice",
                    },
                    category: {
                      type: ["string", "null"],
                      description: "Related expense category if applicable",
                    },
                    estimatedImpact: {
                      type: ["number", "null"],
                      description:
                        "Estimated financial impact in FCFA if applicable",
                    },
                    actionable: {
                      type: "boolean",
                      description:
                        "Whether this insight has specific actionable steps",
                    },
                  },
                  required: [
                    "type",
                    "priority",
                    "title",
                    "description",
                    "category",
                    "estimatedImpact",
                    "actionable",
                  ],
                  additionalProperties: false,
                },
              },
              overallFinancialHealth: {
                type: "string",
                enum: [
                  "excellent",
                  "good",
                  "fair",
                  "needs_attention",
                  "critical",
                ],
              },
              monthlyTrend: {
                type: "string",
                enum: ["improving", "stable", "declining"],
              },
              keyRecommendation: {
                type: "string",
                description: "One primary recommendation for the user",
              },
            },
            required: [
              "insights",
              "overallFinancialHealth",
              "monthlyTrend",
              "keyRecommendation",
            ],
            additionalProperties: false,
          },
        },
      }),
    });

    if (!aiResponse.ok) {
      console.error("AI insights generation failed:", await aiResponse.text());
      return generateFallbackInsights(analysisData);
    }

    const result = await aiResponse.json();
    const aiInsights = JSON.parse(result.choices[0].message.content);

    // Store insights in database for future reference
    for (const insight of aiInsights.insights) {
      await sql`
        INSERT INTO ai_insights (
          user_id,
          insight_type,
          title,
          description,
          priority,
          category,
          amount,
          valid_until
        ) VALUES (
          ${userId},
          ${insight.type},
          ${insight.title},
          ${insight.description},
          ${insight.priority},
          ${insight.category},
          ${insight.estimatedImpact},
          ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]} -- Valid for 30 days
        )
        ON CONFLICT DO NOTHING
      `;
    }

    return Response.json({
      ...aiInsights,
      generatedAt: new Date().toISOString(),
      period,
      dataPoints: {
        totalIncome,
        totalExpenses,
        netSavings,
        topCategory: analysisData.topCategories[0]?.category || null,
      },
    });
  } catch (error) {
    console.error("Error generating AI insights:", error);

    // Fallback insights
    try {
      const body = await request.json();
      const { userId = 1 } = body;

      return generateFallbackInsights({
        totalIncome: 0,
        totalExpenses: 0,
        netSavings: 0,
        monthlyBudget: null,
      });
    } catch {
      return Response.json(
        { error: "Failed to generate insights" },
        { status: 500 },
      );
    }
  }
}

// Fallback insights when AI fails
function generateFallbackInsights(data) {
  const insights = [];

  // Budget alert if expenses are high
  if (data.monthlyBudget && data.totalExpenses > data.monthlyBudget * 0.9) {
    insights.push({
      type: "budget_alert",
      priority: "high",
      title: "Alerte budget",
      description:
        "Vous avez dépassé 90% de votre budget mensuel. Considérez réduire les dépenses non essentielles.",
      category: null,
      estimatedImpact: data.totalExpenses - data.monthlyBudget,
      actionable: true,
    });
  }

  // Savings suggestion if net is positive
  if (data.netSavings > 0) {
    insights.push({
      type: "saving_suggestion",
      priority: "medium",
      title: "Opportunité d'épargne",
      description: `Vous avez économisé ${data.netSavings.toLocaleString()} FCFA ce mois. Considérez placer une partie en épargne automatique.`,
      category: null,
      estimatedImpact: data.netSavings * 0.2,
      actionable: true,
    });
  }

  // Default encouragement
  if (insights.length === 0) {
    insights.push({
      type: "optimization_tip",
      priority: "low",
      title: "Continuez vos efforts",
      description:
        "Votre gestion financière progresse. Continuez à suivre vos dépenses pour identifier des opportunités d'amélioration.",
      category: null,
      estimatedImpact: null,
      actionable: false,
    });
  }

  return Response.json({
    insights,
    overallFinancialHealth: data.netSavings > 0 ? "good" : "fair",
    monthlyTrend: "stable",
    keyRecommendation:
      "Continuez à surveiller vos dépenses et cherchez des moyens d'optimiser votre budget.",
    generatedAt: new Date().toISOString(),
    isAiGenerated: false,
  });
}
