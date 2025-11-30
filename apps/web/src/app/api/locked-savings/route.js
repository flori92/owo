import sql from "@/app/api/utils/sql.js";
import { auth } from "@/auth.js";
import argon2 from "argon2";

export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Non autorisé" }, { status: 401 });
    }

    const lockedSavings = await sql`
      SELECT 
        id,
        title,
        description,
        amount,
        currency,
        unlock_date,
        is_unlocked,
        unlock_reason,
        created_at,
        unlocked_at,
        CASE 
          WHEN unlock_date <= CURRENT_DATE THEN 'mature'
          WHEN is_unlocked THEN 'unlocked'
          ELSE 'locked'
        END as status
      FROM locked_savings 
      WHERE user_id = ${session.user.id}
      ORDER BY created_at DESC
    `;

    return Response.json({
      success: true,
      lockedSavings,
    });
  } catch (error) {
    console.error("Erreur récupération épargnes bloquées:", error);
    return Response.json(
      {
        error: "Erreur lors de la récupération des épargnes bloquées",
      },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Non autorisé" }, { status: 401 });
    }

    const {
      title,
      description,
      amount,
      currency = "FCFA",
      unlock_date,
      emergency_pin,
    } = await request.json();

    if (!title || !amount || amount <= 0 || !unlock_date) {
      return Response.json(
        {
          error: "Titre, montant et date de déblocage requis",
        },
        { status: 400 },
      );
    }

    // Vérifier que la date de déblocage est dans le futur
    const unlockDateTime = new Date(unlock_date);
    if (unlockDateTime <= new Date()) {
      return Response.json(
        {
          error: "La date de déblocage doit être dans le futur",
        },
        { status: 400 },
      );
    }

    // Hasher le PIN d'urgence si fourni
    let emergencyPinHash = null;
    if (emergency_pin) {
      if (emergency_pin.length < 4 || emergency_pin.length > 8) {
        return Response.json(
          {
            error: "Le PIN d'urgence doit contenir entre 4 et 8 caractères",
          },
          { status: 400 },
        );
      }
      emergencyPinHash = await argon2.hash(emergency_pin);
    }

    // Créer l'épargne bloquée
    const newLockedSaving = await sql`
      INSERT INTO locked_savings (
        user_id,
        title,
        description,
        amount,
        currency,
        unlock_date,
        emergency_pin_hash
      ) VALUES (
        ${session.user.id},
        ${title},
        ${description},
        ${parseFloat(amount)},
        ${currency},
        ${unlock_date},
        ${emergencyPinHash}
      ) RETURNING 
        id,
        title,
        description,
        amount,
        currency,
        unlock_date,
        is_unlocked,
        created_at
    `;

    return Response.json({
      success: true,
      lockedSaving: newLockedSaving[0],
      message: "Épargne bloquée créée avec succès",
    });
  } catch (error) {
    console.error("Erreur création épargne bloquée:", error);
    return Response.json(
      {
        error: "Erreur lors de la création de l'épargne bloquée",
      },
      { status: 500 },
    );
  }
}

export async function PATCH(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Non autorisé" }, { status: 401 });
    }

    const {
      id,
      action, // 'unlock_emergency' ou 'unlock_mature'
      emergency_pin,
    } = await request.json();

    if (!id || !action) {
      return Response.json(
        {
          error: "ID et action requis",
        },
        { status: 400 },
      );
    }

    // Récupérer l'épargne bloquée
    const lockedSaving = await sql`
      SELECT * FROM locked_savings 
      WHERE id = ${id} AND user_id = ${session.user.id}
    `;

    if (lockedSaving.length === 0) {
      return Response.json(
        {
          error: "Épargne bloquée non trouvée",
        },
        { status: 404 },
      );
    }

    const saving = lockedSaving[0];

    if (saving.is_unlocked) {
      return Response.json(
        {
          error: "Cette épargne a déjà été débloquée",
        },
        { status: 400 },
      );
    }

    let unlockReason = "";
    let canUnlock = false;

    if (action === "unlock_mature") {
      // Déblocage à maturité
      const unlockDate = new Date(saving.unlock_date);
      const now = new Date();

      if (now >= unlockDate) {
        canUnlock = true;
        unlockReason = "maturity";
      } else {
        return Response.json(
          {
            error: "Cette épargne ne peut pas encore être débloquée",
          },
          { status: 400 },
        );
      }
    } else if (action === "unlock_emergency") {
      // Déblocage d'urgence avec PIN
      if (!saving.emergency_pin_hash) {
        return Response.json(
          {
            error: "Aucun PIN d'urgence configuré pour cette épargne",
          },
          { status: 400 },
        );
      }

      if (!emergency_pin) {
        return Response.json(
          {
            error: "PIN d'urgence requis",
          },
          { status: 400 },
        );
      }

      // Vérifier le PIN d'urgence
      const pinValid = await argon2.verify(
        saving.emergency_pin_hash,
        emergency_pin,
      );
      if (!pinValid) {
        return Response.json(
          {
            error: "PIN d'urgence incorrect",
          },
          { status: 400 },
        );
      }

      canUnlock = true;
      unlockReason = "emergency";
    }

    if (!canUnlock) {
      return Response.json(
        {
          error: "Action de déblocage non valide",
        },
        { status: 400 },
      );
    }

    // Débloquer l'épargne
    const unlockedSaving = await sql`
      UPDATE locked_savings 
      SET 
        is_unlocked = TRUE,
        unlock_reason = ${unlockReason},
        unlocked_at = NOW()
      WHERE id = ${id} AND user_id = ${session.user.id}
      RETURNING *
    `;

    return Response.json({
      success: true,
      lockedSaving: unlockedSaving[0],
      message:
        unlockReason === "emergency"
          ? "Épargne débloquée en urgence"
          : "Épargne débloquée à maturité",
    });
  } catch (error) {
    console.error("Erreur déblocage épargne:", error);
    return Response.json(
      {
        error: "Erreur lors du déblocage de l'épargne",
      },
      { status: 500 },
    );
  }
}
