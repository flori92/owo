import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useTheme } from '@/utils/useTheme';
import { 
  createAccount, 
  login, 
  createWallet, 
  createTransaction,
  getCurrentUser,
  getWallets,
  getTransactions 
} from '@/lib/appwrite';

/**
 * Composant d'exemple pour tester Appwrite
 */
export function AppwriteExample() {
  const theme = useTheme();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');

  useEffect(() => {
    checkCurrentUser();
  }, []);

  const checkCurrentUser = async () => {
    const { success, user } = await getCurrentUser();
    if (success) {
      setUser(user);
      setResult(`Connecté: ${user.email || user.phone || user.name}`);
    }
  };

  const handleCreateAccount = async () => {
    setLoading(true);
    try {
      const result = await createAccount(
        'test@example.com',
        'Password123!',
        'Test User'
      );
      
      if (result.success) {
        setResult('✅ Compte créé avec succès!');
        checkCurrentUser();
      } else {
        setResult(`❌ Erreur: ${result.error}`);
      }
    } catch (error) {
      setResult(`❌ Erreur: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    setLoading(true);
    try {
      const result = await login('test@example.com', 'Password123!');
      
      if (result.success) {
        setResult('✅ Connexion réussie!');
        checkCurrentUser();
      } else {
        setResult(`❌ Erreur: ${result.error}`);
      }
    } catch (error) {
      setResult(`❌ Erreur: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWallet = async () => {
    if (!user) {
      setResult('❌ Connectez-vous d\'abord');
      return;
    }

    setLoading(true);
    try {
      const walletData = {
        userId: user.$id,
        type: 'mobile_money',
        provider: 'MTN Mobile Money',
        accountNumber: '+22507XXXXXXXX',
        isPrimary: true,
      };

      const result = await createWallet(walletData);
      
      if (result.success) {
        setResult('✅ Wallet créé avec succès!');
      } else {
        setResult(`❌ Erreur: ${result.error}`);
      }
    } catch (error) {
      setResult(`❌ Erreur: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTransaction = async () => {
    if (!user) {
      setResult('❌ Connectez-vous d\'abord');
      return;
    }

    setLoading(true);
    try {
      const transactionData = {
        userId: user.$id,
        type: 'send',
        amount: 1000,
        recipientPhone: '+22507XXXXXXXX',
        recipientName: 'John Doe',
        description: 'Test transaction',
      };

      const result = await createTransaction(transactionData);
      
      if (result.success) {
        setResult(`✅ Transaction créée! Réf: ${result.transaction.reference}`);
      } else {
        setResult(`❌ Erreur: ${result.error}`);
      }
    } catch (error) {
      setResult(`❌ Erreur: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFetchData = async () => {
    if (!user) {
      setResult('❌ Connectez-vous d\'abord');
      return;
    }

    setLoading(true);
    try {
      const [walletsResult, transactionsResult] = await Promise.all([
        getWallets(user.$id),
        getTransactions(user.$id),
      ]);

      const wallets = walletsResult.success ? walletsResult.wallets : [];
      const transactions = transactionsResult.success ? transactionsResult.transactions : [];

      setResult(
        `📊 Données:\n` +
        `👛 Wallets: ${wallets.length}\n` +
        `💸 Transactions: ${transactions.length}\n` +
        `💰 Solde total: ${wallets.reduce((sum, w) => sum + (w.balance || 0), 0)} FCFA`
      );
    } catch (error) {
      setResult(`❌ Erreur: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 20, color: theme.colors.text }}>
        Test Appwrite owo!
      </Text>

      {user && (
        <View style={{ 
          backgroundColor: theme.colors.primary, 
          padding: 15, 
          borderRadius: 10, 
          marginBottom: 20 
        }}>
          <Text style={{ color: 'white', fontWeight: '600' }}>
            Utilisateur: {user.email || user.phone || user.name}
          </Text>
        </View>
      )}

      <View style={{ gap: 10 }}>
        <TouchableOpacity
          onPress={handleCreateAccount}
          disabled={loading}
          style={{
            backgroundColor: theme.colors.primary,
            padding: 15,
            borderRadius: 10,
            opacity: loading ? 0.6 : 1,
          }}
        >
          <Text style={{ color: 'white', textAlign: 'center', fontWeight: '600' }}>
            1. Créer un compte test
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleLogin}
          disabled={loading}
          style={{
            backgroundColor: theme.colors.secondary,
            padding: 15,
            borderRadius: 10,
            opacity: loading ? 0.6 : 1,
          }}
        >
          <Text style={{ color: 'white', textAlign: 'center', fontWeight: '600' }}>
            2. Se connecter
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleCreateWallet}
          disabled={loading}
          style={{
            backgroundColor: theme.colors.accent,
            padding: 15,
            borderRadius: 10,
            opacity: loading ? 0.6 : 1,
          }}
        >
          <Text style={{ color: 'white', textAlign: 'center', fontWeight: '600' }}>
            3. Créer un wallet
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleCreateTransaction}
          disabled={loading}
          style={{
            backgroundColor: theme.colors.success,
            padding: 15,
            borderRadius: 10,
            opacity: loading ? 0.6 : 1,
          }}
        >
          <Text style={{ color: 'white', textAlign: 'center', fontWeight: '600' }}>
            4. Créer une transaction
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleFetchData}
          disabled={loading}
          style={{
            backgroundColor: theme.colors.warning,
            padding: 15,
            borderRadius: 10,
            opacity: loading ? 0.6 : 1,
          }}
        >
          <Text style={{ color: 'white', textAlign: 'center', fontWeight: '600' }}>
            5. Voir les données
          </Text>
        </TouchableOpacity>
      </View>

      {result && (
        <View style={{
          backgroundColor: theme.colors.cardBackground,
          padding: 15,
          borderRadius: 10,
          marginTop: 20,
          borderWidth: 1,
          borderColor: theme.colors.border,
        }}>
          <Text style={{ color: theme.colors.text, fontFamily: 'monospace' }}>
            {result}
          </Text>
        </View>
      )}

      {loading && (
        <Text style={{ 
          textAlign: 'center', 
          marginTop: 20, 
          color: theme.colors.textSecondary 
        }}>
          Chargement...
        </Text>
      )}
    </View>
  );
}

export default AppwriteExample;
