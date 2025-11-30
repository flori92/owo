import sql from "@/app/api/utils/sql.js";
import { auth } from "@/auth.js";

// Langues supportées
const SUPPORTED_LANGUAGES = [
  {
    code: "fr",
    name: "Français",
    nativeName: "Français",
    countryCode: "FR",
    flag: "🇫🇷",
  },
  {
    code: "en",
    name: "English",
    nativeName: "English",
    countryCode: "US",
    flag: "🇺🇸",
  },
  {
    code: "yo",
    name: "Yoruba",
    nativeName: "Yorùbá",
    countryCode: "NG",
    flag: "🇳🇬",
  },
  {
    code: "ff",
    name: "Fulah",
    nativeName: "Fulfulde",
    countryCode: "BF",
    flag: "🇧🇫",
  },
  {
    code: "ha",
    name: "Hausa",
    nativeName: "Hausa",
    countryCode: "NE",
    flag: "🇳🇪",
  },
];

export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Non autorisé" }, { status: 401 });
    }

    const url = new URL(request.url);
    const type = url.searchParams.get("type");

    if (type === "supported") {
      // Retourner toutes les langues supportées
      return Response.json({
        success: true,
        languages: SUPPORTED_LANGUAGES,
      });
    }

    // Récupérer les préférences de langue de l'utilisateur
    const userLanguagePrefs = await sql`
      SELECT * FROM user_language_preferences 
      WHERE user_id = ${session.user.id}
    `;

    const currentLanguage =
      userLanguagePrefs.length > 0
        ? userLanguagePrefs[0]
        : {
            language_code: "fr",
            country_code: "FR",
            date_format: "DD/MM/YYYY",
            currency_display: "symbol",
            number_format: "european",
          };

    return Response.json({
      success: true,
      currentLanguage,
      supportedLanguages: SUPPORTED_LANGUAGES,
    });
  } catch (error) {
    console.error("Erreur récupération langues:", error);
    return Response.json(
      {
        error: "Erreur lors de la récupération des langues",
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
      language_code,
      country_code,
      date_format,
      currency_display,
      number_format,
    } = await request.json();

    if (!language_code) {
      return Response.json(
        {
          error: "Code de langue requis",
        },
        { status: 400 },
      );
    }

    // Vérifier que la langue est supportée
    const isSupported = SUPPORTED_LANGUAGES.find(
      (lang) => lang.code === language_code,
    );
    if (!isSupported) {
      return Response.json(
        {
          error: "Langue non supportée",
        },
        { status: 400 },
      );
    }

    // Mettre à jour les préférences de langue
    const updatedPrefs = await sql`
      INSERT INTO user_language_preferences (
        user_id,
        language_code,
        country_code,
        date_format,
        currency_display,
        number_format,
        created_at,
        updated_at
      ) VALUES (
        ${session.user.id},
        ${language_code},
        ${country_code || isSupported.countryCode},
        ${date_format || "DD/MM/YYYY"},
        ${currency_display || "symbol"},
        ${number_format || "european"},
        NOW(),
        NOW()
      )
      ON CONFLICT (user_id)
      DO UPDATE SET
        language_code = EXCLUDED.language_code,
        country_code = EXCLUDED.country_code,
        date_format = EXCLUDED.date_format,
        currency_display = EXCLUDED.currency_display,
        number_format = EXCLUDED.number_format,
        updated_at = NOW()
      RETURNING *
    `;

    return Response.json({
      success: true,
      languagePrefs: updatedPrefs[0],
      message: "Préférences de langue mises à jour",
    });
  } catch (error) {
    console.error("Erreur mise à jour langue:", error);
    return Response.json(
      {
        error: "Erreur lors de la mise à jour des préférences de langue",
      },
      { status: 500 },
    );
  }
}
