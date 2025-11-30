import sql from "@/app/api/utils/sql.js";
import { auth } from "@/auth.js";

// Configuration Open Banking PSD2
const PSD2_CONFIG = {
  // Providers populaires en Europe
  providers: {
    nordigen: {
      baseURL:
        process.env.NORDIGEN_BASE_URL || "https://ob.nordigen.com/api/v2",
      secretId: process.env.NORDIGEN_SECRET_ID,
      secretKey: process.env.NORDIGEN_SECRET_KEY,
    },
    yapily: {
      baseURL: process.env.YAPILY_BASE_URL || "https://api.yapily.com",
      applicationId: process.env.YAPILY_APPLICATION_ID,
      applicationSecret: process.env.YAPILY_APPLICATION_SECRET,
    },
    token: {
      baseURL: process.env.TOKEN_IO_BASE_URL || "https://api.token.io",
      keyId: process.env.TOKEN_IO_KEY_ID,
      privateKey: process.env.TOKEN_IO_PRIVATE_KEY,
    },
  },
  defaultProvider: process.env.PSD2_DEFAULT_PROVIDER || "nordigen",
};

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { action, provider, data } = await request.json();
    const selectedProvider = provider || PSD2_CONFIG.defaultProvider;

    switch (action) {
      case "list-institutions":
        return await listInstitutions(selectedProvider, data);
      case "create-link":
        return await createBankingLink(selectedProvider, data, session.user.id);
      case "get-accounts":
        return await getAccounts(selectedProvider, data, session.user.id);
      case "get-transactions":
        return await getTransactions(selectedProvider, data, session.user.id);
      case "get-balances":
        return await getBalances(selectedProvider, data, session.user.id);
      case "refresh-connection":
        return await refreshConnection(selectedProvider, data, session.user.id);
      default:
        return Response.json(
          { error: "Action non supportée" },
          { status: 400 },
        );
    }
  } catch (error) {
    console.error("Erreur Open Banking PSD2:", error);
    return Response.json(
      {
        error: "Erreur lors de l'opération Open Banking",
      },
      { status: 500 },
    );
  }
}

async function getAuthToken(provider) {
  try {
    const config = PSD2_CONFIG.providers[provider];

    if (provider === "nordigen") {
      const response = await fetch(`${config.baseURL}/token/new/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          secret_id: config.secretId,
          secret_key: config.secretKey,
        }),
      });

      if (!response.ok) {
        throw new Error(`Erreur auth ${provider}: ${response.status}`);
      }

      const tokenData = await response.json();
      return tokenData.access_token;
    } else if (provider === "yapily") {
      const credentials = Buffer.from(
        `${config.applicationId}:${config.applicationSecret}`,
      ).toString("base64");

      const response = await fetch(`${config.baseURL}/auth/token`, {
        method: "POST",
        headers: {
          Authorization: `Basic ${credentials}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: "grant_type=client_credentials&scope=accounts",
      });

      if (!response.ok) {
        throw new Error(`Erreur auth ${provider}: ${response.status}`);
      }

      const tokenData = await response.json();
      return tokenData.access_token;
    }

    throw new Error(`Provider ${provider} non supporté`);
  } catch (error) {
    console.error(`Erreur authentification ${provider}:`, error);
    throw error;
  }
}

async function listInstitutions(provider, data) {
  try {
    const { country = "FR" } = data;
    const token = await getAuthToken(provider);
    const config = PSD2_CONFIG.providers[provider];

    let response;

    if (provider === "nordigen") {
      response = await fetch(
        `${config.baseURL}/institutions/?country=${country}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
    } else if (provider === "yapily") {
      response = await fetch(
        `${config.baseURL}/institutions?country=${country}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );
    }

    if (!response.ok) {
      throw new Error(`Erreur institutions ${provider}: ${response.status}`);
    }

    const institutions = await response.json();

    // Normaliser la réponse pour tous les providers
    const normalizedInstitutions = normalizeInstitutions(
      institutions,
      provider,
    );

    return Response.json({
      success: true,
      provider,
      country,
      institutions: normalizedInstitutions,
    });
  } catch (error) {
    console.error("Erreur list institutions:", error);
    return Response.json(
      {
        error: "Erreur lors de la récupération des banques",
        details: error.message,
      },
      { status: 500 },
    );
  }
}

async function createBankingLink(provider, data, userId) {
  try {
    const { institutionId, redirectUri, userLanguage = "fr" } = data;
    const token = await getAuthToken(provider);
    const config = PSD2_CONFIG.providers[provider];

    let response;
    const sessionToken = generateSessionToken();

    if (provider === "nordigen") {
      // Créer un end user agreement
      const agreementResponse = await fetch(
        `${config.baseURL}/agreements/enduser/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            institution_id: institutionId,
            max_historical_days: 90,
            access_valid_for_days: 90,
            access_scope: ["balances", "details", "transactions"],
          }),
        },
      );

      if (!agreementResponse.ok) {
        throw new Error(`Erreur agreement: ${agreementResponse.status}`);
      }

      const agreement = await agreementResponse.json();

      // Créer le requisition (lien de connexion)
      response = await fetch(`${config.baseURL}/requisitions/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          redirect: redirectUri || `${process.env.APP_URL}/banking/callback`,
          institution_id: institutionId,
          agreement: agreement.id,
          reference: `OWO-${userId}-${Date.now()}`,
          user_language: userLanguage,
        }),
      });
    } else if (provider === "yapily") {
      response = await fetch(`${config.baseURL}/account-auth-requests`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          applicationUserId: userId.toString(),
          institutionId: institutionId,
          callback: redirectUri || `${process.env.APP_URL}/banking/callback`,
          oneTimeToken: true,
          maxHistoricalDays: 90,
          featureScope: ["ACCOUNTS", "TRANSACTIONS"],
        }),
      });
    }

    if (!response.ok) {
      throw new Error(`Erreur link creation ${provider}: ${response.status}`);
    }

    const linkData = await response.json();

    // Enregistrer la session de connexion en base
    const connectionSession = await sql`
      INSERT INTO bank_connection_sessions (
        user_id,
        session_token,
        provider,
        institution_id,
        redirect_url,
        status,
        expires_at
      ) VALUES (
        ${userId},
        ${sessionToken},
        ${provider},
        ${institutionId},
        ${redirectUri || `${process.env.APP_URL}/banking/callback`},
        'pending',
        NOW() + INTERVAL '1 hour'
      ) RETURNING *
    `;

    const authUrl =
      provider === "nordigen" ? linkData.link : linkData.authorisationUrl;

    return Response.json({
      success: true,
      sessionToken,
      authUrl,
      institutionId,
      provider,
      expiresAt: connectionSession[0].expires_at,
      message: "Lien de connexion bancaire créé",
    });
  } catch (error) {
    console.error("Erreur create banking link:", error);
    return Response.json(
      {
        error: "Erreur lors de la création du lien bancaire",
        details: error.message,
      },
      { status: 500 },
    );
  }
}

async function getAccounts(provider, data, userId) {
  try {
    const { connectionId } = data;

    // Récupérer les informations de connexion
    const connection = await sql`
      SELECT * FROM european_bank_accounts 
      WHERE user_id = ${userId} 
      AND id = ${connectionId}
      AND connection_status = 'active'
      LIMIT 1
    `;

    if (connection.length === 0) {
      return Response.json(
        {
          error: "Connexion bancaire non trouvée ou inactive",
        },
        { status: 404 },
      );
    }

    const token = await getAuthToken(provider);
    const config = PSD2_CONFIG.providers[provider];

    let response;

    if (provider === "nordigen") {
      // Récupérer les comptes via l'institution_id
      response = await fetch(
        `${config.baseURL}/requisitions/${connection[0].institution_id}/`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
    }

    if (!response.ok) {
      throw new Error(`Erreur accounts ${provider}: ${response.status}`);
    }

    const accountsData = await response.json();
    const normalizedAccounts = normalizeAccounts(accountsData, provider);

    // Mettre à jour la dernière synchronisation
    await sql`
      UPDATE european_bank_accounts 
      SET last_sync_at = NOW()
      WHERE id = ${connectionId}
    `;

    return Response.json({
      success: true,
      provider,
      accounts: normalizedAccounts,
      lastSync: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Erreur get accounts:", error);
    return Response.json(
      {
        error: "Erreur lors de la récupération des comptes",
        details: error.message,
      },
      { status: 500 },
    );
  }
}

async function getTransactions(provider, data, userId) {
  try {
    const { accountId, dateFrom, dateTo } = data;
    const token = await getAuthToken(provider);
    const config = PSD2_CONFIG.providers[provider];

    // Construire les paramètres de date
    const fromDate =
      dateFrom ||
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];
    const toDate = dateTo || new Date().toISOString().split("T")[0];

    let response;

    if (provider === "nordigen") {
      response = await fetch(
        `${config.baseURL}/accounts/${accountId}/transactions/?date_from=${fromDate}&date_to=${toDate}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
    } else if (provider === "yapily") {
      response = await fetch(
        `${config.baseURL}/accounts/${accountId}/transactions?from=${fromDate}&to=${toDate}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );
    }

    if (!response.ok) {
      throw new Error(`Erreur transactions ${provider}: ${response.status}`);
    }

    const transactionsData = await response.json();
    const normalizedTransactions = normalizeTransactions(
      transactionsData,
      provider,
    );

    return Response.json({
      success: true,
      provider,
      accountId,
      dateFrom: fromDate,
      dateTo: toDate,
      transactions: normalizedTransactions,
    });
  } catch (error) {
    console.error("Erreur get transactions:", error);
    return Response.json(
      {
        error: "Erreur lors de la récupération des transactions",
        details: error.message,
      },
      { status: 500 },
    );
  }
}

async function getBalances(provider, data, userId) {
  try {
    const { accountId } = data;
    const token = await getAuthToken(provider);
    const config = PSD2_CONFIG.providers[provider];

    let response;

    if (provider === "nordigen") {
      response = await fetch(
        `${config.baseURL}/accounts/${accountId}/balances/`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
    } else if (provider === "yapily") {
      response = await fetch(
        `${config.baseURL}/accounts/${accountId}/balances`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );
    }

    if (!response.ok) {
      throw new Error(`Erreur balances ${provider}: ${response.status}`);
    }

    const balancesData = await response.json();
    const normalizedBalances = normalizeBalances(balancesData, provider);

    return Response.json({
      success: true,
      provider,
      accountId,
      balances: normalizedBalances,
      lastUpdate: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Erreur get balances:", error);
    return Response.json(
      {
        error: "Erreur lors de la récupération des soldes",
        details: error.message,
      },
      { status: 500 },
    );
  }
}

async function refreshConnection(provider, data, userId) {
  try {
    const { connectionId } = data;

    // Mettre à jour le statut de connexion
    await sql`
      UPDATE european_bank_accounts 
      SET last_sync_at = NOW(),
          connection_status = 'active'
      WHERE id = ${connectionId} 
      AND user_id = ${userId}
    `;

    return Response.json({
      success: true,
      connectionId,
      message: "Connexion bancaire rafraîchie",
      lastSync: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Erreur refresh connection:", error);
    return Response.json(
      {
        error: "Erreur lors du rafraîchissement de la connexion",
        details: error.message,
      },
      { status: 500 },
    );
  }
}

// Fonctions utilitaires pour normaliser les réponses des différents providers

function normalizeInstitutions(institutions, provider) {
  if (provider === "nordigen") {
    return institutions.map((inst) => ({
      id: inst.id,
      name: inst.name,
      bic: inst.bic,
      logo: inst.logo,
      countries: inst.countries,
    }));
  } else if (provider === "yapily") {
    return institutions.data.map((inst) => ({
      id: inst.id,
      name: inst.fullName,
      bic: inst.bic,
      logo: inst.media?.[0]?.source,
      countries: inst.countries,
    }));
  }
  return institutions;
}

function normalizeAccounts(accounts, provider) {
  if (provider === "nordigen") {
    return (
      accounts.accounts?.map((acc) => ({
        id: acc.id,
        iban: acc.iban,
        name: acc.name,
        currency: acc.currency,
        type: acc.cashAccountType,
      })) || []
    );
  }
  return accounts;
}

function normalizeTransactions(transactions, provider) {
  if (provider === "nordigen") {
    const allTransactions = [
      ...(transactions.transactions?.booked || []),
      ...(transactions.transactions?.pending || []),
    ];

    return allTransactions.map((tx) => ({
      id: tx.transactionId || tx.internalTransactionId,
      amount: parseFloat(tx.transactionAmount?.amount || 0),
      currency: tx.transactionAmount?.currency,
      date: tx.bookingDate || tx.valueDate,
      description:
        tx.remittanceInformationUnstructured || tx.additionalInformation,
      creditorName: tx.creditorName,
      debtorName: tx.debtorName,
      status: tx.bookingDate ? "booked" : "pending",
    }));
  }
  return transactions;
}

function normalizeBalances(balances, provider) {
  if (provider === "nordigen") {
    return (
      balances.balances?.map((bal) => ({
        type: bal.balanceType,
        amount: parseFloat(bal.balanceAmount?.amount || 0),
        currency: bal.balanceAmount?.currency,
        date: bal.referenceDate,
      })) || []
    );
  }
  return balances;
}

function generateSessionToken() {
  return (
    "psd2_" + Math.random().toString(36).substring(2) + Date.now().toString(36)
  );
}
