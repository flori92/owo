import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    if (from && to) {
      // Get specific exchange rate
      const [rate] = await sql`
        SELECT from_currency, to_currency, rate, fees_percentage, updated_at 
        FROM exchange_rates 
        WHERE from_currency = ${from} AND to_currency = ${to}
        LIMIT 1
      `;

      if (!rate) {
        return Response.json(
          { error: "Exchange rate not found" },
          { status: 404 },
        );
      }

      return Response.json(rate);
    } else {
      // Get all exchange rates
      const rates = await sql`
        SELECT from_currency, to_currency, rate, fees_percentage, updated_at 
        FROM exchange_rates 
        ORDER BY updated_at DESC
      `;

      return Response.json(rates);
    }
  } catch (error) {
    console.error("Error fetching exchange rates:", error);
    return Response.json(
      { error: "Failed to fetch exchange rates" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      userId,
      fromAccountType,
      fromAccountId,
      toAccountType,
      toAccountId,
      fromCurrency,
      toCurrency,
      fromAmount,
      provider = "owo_internal",
    } = body;

    if (!userId || !fromCurrency || !toCurrency || !fromAmount) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Get exchange rate
    const [exchangeRate] = await sql`
      SELECT rate, fees_percentage 
      FROM exchange_rates 
      WHERE from_currency = ${fromCurrency} AND to_currency = ${toCurrency}
      LIMIT 1
    `;

    if (!exchangeRate) {
      return Response.json(
        { error: "Exchange rate not available" },
        { status: 400 },
      );
    }

    // Calculate amounts
    const rate = parseFloat(exchangeRate.rate);
    const feesPercentage = parseFloat(exchangeRate.fees_percentage);
    const convertedAmount = parseFloat(fromAmount) * rate;
    const feesAmount = convertedAmount * feesPercentage;
    const finalAmount = convertedAmount - feesAmount;
    const totalDebited = parseFloat(fromAmount);

    // Generate reference number
    const referenceNumber = `OWO${Date.now()}${Math.floor(Math.random() * 1000)}`;

    // Create currency transfer record
    const [transfer] = await sql`
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
        provider,
        created_at
      ) VALUES (
        ${userId},
        ${fromAccountType},
        ${fromAccountId},
        ${toAccountType},
        ${toAccountId},
        ${fromCurrency},
        ${toCurrency},
        ${totalDebited},
        ${finalAmount},
        ${rate},
        ${feesAmount},
        ${totalDebited},
        'completed',
        ${referenceNumber},
        ${provider},
        NOW()
      ) RETURNING *
    `;

    return Response.json({
      success: true,
      transfer,
      exchangeDetails: {
        fromAmount: totalDebited,
        fromCurrency,
        toAmount: finalAmount,
        toCurrency,
        exchangeRate: rate,
        fees: feesAmount,
        referenceNumber,
      },
    });
  } catch (error) {
    console.error("Error processing currency exchange:", error);
    return Response.json(
      { error: "Failed to process currency exchange" },
      { status: 500 },
    );
  }
}
