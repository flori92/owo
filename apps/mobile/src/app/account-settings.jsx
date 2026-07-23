import { useState } from 'react';
import { ActivityIndicator, Alert, Linking, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import HeaderBar from '@/components/HeaderBar';
import ScreenContainer from '@/components/ScreenContainer';
import { LEGAL_CONFIG } from '@/config/appConfig';
import { submitAccountDeletion } from '@/services/account';
import { useTheme } from '@/utils/useTheme';

export default function AccountSettingsScreen() {
  const theme = useTheme();
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submitDeletionRequest = async () => {
    setSubmitting(true);
    const result = await submitAccountDeletion(reason);
    setSubmitting(false);

    if (result.success) {
      Alert.alert(
        'Demande enregistrée',
        "Votre demande de suppression a été transmise. Vous recevrez une confirmation après les vérifications réglementaires nécessaires.",
      );
      setReason('');
      return;
    }

    Alert.alert('Demande impossible', result.error || 'Veuillez réessayer plus tard.');
  };

  const confirmDeletion = () => {
    Alert.alert(
      'Supprimer mon compte',
      "Cette demande concerne votre compte et vos données personnelles. Certaines données financières peuvent être conservées pendant la durée imposée par la loi.",
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Continuer', style: 'destructive', onPress: submitDeletionRequest },
      ],
    );
  };

  return (
    <ScreenContainer>
      <HeaderBar title="Compte et sécurité" showBack />
      <ScrollView contentContainerStyle={{ padding: 24, gap: 20 }}>
        <View style={{ backgroundColor: theme.colors.elevated, borderRadius: 16, padding: 20 }}>
          <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: '700', marginBottom: 8 }}>
            Vos données
          </Text>
          <Text style={{ color: theme.colors.textSecondary, fontSize: 15, lineHeight: 22 }}>
            Consultez notre politique de confidentialité pour connaître les données collectées, leur usage et leur durée de conservation.
          </Text>
          <TouchableOpacity
            onPress={() => LEGAL_CONFIG.privacyPolicyUrl && Linking.openURL(LEGAL_CONFIG.privacyPolicyUrl)}
            disabled={!LEGAL_CONFIG.privacyPolicyUrl}
            style={{ marginTop: 16 }}
          >
            <Text style={{ color: LEGAL_CONFIG.privacyPolicyUrl ? theme.colors.primary : theme.colors.disabledText, fontWeight: '600' }}>
              Ouvrir la politique de confidentialité
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ backgroundColor: theme.colors.elevated, borderRadius: 16, padding: 20 }}>
          <Text style={{ color: theme.colors.error, fontSize: 18, fontWeight: '700', marginBottom: 8 }}>
            Suppression du compte
          </Text>
          <Text style={{ color: theme.colors.textSecondary, fontSize: 15, lineHeight: 22 }}>
            Vous pouvez initier ici la suppression de votre compte. Indiquez facultativement un motif pour aider notre équipe à traiter la demande.
          </Text>
          <TextInput
            value={reason}
            onChangeText={setReason}
            editable={!submitting}
            maxLength={500}
            multiline
            placeholder="Motif facultatif"
            placeholderTextColor={theme.colors.textTertiary}
            style={{
              minHeight: 96,
              marginTop: 16,
              padding: 14,
              borderWidth: 1,
              borderColor: theme.colors.border,
              borderRadius: 12,
              color: theme.colors.text,
              textAlignVertical: 'top',
            }}
          />
          <TouchableOpacity
            accessibilityRole="button"
            onPress={confirmDeletion}
            disabled={submitting}
            style={{
              marginTop: 16,
              minHeight: 48,
              borderRadius: 12,
              backgroundColor: theme.colors.error,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: submitting ? 0.6 : 1,
            }}
          >
            {submitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>Demander la suppression</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
