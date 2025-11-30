import sql from "@/app/api/utils/sql.js";
import { auth } from "@/auth.js";
import crypto from "crypto";

export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Non autorisé" }, { status: 401 });
    }

    const url = new URL(request.url);
    const type = url.searchParams.get("type") || "all"; // all, created, joined

    let query;

    if (type === "created") {
      query = sql`
        SELECT 
          gs.*,
          COUNT(gsm.id) as member_count,
          u.name as creator_name
        FROM group_savings gs
        LEFT JOIN group_savings_members gsm ON gs.id = gsm.group_saving_id
        LEFT JOIN auth_users u ON gs.created_by = u.id
        WHERE gs.created_by = ${session.user.id}
        GROUP BY gs.id, u.name
        ORDER BY gs.created_at DESC
      `;
    } else if (type === "joined") {
      query = sql`
        SELECT 
          gs.*,
          COUNT(gsm2.id) as member_count,
          gsm.contributed_amount as my_contribution,
          gsm.role,
          u.name as creator_name
        FROM group_savings gs
        JOIN group_savings_members gsm ON gs.id = gsm.group_saving_id
        LEFT JOIN group_savings_members gsm2 ON gs.id = gsm2.group_saving_id
        LEFT JOIN auth_users u ON gs.created_by = u.id
        WHERE gsm.user_id = ${session.user.id} AND gs.created_by != ${session.user.id}
        GROUP BY gs.id, gsm.contributed_amount, gsm.role, u.name
        ORDER BY gs.created_at DESC
      `;
    } else {
      query = sql`
        SELECT DISTINCT
          gs.*,
          COUNT(gsm2.id) as member_count,
          COALESCE(gsm.contributed_amount, 0) as my_contribution,
          COALESCE(gsm.role, 'none') as my_role,
          u.name as creator_name
        FROM group_savings gs
        LEFT JOIN group_savings_members gsm ON gs.id = gsm.group_saving_id AND gsm.user_id = ${session.user.id}
        LEFT JOIN group_savings_members gsm2 ON gs.id = gsm2.group_saving_id
        LEFT JOIN auth_users u ON gs.created_by = u.id
        WHERE (gs.created_by = ${session.user.id} OR gsm.user_id = ${session.user.id})
        GROUP BY gs.id, gsm.contributed_amount, gsm.role, u.name
        ORDER BY gs.created_at DESC
      `;
    }

    const groupSavings = await query;

    return Response.json({
      success: true,
      groupSavings,
    });
  } catch (error) {
    console.error("Erreur récupération cagnottes:", error);
    return Response.json(
      {
        error: "Erreur lors de la récupération des cagnottes",
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
      target_amount,
      currency = "FCFA",
      target_date,
      is_private = false,
    } = await request.json();

    if (!title || !target_amount || target_amount <= 0) {
      return Response.json(
        {
          error: "Titre et montant cible requis",
        },
        { status: 400 },
      );
    }

    // Générer un code d'invitation unique
    const invite_code = crypto.randomBytes(8).toString("hex").toUpperCase();

    // Créer la cagnotte
    const newGroupSaving = await sql`
      INSERT INTO group_savings (
        title,
        description,
        target_amount,
        currency,
        target_date,
        is_private,
        invite_code,
        created_by
      ) VALUES (
        ${title},
        ${description},
        ${parseFloat(target_amount)},
        ${currency},
        ${target_date},
        ${is_private},
        ${invite_code},
        ${session.user.id}
      ) RETURNING *
    `;

    // Ajouter le créateur comme admin
    await sql`
      INSERT INTO group_savings_members (
        group_saving_id,
        user_id,
        role
      ) VALUES (
        ${newGroupSaving[0].id},
        ${session.user.id},
        'admin'
      )
    `;

    return Response.json({
      success: true,
      groupSaving: newGroupSaving[0],
      message: "Cagnotte créée avec succès",
    });
  } catch (error) {
    console.error("Erreur création cagnotte:", error);
    return Response.json(
      {
        error: "Erreur lors de la création de la cagnotte",
      },
      { status: 500 },
    );
  }
}
