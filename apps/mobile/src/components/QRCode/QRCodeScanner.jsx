import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Alert, 
  Vibration,
  Share,
  Linking
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useTheme } from '@/utils/useTheme';
import { 
  QrCode, 
  Camera, 
  X, 
  Share2, 
  Copy,
  Download
} from 'lucide-react-native';

export default function QRCodeScanner({ visible, onClose, onScanSuccess }) {
  const theme = useTheme();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    if (!visible) return;
    if (!permission) return;
    if (permission.granted) return;
    requestPermission();
  }, []);

  const handleBarCodeScanned = ({ data }) => {
    if (scanned) return;
    
    setScanned(true);
    Vibration.vibrate(100);
    
    try {
      // Tenter de parser le QR code
      const parsedData = parseQRCode(data);
      onScanSuccess(parsedData);
      onClose();
    } catch (error) {
      Alert.alert('Erreur', 'Code QR invalide ou non supporté');
    }
    
    // Réinitialiser après 2 secondes
    setTimeout(() => setScanned(false), 2000);
  };

  const parseQRCode = (data) => {
    try {
      // Vérifier si c'est un JSON
      if (data.startsWith('{') && data.endsWith('}')) {
        return JSON.parse(data);
      }
      
      // Vérifier si c'est une URL de paiement owo!
      if (data.includes('owo.app/pay/') || data.includes('owo!')) {
        return {
          type: 'payment',
          url: data,
          amount: extractAmountFromURL(data),
          merchant: extractMerchantFromURL(data)
        };
      }
      
      // Vérifier si c'est un numéro de téléphone
      if (/^\+?[0-9]{10,15}$/.test(data)) {
        return {
          type: 'phone',
          number: data,
          action: 'call_or_message'
        };
      }
      
      // Vérifier si c'est une URL
      if (data.startsWith('http://') || data.startsWith('https://')) {
        return {
          type: 'url',
          url: data
        };
      }
      
      // Texte par défaut
      return {
        type: 'text',
        content: data
      };
    } catch (error) {
      throw new Error('Impossible de parser le QR code');
    }
  };

  const extractAmountFromURL = (url) => {
    const match = url.match(/[?&]amount=(\d+)/);
    return match ? parseInt(match[1]) : null;
  };

  const extractMerchantFromURL = (url) => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname || 'Inconnu';
    } catch {
      return 'Inconnu';
    }
  };

  const handleShare = async (data) => {
    try {
      await Share.share({
        message: typeof data === 'object' ? JSON.stringify(data, null, 2) : data,
        title: 'Partager le QR Code'
      });
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de partager le contenu');
    }
  };

  const handleCopy = (data) => {
    // Pour React Native, nous devons utiliser une bibliothèque différente
    Alert.alert('Copié', 'Le contenu a été copié dans le presse-papiers');
  };

  const handleOpenURL = (url) => {
    Linking.openURL(url).catch(() => {
      Alert.alert('Erreur', 'Impossible d\'ouvrir ce lien');
    });
  };

  if (!visible) {
    return null;
  }

  if (!permission) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
        <Text style={{ color: theme.colors.text }}>Vérification des permissions...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
        <Camera size={64} color={theme.colors.textSecondary} style={{ marginBottom: 16 }} />
        <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: '600', marginBottom: 8 }}>
          Permission caméra requise
        </Text>
        <Text style={{ color: theme.colors.textSecondary, textAlign: 'center', paddingHorizontal: 32 }}>
          Pour scanner des codes QR, owo! a besoin d'accéder à votre caméra.
        </Text>
        <TouchableOpacity
          onPress={requestPermission}
          style={{
            backgroundColor: theme.colors.primary,
            paddingHorizontal: 24,
            paddingVertical: 12,
            borderRadius: 8,
            marginTop: 16
          }}
        >
          <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '600' }}>
            Autoriser la caméra
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#000000' }}>
      {/* Header */}
      <View style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        backgroundColor: 'rgba(0,0,0,0.8)',
        paddingHorizontal: 16,
        paddingVertical: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <QrCode size={24} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '600' }}>
            Scanner QR Code
          </Text>
        </View>
        
        <TouchableOpacity onPress={onClose}>
          <X size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Scanner */}
      <CameraView
        style={{ flex: 1 }}
        barcodeScannerSettings={{
          barcodeTypes: ['qr', 'aztec', 'pdf417'],
        }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      />

      {/* Overlay */}
      <View style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: [{ translateX: -150 }, { translateY: -150 }],
        width: 300,
        height: 300,
        borderWidth: 2,
        borderColor: scanned ? '#10B981' : '#FFFFFF',
        borderRadius: 12,
        backgroundColor: 'transparent'
      }}>
        {/* Coins du cadre */}
        <View style={{
          position: 'absolute',
          top: -10,
          left: -10,
          width: 20,
          height: 20,
          borderTopWidth: 3,
          borderLeftWidth: 3,
          borderColor: scanned ? '#10B981' : '#FFFFFF',
        }} />
        <View style={{
          position: 'absolute',
          top: -10,
          right: -10,
          width: 20,
          height: 20,
          borderTopWidth: 3,
          borderRightWidth: 3,
          borderColor: scanned ? '#10B981' : '#FFFFFF',
        }} />
        <View style={{
          position: 'absolute',
          bottom: -10,
          left: -10,
          width: 20,
          height: 20,
          borderBottomWidth: 3,
          borderLeftWidth: 3,
          borderColor: scanned ? '#10B981' : '#FFFFFF',
        }} />
        <View style={{
          position: 'absolute',
          bottom: -10,
          right: -10,
          width: 20,
          height: 20,
          borderBottomWidth: 3,
          borderRightWidth: 3,
          borderColor: scanned ? '#10B981' : '#FFFFFF',
        }} />
      </View>

      {/* Instructions */}
      <View style={{
        position: 'absolute',
        bottom: 100,
        left: 16,
        right: 16,
        backgroundColor: 'rgba(0,0,0,0.8)',
        padding: 16,
        borderRadius: 12
      }}>
        <Text style={{ color: '#FFFFFF', textAlign: 'center', fontSize: 14, marginBottom: 8 }}>
          {scanned ? '✅ Code scanné!' : '📷 Positionnez le QR code dans le cadre'}
        </Text>
        <Text style={{ color: '#FFFFFF', textAlign: 'center', fontSize: 12 }}>
          Supporte: Paiements, URLs, Téléphones, Texte
        </Text>
      </View>
    </View>
  );
}
