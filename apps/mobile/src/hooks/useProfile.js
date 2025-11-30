import { useState, useEffect } from "react";

export function useProfile(userId) {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/user-profile");
      if (response.ok) {
        const data = await response.json();
        setUserProfile(data.profile);
      }
    } catch (error) {
      console.error("Erreur chargement profil:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      loadUserProfile();
    }
  }, [userId]);

  return { userProfile, loading, refetch: loadUserProfile };
}
