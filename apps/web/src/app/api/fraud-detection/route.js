import sql from "@/app/api/utils/sql.js";
import { auth } from "@/auth.js";

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { transaction } = await request.json();

    // Analyse de fraude basée sur des patterns
    const fraudScore = await analyzeTransactionForFraud(
      transaction,
      session.user.id,
    );

    // Enregistrer l'analyse
    const analysis = await sql`
      INSERT INTO fraud_analyses (
        user_id, 
        transaction_data, 
        fraud_score, 
        risk_level,
        analyzed_at
      ) VALUES (
        ${session.user.id},
        ${JSON.stringify(transaction)},
        ${fraudScore.score},
        ${fraudScore.riskLevel},
        NOW()
      ) RETURNING *
    `;

    return Response.json({
      fraudScore: fraudScore.score,
      riskLevel: fraudScore.riskLevel,
      factors: fraudScore.factors,
      recommendation: fraudScore.recommendation,
      analysisId: analysis[0].id,
    });
  } catch (error) {
    console.error("Erreur détection fraude:", error);
    return Response.json(
      {
        error: "Erreur lors de l'analyse de fraude",
      },
      { status: 500 },
    );
  }
}

async function analyzeTransactionForFraud(transaction, userId) {
  const factors = [];
  let score = 0;

  // 1. Analyse du montant (transactions inhabituellement élevées)
  const userHistory = await sql`
    SELECT AVG(amount) as avg_amount, MAX(amount) as max_amount, COUNT(*) as total_transactions
    FROM transactions 
    WHERE user_id = ${userId} 
    AND created_at > NOW() - INTERVAL '30 days'
  `;

  if (userHistory[0]?.avg_amount) {
    const avgAmount = parseFloat(userHistory[0].avg_amount);
    const transactionAmount = parseFloat(transaction.amount);

    if (transactionAmount > avgAmount * 5) {
      score += 30;
      factors.push("Montant inhabituellement élevé");
    }

    if (transactionAmount > parseFloat(userHistory[0].max_amount) * 1.5) {
      score += 20;
      factors.push("Dépasse le maximum historique");
    }
  }

  // 2. Analyse de fréquence (transactions trop rapprochées)
  const recentTransactions = await sql`
    SELECT COUNT(*) as recent_count
    FROM transactions 
    WHERE user_id = ${userId} 
    AND created_at > NOW() - INTERVAL '10 minutes'
  `;

  if (parseInt(recentTransactions[0].recent_count) > 3) {
    score += 25;
    factors.push("Fréquence de transactions élevée");
  }

  // 3. Analyse géographique (si disponible)
  const timeOfDay = new Date().getHours();
  if (timeOfDay < 6 || timeOfDay > 23) {
    score += 10;
    factors.push("Transaction à une heure inhabituelle");
  }

  // 4. Analyse des patterns de compte
  const accountPattern = await sql`
    SELECT 
      COUNT(DISTINCT mobile_money_account_id) as mobile_accounts,
      COUNT(DISTINCT category_id) as categories_used
    FROM transactions 
    WHERE user_id = ${userId} 
    AND created_at > NOW() - INTERVAL '7 days'
  `;

  // 5. Analyse des marchands (pour cartes virtuelles)
  if (transaction.merchant) {
    const merchantHistory = await sql`
      SELECT COUNT(*) as merchant_count
      FROM transactions 
      WHERE user_id = ${userId} 
      AND title ILIKE ${"%" + transaction.merchant + "%"}
    `;

    if (parseInt(merchantHistory[0].merchant_count) === 0) {
      score += 15;
      factors.push("Nouveau marchand");
    }
  }

  // 6. Analyse de vitesse de saisie (simulation)
  if (transaction.inputSpeed && transaction.inputSpeed < 100) {
    score += 10;
    factors.push("Saisie très rapide - possible bot");
  }

  // Déterminer le niveau de risque
  let riskLevel = "low";
  let recommendation = "Autoriser";

  if (score >= 70) {
    riskLevel = "high";
    recommendation = "Bloquer et demander vérification";
  } else if (score >= 40) {
    riskLevel = "medium";
    recommendation = "Demander authentification supplémentaire";
  } else if (score >= 20) {
    riskLevel = "low-medium";
    recommendation = "Surveiller de près";
  }

  return {
    score,
    riskLevel,
    factors,
    recommendation,
  };
}
