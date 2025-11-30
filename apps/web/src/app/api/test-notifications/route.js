import sql from "@/app/api/utils/sql.js";
import { auth } from "@/auth.js";

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Créer quelques notifications de test
    const testNotifications = [
      {
        type: "transaction_completed",
        title: "Transaction réussie ✅",
        message: "Votre virement de 50 000 FCFA a été traité avec succès",
        priority: "high",
        action_url: "/transactions",
      },
      {
        type: "rate_alert",
        title: "Alerte de taux 📈",
        message:
          "Le taux EUR/FCFA a atteint votre seuil de 660 FCFA pour 1 EUR",
        priority: "high",
        action_url: "/currency",
      },
      {
        type: "card_payment",
        title: "Paiement par carte 💳",
        message: "Paiement de 89.99 € chez Amazon avec votre carte owo! Visa",
        priority: "medium",
        action_url: "/virtual-card",
      },
      {
        type: "security_alert",
        title: "Alerte de sécurité 🔒",
        message: "Nouvelle connexion détectée depuis un appareil inconnu",
        priority: "urgent",
        action_url: "/profile",
      },
      {
        type: "promotion",
        title: "Nouvelle promotion 🎉",
        message:
          "Découvrez nos nouvelles fonctionnalités de cagnottes collaboratives !",
        priority: "low",
        action_url: "/group-savings",
      },
    ];

    const createdNotifications = [];

    for (const notif of testNotifications) {
      const notification = await sql`
        INSERT INTO notifications (
          user_id,
          type,
          title,
          message,
          data,
          priority,
          action_url,
          created_at
        ) VALUES (
          ${session.user.id},
          ${notif.type},
          ${notif.title},
          ${notif.message},
          ${JSON.stringify({})},
          ${notif.priority},
          ${notif.action_url},
          NOW()
        ) RETURNING *
      `;

      createdNotifications.push(notification[0]);
    }

    return Response.json({
      success: true,
      message: `${testNotifications.length} notifications de test créées`,
      notifications: createdNotifications,
    });
  } catch (error) {
    console.error("Erreur création notifications test:", error);
    return Response.json(
      {
        error: "Erreur lors de la création des notifications de test",
      },
      { status: 500 },
    );
  }
}
