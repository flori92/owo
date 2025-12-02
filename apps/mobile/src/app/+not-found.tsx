import { Stack, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Home, ArrowLeft, AlertCircle } from 'lucide-react-native';

/**
 * Écran 404 professionnel pour owo!
 * Redirige automatiquement vers l'accueil après 3 secondes
 */
function NotFoundScreen() {
  const router = useRouter();

  // Redirection automatique après 3 secondes
  useEffect(() => {
    const timer = setTimeout(() => {
      handleGoHome();
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleGoHome = () => {
    router.replace('/(tabs)/home');
  };

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      handleGoHome();
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Page introuvable', headerShown: false }} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          {/* Icône d'erreur */}
          <View style={styles.iconContainer}>
            <AlertCircle size={80} color="#FF6B35" strokeWidth={1.5} />
          </View>

          {/* Titre */}
          <Text style={styles.title}>Page introuvable</Text>

          {/* Description */}
          <Text style={styles.description}>
            Cette page n'existe pas ou a été déplacée.{'\n'}
            Vous serez redirigé automatiquement.
          </Text>

          {/* Boutons d'action */}
          <View style={styles.buttonsContainer}>
            <TouchableOpacity 
              style={styles.primaryButton} 
              onPress={handleGoHome}
              activeOpacity={0.8}
            >
              <Home size={20} color="#FFFFFF" strokeWidth={2} />
              <Text style={styles.primaryButtonText}>Accueil</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.secondaryButton} 
              onPress={handleGoBack}
              activeOpacity={0.8}
            >
              <ArrowLeft size={20} color="#FF6B35" strokeWidth={2} />
              <Text style={styles.secondaryButtonText}>Retour</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  iconContainer: {
    marginBottom: 24,
    padding: 20,
    borderRadius: 50,
    backgroundColor: '#FFF5F2',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1A2E',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FF6B35',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    minWidth: 120,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    minWidth: 120,
    borderWidth: 2,
    borderColor: '#FF6B35',
  },
  secondaryButtonText: {
    color: '#FF6B35',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default NotFoundScreen;
