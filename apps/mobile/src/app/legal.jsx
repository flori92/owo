import { Alert, Linking, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import HeaderBar from '@/components/HeaderBar';
import ScreenContainer from '@/components/ScreenContainer';
import { LEGAL_CONFIG } from '@/config/appConfig';
import { useTheme } from '@/utils/useTheme';

export default function LegalScreen() {
  const theme = useTheme();
  const links = [
    ['Politique de confidentialité', LEGAL_CONFIG.privacyPolicyUrl],
    ["Conditions d'utilisation", LEGAL_CONFIG.termsUrl],
    ['Suppression des données', LEGAL_CONFIG.accountDeletionUrl],
  ];

  const openLink = async (url) => {
    if (!url) {
      Alert.alert('Lien indisponible', 'Ce document sera disponible avant la publication publique.');
      return;
    }
    await Linking.openURL(url);
  };

  return (
    <ScreenContainer>
      <HeaderBar title="Informations légales" showBack />
      <ScrollView contentContainerStyle={{ padding: 24 }}>
        <Text style={{ color: theme.colors.textSecondary, fontSize: 15, lineHeight: 22, marginBottom: 20 }}>
          Ces documents expliquent vos droits, l'utilisation de vos données et les règles applicables au service owo!.
        </Text>
        <View style={{ backgroundColor: theme.colors.elevated, borderRadius: 16, overflow: 'hidden' }}>
          {links.map(([label, url], index) => (
            <TouchableOpacity
              key={label}
              onPress={() => openLink(url)}
              style={{ padding: 18, borderBottomWidth: index < links.length - 1 ? 1 : 0, borderBottomColor: theme.colors.divider }}
            >
              <Text style={{ color: theme.colors.primary, fontSize: 16, fontWeight: '600' }}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
