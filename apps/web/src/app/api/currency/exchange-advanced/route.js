import sql from "@/app/api/utils/sql.js";
import { auth } from "@/auth.js";

// Configuration des providers de taux de change
const EXCHANGE_RATE_PROVIDERS = {
  exchangerate: {
    baseURL: "https://api.exchangerate-api.com/v4",
    apiKey: process.env.EXCHANGE_RATE_API_KEY,
  },
  fixer: {
    baseURL: "http://data.fixer.io/api",
    apiKey: process.env.FIXER_API_KEY,
  },
  currencyapi: {
    baseURL: "https://api.currencyapi.com/v3",
    apiKey: process.env.CURRENCY_API_KEY,
  },
};

const DEFAULT_PROVIDER = process.env.EXCHANGE_RATE_PROVIDER || "exchangerate";

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { action, data } = await request.json();

    switch (action) {
      case "get-rates":
        return await getCurrentRates(data);
      case "calculate-exchange":
        return await calculateExchange(data);
      case "execute-exchange":
        return await executeExchange(data, session.user.id);
      case "get-rate-history":
        return await getRateHistory(data);
      case "set-rate-alert":
        return await setRateAlert(data, session.user.id);
      case "get-popular-pairs":
        return await getPopularPairs();
      default:
        return Response.json(
          { error: "Action non supportée" },
          { status: 400 },
        );
    }
  } catch (error) {
    console.error("Erreur API currency exchange:", error);
    return Response.json(
      {
        error: "Erreur lors de l'opération de change",
      },
      { status: 500 },
    );
  }
}

async function getCurrentRates(data) {
  try {
    const { baseCurrency = "EUR", targetCurrencies = ["XOF", "USD", "GBP"] } =
      data;
    const provider = data.provider || DEFAULT_PROVIDER;

    // Essayer de récupérer les taux en cache d'abord
    const cachedRates = await getCachedRates(baseCurrency, targetCurrencies);

    if (cachedRates && cachedRates.length > 0) {
      const cacheTime = new Date(cachedRates[0].updated_at);
      const now = new Date();
      const diffMinutes = (now - cacheTime) / (1000 * 60);

      // Utiliser le cache s'il a moins de 10 minutes
      if (diffMinutes < 10) {
        return Response.json({
          success: true,
          baseCurrency,
          rates: cachedRates.map((rate) => ({
            currency: rate.to_currency,
            rate: parseFloat(rate.rate),
            spread: parseFloat(rate.spread_percentage),
            fees: parseFloat(rate.fees_percentage),
            lastUpdate: rate.updated_at,
          })),
          source: "cache",
        });
      }
    }

    // Récupérer de nouvelles données depuis l'API
    const freshRates = await fetchRatesFromProvider(
      provider,
      baseCurrency,
      targetCurrencies,
    );

    // Mettre à jour le cache
    await updateRatesCache(baseCurrency, freshRates);

    return Response.json({
      success: true,
      baseCurrency,
      rates: freshRates,
      source: provider,
    });
  } catch (error) {
    console.error("Erreur get current rates:", error);
    return Response.json(
      {
        error: "Erreur lors de la récupération des taux",
        details: error.message,
      },
      { status: 500 },
    );
  }
}

async function fetchRatesFromProvider(
  provider,
  baseCurrency,
  targetCurrencies,
) {
  const config = EXCHANGE_RATE_PROVIDERS[provider];

  if (provider === "exchangerate") {
    try {
      const response = await fetch(`${config.baseURL}/latest/${baseCurrency}`);

      if (!response.ok) {
        throw new Error(`Erreur API ${provider}: ${response.status}`);
      }

      const data = await response.json();

      return targetCurrencies.map((currency) => {
        const rate = data.rates[currency];
        const spread = calculateSpread(baseCurrency, currency);
        const fees = calculateFees(baseCurrency, currency);

        return {
          currency,
          rate: rate || 0,
          spread,
          fees,
          finalRate: rate ? rate * (1 + spread + fees) : 0,
          lastUpdate: new Date().toISOString(),
        };
      });
    } catch (error) {
      console.error(`Erreur provider ${provider}:`, error);
      // Fallback vers les taux simulés
      return getSimulatedRates(baseCurrency, targetCurrencies);
    }
  }

  // Fallback pour les taux mockés
  return getSimulatedRates(baseCurrency, targetCurrencies);
}

async function calculateExchange(data) {
  try {
    const {
      fromCurrency,
      toCurrency,
      amount,
      includeFeesBreakdown = false,
    } = data;

    // Récupérer le taux actuel
    const ratesData = await getCurrentRates({
      baseCurrency: fromCurrency,
      targetCurrencies: [toCurrency],
    });

    if (!ratesData || ratesData.status !== 200) {
      return Response.json(
        {
          error: "Impossible de récupérer les taux de change",
        },
        { status: 500 },
      );
    }

    const ratesResponse = await ratesData.json();
    const rate = ratesResponse.rates.find((r) => r.currency === toCurrency);

    if (!rate) {
      return Response.json(
        {
          error: "Taux de change non disponible pour cette paire",
        },
        { status: 400 },
      );
    }

    const exchangedAmount = amount * rate.finalRate;
    const fees = amount * rate.fees;
    const spread = amount * rate.spread;

    const result = {
      fromAmount: amount,
      fromCurrency,
      toAmount: exchangedAmount,
      toCurrency,
      rate: rate.rate,
      finalRate: rate.finalRate,
      totalFees: fees + spread,
      estimatedArrival: new Date(Date.now() + 2 * 60 * 1000).toISOString(), // 2 minutes
    };

    if (includeFeesBreakdown) {
      result.feesBreakdown = {
        baseFees: fees,
        spread: spread,
        exchangeFeesPercentage: rate.fees * 100,
        spreadPercentage: rate.spread * 100,
      };
    }

    return Response.json({
      success: true,
      calculation: result,
    });
  } catch (error) {
    console.error("Erreur calculate exchange:", error);
    return Response.json(
      {
        error: "Erreur lors du calcul du change",
        details: error.message,
      },
      { status: 500 },
    );
  }
}

async function executeExchange(data, userId) {
  try {
    const {
      fromAccountType,
      fromAccountId,
      toAccountType,
      toAccountId,
      fromAmount,
      fromCurrency,
      toCurrency,
      acceptedRate,
      slippageTolerance = 0.01, // 1% par défaut
    } = data;

    // Vérifier les soldes
    const fromBalance = await getAccountBalance(
      fromAccountType,
      fromAccountId,
      userId,
    );

    if (fromBalance < fromAmount) {
      return Response.json(
        {
          error: "Solde insuffisant sur le compte source",
        },
        { status: 400 },
      );
    }

    // Recalculer le taux actuel pour vérifier le slippage
    const calculation = await calculateExchange({
      fromCurrency,
      toCurrency,
      amount: fromAmount,
    });

    const calculationData = await calculation.json();
    const currentRate = calculationData.calculation.finalRate;
    const rateChange = Math.abs(currentRate - acceptedRate) / acceptedRate;

    if (rateChange > slippageTolerance) {
      return Response.json(
        {
          error:
            "Le taux a trop changé. Veuillez confirmer la nouvelle estimation.",
          newRate: currentRate,
          oldRate: acceptedRate,
          slippage: rateChange * 100,
        },
        { status: 409 },
      );
    }

    // Générer une référence unique
    const referenceNumber = `OWO-EXC-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // Exécuter l'échange avec transaction atomique
    const exchange = await sql.transaction([
      // Enregistrer l'échange
      sql`
        INSERT INTO currency_transfers (
          user_id,
          from_account_type,
          from_account_id,
          to_account_type,
          to_account_id,
          from_currency,
          to_currency,
          from_amount,
          to_amount,
          exchange_rate,
          fees_amount,
          total_debited,
          status,
          reference_number,
          provider
        ) VALUES (
          ${userId},
          ${fromAccountType},
          ${fromAccountId},
          ${toAccountType},
          ${toAccountId},
          ${fromCurrency},
          ${toCurrency},
          ${fromAmount},
          ${calculationData.calculation.toAmount},
          ${calculationData.calculation.finalRate},
          ${calculationData.calculation.totalFees},
          ${fromAmount + calculationData.calculation.totalFees},
          'processing',
          ${referenceNumber},
          'owo_exchange'
        ) RETURNING *
      `,
    ]);

    // Simulation du délai de traitement (en production, cela serait async)
    setTimeout(async () => {
      await sql`
        UPDATE currency_transfers 
        SET status = 'completed',
            completed_at = NOW()
        WHERE reference_number = ${referenceNumber}
      `;
    }, 2000);

    return Response.json({
      success: true,
      exchange: {
        referenceNumber,
        fromAmount,
        fromCurrency,
        toAmount: calculationData.calculation.toAmount,
        toCurrency,
        rate: calculationData.calculation.finalRate,
        fees: calculationData.calculation.totalFees,
        status: "processing",
        estimatedCompletion: new Date(Date.now() + 2 * 60 * 1000).toISOString(),
      },
      message: "Échange initié avec succès",
    });
  } catch (error) {
    console.error("Erreur execute exchange:", error);
    return Response.json(
      {
        error: "Erreur lors de l'exécution du change",
        details: error.message,
      },
      { status: 500 },
    );
  }
}

async function getRateHistory(data) {
  try {
    const { fromCurrency, toCurrency, period = "7d" } = data;

    // Récupérer l'historique depuis la base de données
    const interval = period === "24h" ? "hour" : "day";
    const periodDays =
      period === "24h" ? "1 day" : period === "7d" ? "7 days" : "30 days";

    const history = await sql`
      SELECT 
        DATE_TRUNC(${interval}, updated_at) as date,
        AVG(rate) as average_rate,
        MIN(rate) as min_rate,
        MAX(rate) as max_rate,
        COUNT(*) as data_points
      FROM exchange_rates 
      WHERE from_currency = ${fromCurrency} 
      AND to_currency = ${toCurrency}
      AND updated_at > NOW() - INTERVAL ${periodDays}
      GROUP BY DATE_TRUNC(${interval}, updated_at)
      ORDER BY date ASC
    `;

    return Response.json({
      success: true,
      fromCurrency,
      toCurrency,
      period,
      history: history.map((h) => ({
        date: h.date,
        rate: parseFloat(h.average_rate),
        min: parseFloat(h.min_rate),
        max: parseFloat(h.max_rate),
        volume: h.data_points,
      })),
    });
  } catch (error) {
    console.error("Erreur rate history:", error);
    return Response.json(
      {
        error: "Erreur lors de la récupération de l'historique",
        details: error.message,
      },
      { status: 500 },
    );
  }
}

async function setRateAlert(data, userId) {
  try {
    const { fromCurrency, toCurrency, targetRate, alertType = "above" } = data;

    // Créer l'alerte en base
    const alert = await sql`
      INSERT INTO rate_alerts (
        user_id,
        from_currency,
        to_currency,
        target_rate,
        alert_type,
        is_active,
        created_at
      ) VALUES (
        ${userId},
        ${fromCurrency},
        ${toCurrency},
        ${targetRate},
        ${alertType},
        true,
        NOW()
      ) RETURNING *
    `;

    return Response.json({
      success: true,
      alert: {
        id: alert[0].id,
        fromCurrency,
        toCurrency,
        targetRate,
        alertType,
        createdAt: alert[0].created_at,
      },
      message: "Alerte de taux créée",
    });
  } catch (error) {
    console.error("Erreur set rate alert:", error);
    return Response.json(
      {
        error: "Erreur lors de la création de l'alerte",
        details: error.message,
      },
      { status: 500 },
    );
  }
}

async function getPopularPairs() {
  try {
    // Retourner les paires de devises populaires pour l'Afrique de l'Ouest et l'Europe
    const popularPairs = [
      {
        from: "EUR",
        to: "XOF",
        name: "Euro vers Franc CFA",
        flag: "🇪🇺→🇸🇳",
        trending: true,
        volume24h: "2.5M",
      },
      {
        from: "XOF",
        to: "EUR",
        name: "Franc CFA vers Euro",
        flag: "🇸🇳→🇪🇺",
        trending: true,
        volume24h: "1.8M",
      },
      {
        from: "USD",
        to: "XOF",
        name: "Dollar vers Franc CFA",
        flag: "🇺🇸→🇸🇳",
        trending: false,
        volume24h: "950K",
      },
      {
        from: "EUR",
        to: "USD",
        name: "Euro vers Dollar",
        flag: "🇪🇺→🇺🇸",
        trending: false,
        volume24h: "5.2M",
      },
      {
        from: "GBP",
        to: "XOF",
        name: "Livre Sterling vers Franc CFA",
        flag: "🇬🇧→🇸🇳",
        trending: false,
        volume24h: "420K",
      },
    ];

    return Response.json({
      success: true,
      pairs: popularPairs,
    });
  } catch (error) {
    console.error("Erreur popular pairs:", error);
    return Response.json(
      {
        error: "Erreur lors de la récupération des paires populaires",
        details: error.message,
      },
      { status: 500 },
    );
  }
}

// Fonctions utilitaires

async function getCachedRates(baseCurrency, targetCurrencies) {
  return await sql`
    SELECT * FROM exchange_rates 
    WHERE from_currency = ${baseCurrency} 
    AND to_currency = ANY(${targetCurrencies})
    AND updated_at > NOW() - INTERVAL '10 minutes'
    ORDER BY updated_at DESC
  `;
}

async function updateRatesCache(baseCurrency, rates) {
  for (const rate of rates) {
    await sql`
      INSERT INTO exchange_rates (
        from_currency, 
        to_currency, 
        rate, 
        fees_percentage, 
        spread_percentage,
        updated_at,
        source
      ) VALUES (
        ${baseCurrency},
        ${rate.currency},
        ${rate.rate},
        ${rate.fees},
        ${rate.spread},
        NOW(),
        'api'
      )
      ON CONFLICT (from_currency, to_currency) 
      DO UPDATE SET 
        rate = EXCLUDED.rate,
        fees_percentage = EXCLUDED.fees_percentage,
        spread_percentage = EXCLUDED.spread_percentage,
        updated_at = EXCLUDED.updated_at,
        source = EXCLUDED.source
    `;
  }
}

function calculateSpread(fromCurrency, toCurrency) {
  // Calcul du spread basé sur la liquidité et la popularité de la paire
  if (fromCurrency === "EUR" && toCurrency === "XOF") return 0.005; // 0.5%
  if (fromCurrency === "XOF" && toCurrency === "EUR") return 0.007; // 0.7%
  if (fromCurrency === "USD" && toCurrency === "XOF") return 0.008; // 0.8%
  return 0.01; // 1% par défaut
}

function calculateFees(fromCurrency, toCurrency) {
  // Calcul des frais basé sur le provider et la paire
  if (
    (fromCurrency === "EUR" && toCurrency === "XOF") ||
    (fromCurrency === "XOF" && toCurrency === "EUR")
  ) {
    return 0.015; // 1.5% pour les transferts EUR-FCFA
  }
  return 0.02; // 2% pour les autres paires
}

function getSimulatedRates(baseCurrency, targetCurrencies) {
  // Taux simulés réalistes basés sur les taux actuels avec variation aléatoire
  const baseRates = {
    EUR: {
      XOF: 655.96,
      USD: 1.08,
      GBP: 0.85,
      NGN: 1680.5,
    },
    USD: {
      XOF: 607.5,
      EUR: 0.93,
      GBP: 0.79,
      NGN: 1556.25,
    },
    XOF: {
      EUR: 0.00152,
      USD: 0.00165,
      GBP: 0.00129,
      NGN: 2.56,
    },
  };

  const currencyRates = baseRates[baseCurrency] || {};

  return targetCurrencies.map((currency) => {
    let rate = currencyRates[currency] || 1;

    // Ajouter une petite variation aléatoire pour simuler les fluctuations réelles
    const variation = (Math.random() - 0.5) * 0.02; // ±1% de variation
    rate = rate * (1 + variation);

    const spread = calculateSpread(baseCurrency, currency);
    const fees = calculateFees(baseCurrency, currency);

    return {
      currency,
      rate,
      spread,
      fees,
      finalRate: rate * (1 + spread + fees),
      lastUpdate: new Date().toISOString(),
    };
  });
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
