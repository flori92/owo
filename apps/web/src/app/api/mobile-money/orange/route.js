import sql from "@/app/api/utils/sql.js";
import { auth } from "@/auth.js";

// Configuration Orange Money API
const ORANGE_CONFIG = {
  baseURL:
    process.env.ORANGE_API_BASE_URL ||
    "https://api.orange.com/orange-money-webpay/dev/v1",
  clientId: process.env.ORANGE_CLIENT_ID,
  clientSecret: process.env.ORANGE_CLIENT_SECRET,
  merchantKey: process.env.ORANGE_MERCHANT_KEY,
  environment: process.env.ORANGE_ENVIRONMENT || "sandbox",
};

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { action, data } = await request.json();

    switch (action) {
      case "request-payment":
        return await requestPayment(data, session.user.id);
      case "check-balance":
        return await checkBalance(data, session.user.id);
      case "send-money":
        return await sendMoney(data, session.user.id);
      case "payment-status":
        return await checkPaymentStatus(data, session.user.id);
      default:
        return Response.json(
          { error: "Action non supportée" },
          { status: 400 },
        );
    }
  } catch (error) {
    console.error("Erreur Orange Money:", error);
    return Response.json(
      {
        error: "Erreur lors de l'opération Orange Money",
      },
      { status: 500 },
    );
  }
}

async function getAuthToken() {
  try {
    const credentials = Buffer.from(
      `${ORANGE_CONFIG.clientId}:${ORANGE_CONFIG.clientSecret}`,
    ).toString("base64");

    const response = await fetch(`${ORANGE_CONFIG.baseURL}/oauth/token`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: "grant_type=client_credentials",
    });

    if (!response.ok) {
      throw new Error(`Erreur auth Orange: ${response.status}`);
    }

    const tokenData = await response.json();
    return tokenData.access_token;
  } catch (error) {
    console.error("Erreur authentification Orange:", error);
    throw error;
  }
}

async function requestPayment(data, userId) {
  try {
    const {
      phoneNumber,
      amount,
      currency = "XOF",
      orderId,
      returnUrl,
      cancelUrl,
      notifUrl,
    } = data;
    const token = await getAuthToken();

    // Générer un order_id unique si non fourni
    const orderIdFinal = orderId || generateOrderId();

    const paymentRequest = {
      merchant_key: ORANGE_CONFIG.merchantKey,
      currency,
      order_id: orderIdFinal,
      amount: parseInt(amount), // Orange attend un entier en centimes
      return_url: returnUrl || `${process.env.APP_URL}/payment/success`,
      cancel_url: cancelUrl || `${process.env.APP_URL}/payment/cancel`,
      notif_url: notifUrl || `${process.env.APP_URL}/api/webhooks/orange`,
      lang: "fr",
      reference: `OWO-${orderIdFinal}`,
    };

    const response = await fetch(`${ORANGE_CONFIG.baseURL}/webpayment`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(paymentRequest),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Erreur Orange payment: ${response.status} - ${errorData.message || "Unknown error"}`,
      );
    }

    const responseData = await response.json();

    // Enregistrer la transaction en base
    const transaction = await sql`
      INSERT INTO mobile_money_transactions (
        user_id,
        provider,
        type,
        reference_id,
        external_id,
        amount,
        currency,
        phone_number,
        status,
        orange_transaction_id,
        created_at
      ) VALUES (
        ${userId},
        'Orange',
        'request_payment',
        ${orderIdFinal},
        ${responseData.pay_token || ""},
        ${amount},
        ${currency},
        ${phoneNumber},
        'pending',
        ${responseData.pay_token || null},
        NOW()
      ) RETURNING *
    `;

    return Response.json({
      success: true,
      orderId: orderIdFinal,
      payToken: responseData.pay_token,
      paymentUrl: responseData.payment_url,
      transaction: transaction[0],
      message: "Demande de paiement Orange Money créée",
    });
  } catch (error) {
    console.error("Erreur request payment Orange:", error);
    return Response.json(
      {
        error: "Erreur lors de la demande de paiement Orange Money",
        details: error.message,
      },
      { status: 500 },
    );
  }
}

async function checkBalance(data, userId) {
  try {
    const { phoneNumber } = data;
    const token = await getAuthToken();

    // Orange Money n'expose pas directement l'API de consultation de solde
    // Cette fonctionnalité nécessiterait un partenariat spécifique avec Orange
    // Pour le moment, on simule ou on utilise les données stockées

    const account = await sql`
      SELECT * FROM mobile_money_accounts 
      WHERE user_id = ${userId} 
      AND provider = 'Orange Money' 
      AND phone_number = ${phoneNumber}
      LIMIT 1
    `;

    if (account.length === 0) {
      return Response.json(
        {
          error: "Compte Orange Money non trouvé",
        },
        { status: 404 },
      );
    }

    return Response.json({
      success: true,
      balance: account[0].balance,
      currency: account[0].currency,
      lastUpdate: account[0].last_sync_at,
      message: "Solde Orange Money (dernière synchronisation)",
    });
  } catch (error) {
    console.error("Erreur check balance Orange:", error);
    return Response.json(
      {
        error: "Erreur lors de la vérification du solde Orange Money",
        details: error.message,
      },
      { status: 500 },
    );
  }
}

async function sendMoney(data, userId) {
  try {
    const { phoneNumber, amount, currency = "XOF", message } = data;
    const token = await getAuthToken();

    // Orange Money Transfer API (nécessite des permissions spéciales)
    const transferId = generateOrderId();

    const transferRequest = {
      partner_id: ORANGE_CONFIG.merchantKey,
      transfer_id: transferId,
      amount: parseInt(amount),
      currency,
      receiving_msisdn: phoneNumber,
      reference: `OWO-TRANSFER-${transferId}`,
      message: message || "Transfert via owo!",
    };

    // Note: Cette API nécessite généralement un accord commercial avec Orange
    // Pour l'instant, on simule la réponse
    const mockResponse = {
      transfer_id: transferId,
      status: "pending",
      message: "Transfert initié avec succès",
    };

    // Enregistrer la transaction
    const transaction = await sql`
      INSERT INTO mobile_money_transactions (
        user_id,
        provider,
        type,
        reference_id,
        amount,
        currency,
        phone_number,
        status,
        message,
        orange_transaction_id,
        created_at
      ) VALUES (
        ${userId},
        'Orange',
        'send_money',
        ${transferId},
        ${amount},
        ${currency},
        ${phoneNumber},
        'pending',
        ${message || "Transfert d'argent"},
        ${transferId},
        NOW()
      ) RETURNING *
    `;

    return Response.json({
      success: true,
      transferId,
      transaction: transaction[0],
      message: "Transfert Orange Money initié",
    });
  } catch (error) {
    console.error("Erreur send money Orange:", error);
    return Response.json(
      {
        error: "Erreur lors de l'envoi d'argent Orange Money",
        details: error.message,
      },
      { status: 500 },
    );
  }
}

async function checkPaymentStatus(data, userId) {
  try {
    const { orderId, payToken } = data;
    const token = await getAuthToken();

    const response = await fetch(
      `${ORANGE_CONFIG.baseURL}/webpayment/${payToken}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Erreur Orange status: ${response.status}`);
    }

    const statusData = await response.json();

    // Mettre à jour le statut en base
    const status = mapOrangeStatus(statusData.status);

    await sql`
      UPDATE mobile_money_transactions 
      SET status = ${status},
          webhook_data = ${JSON.stringify(statusData)},
          updated_at = NOW()
      WHERE (reference_id = ${orderId} OR orange_transaction_id = ${payToken})
      AND user_id = ${userId}
    `;

    return Response.json({
      success: true,
      status: statusData.status,
      mappedStatus: status,
      orderId: statusData.order_id,
      payToken: statusData.pay_token,
      amount: statusData.amount,
      currency: statusData.currency,
      transactionId: statusData.txnid,
    });
  } catch (error) {
    console.error("Erreur status Orange:", error);
    return Response.json(
      {
        error: "Erreur lors de la vérification du statut Orange Money",
        details: error.message,
      },
      { status: 500 },
    );
  }
}

// Endpoint GET pour webhooks et vérifications
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("orderId");
    const payToken = searchParams.get("payToken");

    if (!orderId && !payToken) {
      return Response.json({ error: "Paramètre manquant" }, { status: 400 });
    }

    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Non autorisé" }, { status: 401 });
    }

    return await checkPaymentStatus({ orderId, payToken }, session.user.id);
  } catch (error) {
    console.error("Erreur GET Orange:", error);
    return Response.json(
      {
        error: "Erreur lors de la récupération du statut",
        details: error.message,
      },
      { status: 500 },
    );
  }
}

function generateOrderId() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `OWO${timestamp}${random}`;
}

function mapOrangeStatus(orangeStatus) {
  const statusMap = {
    INITIATED: "pending",
    PENDING: "pending",
    SUCCESS: "successful",
    FAILED: "failed",
    EXPIRED: "expired",
    CANCELLED: "cancelled",
  };

  return statusMap[orangeStatus?.toUpperCase()] || "pending";
}
