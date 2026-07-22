import { Alert, Linking, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import HeaderBar from '@/components/HeaderBar';
import ScreenContainer from '@/components/ScreenContainer';
import { LEGAL_CONFIG } from '@/config/appConfig';
import { useTheme } from '@/utils/useTheme';

export default function SupportScreen() {
  const theme = useTheme();

  const open = async (url) => {
    if (!url) {
      Alert.alert('Support indisponible', "Les coordonnées de support doivent être configurées avant la publication.");
      return;
    }
    await Linking.openURL(url);
  };

  return (
    <ScreenContainer>
      <HeaderBar title="Centre d'aide" showBack />
      <ScrollView contentContainerStyle={{ padding: 24, gap: 18 }}>
        <View style={{ backgroundColor: theme.colors.elevated, borderRadius: 16, padding: 20 }}>
          <Text style={{ color: theme.colors.text, fontSize: 20, fontWeight: '700', marginBottom: 8 }}>Besoin d'aide ?</Text>
          <Text style={{ color: theme.colors.textSecondary, fontSize: 15, lineHeight: 22 }}>
            Notre équipe peut vous aider pour l'accès au compte, les données personnelles et l'utilisation de l'application.
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => open(LEGAL_CONFIG.supportUrl)}
          style={{ backgroundColor: theme.colors.primary, minHeight: 50, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}
        >
          <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>Ouvrir le site d'assistance</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => open(LEGAL_CONFIG.supportEmail ? `mailto:${LEGAL_CONFIG.supportEmail}` : '')}
          style={{ borderWidth: 1, borderColor: theme.colors.primary, minHeight: 50, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}
        >
          <Text style={{ color: theme.colors.primary, fontWeight: '700' }}>Contacter le support</Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenContainer>
  );
}
