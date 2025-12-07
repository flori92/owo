import { useState, useEffect, useCallback } from "react";
import { getProfile } from "@/lib/firebase";

export function useProfile(userId) {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUserProfile = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      const { success, profile, error } = await getProfile(userId);
      
      if (success && profile) {
        setUserProfile(profile);
      } else {
        console.log("Profil non trouvé ou erreur:", error);
        setUserProfile(null);
      }
    } catch (error) {
      console.error("Erreur chargement profil:", error);
      setUserProfile(null);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadUserProfile();
  }, [loadUserProfile]);

  return { userProfile, loading, refetch: loadUserProfile };
}
