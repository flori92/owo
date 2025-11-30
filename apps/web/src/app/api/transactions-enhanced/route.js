import sql from "@/app/api/utils/sql";
import { auth } from "@/auth.js";
import { createSystemNotification } from "../notifications/route.js";

export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");
    const category = searchParams.get("category");
    const type = searchParams.get("type");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const search = searchParams.get("search");

    let whereClause = `WHERE user_id = $1`;
    const params = [session.user.id];
    let paramIndex = 2;

    if (category) {
      whereClause += ` AND category_id = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    if (type) {
      whereClause += ` AND type = $${paramIndex}`;
      params.push(type);
      paramIndex++;
    }

    if (startDate) {
      whereClause += ` AND transaction_date >= $${paramIndex}`;
      params.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      whereClause += ` AND transaction_date <= $${paramIndex}`;
      params.push(endDate);
      paramIndex++;
    }

    if (search) {
      whereClause += ` AND (LOWER(title) LIKE LOWER($${paramIndex}) OR LOWER(description) LIKE LOWER($${paramIndex}))`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    const transactions = await sql(
      `SELECT 
        t.*, 
        tc.name as category_name, 
        tc.color as category_color,
        tc.icon as category_icon,
        mma.provider as mobile_money_provider,
        fa.fraud_score,
        fa.risk_level,
        fa.factors as fraud_factors
      FROM transactions t
      LEFT JOIN transaction_categories tc ON t.category_id = tc.id
      LEFT JOIN mobile_money_accounts mma ON t.mobile_money_account_id = mma.id
      LEFT JOIN fraud_analyses fa ON fa.transaction_data->>'transactionId' = t.id::text
      ${whereClause}
      ORDER BY t.transaction_date DESC 
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, limit, offset],
    );

    return Response.json({
      success: true,
      transactions: transactions.map((tx) => ({
        id: tx.id,
        title: tx.title,
        description: tx.description,
        amount: parseFloat(tx.amount),
        currency: tx.currency,
        type: tx.type,
        category: tx.category_name,
        categoryColor: tx.category_color,
        categoryIcon: tx.category_icon,
        provider: tx.mobile_money_provider,
        referenceNumber: tx.reference_number,
        transactionDate: tx.transaction_date,
        isAiCategorized: tx.is_ai_categorized,
        aiConfidenceScore: tx.ai_confidence_score
          ? parseFloat(tx.ai_confidence_score)
          : null,
        fraudScore: tx.fraud_score ? parseFloat(tx.fraud_score) : null,
        riskLevel: tx.risk_level,
        fraudFactors: tx.fraud_factors,
        createdAt: tx.created_at,
      })),
      hasMore: transactions.length === limit,
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return Response.json(
      { error: "Failed to fetch transactions" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      case "create":
        return await createTransaction(data, session.user.id);
      case "analyze-fraud":
        return await analyzeExistingTransaction(data, session.user.id);
      case "bulk-categorize":
        return await bulkCategorizeTransactions(data, session.user.id);
      default:
        return Response.json(
          { error: "Action non supportée" },
          { status: 400 },
        );
    }
  } catch (error) {
    console.error("Error in transactions API:", error);
    return Response.json(
      { error: "Failed to process request" },
      { status: 500 },
    );
  }
}

async function createTransaction(data, userId) {
  try {
    const {
      title,
      description,
      amount,
      currency = "FCFA",
      type,
      categoryId,
      mobileMoneyAccountId,
      referenceNumber,
      transactionDate = new Date().toISOString(),
      skipFraudCheck = false,
    } = data;

    // Validation des champs requis
    if (!title || !amount || !type) {
      return Response.json(
        { error: "Title, amount, and type are required" },
        { status: 400 },
      );
    }

    let fraudAnalysis = null;

    // Analyse de fraude en temps réel (sauf si explicitement désactivée)
    if (!skipFraudCheck) {
      fraudAnalysis = await analyzeTransactionForFraud(
        {
          title,
          amount: parseFloat(amount),
          currency,
          type,
          categoryId,
          merchant: extractMerchantFromTitle(title),
        },
        userId,
      );

      // Si le score de fraude est trop élevé, bloquer la transaction
      if (fraudAnalysis.score >= 70) {
        await createSystemNotification(userId, "security_alert", {
          message: `Transaction suspecte bloquée: ${title} (${amount} ${currency})`,
          fraudScore: fraudAnalysis.score,
          factors: fraudAnalysis.factors,
        });

        return Response.json(
          {
            error: "Transaction bloquée pour des raisons de sécurité",
            fraudAnalysis: {
              score: fraudAnalysis.score,
              riskLevel: fraudAnalysis.riskLevel,
              factors: fraudAnalysis.factors,
              recommendation: fraudAnalysis.recommendation,
            },
            requiresVerification: true,
          },
          { status: 403 },
        );
      }
    }

    // Générer un numéro de référence si non fourni
    const finalReferenceNumber =
      referenceNumber ||
      `OWO-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // Créer la transaction avec l'analyse de fraude
    const transaction = await sql`
      INSERT INTO transactions (
        user_id,
        mobile_money_account_id,
        category_id,
        title,
        description,
        amount,
        currency,
        type,
        reference_number,
        transaction_date,
        ai_confidence_score,
        created_at
      ) VALUES (
        ${userId},
        ${mobileMoneyAccountId || null},
        ${categoryId || null},
        ${title},
        ${description || ""},
        ${amount},
        ${currency},
        ${type},
        ${finalReferenceNumber},
        ${transactionDate},
        ${fraudAnalysis ? 100 - fraudAnalysis.score : null},
        NOW()
      ) RETURNING *
    `;

    // Enregistrer l'analyse de fraude si elle a eu lieu
    if (fraudAnalysis) {
      await sql`
        INSERT INTO fraud_analyses (
          user_id,
          transaction_data,
          fraud_score,
          risk_level,
          factors,
          analyzed_at
        ) VALUES (
          ${userId},
          ${JSON.stringify({ transactionId: transaction[0].id, ...data })},
          ${fraudAnalysis.score},
          ${fraudAnalysis.riskLevel},
          ${fraudAnalysis.factors},
          NOW()
        )
      `;
    }

    // Catégorisation automatique par IA si pas de catégorie
    if (!categoryId) {
      const aiCategoryId = await categorizeTransactionWithAI(
        title,
        description || "",
        type,
      );
      if (aiCategoryId) {
        await sql`
          UPDATE transactions 
          SET category_id = ${aiCategoryId}, 
              is_ai_categorized = true,
              ai_confidence_score = 0.85
          WHERE id = ${transaction[0].id}
        `;
      }
    }

    // Mettre à jour le solde du compte si spécifié
    if (mobileMoneyAccountId) {
      await sql`
        UPDATE mobile_money_accounts 
        SET balance = balance + ${type === "expense" ? -Math.abs(amount) : Math.abs(amount)},
            last_sync_at = NOW()
        WHERE id = ${mobileMoneyAccountId} AND user_id = ${userId}
      `;
    }

    // Créer des notifications selon le type et le montant
    await createTransactionNotifications(transaction[0], userId, fraudAnalysis);

    return Response.json({
      success: true,
      transaction: {
        id: transaction[0].id,
        title: transaction[0].title,
        description: transaction[0].description,
        amount: parseFloat(transaction[0].amount),
        currency: transaction[0].currency,
        type: transaction[0].type,
        referenceNumber: transaction[0].reference_number,
        transactionDate: transaction[0].transaction_date,
        createdAt: transaction[0].created_at,
      },
      fraudAnalysis: fraudAnalysis
        ? {
            score: fraudAnalysis.score,
            riskLevel: fraudAnalysis.riskLevel,
            recommendation: fraudAnalysis.recommendation,
          }
        : null,
      message: "Transaction créée avec succès",
    });
  } catch (error) {
    console.error("Error creating transaction:", error);
    return Response.json(
      { error: "Failed to create transaction" },
      { status: 500 },
    );
  }
}

async function analyzeExistingTransaction(data, userId) {
  try {
    const { transactionId } = data;

    // Récupérer la transaction
    const transaction = await sql`
      SELECT * FROM transactions 
      WHERE id = ${transactionId} AND user_id = ${userId}
      LIMIT 1
    `;

    if (transaction.length === 0) {
      return Response.json(
        { error: "Transaction non trouvée" },
        { status: 404 },
      );
    }

    const tx = transaction[0];

    // Analyser la fraude
    const fraudAnalysis = await analyzeTransactionForFraud(
      {
        title: tx.title,
        amount: parseFloat(tx.amount),
        currency: tx.currency,
        type: tx.type,
        merchant: extractMerchantFromTitle(tx.title),
      },
      userId,
    );

    // Enregistrer l'analyse
    await sql`
      INSERT INTO fraud_analyses (
        user_id,
        transaction_data,
        fraud_score,
        risk_level,
        factors,
        analyzed_at
      ) VALUES (
        ${userId},
        ${JSON.stringify({ transactionId, reanalysis: true })},
        ${fraudAnalysis.score},
        ${fraudAnalysis.riskLevel},
        ${fraudAnalysis.factors},
        NOW()
      )
      ON CONFLICT (user_id, (transaction_data->>'transactionId')::integer) 
      DO UPDATE SET 
        fraud_score = EXCLUDED.fraud_score,
        risk_level = EXCLUDED.risk_level,
        factors = EXCLUDED.factors,
        analyzed_at = EXCLUDED.analyzed_at
    `;

    return Response.json({
      success: true,
      fraudAnalysis,
      message: "Analyse de fraude complétée",
    });
  } catch (error) {
    console.error("Error analyzing transaction:", error);
    return Response.json(
      { error: "Failed to analyze transaction" },
      { status: 500 },
    );
  }
}

async function bulkCategorizeTransactions(data, userId) {
  try {
    const { transactionIds, categoryId } = data;

    if (!transactionIds || !Array.isArray(transactionIds) || !categoryId) {
      return Response.json(
        { error: "Transaction IDs array and category ID required" },
        { status: 400 },
      );
    }

    // Mettre à jour les transactions
    const result = await sql`
      UPDATE transactions 
      SET category_id = ${categoryId},
          is_ai_categorized = false,
          updated_at = NOW()
      WHERE id = ANY(${transactionIds}) 
      AND user_id = ${userId}
    `;

    return Response.json({
      success: true,
      updated: result.count || transactionIds.length,
      message: `${result.count || transactionIds.length} transactions catégorisées`,
    });
  } catch (error) {
    console.error("Error bulk categorizing:", error);
    return Response.json(
      { error: "Failed to bulk categorize transactions" },
      { status: 500 },
    );
  }
}

// Fonction d'analyse de fraude améliorée
async function analyzeTransactionForFraud(transaction, userId) {
  const factors = [];
  let score = 0;

  try {
    // 1. Analyse du montant par rapport à l'historique
    const userHistory = await sql`
      SELECT 
        AVG(ABS(amount)) as avg_amount, 
        MAX(ABS(amount)) as max_amount, 
        COUNT(*) as total_transactions,
        STDDEV(ABS(amount)) as std_amount
      FROM transactions 
      WHERE user_id = ${userId} 
      AND created_at > NOW() - INTERVAL '30 days'
      AND type = ${transaction.type}
    `;

    if (userHistory[0]?.avg_amount) {
      const avgAmount = parseFloat(userHistory[0].avg_amount);
      const maxAmount = parseFloat(userHistory[0].max_amount);
      const stdAmount =
        parseFloat(userHistory[0].std_amount) || avgAmount * 0.5;
      const transactionAmount = Math.abs(parseFloat(transaction.amount));

      // Détection d'anomalies statistiques
      if (transactionAmount > avgAmount + 3 * stdAmount) {
        score += 25;
        factors.push("Montant statistiquement anormal");
      } else if (transactionAmount > avgAmount * 5) {
        score += 15;
        factors.push("Montant inhabituellement élevé");
      }

      if (transactionAmount > maxAmount * 1.5) {
        score += 20;
        factors.push("Dépasse largement le maximum historique");
      }
    }

    // 2. Analyse de fréquence et de timing
    const recentActivity = await sql`
      SELECT 
        COUNT(*) as recent_count,
        COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '5 minutes') as very_recent_count,
        AVG(amount) as recent_avg_amount
      FROM transactions 
      WHERE user_id = ${userId} 
      AND created_at > NOW() - INTERVAL '1 hour'
    `;

    if (parseInt(recentActivity[0].recent_count) > 10) {
      score += 20;
      factors.push("Activité très fréquente (>10 transactions/heure)");
    } else if (parseInt(recentActivity[0].very_recent_count) > 3) {
      score += 15;
      factors.push("Transactions très rapprochées");
    }

    // 3. Analyse temporelle avancée
    const now = new Date();
    const hour = now.getHours();
    const dayOfWeek = now.getDay();

    if (hour >= 2 && hour <= 5) {
      score += 15;
      factors.push("Transaction en pleine nuit");
    } else if (hour >= 23 || hour <= 1) {
      score += 8;
      factors.push("Transaction très tardive");
    }

    // Weekend + heures inhabituelles
    if ((dayOfWeek === 0 || dayOfWeek === 6) && (hour < 8 || hour > 22)) {
      score += 10;
      factors.push("Weekend à heures inhabituelles");
    }

    // 4. Analyse des patterns de marchands
    if (transaction.merchant) {
      const merchantHistory = await sql`
        SELECT 
          COUNT(*) as merchant_count,
          AVG(ABS(amount)) as avg_merchant_amount,
          MAX(created_at) as last_transaction
        FROM transactions 
        WHERE user_id = ${userId} 
        AND (title ILIKE ${"%" + transaction.merchant + "%"} OR description ILIKE ${"%" + transaction.merchant + "%"})
      `;

      const merchantStats = merchantHistory[0];

      if (parseInt(merchantStats.merchant_count) === 0) {
        score += 12;
        factors.push("Nouveau marchand jamais utilisé");
      } else if (
        merchantStats.avg_merchant_amount &&
        Math.abs(transaction.amount) >
          parseFloat(merchantStats.avg_merchant_amount) * 3
      ) {
        score += 10;
        factors.push("Montant inhabituellement élevé pour ce marchand");
      }
    }

    // 5. Analyse de contenu textuel sophistiquée
    const suspiciousPatterns = [
      {
        pattern: /\b(test|verify|check|urgent|immediately)\b/i,
        score: 15,
        desc: "Mots-clés suspects",
      },
      {
        pattern: /\b(winner|lottery|prize|congratulations)\b/i,
        score: 25,
        desc: "Vocabulaire de fraude typique",
      },
      {
        pattern: /\b(click|link|verify account|suspended)\b/i,
        score: 20,
        desc: "Phishing potentiel",
      },
      {
        pattern: /\b(free|bonus|gift|gratuit)\b/i,
        score: 10,
        desc: "Offres suspectes",
      },
      { pattern: /[A-Z]{5,}/g, score: 8, desc: "Texte en majuscules excessif" },
      {
        pattern: /\b\d{4}\s?\d{4}\s?\d{4}\s?\d{4}\b/i,
        score: 30,
        desc: "Numéro de carte potentiel dans le texte",
      },
    ];

    const fullText = `${transaction.title} ${transaction.description || ""}`;

    for (const { pattern, score: patternScore, desc } of suspiciousPatterns) {
      if (pattern.test(fullText)) {
        score += patternScore;
        factors.push(desc);
      }
    }

    // 6. Analyse des montants ronds suspects
    const amount = Math.abs(parseFloat(transaction.amount));
    if (amount % 1000 === 0 && amount >= 10000) {
      score += 8;
      factors.push("Montant rond suspect");
    }

    // 7. Analyse de géolocalisation simulée (à implémenter avec de vraies données)
    // if (isUnusualLocation(transaction.location)) {
    //   score += 20;
    //   factors.push('Localisation inhabituelle');
    // }

    // 8. Analyse de vélocité des transactions
    const velocityCheck = await sql`
      SELECT COUNT(*) as count_last_hour,
             SUM(ABS(amount)) as total_amount_last_hour
      FROM transactions 
      WHERE user_id = ${userId} 
      AND created_at > NOW() - INTERVAL '1 hour'
      AND type = ${transaction.type}
    `;

    const hourlyTotal =
      parseFloat(velocityCheck[0].total_amount_last_hour) || 0;
    if (hourlyTotal + amount > 100000) {
      // Plus de 100k FCFA par heure
      score += 15;
      factors.push("Volume horaire excessif");
    }
  } catch (error) {
    console.error("Erreur analyse fraude avancée:", error);
    score += 5;
    factors.push("Erreur d'analyse - surveillance recommandée");
  }

  // Déterminer le niveau de risque avec plus de nuances
  let riskLevel = "low";
  let recommendation = "Autoriser";

  if (score >= 80) {
    riskLevel = "critical";
    recommendation = "Bloquer immédiatement et alerter";
  } else if (score >= 60) {
    riskLevel = "high";
    recommendation = "Bloquer et demander vérification forte";
  } else if (score >= 40) {
    riskLevel = "medium-high";
    recommendation = "Demander authentification supplémentaire";
  } else if (score >= 25) {
    riskLevel = "medium";
    recommendation = "Surveiller de près";
  } else if (score >= 15) {
    riskLevel = "low-medium";
    recommendation = "Surveillance légère";
  }

  return {
    score,
    riskLevel,
    factors,
    recommendation,
  };
}

async function createTransactionNotifications(
  transaction,
  userId,
  fraudAnalysis,
) {
  try {
    const amount = Math.abs(parseFloat(transaction.amount));
    const type = transaction.type;

    // Notification pour transactions importantes
    if (type === "expense" && amount > 50000) {
      await createSystemNotification(userId, "transaction_completed", {
        type: "dépense importante",
        amount,
        currency: transaction.currency,
        merchant: extractMerchantFromTitle(transaction.title),
        reference: transaction.reference_number,
      });
    } else if (type === "income" && amount > 25000) {
      await createSystemNotification(userId, "transaction_completed", {
        type: "revenus reçus",
        amount,
        currency: transaction.currency,
        reference: transaction.reference_number,
      });
    }

    // Notifications de sécurité basées sur l'analyse de fraude
    if (fraudAnalysis && fraudAnalysis.score >= 40) {
      const priority = fraudAnalysis.score >= 60 ? "urgent" : "high";

      await createSystemNotification(userId, "security_alert", {
        message: `Transaction surveillée: ${transaction.title} (Score de risque: ${fraudAnalysis.score})`,
        fraudScore: fraudAnalysis.score,
        factors: fraudAnalysis.factors,
        priority,
      });
    }
  } catch (error) {
    console.error("Erreur création notifications transaction:", error);
    // Ne pas faire échouer la transaction si les notifications échouent
  }
}

async function categorizeTransactionWithAI(title, description, type) {
  try {
    const text = `${title} ${description}`.toLowerCase();

    if (type === "expense") {
      // Catégories de dépenses avec mots-clés étendus
      const expenseKeywords = {
        1: [
          "supermarché",
          "alimentation",
          "nourriture",
          "restaurant",
          "café",
          "marché",
          "boulangerie",
          "épicerie",
        ], // Alimentation
        2: [
          "taxi",
          "transport",
          "bus",
          "moto",
          "carburant",
          "essence",
          "uber",
          "bolt",
          "voyage",
        ], // Transport
        3: [
          "shopping",
          "achat",
          "magasin",
          "boutique",
          "vêtements",
          "chaussures",
          "mode",
        ], // Shopping
        4: [
          "facture",
          "électricité",
          "eau",
          "gaz",
          "loyer",
          "sbee",
          "utilities",
          "charges",
        ], // Factures
        5: [
          "téléphone",
          "internet",
          "communication",
          "recharge",
          "crédit",
          "data",
          "wifi",
        ], // Communications
        6: [
          "divertissement",
          "cinéma",
          "jeu",
          "sport",
          "loisir",
          "concert",
          "théâtre",
        ], // Divertissement
      };

      for (const [categoryId, keywords] of Object.entries(expenseKeywords)) {
        if (keywords.some((keyword) => text.includes(keyword))) {
          return parseInt(categoryId);
        }
      }
    } else if (type === "income") {
      // Catégories de revenus
      if (
        text.includes("salaire") ||
        text.includes("salary") ||
        text.includes("paie")
      )
        return 10;
      if (
        text.includes("freelance") ||
        text.includes("projet") ||
        text.includes("mission")
      )
        return 11;
      if (
        text.includes("investissement") ||
        text.includes("dividende") ||
        text.includes("intérêt")
      )
        return 12;
      if (
        text.includes("cadeau") ||
        text.includes("gift") ||
        text.includes("don")
      )
        return 13;
      if (
        text.includes("vente") ||
        text.includes("business") ||
        text.includes("commerce")
      )
        return 14;
    }

    return null;
  } catch (error) {
    console.error("Erreur catégorisation IA:", error);
    return null;
  }
}

function extractMerchantFromTitle(title) {
  // Extraire le nom du marchand du titre de la transaction
  const patterns = [
    /(?:chez|at|@)\s+([A-Za-z0-9\s]+)/i,
    /([A-Za-z0-9\s]+)(?:\s+-\s+)/i,
    /^([A-Za-z0-9\s]+)/i,
  ];

  for (const pattern of patterns) {
    const match = title.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }

  return title.split(" ")[0]; // Fallback au premier mot
}
