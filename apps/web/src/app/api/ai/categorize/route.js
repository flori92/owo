import sql from "@/app/api/utils/sql";

// POST /api/ai/categorize - AI-powered transaction categorization
export async function POST(request) {
  try {
    const body = await request.json();
    const { title, description, amount, type } = body;

    if (!title || !type) {
      return Response.json(
        { error: "Title and type are required" },
        { status: 400 },
      );
    }

    // Get available categories for the transaction type
    const categories = await sql`
      SELECT id, name, icon 
      FROM transaction_categories 
      WHERE type = ${type}
      ORDER BY name
    `;

    // Prepare context for AI
    const categoryList = categories
      .map((cat) => `${cat.id}: ${cat.name}`)
      .join("\n");
    const transactionText = `${title} ${description || ""}`.trim();

    // Call Claude Sonnet 4 for categorization
    const aiResponse = await fetch("/integrations/anthropic-claude-sonnet-4/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content: `You are a financial transaction categorization expert for West African mobile money transactions (Benin context). 
            Analyze transaction titles and descriptions to categorize them accurately.
            
            Available categories:
            ${categoryList}
            
            Consider local context like:
            - SBEE (Société Béninoise d'Énergie Électrique) = utilities/bills
            - Mobile Money providers: MTN Mobile Money, Moov Money, Celtiis Cash
            - Common French/local terms used in Benin
            - Local markets, transport, and business practices
            
            Return only the category ID number that best matches the transaction.`,
          },
          {
            role: "user",
            content: `Categorize this ${type} transaction:
            Title: "${title}"
            Description: "${description || "None"}"
            Amount: ${Math.abs(amount || 0)} FCFA
            
            Respond with only the category ID number.`,
          },
        ],
        json_schema: {
          name: "transaction_categorization",
          schema: {
            type: "object",
            properties: {
              categoryId: {
                type: "number",
                description:
                  "The ID of the most appropriate category for this transaction",
              },
              confidence: {
                type: "number",
                minimum: 0,
                maximum: 1,
                description:
                  "Confidence score between 0 and 1 for the categorization",
              },
              reasoning: {
                type: "string",
                description:
                  "Brief explanation for why this category was chosen",
              },
            },
            required: ["categoryId", "confidence", "reasoning"],
            additionalProperties: false,
          },
        },
      }),
    });

    if (!aiResponse.ok) {
      console.error("AI categorization failed:", await aiResponse.text());
      // Fallback to keyword-based categorization
      return fallbackCategorization(title, description, type, categories);
    }

    const result = await aiResponse.json();
    const aiResult = JSON.parse(result.choices[0].message.content);

    // Validate that the returned category ID exists
    const selectedCategory = categories.find(
      (cat) => cat.id === aiResult.categoryId,
    );

    if (!selectedCategory) {
      console.warn("AI returned invalid category ID, falling back");
      return fallbackCategorization(title, description, type, categories);
    }

    return Response.json({
      categoryId: aiResult.categoryId,
      categoryName: selectedCategory.name,
      confidence: aiResult.confidence,
      reasoning: aiResult.reasoning,
      isAiCategorized: true,
    });
  } catch (error) {
    console.error("Error in AI categorization:", error);

    // Fallback to simple categorization
    try {
      const body = await request.json();
      const { title, description, type } = body;

      const categories = await sql`
        SELECT id, name, icon 
        FROM transaction_categories 
        WHERE type = ${type}
        ORDER BY name
      `;

      return fallbackCategorization(title, description, type, categories);
    } catch (fallbackError) {
      return Response.json({ error: "Categorization failed" }, { status: 500 });
    }
  }
}

// Fallback keyword-based categorization
function fallbackCategorization(title, description, type, categories) {
  const text = `${title} ${description || ""}`.toLowerCase();

  if (type === "expense") {
    const keywords = {
      1: [
        "supermarché",
        "alimentation",
        "nourriture",
        "restaurant",
        "café",
        "marché",
        "food",
        "eat",
      ], // Alimentation
      2: ["taxi", "transport", "bus", "moto", "carburant", "essence", "voyage"], // Transport
      3: ["shopping", "achat", "magasin", "boutique", "vêtements", "clothes"], // Shopping
      4: [
        "facture",
        "électricité",
        "eau",
        "gaz",
        "loyer",
        "sbee",
        "bill",
        "utilities",
      ], // Factures
      5: [
        "téléphone",
        "internet",
        "communication",
        "recharge",
        "crédit",
        "phone",
      ], // Communications
      6: [
        "divertissement",
        "cinéma",
        "jeu",
        "sport",
        "loisir",
        "entertainment",
      ], // Divertissement
      7: ["santé", "médecin", "pharmacie", "hospital", "health"], // Santé
      8: ["éducation", "école", "formation", "course", "education"], // Education
    };

    for (const [categoryId, words] of Object.entries(keywords)) {
      if (words.some((word) => text.includes(word))) {
        const category = categories.find(
          (cat) => cat.id === parseInt(categoryId),
        );
        if (category) {
          return Response.json({
            categoryId: parseInt(categoryId),
            categoryName: category.name,
            confidence: 0.7,
            reasoning: "Catégorisation basée sur mots-clés",
            isAiCategorized: false,
          });
        }
      }
    }
  } else if (type === "income") {
    if (text.includes("salaire") || text.includes("salary")) {
      const category = categories.find((cat) => cat.name === "Salaire");
      if (category) {
        return Response.json({
          categoryId: category.id,
          categoryName: category.name,
          confidence: 0.8,
          reasoning: "Mot-clé salaire détecté",
          isAiCategorized: false,
        });
      }
    }

    if (
      text.includes("freelance") ||
      text.includes("projet") ||
      text.includes("project")
    ) {
      const category = categories.find((cat) => cat.name === "Freelance");
      if (category) {
        return Response.json({
          categoryId: category.id,
          categoryName: category.name,
          confidence: 0.8,
          reasoning: "Travail freelance détecté",
          isAiCategorized: false,
        });
      }
    }
  }

  // Default to first category if no match found
  const defaultCategory = categories[0];
  return Response.json({
    categoryId: defaultCategory?.id || null,
    categoryName: defaultCategory?.name || "Non catégorisé",
    confidence: 0.3,
    reasoning: "Aucun mot-clé correspondant trouvé",
    isAiCategorized: false,
  });
}
