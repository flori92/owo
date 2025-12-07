import { useState } from "react";
import { Alert } from "react-native";
import { updateUserProfile as firebaseUpdateProfile } from "@/lib/firebase";

export function useProfileForm(initialProfile, user, onSuccess) {
  const [firstName, setFirstName] = useState(initialProfile?.firstName || initialProfile?.first_name || "");
  const [lastName, setLastName] = useState(initialProfile?.lastName || initialProfile?.last_name || "");
  const [email, setEmail] = useState(
    initialProfile?.email || user?.email || "",
  );
  const [phone, setPhone] = useState(initialProfile?.phone || initialProfile?.phoneNumber || "");
  const [address, setAddress] = useState(initialProfile?.address || "");
  const [city, setCity] = useState(initialProfile?.city || "");
  const [saving, setSaving] = useState(false);

  const updateProfile = async (preferences) => {
    if (!user?.uid) {
      Alert.alert("Erreur", "Utilisateur non connecté");
      return false;
    }

    setSaving(true);
    try {
      const profileData = {
        firstName: firstName,
        lastName: lastName,
        displayName: `${firstName} ${lastName}`.trim(),
        email: email,
        phone: phone,
        phoneNumber: phone,
        address: address,
        city: city,
        ...preferences,
      };

      const { success, error } = await firebaseUpdateProfile(user.uid, profileData);

      if (success) {
        Alert.alert("Succès", "Profil mis à jour");
        if (onSuccess) {
          onSuccess();
        }
        return true;
      } else {
        Alert.alert("Erreur", error || "Impossible de mettre à jour");
        return false;
      }
    } catch (error) {
      console.error("Erreur mise à jour profil:", error);
      Alert.alert("Erreur", "Erreur lors de la mise à jour");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const setFormData = (profile, user) => {
    setFirstName(profile?.firstName || profile?.first_name || "");
    setLastName(profile?.lastName || profile?.last_name || "");
    setEmail(profile?.email || user?.email || "");
    setPhone(profile?.phone || profile?.phoneNumber || "");
    setAddress(profile?.address || "");
    setCity(profile?.city || "");
  };

  return {
    firstName,
    setFirstName,
    lastName,
    setLastName,
    email,
    setEmail,
    phone,
    setPhone,
    address,
    setAddress,
    city,
    setCity,
    saving,
    updateProfile,
    setFormData,
  };
}
