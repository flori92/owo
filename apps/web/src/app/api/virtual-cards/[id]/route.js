import sql from "@/app/api/utils/sql";

export async function GET(request, { params }) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const includeSensitive = searchParams.get("includeSensitive") === "true";

    // Get specific virtual card
    const [card] = await sql`
      SELECT 
        id,
        card_number,
        card_holder_name,
        expiry_month,
        expiry_year,
        ${includeSensitive ? sql`cvv,` : sql``}
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
      WHERE id = ${id}
      LIMIT 1
    `;

    if (!card) {
      return Response.json(
        { error: "Virtual card not found" },
        { status: 404 },
      );
    }

    return Response.json({
      ...card,
      cardNumber: formatCardNumber(card.card_number),
    });
  } catch (error) {
    console.error("Error fetching virtual card:", error);
    return Response.json(
      { error: "Failed to fetch virtual card" },
      { status: 500 },
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { action, amount, ...updateFields } = body;

    // Handle specific actions
    if (action) {
      switch (action) {
        case "freeze":
          await sql`
            UPDATE virtual_cards 
            SET is_frozen = true, updated_at = NOW()
            WHERE id = ${id}
          `;
          return Response.json({
            success: true,
            message: "Card frozen successfully",
          });

        case "unfreeze":
          await sql`
            UPDATE virtual_cards 
            SET is_frozen = false, updated_at = NOW()
            WHERE id = ${id}
          `;
          return Response.json({
            success: true,
            message: "Card unfrozen successfully",
          });

        case "recharge":
          if (!amount || amount <= 0) {
            return Response.json(
              { error: "Valid amount is required for recharge" },
              { status: 400 },
            );
          }

          // Get current balance
          const [currentCard] = await sql`
            SELECT balance FROM virtual_cards WHERE id = ${id} LIMIT 1
          `;

          if (!currentCard) {
            return Response.json(
              { error: "Virtual card not found" },
              { status: 404 },
            );
          }

          const newBalance =
            parseFloat(currentCard.balance) + parseFloat(amount);

          // Update balance
          await sql`
            UPDATE virtual_cards 
            SET balance = ${newBalance}, updated_at = NOW()
            WHERE id = ${id}
          `;

          // Record the recharge transaction (you might want to create a separate transactions table for cards)
          return Response.json({
            success: true,
            message: "Card recharged successfully",
            newBalance,
            rechargeAmount: amount,
          });

        case "activate":
          await sql`
            UPDATE virtual_cards 
            SET is_active = true, updated_at = NOW()
            WHERE id = ${id}
          `;
          return Response.json({
            success: true,
            message: "Card activated successfully",
          });

        case "deactivate":
          await sql`
            UPDATE virtual_cards 
            SET is_active = false, updated_at = NOW()
            WHERE id = ${id}
          `;
          return Response.json({
            success: true,
            message: "Card deactivated successfully",
          });

        default:
          return Response.json({ error: "Unknown action" }, { status: 400 });
      }
    }

    // Handle general updates
    if (Object.keys(updateFields).length > 0) {
      const allowedFields = [
        "daily_limit",
        "monthly_limit",
        "card_holder_name",
      ];
      const updateData = {};

      for (const field of allowedFields) {
        if (updateFields[field] !== undefined) {
          updateData[field] = updateFields[field];
        }
      }

      if (Object.keys(updateData).length === 0) {
        return Response.json(
          { error: "No valid fields to update" },
          { status: 400 },
        );
      }

      // Build dynamic update query
      const setClause = Object.keys(updateData)
        .map((field, index) => `${field} = $${index + 2}`)
        .join(", ");

      const values = [id, ...Object.values(updateData)];

      await sql(
        `
        UPDATE virtual_cards 
        SET ${setClause}, updated_at = NOW()
        WHERE id = $1
      `,
        values,
      );

      return Response.json({
        success: true,
        message: "Card updated successfully",
      });
    }

    return Response.json(
      { error: "No action or update fields provided" },
      { status: 400 },
    );
  } catch (error) {
    console.error("Error updating virtual card:", error);
    return Response.json(
      { error: "Failed to update virtual card" },
      { status: 500 },
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    // Soft delete by deactivating the card
    await sql`
      UPDATE virtual_cards 
      SET is_active = false, is_frozen = true, updated_at = NOW()
      WHERE id = ${id}
    `;

    return Response.json({
      success: true,
      message: "Card deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting virtual card:", error);
    return Response.json(
      { error: "Failed to delete virtual card" },
      { status: 500 },
    );
  }
}

// Helper function
function formatCardNumber(cardNumber) {
  return cardNumber.replace(/(.{4})/g, "$1 ").trim();
}
