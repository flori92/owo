import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import {
  Bell,
  CheckCircle,
  AlertCircle,
  Info,
  Trash2,
  MoreHorizontal,
  ArrowLeft,
  X,
} from "lucide-react-native";
import { router } from "expo-router";
import { useTheme } from "@/utils/useTheme";
import { useRequireAuth } from "@/utils/auth/useAuth";
import ScreenContainer from "@/components/ScreenContainer";
import HeaderBar from "@/components/HeaderBar";
import LoadingScreen from "@/components/LoadingScreen";
import EmptyState from "@/components/EmptyState";

export default function NotificationsScreen() {
  useRequireAuth();

  const insets = useSafeAreaInsets();
  const theme = useTheme();

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);

      const response = await fetch("/api/notifications?limit=50");
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      } else {
        Alert.alert("Erreur", "Impossible de charger les notifications");
      }
    } catch (error) {
      console.error("Erreur chargement notifications:", error);
      Alert.alert("Erreur", "Erreur réseau");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadNotifications(false);
  }, []);

  const markAsRead = async (notificationId) => {
    try {
      const response = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "mark-read",
          data: { notificationId },
        }),
      });

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((notif) =>
            notif.id === notificationId ? { ...notif, isRead: true } : notif,
          ),
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Erreur marquage lu:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "mark-all-read",
        }),
      });

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((notif) => ({ ...notif, isRead: true })),
        );
        setUnreadCount(0);
        Alert.alert("Succès", "Toutes les notifications marquées comme lues");
      }
    } catch (error) {
      console.error("Erreur marquage tout lu:", error);
      Alert.alert("Erreur", "Impossible de marquer comme lues");
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      const response = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete",
          data: { notificationId },
        }),
      });

      if (response.ok) {
        setNotifications((prev) =>
          prev.filter((notif) => notif.id !== notificationId),
        );
      }
    } catch (error) {
      console.error("Erreur suppression:", error);
      Alert.alert("Erreur", "Impossible de supprimer");
    }
  };

  const getNotificationIcon = (type, priority) => {
    const iconColor =
      priority === "urgent"
        ? theme.colors.error
        : priority === "high"
          ? theme.colors.accent
          : theme.colors.primary;

    switch (type) {
      case "transaction_completed":
        return <CheckCircle size={24} color={theme.colors.success} />;
      case "transaction_failed":
        return <AlertCircle size={24} color={theme.colors.error} />;
      case "security_alert":
        return <AlertCircle size={24} color={theme.colors.error} />;
      case "rate_alert":
        return <Info size={24} color={theme.colors.primary} />;
      default:
        return <Bell size={24} color={iconColor} />;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return diffMinutes < 1 ? "À l'instant" : `Il y a ${diffMinutes}min`;
    } else if (diffHours < 24) {
      return `Il y a ${diffHours}h`;
    } else if (diffDays < 7) {
      return `Il y a ${diffDays}j`;
    } else {
      return date.toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "short",
      });
    }
  };

  if (!fontsLoaded) {
    return <LoadingScreen />;
  }

  if (loading) {
    return (
      <ScreenContainer>
        <HeaderBar
          title="Notifications"
          showBack={true}
          onBack={() => router.back()}
        />
        <LoadingScreen />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <HeaderBar
        title="Notifications"
        showBack={true}
        onBack={() => router.back()}
        rightComponent={
          unreadCount > 0 && (
            <TouchableOpacity
              onPress={markAllAsRead}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 6,
                backgroundColor: theme.colors.primary,
                borderRadius: 20,
              }}
            >
              <Text
                style={{
                  fontFamily: "Inter_500Medium",
                  fontSize: 12,
                  color: "#FFFFFF",
                }}
              >
                Tout lire
              </Text>
            </TouchableOpacity>
          )
        }
      />

      {notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="Aucune notification"
          description="Vous recevrez ici toutes vos notifications importantes"
        />
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingVertical: 20,
            paddingBottom: insets.bottom + 20,
          }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
            />
          }
          showsVerticalScrollIndicator={false}
        >
          {/* Stats header */}
          {unreadCount > 0 && (
            <View
              style={{
                backgroundColor: `${theme.colors.primary}15`,
                borderRadius: 12,
                padding: 16,
                marginBottom: 24,
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Bell size={20} color={theme.colors.primary} strokeWidth={1.5} />
              <Text
                style={{
                  fontFamily: "Inter_500Medium",
                  fontSize: 14,
                  color: theme.colors.primary,
                  marginLeft: 12,
                }}
              >
                {unreadCount} notification{unreadCount > 1 ? "s" : ""} non lue
                {unreadCount > 1 ? "s" : ""}
              </Text>
            </View>
          )}

          {/* Notifications List */}
          <View
            style={{
              backgroundColor: theme.colors.elevated,
              borderRadius: 16,
              overflow: "hidden",
            }}
          >
            {notifications.map((notification, index) => (
              <View key={notification.id}>
                <TouchableOpacity
                  style={{
                    flexDirection: "row",
                    alignItems: "flex-start",
                    padding: 20,
                    opacity: notification.isRead ? 0.7 : 1,
                  }}
                  onPress={() => {
                    if (!notification.isRead) {
                      markAsRead(notification.id);
                    }
                    if (notification.actionUrl) {
                      router.push(notification.actionUrl);
                    }
                  }}
                >
                  {/* Icon */}
                  <View
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 22,
                      backgroundColor: notification.isRead
                        ? theme.colors.background
                        : `${theme.colors.primary}15`,
                      justifyContent: "center",
                      alignItems: "center",
                      marginRight: 16,
                    }}
                  >
                    {getNotificationIcon(
                      notification.type,
                      notification.priority,
                    )}
                  </View>

                  {/* Content */}
                  <View style={{ flex: 1 }}>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                        marginBottom: 4,
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: notification.isRead
                            ? "Inter_500Medium"
                            : "Inter_600SemiBold",
                          fontSize: 15,
                          color: theme.colors.text,
                          flex: 1,
                          marginRight: 12,
                        }}
                      >
                        {notification.title}
                      </Text>

                      <TouchableOpacity
                        onPress={() => deleteNotification(notification.id)}
                        style={{
                          padding: 4,
                        }}
                      >
                        <X
                          size={16}
                          color={theme.colors.textSecondary}
                          strokeWidth={1.5}
                        />
                      </TouchableOpacity>
                    </View>

                    <Text
                      style={{
                        fontFamily: "Inter_400Regular",
                        fontSize: 14,
                        color: theme.colors.textSecondary,
                        lineHeight: 20,
                        marginBottom: 8,
                      }}
                    >
                      {notification.message}
                    </Text>

                    <Text
                      style={{
                        fontFamily: "Inter_400Regular",
                        fontSize: 12,
                        color: theme.colors.textSecondary,
                      }}
                    >
                      {formatDate(notification.createdAt)}
                    </Text>

                    {/* Priority indicator */}
                    {(notification.priority === "high" ||
                      notification.priority === "urgent") && (
                      <View
                        style={{
                          alignSelf: "flex-start",
                          backgroundColor:
                            notification.priority === "urgent"
                              ? theme.colors.error
                              : theme.colors.accent,
                          paddingHorizontal: 8,
                          paddingVertical: 4,
                          borderRadius: 12,
                          marginTop: 8,
                        }}
                      >
                        <Text
                          style={{
                            fontFamily: "Inter_600SemiBold",
                            fontSize: 10,
                            color: "#FFFFFF",
                          }}
                        >
                          {notification.priority === "urgent"
                            ? "URGENT"
                            : "IMPORTANT"}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Unread indicator */}
                  {!notification.isRead && (
                    <View
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: theme.colors.primary,
                        marginLeft: 8,
                        marginTop: 8,
                      }}
                    />
                  )}
                </TouchableOpacity>

                {index < notifications.length - 1 && (
                  <View
                    style={{
                      height: 1,
                      backgroundColor: theme.colors.divider,
                      marginLeft: 80,
                    }}
                  />
                )}
              </View>
            ))}
          </View>
        </ScrollView>
      )}
    </ScreenContainer>
  );
}
