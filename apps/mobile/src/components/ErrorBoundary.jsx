import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '@/utils/useTheme';

/**
 * Error Boundary pour capturer les erreurs de rendu React
 * Affiche un écran user-friendly avec le thème owo!
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    // Mettre à jour l'état pour afficher l'UI de fallback
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Logger les erreurs en développement seulement
    if (__DEV__) {
      console.error('Error Boundary caught an error:', error);
      console.error('Error Info:', errorInfo);
    }

    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // Afficher l'écran d'erreur
      return (
        <ErrorFallbackScreen
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          onReset={this.handleReset}
        />
      );
    }

    return this.props.children;
  }
}

/**
 * Écran d'erreur user-friendly avec le thème owo!
 */
function ErrorFallbackScreen({ error, errorInfo, onReset }) {
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        {/* Icône d'erreur stylisée owo! */}
        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor: theme.colors.elevated,
              borderColor: theme.colors.error,
            },
          ]}
        >
          <Text style={[styles.icon, { color: theme.colors.error }]}>!</Text>
        </View>

        {/* Titre avec la couleur accent owo! */}
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Oups, une erreur s'est produite
        </Text>

        {/* Message user-friendly */}
        <Text style={[styles.message, { color: theme.colors.textSecondary }]}>
          Quelque chose s'est mal passé. Ne vous inquiétez pas, vos données sont en sécurité.
        </Text>

        {/* Détails de l'erreur en mode développement */}
        {__DEV__ && error && (
          <ScrollView
            style={[
              styles.errorDetails,
              {
                backgroundColor: theme.colors.elevated,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <Text style={[styles.errorTitle, { color: theme.colors.error }]}>
              Détails de l'erreur (DEV seulement):
            </Text>
            <Text style={[styles.errorText, { color: theme.colors.textSecondary }]}>
              {error.toString()}
            </Text>
            {errorInfo && errorInfo.componentStack && (
              <Text style={[styles.errorStack, { color: theme.colors.textTertiary }]}>
                {errorInfo.componentStack}
              </Text>
            )}
          </ScrollView>
        )}

        {/* Bouton de réessai avec style owo! */}
        <TouchableOpacity
          style={[
            styles.resetButton,
            {
              backgroundColor: theme.colors.primary,
            },
          ]}
          onPress={onReset}
          activeOpacity={0.8}
        >
          <Text style={styles.resetButtonText}>Réessayer</Text>
        </TouchableOpacity>

        {/* Message de support */}
        <Text style={[styles.supportText, { color: theme.colors.textTertiary }]}>
          Si le problème persiste, contactez le support owo!
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  icon: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  errorDetails: {
    width: '100%',
    maxHeight: 200,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 12,
    marginBottom: 8,
    fontFamily: 'monospace',
  },
  errorStack: {
    fontSize: 10,
    fontFamily: 'monospace',
  },
  resetButton: {
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  supportText: {
    fontSize: 14,
    textAlign: 'center',
  },
});

export default ErrorBoundary;
