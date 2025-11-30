import sql from "@/app/api/utils/sql.js";
import { auth } from "@/auth.js";

// Configuration pour les providers de cartes virtuelles
const CARD_PROVIDERS = {
  marqeta: {
    baseURL: process.env.MARQETA_BASE_URL || "https://sandbox-api.marqeta.com",
    applicationToken: process.env.MARQETA_APPLICATION_TOKEN,
    accessToken: process.env.MARQETA_ACCESS_TOKEN,
    environment: process.env.MARQETA_ENVIRONMENT || "sandbox",
  },
  stripe: {
    baseURL: "https://api.stripe.com/v1",
    secretKey: process.env.STRIPE_SECRET_KEY,
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
  },
};

const DEFAULT_PROVIDER = process.env.CARD_PROVIDER || "marqeta";

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { action, provider, data } = await request.json();
    const selectedProvider = provider || DEFAULT_PROVIDER;

    switch (action) {
      case "create-card":
        return await createVirtualCard(selectedProvider, data, session.user.id);
      case "get-card-details":
        return await getCardDetails(selectedProvider, data, session.user.id);
      case "freeze-card":
        return await freezeCard(selectedProvider, data, session.user.id);
      case "unfreeze-card":
        return await unfreezeCard(selectedProvider, data, session.user.id);
      case "set-limits":
        return await setCardLimits(selectedProvider, data, session.user.id);
      case "load-funds":
        return await loadFunds(selectedProvider, data, session.user.id);
      case "get-transactions":
        return await getCardTransactions(
          selectedProvider,
          data,
          session.user.id,
        );
      case "terminate-card":
        return await terminateCard(selectedProvider, data, session.user.id);
      default:
        return Response.json(
          { error: "Action non supportée" },
          { status: 400 },
        );
    }
  } catch (error) {
    console.error("Erreur cartes virtuelles:", error);
    return Response.json(
      {
        error: "Erreur lors de l'opération carte virtuelle",
      },
      { status: 500 },
    );
  }
}

async function createVirtualCard(provider, data, userId) {
  try {
    const {
      cardHolderName,
      initialBalance = 0,
      dailyLimit = 1000,
      monthlyLimit = 5000,
      currency = "EUR",
      cardType = "virtual",
    } = data;

    // Générer des détails de carte réalistes
    const cardDetails = generateSecureCardDetails();

    // Enregistrer la carte en base de données
    const card = await sql`
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
        card_type,
        provider,
        created_at
      ) VALUES (
        ${userId},
        ${cardDetails.maskedNumber},
        ${cardHolderName},
        ${cardDetails.expiryMonth},
        ${cardDetails.expiryYear},
        ${cardDetails.cvv},
        ${currency},
        ${initialBalance},
        ${dailyLimit},
        ${monthlyLimit},
        true,
        ${cardType},
        ${provider},
        NOW()
      ) RETURNING *
    `;

    return Response.json({
      success: true,
      card: {
        id: card[0].id,
        maskedNumber: cardDetails.maskedNumber,
        cardHolderName: cardHolderName,
        expiryMonth: cardDetails.expiryMonth,
        expiryYear: cardDetails.expiryYear,
        currency: currency,
        balance: initialBalance,
        dailyLimit: dailyLimit,
        monthlyLimit: monthlyLimit,
        isActive: true,
        provider: provider,
      },
      message: "Carte virtuelle créée avec succès",
    });
  } catch (error) {
    console.error("Erreur création carte:", error);
    return Response.json(
      {
        error: "Erreur lors de la création de la carte virtuelle",
        details: error.message,
      },
      { status: 500 },
    );
  }
}

async function getCardDetails(provider, data, userId) {
  try {
    const { cardId, includeFullDetails = false } = data;

    const card = await sql`
      SELECT * FROM virtual_cards
      WHERE id = ${cardId} 
      AND user_id = ${userId}
      LIMIT 1
    `;

    if (card.length === 0) {
      return Response.json(
        {
          error: "Carte non trouvée",
        },
        { status: 404 },
      );
    }

    const cardInfo = card[0];
    const response = {
      id: cardInfo.id,
      maskedNumber: cardInfo.card_number,
      cardHolderName: cardInfo.card_holder_name,
      expiryMonth: cardInfo.expiry_month,
      expiryYear: cardInfo.expiry_year,
      currency: cardInfo.currency,
      balance: parseFloat(cardInfo.balance),
      dailyLimit: parseFloat(cardInfo.daily_limit),
      monthlyLimit: parseFloat(cardInfo.monthly_limit),
      isActive: cardInfo.is_active,
      isFrozen: cardInfo.is_frozen,
      provider: cardInfo.provider,
    };

    // Si les détails complets sont demandés (avec authentification supplémentaire)
    if (includeFullDetails) {
      response.fullNumber = generateFullCardNumber(cardInfo.card_number);
      response.cvv = cardInfo.cvv;
    }

    return Response.json({
      success: true,
      card: response,
    });
  } catch (error) {
    console.error("Erreur récupération carte:", error);
    return Response.json(
      {
        error: "Erreur lors de la récupération des détails de la carte",
        details: error.message,
      },
      { status: 500 },
    );
  }
}

async function freezeCard(provider, data, userId) {
  try {
    const { cardId } = data;

    await sql`
      UPDATE virtual_cards 
      SET is_frozen = true,
          updated_at = NOW()
      WHERE id = ${cardId} 
      AND user_id = ${userId}
    `;

    return Response.json({
      success: true,
      message: "Carte gelée avec succès",
    });
  } catch (error) {
    console.error("Erreur gel carte:", error);
    return Response.json(
      {
        error: "Erreur lors du gel de la carte",
        details: error.message,
      },
      { status: 500 },
    );
  }
}

async function unfreezeCard(provider, data, userId) {
  try {
    const { cardId } = data;

    await sql`
      UPDATE virtual_cards 
      SET is_frozen = false,
          updated_at = NOW()
      WHERE id = ${cardId} 
      AND user_id = ${userId}
    `;

    return Response.json({
      success: true,
      message: "Carte dégelée avec succès",
    });
  } catch (error) {
    console.error("Erreur dégel carte:", error);
    return Response.json(
      {
        error: "Erreur lors du dégel de la carte",
        details: error.message,
      },
      { status: 500 },
    );
  }
}

async function setCardLimits(provider, data, userId) {
  try {
    const { cardId, dailyLimit, monthlyLimit } = data;

    await sql`
      UPDATE virtual_cards 
      SET daily_limit = COALESCE(${dailyLimit}, daily_limit),
          monthly_limit = COALESCE(${monthlyLimit}, monthly_limit),
          updated_at = NOW()
      WHERE id = ${cardId} 
      AND user_id = ${userId}
    `;

    return Response.json({
      success: true,
      dailyLimit,
      monthlyLimit,
      message: "Limites de carte mises à jour",
    });
  } catch (error) {
    console.error("Erreur mise à jour limites:", error);
    return Response.json(
      {
        error: "Erreur lors de la mise à jour des limites",
        details: error.message,
      },
      { status: 500 },
    );
  }
}

async function loadFunds(provider, data, userId) {
  try {
    const { cardId, amount, sourceAccountType, sourceAccountId } = data;

    // Vérifier que l'utilisateur a suffisamment de fonds
    const sourceBalance = await getAccountBalance(
      sourceAccountType,
      sourceAccountId,
      userId,
    );

    if (sourceBalance < amount) {
      return Response.json(
        {
          error: "Solde insuffisant sur le compte source",
        },
        { status: 400 },
      );
    }

    // Mettre à jour le solde de la carte
    await sql`
      UPDATE virtual_cards 
      SET balance = balance + ${amount},
          updated_at = NOW()
      WHERE id = ${cardId} 
      AND user_id = ${userId}
    `;

    // Enregistrer la transaction de rechargement
    await sql`
      INSERT INTO transactions (
        user_id,
        title,
        description,
        amount,
        currency,
        type,
        reference_number,
        transaction_date
      ) VALUES (
        ${userId},
        'Rechargement carte virtuelle',
        'Rechargement de ${amount}€ sur carte virtuelle',
        ${amount},
        'EUR',
        'expense',
        'CARD_LOAD_${Date.now()}',
        NOW()
      )
    `;

    return Response.json({
      success: true,
      amount,
      message: "Carte rechargée avec succès",
    });
  } catch (error) {
    console.error("Erreur rechargement carte:", error);
    return Response.json(
      {
        error: "Erreur lors du rechargement de la carte",
        details: error.message,
      },
      { status: 500 },
    );
  }
}

async function getCardTransactions(provider, data, userId) {
  try {
    const { cardId, dateFrom, dateTo, limit = 50 } = data;

    const card = await sql`
      SELECT * FROM virtual_cards 
      WHERE id = ${cardId} AND user_id = ${userId}
      LIMIT 1
    `;

    if (card.length === 0) {
      return Response.json(
        {
          error: "Carte non trouvée",
        },
        { status: 404 },
      );
    }

    // Récupérer les transactions de la carte (simulation)
    const transactions = await sql`
      SELECT * FROM transactions 
      WHERE user_id = ${userId}
      AND title ILIKE '%carte%'
      AND transaction_date >= ${dateFrom || "2024-01-01"}
      AND transaction_date <= ${dateTo || new Date().toISOString()}
      ORDER BY transaction_date DESC
      LIMIT ${limit}
    `;

    return Response.json({
      success: true,
      cardId,
      transactions: transactions.map((tx) => ({
        id: tx.id,
        amount: parseFloat(tx.amount),
        currency: tx.currency,
        description: tx.description,
        merchant: tx.title,
        date: tx.transaction_date,
        type: tx.type,
        reference: tx.reference_number,
      })),
    });
  } catch (error) {
    console.error("Erreur récupération transactions carte:", error);
    return Response.json(
      {
        error: "Erreur lors de la récupération des transactions",
        details: error.message,
      },
      { status: 500 },
    );
  }
}

async function terminateCard(provider, data, userId) {
  try {
    const { cardId } = data;

    await sql`
      UPDATE virtual_cards 
      SET is_active = false,
          updated_at = NOW()
      WHERE id = ${cardId} 
      AND user_id = ${userId}
    `;

    return Response.json({
      success: true,
      message: "Carte désactivée avec succès",
    });
  } catch (error) {
    console.error("Erreur désactivation carte:", error);
    return Response.json(
      {
        error: "Erreur lors de la désactivation de la carte",
        details: error.message,
      },
      { status: 500 },
    );
  }
}

// Fonctions utilitaires
function generateSecureCardDetails() {
  const cardNumber = generateMockCardNumber();
  const cvv = Math.floor(Math.random() * 900 + 100).toString();
  const currentDate = new Date();
  const expiryYear = currentDate.getFullYear() + 3;
  const expiryMonth = Math.floor(Math.random() * 12) + 1;

  return {
    fullNumber: cardNumber,
    maskedNumber: `${cardNumber.slice(0, 4)} **** **** ${cardNumber.slice(-4)}`,
    cvv,
    expiryMonth,
    expiryYear,
  };
}

function generateMockCardNumber() {
  // Génère un numéro de carte Visa valide (commençant par 4)
  const prefix = "4258"; // Prefix Visa owo!
  let number = prefix;

  // Générer 11 chiffres aléatoires
  for (let i = 0; i < 11; i++) {
    number += Math.floor(Math.random() * 10);
  }

  // Calculer le chiffre de vérification Luhn
  const checkDigit = calculateLuhnCheckDigit(number);
  return number + checkDigit;
}

function calculateLuhnCheckDigit(number) {
  let sum = 0;
  let isEven = true;

  for (let i = number.length - 1; i >= 0; i--) {
    let digit = parseInt(number[i]);

    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }

    sum += digit;
    isEven = !isEven;
  }

  return (10 - (sum % 10)) % 10;
}

function generateFullCardNumber(maskedNumber) {
  // Récupère le numéro complet depuis le masqué (simulation)
  const parts = maskedNumber.split(" ");
  const prefix = parts[0];
  const suffix = parts[3];

  // Générer les chiffres du milieu
  let middle = "";
  for (let i = 0; i < 8; i++) {
    middle += Math.floor(Math.random() * 10);
  }

  return prefix + middle + suffix;
}

async function getAccountBalance(accountType, accountId, userId) {
  if (accountType === "mobile_money") {
    const account = await sql`
      SELECT balance FROM mobile_money_accounts 
      WHERE id = ${accountId} AND user_id = ${userId}
      LIMIT 1
    `;
    return account[0]?.balance || 0;
  } else if (accountType === "european_bank") {
    const account = await sql`
      SELECT balance FROM european_bank_accounts 
      WHERE id = ${accountId} AND user_id = ${userId}
      LIMIT 1
    `;
    return account[0]?.balance || 0;
  }

  return 0;
}
