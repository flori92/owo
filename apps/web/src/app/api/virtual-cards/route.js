import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return Response.json({ error: "User ID is required" }, { status: 400 });
    }

    // Get user's virtual cards
    const cards = await sql`
      SELECT 
        id,
        card_number,
        card_holder_name,
        expiry_month,
        expiry_year,
        currency,
        balance,
        daily_limit,
        monthly_limit,
        is_active,
        is_frozen,
        card_type,
        provider,
        created_at,
        updated_at
      FROM virtual_cards 
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `;

    // Don't send CVV in GET requests for security
    return Response.json(cards);
  } catch (error) {
    console.error("Error fetching virtual cards:", error);
    return Response.json(
      { error: "Failed to fetch virtual cards" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      userId,
      cardHolderName,
      currency = "EUR",
      dailyLimit = 1000.0,
      monthlyLimit = 5000.0,
    } = body;

    if (!userId || !cardHolderName) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Generate card details
    const cardNumber = generateCardNumber();
    const cvv = generateCVV();
    const expiryDate = generateExpiryDate();

    // Create virtual card
    const [card] = await sql`
      INSERT INTO virtual_cards (
        user_id,
        card_number,
        card_holder_name,
        expiry_month,
        expiry_year,
        cvv,
        currency,
        balance,
        daily_limit,
        monthly_limit,
        is_active,
        is_frozen,
        card_type,
        provider,
        created_at,
        updated_at
      ) VALUES (
        ${userId},
        ${cardNumber},
        ${cardHolderName.toUpperCase()},
        ${expiryDate.month},
        ${expiryDate.year},
        ${cvv},
        ${currency},
        0.00,
        ${dailyLimit},
        ${monthlyLimit},
        true,
        false,
        'virtual',
        'owo_visa',
        NOW(),
        NOW()
      ) RETURNING *
    `;

    return Response.json({
      success: true,
      card: {
        ...card,
        // Include sensitive data only on creation
        cardNumber: formatCardNumber(card.card_number),
        cvv: card.cvv,
      },
    });
  } catch (error) {
    console.error("Error creating virtual card:", error);
    return Response.json(
      { error: "Failed to create virtual card" },
      { status: 500 },
    );
  }
}

// Helper functions
function generateCardNumber() {
  // Generate a Visa-style card number (starts with 5258)
  const prefix = "5258";
  let number = prefix;

  // Generate 12 more digits
  for (let i = 0; i < 12; i++) {
    number += Math.floor(Math.random() * 10);
  }

  return number;
}

function generateCVV() {
  return Math.floor(Math.random() * 900 + 100).toString();
}

function generateExpiryDate() {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const futureYear = currentYear + 4; // Card expires in 4 years

  return {
    month: Math.floor(Math.random() * 12) + 1,
    year: futureYear,
  };
}

function formatCardNumber(cardNumber) {
  return cardNumber.replace(/(.{4})/g, "$1 ").trim();
}
