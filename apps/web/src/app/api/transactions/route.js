import sql from "@/app/api/utils/sql";

// GET /api/transactions - List user transactions with filtering
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || 1; // Default to test user
    const type = searchParams.get("type"); // 'income' or 'expense'
    const categoryId = searchParams.get("categoryId");
    const search = searchParams.get("search");
    const limit = parseInt(searchParams.get("limit")) || 50;
    const offset = parseInt(searchParams.get("offset")) || 0;
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");

    // Build dynamic query
    let query = `
      SELECT 
        t.id,
        t.title,
        t.description,
        t.amount,
        t.currency,
        t.type,
        t.reference_number,
        t.transaction_date,
        t.is_ai_categorized,
        t.ai_confidence_score,
        tc.name as category_name,
        tc.color as category_color,
        tc.icon as category_icon,
        mma.provider as provider_name,
        mma.phone_number as provider_phone
      FROM transactions t
      LEFT JOIN transaction_categories tc ON t.category_id = tc.id
      LEFT JOIN mobile_money_accounts mma ON t.mobile_money_account_id = mma.id
      WHERE t.user_id = $1
    `;

    const params = [userId];
    let paramCount = 1;

    // Add filters
    if (type) {
      paramCount++;
      query += ` AND t.type = $${paramCount}`;
      params.push(type);
    }

    if (categoryId) {
      paramCount++;
      query += ` AND t.category_id = $${paramCount}`;
      params.push(categoryId);
    }

    if (search) {
      paramCount++;
      query += ` AND (
        LOWER(t.title) LIKE LOWER($${paramCount}) 
        OR LOWER(t.description) LIKE LOWER($${paramCount})
        OR LOWER(tc.name) LIKE LOWER($${paramCount})
      )`;
      params.push(`%${search}%`);
    }

    if (dateFrom) {
      paramCount++;
      query += ` AND t.transaction_date >= $${paramCount}`;
      params.push(dateFrom);
    }

    if (dateTo) {
      paramCount++;
      query += ` AND t.transaction_date <= $${paramCount}`;
      params.push(dateTo);
    }

    query += ` ORDER BY t.transaction_date DESC`;

    if (limit > 0) {
      paramCount++;
      query += ` LIMIT $${paramCount}`;
      params.push(limit);
    }

    if (offset > 0) {
      paramCount++;
      query += ` OFFSET $${paramCount}`;
      params.push(offset);
    }

    const transactions = await sql(query, params);

    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) as total
      FROM transactions t
      LEFT JOIN transaction_categories tc ON t.category_id = tc.id
      WHERE t.user_id = $1
    `;
    const countParams = [userId];
    let countParamCount = 1;

    if (type) {
      countParamCount++;
      countQuery += ` AND t.type = $${countParamCount}`;
      countParams.push(type);
    }

    if (categoryId) {
      countParamCount++;
      countQuery += ` AND t.category_id = $${countParamCount}`;
      countParams.push(categoryId);
    }

    if (search) {
      countParamCount++;
      countQuery += ` AND (
        LOWER(t.title) LIKE LOWER($${countParamCount}) 
        OR LOWER(t.description) LIKE LOWER($${countParamCount})
        OR LOWER(tc.name) LIKE LOWER($${countParamCount})
      )`;
      countParams.push(`%${search}%`);
    }

    if (dateFrom) {
      countParamCount++;
      countQuery += ` AND t.transaction_date >= $${countParamCount}`;
      countParams.push(dateFrom);
    }

    if (dateTo) {
      countParamCount++;
      countQuery += ` AND t.transaction_date <= $${countParamCount}`;
      countParams.push(dateTo);
    }

    const countResult = await sql(countQuery, countParams);
    const total = parseInt(countResult[0].total);

    return Response.json({
      transactions,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return Response.json(
      { error: "Failed to fetch transactions" },
      { status: 500 },
    );
  }
}

// POST /api/transactions - Create a new transaction
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      userId = 1, // Default to test user
      mobileMoneyAccountId,
      categoryId,
      title,
      description,
      amount,
      currency = "FCFA",
      type,
      referenceNumber,
      transactionDate,
    } = body;

    // Validate required fields
    if (!title || !amount || !type || !transactionDate) {
      return Response.json(
        {
          error:
            "Missing required fields: title, amount, type, transactionDate",
        },
        { status: 400 },
      );
    }

    // Validate type
    if (!["income", "expense"].includes(type)) {
      return Response.json(
        { error: 'Type must be either "income" or "expense"' },
        { status: 400 },
      );
    }

    // Validate amount
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount === 0) {
      return Response.json(
        { error: "Amount must be a valid non-zero number" },
        { status: 400 },
      );
    }

    // For expenses, make amount negative
    const finalAmount =
      type === "expense" && numAmount > 0 ? -numAmount : numAmount;

    // Insert transaction
    const result = await sql`
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
        is_ai_categorized
      ) VALUES (
        ${userId},
        ${mobileMoneyAccountId || null},
        ${categoryId || null},
        ${title},
        ${description || null},
        ${finalAmount},
        ${currency},
        ${type},
        ${referenceNumber || null},
        ${transactionDate},
        ${categoryId ? false : true}
      )
      RETURNING *
    `;

    const transaction = result[0];

    // If no category provided, use AI categorization (mock for now)
    if (!categoryId) {
      // Here we would call an AI service to categorize the transaction
      // For now, we'll use simple keyword matching
      const aiCategoryId = await categorizeTransactionWithAI(
        title,
        description,
        type,
      );
      if (aiCategoryId) {
        await sql`
          UPDATE transactions 
          SET category_id = ${aiCategoryId}, 
              is_ai_categorized = true,
              ai_confidence_score = 0.85
          WHERE id = ${transaction.id}
        `;
        transaction.category_id = aiCategoryId;
        transaction.is_ai_categorized = true;
        transaction.ai_confidence_score = 0.85;
      }
    }

    // Update mobile money account balance if provided
    if (mobileMoneyAccountId) {
      await sql`
        UPDATE mobile_money_accounts 
        SET balance = balance + ${finalAmount},
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ${mobileMoneyAccountId} AND user_id = ${userId}
      `;
    }

    // Get the complete transaction with category and provider info
    const completeTransaction = await sql`
      SELECT 
        t.*,
        tc.name as category_name,
        tc.color as category_color,
        tc.icon as category_icon,
        mma.provider as provider_name,
        mma.phone_number as provider_phone
      FROM transactions t
      LEFT JOIN transaction_categories tc ON t.category_id = tc.id
      LEFT JOIN mobile_money_accounts mma ON t.mobile_money_account_id = mma.id
      WHERE t.id = ${transaction.id}
    `;

    return Response.json(completeTransaction[0], { status: 201 });
  } catch (error) {
    console.error("Error creating transaction:", error);
    return Response.json(
      { error: "Failed to create transaction" },
      { status: 500 },
    );
  }
}

// Simple AI categorization function (mock implementation)
async function categorizeTransactionWithAI(title, description, type) {
  const text = `${title} ${description || ""}`.toLowerCase();

  if (type === "expense") {
    // Get expense categories
    const categories = await sql`
      SELECT id, name FROM transaction_categories 
      WHERE type = 'expense'
    `;

    // Simple keyword matching
    const keywords = {
      1: [
        "supermarché",
        "alimentation",
        "nourriture",
        "restaurant",
        "café",
        "marché",
      ], // Alimentation
      2: ["taxi", "transport", "bus", "moto", "carburant", "essence"], // Transport
      3: ["shopping", "achat", "magasin", "boutique", "vêtements"], // Shopping
      4: ["facture", "électricité", "eau", "gaz", "loyer", "sbee"], // Factures
      5: ["téléphone", "internet", "communication", "recharge", "crédit"], // Communications
      6: ["divertissement", "cinéma", "jeu", "sport", "loisir"], // Divertissement
    };

    for (const [categoryId, words] of Object.entries(keywords)) {
      if (words.some((word) => text.includes(word))) {
        return parseInt(categoryId);
      }
    }
  } else if (type === "income") {
    // Get income categories
    if (text.includes("salaire") || text.includes("salary")) return 10; // Salaire
    if (text.includes("freelance") || text.includes("projet")) return 11; // Freelance
    if (text.includes("investissement") || text.includes("dividende"))
      return 12; // Investissement
    if (text.includes("cadeau") || text.includes("gift")) return 13; // Cadeau
  }

  return null; // No category found
}
