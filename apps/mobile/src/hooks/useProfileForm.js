import { useState } from "react";
import { Alert } from "react-native";

export function useProfileForm(initialProfile, user, onSuccess) {
  const [firstName, setFirstName] = useState(initialProfile?.first_name || "");
  const [lastName, setLastName] = useState(initialProfile?.last_name || "");
  const [email, setEmail] = useState(
    initialProfile?.email || user?.email || "",
  );
  const [phone, setPhone] = useState(initialProfile?.phone || "");
  const [address, setAddress] = useState(initialProfile?.address || "");
  const [city, setCity] = useState(initialProfile?.city || "");
  const [saving, setSaving] = useState(false);

  const updateProfile = async (preferences) => {
    setSaving(true);
    try {
      const response = await fetch("/api/user-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          email: email,
          phone: phone,
          address: address,
          city: city,
          ...preferences,
        }),
      });

      if (response.ok) {
        Alert.alert("Succès", "Profil mis à jour");
        if (onSuccess) {
          onSuccess();
        }
        return true;
      } else {
        const error = await response.json();
        Alert.alert("Erreur", error.error || "Impossible de mettre à jour");
        return false;
      }
    } catch (error) {
      console.error("Erreur mise à jour profil:", error);
      Alert.alert("Erreur", "Erreur réseau");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const setFormData = (profile, user) => {
    setFirstName(profile?.first_name || "");
    setLastName(profile?.last_name || "");
    setEmail(profile?.email || user?.email || "");
    setPhone(profile?.phone || "");
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
