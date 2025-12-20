import sql from "@/app/api/utils/sql.js";
import { auth } from "@/auth.js";
import { isDemoRequest, isMissingDatabaseError } from "@/app/api/utils/demo.js";

export async function GET(request) {
  try {
    const demo = isDemoRequest(request);
    const session = demo ? null : await auth();
    if (!demo && !session?.user?.id) {
      return Response.json({ error: "Non autorisé" }, { status: 401 });
    }

    if (demo) {
      const demoNotifications = [
        {
          id: "demo-notif-1",
          type: "transaction_completed",
          title: "Transaction complétée ",
          message: "Votre dépôt de 25 000 FCFA a été traité avec succès.",
          data: { amount: 25000, currency: "FCFA" },
          isRead: false,
          priority: "high",
          actionUrl: "/transactions",
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: "demo-notif-2",
          type: "rate_alert",
          title: "Alerte de taux ",
          message: "Le taux EUR/XOF a atteint 655.9.",
          data: { fromCurrency: "EUR", toCurrency: "XOF", rate: 655.9 },
          isRead: true,
          priority: "low",
          actionUrl: "/currency",
          createdAt: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
        },
      ];

      return Response.json({
        success: true,
        notifications: demoNotifications,
        unreadCount: demoNotifications.filter((n) => !n.isRead).length,
        hasMore: false,
      });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");
    const unreadOnly = searchParams.get("unread") === "true";

    let query = sql`
      SELECT * FROM notifications 
      WHERE user_id = ${session.user.id}
    `;

    if (unreadOnly) {
      query = sql`
        SELECT * FROM notifications 
        WHERE user_id = ${session.user.id}
        AND is_read = false
      `;
    }

    const notifications = await sql`
      ${query}
      ORDER BY created_at DESC 
      LIMIT ${limit} OFFSET ${offset}
    `;

    // Compter le nombre total de notifications non lues
    const unreadCount = await sql`
      SELECT COUNT(*) as count FROM notifications 
      WHERE user_id = ${session.user.id} AND is_read = false
    `;

    return Response.json({
      success: true,
      notifications: notifications.map((notif) => ({
        id: notif.id,
        type: notif.type,
        title: notif.title,
        message: notif.message,
        data: notif.data,
        isRead: notif.is_read,
        priority: notif.priority,
        actionUrl: notif.action_url,
        createdAt: notif.created_at,
      })),
      unreadCount: parseInt(unreadCount[0].count),
      hasMore: notifications.length === limit,
    });
  } catch (error) {
    console.error("Erreur récupération notifications:", error);
    if (isMissingDatabaseError(error)) {
      return Response.json(
        {
          success: true,
          notifications: [],
          unreadCount: 0,
          hasMore: false,
        },
        { status: 200 },
      );
    }
    return Response.json(
      {
        error: "Erreur lors de la récupération des notifications",
      },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const demo = isDemoRequest(request);
    const session = demo ? null : await auth();
    if (!demo && !session?.user?.id) {
      return Response.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { action, data } = await request.json();

    if (demo) {
      return Response.json({ success: true, message: "OK (demo)" });
    }

    switch (action) {
      case "mark-read":
        return await markNotificationRead(data.notificationId, session.user.id);
      case "mark-all-read":
        return await markAllNotificationsRead(session.user.id);
      case "create":
        return await createNotification(data, session.user.id);
      case "delete":
        return await deleteNotification(data.notificationId, session.user.id);
      default:
        return Response.json(
          { error: "Action non supportée" },
          { status: 400 },
        );
    }
  } catch (error) {
    console.error("Erreur API notifications:", error);
    if (isMissingDatabaseError(error)) {
      return Response.json({ success: true, message: "OK (no-db)" }, { status: 200 });
    }
    return Response.json(
      {
        error: "Erreur lors de l'opération notification",
      },
      { status: 500 },
    );
  }
}

async function markNotificationRead(notificationId, userId) {
  try {
    await sql`
      UPDATE notifications 
      SET is_read = true, read_at = NOW()
      WHERE id = ${notificationId} AND user_id = ${userId}
    `;

    return Response.json({
      success: true,
      message: "Notification marquée comme lue",
    });
  } catch (error) {
    console.error("Erreur mark read:", error);
    return Response.json(
      {
        error: "Erreur lors du marquage de la notification",
      },
      { status: 500 },
    );
  }
}

async function markAllNotificationsRead(userId) {
  try {
    const result = await sql`
      UPDATE notifications 
      SET is_read = true, read_at = NOW()
      WHERE user_id = ${userId} AND is_read = false
    `;

    return Response.json({
      success: true,
      updated: result.length,
      message: "Toutes les notifications marquées comme lues",
    });
  } catch (error) {
    console.error("Erreur mark all read:", error);
    return Response.json(
      {
        error: "Erreur lors du marquage des notifications",
      },
      { status: 500 },
    );
  }
}

async function createNotification(data, userId) {
  try {
    const {
      type,
      title,
      message,
      priority = "medium",
      actionUrl,
      notificationData,
    } = data;

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
        ${userId},
        ${type},
        ${title},
        ${message},
        ${JSON.stringify(notificationData || {})},
        ${priority},
        ${actionUrl},
        NOW()
      ) RETURNING *
    `;

    // Si c'est une notification haute priorité, envoyer une push notification
    if (priority === "high" || priority === "urgent") {
      await sendPushNotification(userId, {
        title,
        message,
        data: notificationData,
      });
    }

    return Response.json({
      success: true,
      notification: {
        id: notification[0].id,
        type: notification[0].type,
        title: notification[0].title,
        message: notification[0].message,
        priority: notification[0].priority,
        createdAt: notification[0].created_at,
      },
      message: "Notification créée",
    });
  } catch (error) {
    console.error("Erreur create notification:", error);
    return Response.json(
      {
        error: "Erreur lors de la création de la notification",
      },
      { status: 500 },
    );
  }
}

async function deleteNotification(notificationId, userId) {
  try {
    await sql`
      DELETE FROM notifications 
      WHERE id = ${notificationId} AND user_id = ${userId}
    `;

    return Response.json({
      success: true,
      message: "Notification supprimée",
    });
  } catch (error) {
    console.error("Erreur delete notification:", error);
    return Response.json(
      {
        error: "Erreur lors de la suppression de la notification",
      },
      { status: 500 },
    );
  }
}

// Fonction pour créer des notifications automatiques
export async function createSystemNotification(userId, type, data) {
  try {
    let title,
      message,
      priority = "medium",
      actionUrl;

    switch (type) {
      case "transaction_completed":
        title = "Transaction complétée ✅";
        message = `Votre ${data.type} de ${data.amount} ${data.currency} a été traité avec succès`;
        priority = "high";
        actionUrl = "/transactions";
        break;

      case "transaction_failed":
        title = "Transaction échouée ❌";
        message = `Votre ${data.type} de ${data.amount} ${data.currency} a échoué. Veuillez réessayer.`;
        priority = "urgent";
        actionUrl = "/transactions";
        break;

      case "card_payment":
        title = "Paiement par carte 💳";
        message = `Paiement de ${data.amount} ${data.currency} chez ${data.merchant}`;
        priority = "medium";
        actionUrl = "/virtual-card";
        break;

      case "rate_alert":
        title = "Alerte de taux 📈";
        message = `Le taux ${data.fromCurrency}/${data.toCurrency} a atteint ${data.rate}`;
        priority = "high";
        actionUrl = "/currency";
        break;

      case "low_balance":
        title = "Solde faible ⚠️";
        message = `Votre solde ${data.accountType} est de ${data.balance} ${data.currency}`;
        priority = "medium";
        actionUrl = "/dashboard";
        break;

      case "security_alert":
        title = "Alerte de sécurité 🔒";
        message = data.message;
        priority = "urgent";
        actionUrl = "/profile/security";
        break;

      case "kyc_update":
        title = "Mise à jour KYC 📄";
        message = data.message;
        priority = "high";
        actionUrl = "/profile/verification";
        break;

      case "promotion":
        title = "Nouvelle promotion 🎉";
        message = data.message;
        priority = "low";
        actionUrl = data.actionUrl || "/dashboard";
        break;

      default:
        title = "Notification owo!";
        message = data.message || "Nouvelle notification";
        break;
    }

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
        ${userId},
        ${type},
        ${title},
        ${message},
        ${JSON.stringify(data)},
        ${priority},
        ${actionUrl},
        NOW()
      ) RETURNING *
    `;

    // Envoyer push notification si priorité élevée
    if (priority === "high" || priority === "urgent") {
      await sendPushNotification(userId, {
        title,
        message,
        data,
      });
    }

    return notification[0];
  } catch (error) {
    console.error("Erreur create system notification:", error);
    throw error;
  }
}

async function sendPushNotification(userId, notificationData) {
  try {
    // Récupérer les tokens de push notification de l'utilisateur
    const pushTokens = await sql`
      SELECT push_token FROM user_push_tokens 
      WHERE user_id = ${userId} AND is_active = true
    `;

    if (pushTokens.length === 0) {
      return;
    }

    // Simuler l'envoi de push notifications
    // En production, on utiliserait Firebase Cloud Messaging ou un autre service
    console.log("Envoi push notification:", {
      userId,
      tokens: pushTokens.map((t) => t.push_token),
      notification: notificationData,
    });

    // Ici on intégrerait avec Firebase, OneSignal, etc.
  } catch (error) {
    console.error("Erreur send push notification:", error);
    // Ne pas faire échouer la notification si la push notification échoue
  }
}

// Fonction pour nettoyer les anciennes notifications
export async function cleanupOldNotifications() {
  try {
    // Supprimer les notifications lues de plus de 30 jours
    await sql`
      DELETE FROM notifications 
      WHERE is_read = true 
      AND created_at < NOW() - INTERVAL '30 days'
    `;

    // Supprimer les notifications non lues de plus de 90 jours
    await sql`
      DELETE FROM notifications 
      WHERE is_read = false 
      AND created_at < NOW() - INTERVAL '90 days'
    `;

    console.log("Nettoyage des anciennes notifications effectué");
  } catch (error) {
    console.error("Erreur cleanup notifications:", error);
  }
}
