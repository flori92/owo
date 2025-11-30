import { useState, useEffect } from "react";

export function useDashboard(userId) {
  const [userProfile, setUserProfile] = useState(null);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [hasTransactions, setHasTransactions] = useState(true);

  useEffect(() => {
    if (userId) {
      loadUserProfile();
      loadNotifications();
    }
  }, [userId]);

  const loadUserProfile = async () => {
    try {
      const response = await fetch("/api/user-profile");
      if (response.ok) {
        const data = await response.json();
        setUserProfile(data.profile);
      }
    } catch (error) {
      console.error("Erreur chargement profil:", error);
    }
  };

  const loadNotifications = async () => {
    try {
      const response = await fetch("/api/notifications?unread=true");
      if (response.ok) {
        const data = await response.json();
        setUnreadNotificationCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error("Erreur chargement notifications:", error);
    }
  };

  const toggleBalanceVisibility = () => {
    setBalanceVisible(!balanceVisible);
  };

  return {
    userProfile,
    unreadNotificationCount,
    balanceVisible,
    hasTransactions,
    toggleBalanceVisibility,
  };
}
