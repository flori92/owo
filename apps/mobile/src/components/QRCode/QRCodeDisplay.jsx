import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Alert, 
  Share,
  Clipboard,
  Dimensions
} from 'react-native';
import Svg, { Rect, Circle, Path } from 'react-native-svg';
import { useTheme } from '@/utils/useTheme';
import { 
  QrCode, 
  Share2, 
  Copy,
  Download,
  ArrowUpRight,
  ArrowDownLeft
} from 'lucide-react-native';

const { width: screenWidth } = Dimensions.get('window');

export default function QRCodeDisplay({ 
  data, 
  title, 
  subtitle, 
  amount, 
  type = 'payment',
  onClose,
  showShare = true 
}) {
  const theme = useTheme();
  const [isGenerating, setIsGenerating] = useState(false);

  const generateQRCodeData = () => {
    switch (type) {
      case 'payment':
        return {
          app: 'owo!',
          version: '1.0',
          type: 'payment',
          amount: amount,
          currency: 'XOF',
          merchant: title,
          timestamp: new Date().toISOString(),
          data: data
        };
      
      case 'contact':
        return {
          app: 'owo!',
          version: '1.0',
          type: 'contact',
          name: title,
          phone: data,
          timestamp: new Date().toISOString()
        };
      
      case 'wifi':
        return {
          app: 'owo!',
          version: '1.0',
          type: 'wifi',
          ssid: title,
          password: data,
          timestamp: new Date().toISOString()
        };
      
      default:
        return data;
    }
  };

  const qrData = typeof data === 'string' ? data : JSON.stringify(generateQRCodeData());
  const qrSize = Math.min(screenWidth - 80, 300);

  const handleShare = async () => {
    try {
      await Share.share({
        message: qrData,
        title: title || 'Code QR owo!',
      });
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de partager le code QR');
    }
  };

  const handleCopy = () => {
    Clipboard.setString(qrData);
    Alert.alert('Copié!', 'Le code QR a été copié dans le presse-papiers');
  };

  const handleSave = () => {
    setIsGenerating(true);
    // Implémentation pour sauvegarder en image
    setTimeout(() => {
      setIsGenerating(false);
      Alert.alert('Info', 'La sauvegarde d\'image sera bientôt disponible');
    }, 1000);
  };

  const renderQRPath = () => {
    const size = qrSize;
    const scale = 8; // Échelle pour les modules QR
    const moduleSize = size / (25 * scale);
    
    // Génération simplifiée du pattern QR (pour l'exemple)
    return (
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Fond blanc */}
        <Rect x={0} y={0} width={size} height={size} fill="white" />
        
        {/* Pattern QR simplifié */}
        <Path
          d={`M ${size * 0.1} ${size * 0.1} L ${size * 0.9} ${size * 0.1} L ${size * 0.9} ${size * 0.9} L ${size * 0.1} ${size * 0.9} Z
              M ${size * 0.2} ${size * 0.2} L ${size * 0.8} ${size * 0.2} L ${size * 0.8} ${size * 0.8} L ${size * 0.2} ${size * 0.8} Z
              M ${size * 0.3} ${size * 0.3} L ${size * 0.7} ${size * 0.3} L ${size * 0.7} ${size * 0.7} L ${size * 0.3} ${size * 0.7} Z
              M ${size * 0.15} ${size * 0.4} L ${size * 0.85} ${size * 0.4}
              M ${size * 0.4} ${size * 0.15} L ${size * 0.4} ${size * 0.85}
              M ${size * 0.15} ${size * 0.6} L ${size * 0.85} ${size * 0.6}
              M ${size * 0.6} ${size * 0.15} L ${size * 0.6} ${size * 0.85}`}
          stroke="black"
          strokeWidth={2}
          fill="none"
        />
        
        {/* Modules de positionnement */}
        <Rect x={size * 0.05} y={size * 0.05} width={size * 0.1} height={size * 0.1} fill="black" />
        <Rect x={size * 0.85} y={size * 0.05} width={size * 0.1} height={size * 0.1} fill="black" />
        <Rect x={size * 0.05} y={size * 0.85} width={size * 0.1} height={size * 0.1} fill="black" />
        <Rect x={size * 0.85} y={size * 0.85} width={size * 0.1} height={size * 0.1} fill="black" />
      </Svg>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* Header */}
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 8,
      }}>
        <View style={{ flex: 1 }}>
          <Text style={{
            color: theme.colors.text,
            fontSize: 20,
            fontWeight: '700',
          }}>
            {title || 'Code QR'}
          </Text>
          {subtitle && (
            <Text style={{
              color: theme.colors.textSecondary,
              fontSize: 14,
              marginTop: 4,
            }}>
              {subtitle}
            </Text>
          )}
          {amount && (
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: 8,
            }}>
              {type === 'payment' ? (
                <ArrowDownLeft size={16} color={theme.colors.success} style={{ marginRight: 4 }} />
              ) : (
                <ArrowUpRight size={16} color={theme.colors.primary} style={{ marginRight: 4 }} />
              )}
              <Text style={{
                color: type === 'payment' ? theme.colors.success : theme.colors.text,
                fontSize: 18,
                fontWeight: '600',
              }}>
                {amount.toLocaleString()} FCFA
              </Text>
            </View>
          )}
        </View>
        
        <TouchableOpacity onPress={onClose}>
          <Text style={{
            color: theme.colors.primary,
            fontSize: 16,
            fontWeight: '600',
          }}>
            Fermer
          </Text>
        </TouchableOpacity>
      </View>

      {/* QR Code */}
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 16,
      }}>
        <View style={{
          backgroundColor: 'white',
          padding: 20,
          borderRadius: 16,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 4,
        }}>
          {renderQRPath()}
        </View>
        
        <Text style={{
          color: theme.colors.textSecondary,
          fontSize: 12,
          marginTop: 16,
          textAlign: 'center',
        }}>
          Scannez ce code avec owo!
        </Text>
      </View>

      {/* Actions */}
      {showShare && (
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-around',
          paddingHorizontal: 16,
          paddingBottom: 32,
          gap: 12,
        }}>
          <TouchableOpacity
            onPress={handleShare}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: theme.colors.card,
              paddingVertical: 12,
              paddingHorizontal: 20,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: theme.colors.border,
              flex: 1,
            }}
          >
            <Share2 size={18} color={theme.colors.text} style={{ marginRight: 8 }} />
            <Text style={{
              color: theme.colors.text,
              fontSize: 14,
              fontWeight: '600',
            }}>
              Partager
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleCopy}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: theme.colors.card,
              paddingVertical: 12,
              paddingHorizontal: 20,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: theme.colors.border,
              flex: 1,
            }}
          >
            <Copy size={18} color={theme.colors.text} style={{ marginRight: 8 }} />
            <Text style={{
              color: theme.colors.text,
              fontSize: 14,
              fontWeight: '600',
            }}>
              Copier
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleSave}
            disabled={isGenerating}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: isGenerating ? theme.colors.border : theme.colors.card,
              paddingVertical: 12,
              paddingHorizontal: 20,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: theme.colors.border,
              flex: 1,
            }}
          >
            <Download size={18} color={isGenerating ? theme.colors.textSecondary : theme.colors.text} style={{ marginRight: 8 }} />
            <Text style={{
              color: isGenerating ? theme.colors.textSecondary : theme.colors.text,
              fontSize: 14,
              fontWeight: '600',
            }}>
              {isGenerating ? 'Génération...' : 'Sauvegarder'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
