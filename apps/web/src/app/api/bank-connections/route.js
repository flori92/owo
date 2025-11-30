import sql from "@/app/api/utils/sql";

// Open Banking API for European banks connection
// Supports: Crédit Agricole, LCL, Société Générale, BNP Paribas, ING, Deutsche Bank, etc.

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("user_id");
    const country = searchParams.get("country") || "FR"; // Default to France

    if (!userId) {
      return Response.json({ error: "user_id is required" }, { status: 400 });
    }

    // Get available banks for the specified country via Open Banking
    const availableBanks = await getAvailableBanks(country);

    return Response.json({
      success: true,
      banks: availableBanks,
      country: country,
    });
  } catch (error) {
    console.error("Error fetching available banks:", error);
    return Response.json(
      { error: "Failed to fetch available banks" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const { user_id, bank_institution_id, redirect_url } = await request.json();

    if (!user_id || !bank_institution_id) {
      return Response.json(
        {
          error: "user_id and bank_institution_id are required",
        },
        { status: 400 },
      );
    }

    // Generate unique session token
    const sessionToken = generateSessionToken();

    // Create bank connection session
    await sql`
      INSERT INTO bank_connection_sessions 
      (user_id, session_token, provider, redirect_url, institution_id, expires_at)
      VALUES (${user_id}, ${sessionToken}, 'nordigen', ${redirect_url}, ${bank_institution_id}, ${new Date(Date.now() + 3600000)})
    `;

    // Generate authorization URL for Open Banking connection
    const authUrl = await generateBankAuthUrl(
      bank_institution_id,
      sessionToken,
      redirect_url,
    );

    return Response.json({
      success: true,
      auth_url: authUrl,
      session_token: sessionToken,
      expires_in: 3600, // 1 hour
    });
  } catch (error) {
    console.error("Error initiating bank connection:", error);
    return Response.json(
      { error: "Failed to initiate bank connection" },
      { status: 500 },
    );
  }
}

export async function PUT(request) {
  try {
    const { session_token, authorization_code } = await request.json();

    if (!session_token || !authorization_code) {
      return Response.json(
        {
          error: "session_token and authorization_code are required",
        },
        { status: 400 },
      );
    }

    // Get session details
    const [session] = await sql`
      SELECT * FROM bank_connection_sessions 
      WHERE session_token = ${session_token} AND status = 'pending' AND expires_at > NOW()
    `;

    if (!session) {
      return Response.json(
        { error: "Invalid or expired session" },
        { status: 400 },
      );
    }

    // Exchange authorization code for access token
    const tokenData = await exchangeAuthCodeForToken(
      authorization_code,
      session.institution_id,
    );

    // Get bank account details
    const accountData = await fetchBankAccountDetails(tokenData.access_token);

    // Store bank account in database
    const [bankAccount] = await sql`
      INSERT INTO european_bank_accounts 
      (user_id, bank_name, account_number, iban, account_holder_name, currency, balance, 
       country, open_banking_provider, institution_id, access_token, refresh_token, 
       connection_status, bank_logo_url, institution_name)
      VALUES (
        ${session.user_id}, 
        ${accountData.institution.name}, 
        ${accountData.account_number}, 
        ${accountData.iban},
        ${accountData.account_holder_name},
        ${accountData.currency},
        ${accountData.balance},
        ${accountData.country},
        'nordigen',
        ${session.institution_id},
        ${encrypt(tokenData.access_token)},
        ${encrypt(tokenData.refresh_token)},
        'active',
        ${accountData.institution.logo},
        ${accountData.institution.name}
      )
      RETURNING *
    `;

    // Update session status
    await sql`
      UPDATE bank_connection_sessions 
      SET status = 'completed' 
      WHERE session_token = ${session_token}
    `;

    return Response.json({
      success: true,
      account: {
        id: bankAccount.id,
        bank_name: bankAccount.institution_name,
        account_number: maskAccountNumber(bankAccount.account_number),
        iban: maskIban(bankAccount.iban),
        currency: bankAccount.currency,
        balance: parseFloat(bankAccount.balance),
        logo: bankAccount.bank_logo_url,
      },
    });
  } catch (error) {
    console.error("Error completing bank connection:", error);
    return Response.json(
      { error: "Failed to complete bank connection" },
      { status: 500 },
    );
  }
}

// Helper functions for Open Banking integration

async function getAvailableBanks(country) {
  // In real implementation, this would call Nordigen/GoCardless API
  // For now, returning popular European banks by country

  const banksByCountry = {
    FR: [
      // France
      {
        id: "CREDIT_AGRICOLE_FR",
        name: "Crédit Agricole",
        logo: "https://cdn.logo.com/ca.png",
        country: "FR",
      },
      {
        id: "LCL_FR",
        name: "LCL",
        logo: "https://cdn.logo.com/lcl.png",
        country: "FR",
      },
      {
        id: "BNP_PARIBAS_FR",
        name: "BNP Paribas",
        logo: "https://cdn.logo.com/bnp.png",
        country: "FR",
      },
      {
        id: "SOCIETE_GENERALE_FR",
        name: "Société Générale",
        logo: "https://cdn.logo.com/sg.png",
        country: "FR",
      },
      {
        id: "BOURSORAMA_FR",
        name: "Boursorama Banque",
        logo: "https://cdn.logo.com/boursorama.png",
        country: "FR",
      },
      {
        id: "REVOLUT_FR",
        name: "Revolut",
        logo: "https://cdn.logo.com/revolut.png",
        country: "FR",
      },
      {
        id: "N26_FR",
        name: "N26",
        logo: "https://cdn.logo.com/n26.png",
        country: "FR",
      },
    ],
    DE: [
      // Germany
      {
        id: "DEUTSCHE_BANK_DE",
        name: "Deutsche Bank",
        logo: "https://cdn.logo.com/db.png",
        country: "DE",
      },
      {
        id: "COMMERZBANK_DE",
        name: "Commerzbank",
        logo: "https://cdn.logo.com/commerzbank.png",
        country: "DE",
      },
      {
        id: "ING_DE",
        name: "ING",
        logo: "https://cdn.logo.com/ing.png",
        country: "DE",
      },
      {
        id: "N26_DE",
        name: "N26",
        logo: "https://cdn.logo.com/n26.png",
        country: "DE",
      },
    ],
    ES: [
      // Spain
      {
        id: "SANTANDER_ES",
        name: "Banco Santander",
        logo: "https://cdn.logo.com/santander.png",
        country: "ES",
      },
      {
        id: "BBVA_ES",
        name: "BBVA",
        logo: "https://cdn.logo.com/bbva.png",
        country: "ES",
      },
      {
        id: "CAIXABANK_ES",
        name: "CaixaBank",
        logo: "https://cdn.logo.com/caixabank.png",
        country: "ES",
      },
    ],
    IT: [
      // Italy
      {
        id: "UNICREDIT_IT",
        name: "UniCredit",
        logo: "https://cdn.logo.com/unicredit.png",
        country: "IT",
      },
      {
        id: "INTESA_SANPAOLO_IT",
        name: "Intesa Sanpaolo",
        logo: "https://cdn.logo.com/intesa.png",
        country: "IT",
      },
    ],
    NL: [
      // Netherlands
      {
        id: "ING_NL",
        name: "ING",
        logo: "https://cdn.logo.com/ing.png",
        country: "NL",
      },
      {
        id: "ABN_AMRO_NL",
        name: "ABN AMRO",
        logo: "https://cdn.logo.com/abnamro.png",
        country: "NL",
      },
    ],
  };

  return banksByCountry[country] || banksByCountry["FR"];
}

async function generateBankAuthUrl(institutionId, sessionToken, redirectUrl) {
  // In real implementation, this would generate Nordigen OAuth URL
  const baseUrl = process.env.EXPO_PUBLIC_BASE_URL || "http://localhost:3000";
  return `${baseUrl}/api/bank-connections/callback?session=${sessionToken}&institution=${institutionId}&redirect=${encodeURIComponent(redirectUrl)}`;
}

async function exchangeAuthCodeForToken(authCode, institutionId) {
  // Mock token exchange - in real implementation would call Nordigen API
  return {
    access_token: `access_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    refresh_token: `refresh_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    expires_in: 86400, // 24 hours
  };
}

async function fetchBankAccountDetails(accessToken) {
  // Mock account details - in real implementation would fetch from Nordigen
  const institutions = {
    CREDIT_AGRICOLE_FR: {
      name: "Crédit Agricole",
      logo: "https://cdn.logo.com/ca.png",
    },
    LCL_FR: { name: "LCL", logo: "https://cdn.logo.com/lcl.png" },
    BNP_PARIBAS_FR: {
      name: "BNP Paribas",
      logo: "https://cdn.logo.com/bnp.png",
    },
    SOCIETE_GENERALE_FR: {
      name: "Société Générale",
      logo: "https://cdn.logo.com/sg.png",
    },
  };

  return {
    account_number: "FR7630001007941234567890185",
    iban: "FR7630001007941234567890185",
    account_holder_name: "Jean Kouadio",
    currency: "EUR",
    balance: 2847.65,
    country: "FR",
    institution: institutions["CREDIT_AGRICOLE_FR"] || {
      name: "Banque Connectée",
      logo: null,
    },
  };
}

function generateSessionToken() {
  return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`;
}

function encrypt(text) {
  // In real implementation, use proper encryption
  return Buffer.from(text).toString("base64");
}

function maskAccountNumber(accountNumber) {
  if (!accountNumber || accountNumber.length < 8) return "••••";
  return accountNumber.slice(0, 4) + "••••" + accountNumber.slice(-4);
}

function maskIban(iban) {
  if (!iban || iban.length < 8) return "••••";
  return iban.slice(0, 4) + "••••••••••••••••••••" + iban.slice(-4);
}
