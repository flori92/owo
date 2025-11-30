import sql from "@/app/api/utils/sql.js";
import { auth } from "@/auth.js";

export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Récupérer les informations utilisateur complètes
    const userProfile = await sql`
      SELECT 
        u.*,
        up.currency,
        up.language,
        up.timezone,
        up.notifications_enabled,
        up.biometric_enabled,
        up.dark_mode_enabled,
        up.monthly_budget,
        up.first_name,
        up.last_name,
        up.date_of_birth,
        up.address,
        up.city,
        up.country,
        up.occupation,
        up.profile_picture_url,
        ulp.language_code,
        ulp.country_code,
        ulp.date_format,
        ulp.currency_display,
        ulp.number_format
      FROM auth_users u
      LEFT JOIN user_preferences up ON u.id = up.user_id
      LEFT JOIN user_language_preferences ulp ON u.id = ulp.user_id
      WHERE u.id = ${session.user.id}
    `;

    if (userProfile.length === 0) {
      return Response.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 },
      );
    }

    return Response.json({
      success: true,
      profile: userProfile[0],
    });
  } catch (error) {
    console.error("Erreur récupération profil:", error);
    return Response.json(
      {
        error: "Erreur lors de la récupération du profil",
      },
      { status: 500 },
    );
  }
}

export async function PUT(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Non autorisé" }, { status: 401 });
    }

    const {
      name,
      first_name,
      last_name,
      email,
      phone,
      date_of_birth,
      address,
      city,
      country,
      occupation,
      language_code,
      currency,
      timezone,
      notifications_enabled,
      biometric_enabled,
      dark_mode_enabled,
      monthly_budget,
    } = await request.json();

    // Mettre à jour la table auth_users
    if (name || email) {
      await sql`
        UPDATE auth_users 
        SET 
          name = COALESCE(${name}, name),
          email = COALESCE(${email}, email)
        WHERE id = ${session.user.id}
      `;
    }

    // Mettre à jour ou créer les préférences utilisateur
    await sql`
      INSERT INTO user_preferences (
        user_id, 
        first_name,
        last_name,
        date_of_birth,
        address,
        city,
        country,
        occupation,
        currency,
        timezone,
        notifications_enabled,
        biometric_enabled,
        dark_mode_enabled,
        monthly_budget,
        updated_at
      ) VALUES (
        ${session.user.id},
        ${first_name},
        ${last_name},
        ${date_of_birth},
        ${address},
        ${city},
        ${country || "Benin"},
        ${occupation},
        ${currency || "FCFA"},
        ${timezone || "Africa/Porto-Novo"},
        ${notifications_enabled !== undefined ? notifications_enabled : true},
        ${biometric_enabled !== undefined ? biometric_enabled : false},
        ${dark_mode_enabled !== undefined ? dark_mode_enabled : false},
        ${monthly_budget},
        NOW()
      )
      ON CONFLICT (user_id) 
      DO UPDATE SET
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        date_of_birth = EXCLUDED.date_of_birth,
        address = EXCLUDED.address,
        city = EXCLUDED.city,
        country = EXCLUDED.country,
        occupation = EXCLUDED.occupation,
        currency = EXCLUDED.currency,
        timezone = EXCLUDED.timezone,
        notifications_enabled = EXCLUDED.notifications_enabled,
        biometric_enabled = EXCLUDED.biometric_enabled,
        dark_mode_enabled = EXCLUDED.dark_mode_enabled,
        monthly_budget = EXCLUDED.monthly_budget,
        updated_at = NOW()
    `;

    // Mettre à jour les préférences de langue
    if (language_code) {
      await sql`
        INSERT INTO user_language_preferences (
          user_id,
          language_code,
          country_code,
          created_at,
          updated_at
        ) VALUES (
          ${session.user.id},
          ${language_code},
          ${language_code === "fr" ? "FR" : "EN"},
          NOW(),
          NOW()
        )
        ON CONFLICT (user_id)
        DO UPDATE SET
          language_code = EXCLUDED.language_code,
          country_code = EXCLUDED.country_code,
          updated_at = NOW()
      `;
    }

    return Response.json({
      success: true,
      message: "Profil mis à jour avec succès",
    });
  } catch (error) {
    console.error("Erreur mise à jour profil:", error);
    return Response.json(
      {
        error: "Erreur lors de la mise à jour du profil",
      },
      { status: 500 },
    );
  }
}
