import sql from "@/app/api/utils/sql.js";
import { auth } from "@/auth.js";

// Configuration MTN Mobile Money API
const MTN_CONFIG = {
  baseURL:
    process.env.MTN_API_BASE_URL || "https://sandbox.momodeveloper.mtn.com",
  subscriptionKey: process.env.MTN_SUBSCRIPTION_KEY,
  apiUser: process.env.MTN_API_USER,
  apiKey: process.env.MTN_API_KEY,
  targetEnvironment: process.env.MTN_TARGET_ENVIRONMENT || "sandbox",
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
      default:
        return Response.json(
          { error: "Action non supportée" },
          { status: 400 },
        );
    }
  } catch (error) {
    console.error("Erreur MTN Mobile Money:", error);
    return Response.json(
      {
        error: "Erreur lors de l'opération MTN",
      },
      { status: 500 },
    );
  }
}

async function getAuthToken() {
  try {
    const authString = Buffer.from(
      `${MTN_CONFIG.apiUser}:${MTN_CONFIG.apiKey}`,
    ).toString("base64");

    const response = await fetch(`${MTN_CONFIG.baseURL}/collection/token/`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${authString}`,
        "Ocp-Apim-Subscription-Key": MTN_CONFIG.subscriptionKey,
        "X-Target-Environment": MTN_CONFIG.targetEnvironment,
      },
    });

    if (!response.ok) {
      throw new Error(`Erreur auth MTN: ${response.status}`);
    }

    const tokenData = await response.json();
    return tokenData.access_token;
  } catch (error) {
    console.error("Erreur authentification MTN:", error);
    throw error;
  }
}

async function requestPayment(data, userId) {
  try {
    const { phoneNumber, amount, currency = "EUR", externalId, payer } = data;
    const token = await getAuthToken();

    // Générer un UUID pour la référence
    const referenceId = generateUUID();

    const paymentRequest = {
      amount: amount.toString(),
      currency,
      externalId: externalId || referenceId,
      payer: {
        partyIdType: "MSISDN",
        partyId: phoneNumber,
      },
      payerMessage: payer?.message || "Paiement owo!",
      payeeNote: "Transaction via owo!",
    };

    const response = await fetch(
      `${MTN_CONFIG.baseURL}/collection/v1_0/requesttopay`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Reference-Id": referenceId,
          "X-Target-Environment": MTN_CONFIG.targetEnvironment,
          "Ocp-Apim-Subscription-Key": MTN_CONFIG.subscriptionKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(paymentRequest),
      },
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Erreur MTN payment: ${response.status} - ${errorData.message || "Unknown error"}`,
      );
    }

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
        created_at
      ) VALUES (
        ${userId},
        'MTN',
        'request_payment',
        ${referenceId},
        ${externalId || referenceId},
        ${amount},
        ${currency},
        ${phoneNumber},
        'pending',
        NOW()
      ) RETURNING *
    `;

    return Response.json({
      success: true,
      referenceId,
      transaction: transaction[0],
      message: "Demande de paiement MTN envoyée",
    });
  } catch (error) {
    console.error("Erreur request payment MTN:", error);
    return Response.json(
      {
        error: "Erreur lors de la demande de paiement MTN",
        details: error.message,
      },
      { status: 500 },
    );
  }
}

async function checkBalance(data, userId) {
  try {
    const { accountId } = data;
    const token = await getAuthToken();

    const response = await fetch(
      `${MTN_CONFIG.baseURL}/collection/v1_0/account/balance`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Target-Environment": MTN_CONFIG.targetEnvironment,
          "Ocp-Apim-Subscription-Key": MTN_CONFIG.subscriptionKey,
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Erreur MTN balance: ${response.status}`);
    }

    const balanceData = await response.json();

    // Mettre à jour le solde en base
    await sql`
      UPDATE mobile_money_accounts 
      SET balance = ${parseFloat(balanceData.availableBalance)},
          currency = ${balanceData.currency},
          last_sync_at = NOW()
      WHERE user_id = ${userId} 
      AND provider = 'MTN Mobile Money'
      AND id = ${accountId}
    `;

    return Response.json({
      success: true,
      balance: balanceData.availableBalance,
      currency: balanceData.currency,
      lastUpdate: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Erreur check balance MTN:", error);
    return Response.json(
      {
        error: "Erreur lors de la vérification du solde MTN",
        details: error.message,
      },
      { status: 500 },
    );
  }
}

async function sendMoney(data, userId) {
  try {
    const { phoneNumber, amount, currency = "EUR", message } = data;
    const token = await getAuthToken();
    const referenceId = generateUUID();

    const transferRequest = {
      amount: amount.toString(),
      currency,
      externalId: generateUUID(),
      payee: {
        partyIdType: "MSISDN",
        partyId: phoneNumber,
      },
      payerMessage: message || "Envoi d'argent via owo!",
      payeeNote: "Réception via owo!",
    };

    const response = await fetch(
      `${MTN_CONFIG.baseURL}/disbursement/v1_0/transfer`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Reference-Id": referenceId,
          "X-Target-Environment": MTN_CONFIG.targetEnvironment,
          "Ocp-Apim-Subscription-Key": MTN_CONFIG.subscriptionKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(transferRequest),
      },
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Erreur MTN transfer: ${response.status} - ${errorData.message || "Unknown error"}`,
      );
    }

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
        created_at
      ) VALUES (
        ${userId},
        'MTN',
        'send_money',
        ${referenceId},
        ${amount},
        ${currency},
        ${phoneNumber},
        'pending',
        ${message || "Envoi d'argent"},
        NOW()
      ) RETURNING *
    `;

    return Response.json({
      success: true,
      referenceId,
      transaction: transaction[0],
      message: "Transfert MTN initié avec succès",
    });
  } catch (error) {
    console.error("Erreur send money MTN:", error);
    return Response.json(
      {
        error: "Erreur lors de l'envoi d'argent MTN",
        details: error.message,
      },
      { status: 500 },
    );
  }
}

// Endpoint pour vérifier le statut d'une transaction
export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const referenceId = searchParams.get("referenceId");

    if (!referenceId) {
      return Response.json({ error: "Reference ID requis" }, { status: 400 });
    }

    const token = await getAuthToken();

    const response = await fetch(
      `${MTN_CONFIG.baseURL}/collection/v1_0/requesttopay/${referenceId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Target-Environment": MTN_CONFIG.targetEnvironment,
          "Ocp-Apim-Subscription-Key": MTN_CONFIG.subscriptionKey,
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Erreur MTN status: ${response.status}`);
    }

    const statusData = await response.json();

    // Mettre à jour le statut en base
    await sql`
      UPDATE mobile_money_transactions 
      SET status = ${statusData.status.toLowerCase()},
          mtn_transaction_id = ${statusData.financialTransactionId || null},
          updated_at = NOW()
      WHERE reference_id = ${referenceId}
      AND user_id = ${session.user.id}
    `;

    return Response.json({
      success: true,
      status: statusData.status,
      financialTransactionId: statusData.financialTransactionId,
      amount: statusData.amount,
      currency: statusData.currency,
      reason: statusData.reason,
    });
  } catch (error) {
    console.error("Erreur status MTN:", error);
    return Response.json(
      {
        error: "Erreur lors de la vérification du statut",
        details: error.message,
      },
      { status: 500 },
    );
  }
}

function generateUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
