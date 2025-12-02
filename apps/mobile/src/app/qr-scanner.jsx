import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Vibration,
  Animated,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import {
  X,
  Flashlight,
  FlashlightOff,
  Camera,
  QrCode,
  Users,
  HandCoins,
  AlertCircle,
} from "lucide-react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useTheme } from "@/utils/useTheme";
import { IS_DEMO_MODE } from "@/config/appConfig";

export default function QRScannerScreen() {
  const { mode } = useLocalSearchParams(); // "cagnotte" ou "payment"
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [torch, setTorch] = useState(false);
  const [scanLineAnim] = useState(new Animated.Value(0));

  // Animation de la ligne de scan
  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(scanLineAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  const handleBarCodeScanned = ({ type, data }) => {
    if (scanned) return;
    
    setScanned(true);
    Vibration.vibrate(100);

    // Analyser le QR code
    processQRCode(data);
  };

  const processQRCode = (data) => {
    console.log("QR Code scanned:", data);

    // Patterns de QR codes owo!
    const cagnottePattern = /^(https?:\/\/pay\.owo-app\.com\/c\/|OWO-)([A-Z0-9]+)$/i;
    const paymentPattern = /^(https?:\/\/pay\.owo-app\.com\/r\/|REQ-)([A-Z0-9]+)$/i;

    let match;

    // Vérifier si c'est un code de cagnotte
    match = data.match(cagnottePattern);
    if (match) {
      const code = match[2].toUpperCase();
      handleCagnotteCode(code.startsWith("OWO-") ? code : `OWO-${code}`);
      return;
    }

    // Vérifier si c'est un code de paiement
    match = data.match(paymentPattern);
    if (match) {
      const code = match[2].toUpperCase();
      handlePaymentCode(code.startsWith("REQ-") ? code : `REQ-${code}`);
      return;
    }

    // Code non reconnu
    Alert.alert(
      "Code non reconnu",
      "Ce QR code n'est pas un code owo! valide.\n\nFormats acceptés :\n• OWO-XXXXXX (cagnotte)\n• REQ-XXXXXX (paiement)\n• Liens pay.owo-app.com",
      [
        { text: "Réessayer", onPress: () => setScanned(false) },
        { text: "Annuler", onPress: () => router.back(), style: "cancel" },
      ]
    );
  };

  const handleCagnotteCode = (code) => {
    Alert.alert(
      "Cagnotte détectée",
      `Code : ${code}\n\nVoulez-vous rejoindre cette cagnotte ?`,
      [
        { text: "Annuler", onPress: () => setScanned(false), style: "cancel" },
        {
          text: "Rejoindre",
          onPress: () => {
            // Naviguer vers l'écran de rejoindre avec le code pré-rempli
            router.replace({
              pathname: "/join-group-saving",
              params: { code },
            });
          },
        },
      ]
    );
  };

  const handlePaymentCode = (code) => {
    // Simuler les données de la demande de paiement
    const mockPaymentData = {
      code,
      amount: 25000,
      currency: "FCFA",
      requester: "Kofi A.",
      reason: "Remboursement repas",
    };

    Alert.alert(
      "Demande de paiement",
      `De : ${mockPaymentData.requester}\n` +
      `Montant : ${mockPaymentData.amount.toLocaleString()} ${mockPaymentData.currency}\n` +
      (mockPaymentData.reason ? `Motif : ${mockPaymentData.reason}\n` : "") +
      `\nCode : ${code}`,
      [
        { text: "Annuler", onPress: () => setScanned(false), style: "cancel" },
        {
          text: "Payer",
          onPress: () => {
            // En mode démo, simuler le paiement
            Alert.alert(
              "✅ Paiement simulé",
              `Paiement de ${mockPaymentData.amount.toLocaleString()} FCFA effectué !\n\n(Mode démo : aucune transaction réelle)`,
              [{ text: "OK", onPress: () => router.back() }]
            );
          },
        },
      ]
    );
  };

  // Écran de permission
  if (!permission) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={{ color: theme.colors.text }}>Chargement...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: theme.colors.background,
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
            paddingHorizontal: 24,
          },
        ]}
      >
        {/* Header */}
        <View style={styles.permissionHeader}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={[styles.closeButton, { backgroundColor: theme.colors.elevated }]}
          >
            <X size={24} color={theme.colors.text} strokeWidth={2} />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.permissionContent}>
          <View
            style={[
              styles.permissionIcon,
              { backgroundColor: `${theme.colors.primary}15` },
            ]}
          >
            <Camera size={64} color={theme.colors.primary} strokeWidth={1.5} />
          </View>

          <Text
            style={[
              styles.permissionTitle,
              { color: theme.colors.text },
            ]}
          >
            Accès à la caméra requis
          </Text>

          <Text
            style={[
              styles.permissionDescription,
              { color: theme.colors.textSecondary },
            ]}
          >
            Pour scanner les QR codes owo!, nous avons besoin d'accéder à votre caméra.
          </Text>

          <TouchableOpacity
            onPress={requestPermission}
            style={[styles.permissionButton, { backgroundColor: theme.colors.primary }]}
          >
            <Text style={styles.permissionButtonText}>Autoriser la caméra</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.cancelButton}
          >
            <Text style={[styles.cancelButtonText, { color: theme.colors.textSecondary }]}>
              Annuler
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!fontsLoaded) {
    return null;
  }

  const scanLineTranslate = scanLineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 220],
  });

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        enableTorch={torch}
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      />

      {/* Overlay sombre */}
      <View style={styles.overlay}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.headerButton}
          >
            <X size={24} color="#FFFFFF" strokeWidth={2} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Scanner QR Code</Text>

          <TouchableOpacity
            onPress={() => setTorch(!torch)}
            style={styles.headerButton}
          >
            {torch ? (
              <FlashlightOff size={24} color="#FFFFFF" strokeWidth={2} />
            ) : (
              <Flashlight size={24} color="#FFFFFF" strokeWidth={2} />
            )}
          </TouchableOpacity>
        </View>

        {/* Zone de scan */}
        <View style={styles.scanAreaContainer}>
          <View style={styles.scanArea}>
            {/* Coins du cadre */}
            <View style={[styles.corner, styles.cornerTopLeft]} />
            <View style={[styles.corner, styles.cornerTopRight]} />
            <View style={[styles.corner, styles.cornerBottomLeft]} />
            <View style={[styles.corner, styles.cornerBottomRight]} />

            {/* Ligne de scan animée */}
            <Animated.View
              style={[
                styles.scanLine,
                {
                  transform: [{ translateY: scanLineTranslate }],
                },
              ]}
            />
          </View>
        </View>

        {/* Instructions */}
        <View style={[styles.footer, { paddingBottom: insets.bottom + 24 }]}>
          <View style={styles.instructionCard}>
            <QrCode size={24} color={theme.colors.primary} strokeWidth={1.5} />
            <Text style={styles.instructionText}>
              Placez le QR code owo! dans le cadre
            </Text>
          </View>

          {/* Types de codes acceptés */}
          <View style={styles.codeTypes}>
            <View style={styles.codeType}>
              <Users size={18} color="#4ECDC4" strokeWidth={1.5} />
              <Text style={styles.codeTypeText}>Cagnottes</Text>
            </View>
            <View style={styles.codeTypeDivider} />
            <View style={styles.codeType}>
              <HandCoins size={18} color="#FFD93D" strokeWidth={1.5} />
              <Text style={styles.codeTypeText}>Paiements</Text>
            </View>
          </View>

          {/* Mode démo */}
          {IS_DEMO_MODE && (
            <View style={styles.demoHint}>
              <AlertCircle size={16} color={theme.colors.accent} strokeWidth={1.5} />
              <Text style={[styles.demoHintText, { color: theme.colors.accent }]}>
                Mode démo : Scannez n'importe quel QR contenant "OWO-" ou "REQ-"
              </Text>
            </View>
          )}

          {/* Bouton pour entrer le code manuellement */}
          <TouchableOpacity
            onPress={() => {
              if (mode === "cagnotte") {
                router.replace("/join-group-saving");
              } else {
                Alert.alert("Info", "Fonctionnalité à venir : entrer un code manuellement");
              }
            }}
            style={styles.manualButton}
          >
            <Text style={styles.manualButtonText}>Entrer le code manuellement</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 18,
    color: "#FFFFFF",
  },
  scanAreaContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scanArea: {
    width: 250,
    height: 250,
    backgroundColor: "transparent",
    position: "relative",
  },
  corner: {
    position: "absolute",
    width: 30,
    height: 30,
    borderColor: "#00D4AA",
    borderWidth: 4,
  },
  cornerTopLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 12,
  },
  cornerTopRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 12,
  },
  cornerBottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 12,
  },
  cornerBottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 12,
  },
  scanLine: {
    position: "absolute",
    left: 10,
    right: 10,
    height: 3,
    backgroundColor: "#00D4AA",
    borderRadius: 2,
    shadowColor: "#00D4AA",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  footer: {
    paddingHorizontal: 24,
  },
  instructionCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    gap: 12,
  },
  instructionText: {
    fontFamily: "Inter_500Medium",
    fontSize: 15,
    color: "#1A1A2E",
  },
  codeTypes: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    gap: 16,
  },
  codeType: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  codeTypeText: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: "#FFFFFF",
  },
  codeTypeDivider: {
    width: 1,
    height: 16,
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  demoHint: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 16,
  },
  demoHintText: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
  },
  manualButton: {
    alignItems: "center",
    paddingVertical: 12,
  },
  manualButtonText: {
    fontFamily: "Inter_500Medium",
    fontSize: 14,
    color: "#FFFFFF",
    textDecorationLine: "underline",
  },
  // Permission screen styles
  permissionHeader: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingVertical: 16,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  permissionContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 100,
  },
  permissionIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  permissionTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 24,
    textAlign: "center",
    marginBottom: 12,
  },
  permissionDescription: {
    fontFamily: "Inter_400Regular",
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  permissionButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  permissionButtonText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    color: "#FFFFFF",
  },
  cancelButton: {
    paddingVertical: 12,
  },
  cancelButtonText: {
    fontFamily: "Inter_500Medium",
    fontSize: 14,
  },
});
