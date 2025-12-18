import React, { useState } from 'react';
import { View } from 'react-native';
import QRCodeScanner from '../../components/QRCode/QRCodeScanner';
import QRCodeDisplay from '../../components/QRCode/QRCodeDisplay';
import { useAuth } from '@/utils/auth/useAuth';
import { useTheme } from '@/utils/useTheme';
import ScreenContainer from '@/components/ScreenContainer';
import { QrCode, Plus } from 'lucide-react-native';

export default function QRScannerNewScreen() {
  const { user } = useAuth();
  const theme = useTheme();
  const [showScanner, setShowScanner] = useState(false);
  const [showQRDisplay, setShowQRDisplay] = useState(false);
  const [qrData, setQrData] = useState(null);

  const handleScanSuccess = (data) => {
    setQrData(data);
    setShowScanner(false);
    
    // Traiter différents types de QR codes
    switch (data.type) {
      case 'payment':
        // Rediriger vers l'écran de paiement
        console.log('Paiement détecté:', data);
        break;
        
      case 'phone':
        // Ouvrir le clavier téléphonique
        console.log('Numéro détecté:', data);
        break;
        
      case 'url':
        // Ouvrir le navigateur
        console.log('URL détectée:', data);
        break;
        
      default:
        console.log('QR Code générique:', data);
    }
  };

  const handleGenerateQR = () => {
    // Générer un QR code pour recevoir un paiement
    const paymentData = {
      type: 'payment',
      userId: user?.uid,
      amount: 0, // L'utilisateur pourra spécifier le montant
      currency: 'XOF',
      timestamp: new Date().toISOString()
    };
    
    setQrData(paymentData);
    setShowQRDisplay(true);
  };

  return (
    <ScreenContainer>
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        {/* Header */}
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: 16,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <QrCode size={24} color={theme.colors.primary} style={{ marginRight: 8 }} />
            <Text style={{
              color: theme.colors.text,
              fontSize: 20,
              fontWeight: '700',
            }}>
              QR Code owo!
            </Text>
          </View>
          
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity
              onPress={() => setShowScanner(true)}
              style={{
                backgroundColor: theme.colors.primary,
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 8,
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <Text style={{
                color: '#FFFFFF',
                fontSize: 14,
                fontWeight: '600',
              }}>
                Scanner
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={handleGenerateQR}
              style={{
                backgroundColor: theme.colors.card,
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 8,
                flexDirection: 'row',
                alignItems: 'center',
                borderWidth: 1,
                borderColor: theme.colors.border,
              }}
            >
              <Plus size={16} color={theme.colors.text} style={{ marginRight: 4 }} />
              <Text style={{
                color: theme.colors.text,
                fontSize: 14,
                fontWeight: '600',
              }}>
                Générer
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Main Content */}
        <View style={{ flex: 1 }}>
          {!showScanner && !showQRDisplay && (
            <View style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              paddingHorizontal: 32,
            }}>
              <QrCode size={64} color={theme.colors.textSecondary} style={{ marginBottom: 16 }} />
              <Text style={{
                color: theme.colors.text,
                fontSize: 18,
                fontWeight: '600',
                textAlign: 'center',
                marginBottom: 8,
              }}>
                Bienvenue dans owo! QR
              </Text>
              <Text style={{
                color: theme.colors.textSecondary,
                fontSize: 14,
                textAlign: 'center',
                marginBottom: 24,
              }}>
                Scannez des codes QR ou générez les vôtres pour les paiements et partages
              </Text>
              
              <View style={{
                flexDirection: 'row',
                justifyContent: 'space-around',
                width: '100%',
                gap: 16,
              }}>
                <View style={{
                  backgroundColor: theme.colors.card,
                  padding: 16,
                  borderRadius: 12,
                  alignItems: 'center',
                  flex: 1,
                }}>
                  <Text style={{
                    color: theme.colors.text,
                    fontSize: 24,
                    fontWeight: '700',
                    marginBottom: 8,
                  }}>
                    📷
                  </Text>
                  <Text style={{
                    color: theme.colors.text,
                    fontSize: 14,
                    fontWeight: '600',
                    textAlign: 'center',
                  }}>
                    Scanner
                  </Text>
                  <Text style={{
                    color: theme.colors.textSecondary,
                    fontSize: 12,
                    textAlign: 'center',
                    marginTop: 4,
                  }}>
                    Scannez n'importe quel QR code
                  </Text>
                </View>
                
                <View style={{
                  backgroundColor: theme.colors.card,
                  padding: 16,
                  borderRadius: 12,
                  alignItems: 'center',
                  flex: 1,
                }}>
                  <Text style={{
                    color: theme.colors.text,
                    fontSize: 24,
                    fontWeight: '700',
                    marginBottom: 8,
                  }}>
                    💳
                  </Text>
                  <Text style={{
                    color: theme.colors.text,
                    fontSize: 14,
                    fontWeight: '600',
                    textAlign: 'center',
                  }}>
                    Recevoir
                  </Text>
                  <Text style={{
                    color: theme.colors.textSecondary,
                    fontSize: 12,
                    textAlign: 'center',
                    marginTop: 4,
                  }}>
                    Générez votre QR code de paiement
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* QR Scanner Modal */}
        <QRCodeScanner
          visible={showScanner}
          onClose={() => setShowScanner(false)}
          onScanSuccess={handleScanSuccess}
        />

        {/* QR Display Modal */}
        <QRCodeDisplay
          visible={showQRDisplay}
          onClose={() => setShowQRDisplay(false)}
          data={qrData}
          title="Paiement owo!"
          subtitle="Scannez pour payer"
          amount={qrData?.amount || 0}
          type="payment"
        />
      </View>
    </ScreenContainer>
  );
}
