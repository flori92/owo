import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useTheme } from '@/utils/useTheme';
import { Wallet, Briefcase } from 'lucide-react-native';
import { 
  getCurrentUser,
  getWallets,
  getTransactions,
  getNotifications,
  getGroupSavings,
  getLockedSavings,
  getVirtualCards
} from '@/lib/appwrite';

/**
 * Profil de Floriace FAVI avec toutes ses données
 */
export function FloriaceProfile() {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [wallets, setWallets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [savings, setSavings] = useState([]);
  const [lockedSavings, setLockedSavings] = useState([]);
  const [virtualCards, setVirtualCards] = useState([]);

  useEffect(() => {
    loadFloriaceData();
  }, []);

  const loadFloriaceData = async () => {
    try {
      setLoading(true);
      
      // Charger l'utilisateur
      const { success: userSuccess, user: userData } = await getCurrentUser();
      if (userSuccess) {
        setUser(userData);
      }

      // Charger toutes les données en parallèle
      const [
        walletsResult,
        transactionsResult,
        notificationsResult,
        savingsResult,
        lockedResult,
        cardsResult
      ] = await Promise.all([
        getWallets(),
        getTransactions(),
        getNotifications(),
        getGroupSavings(),
        getLockedSavings(),
        getVirtualCards()
      ]);

      setWallets(walletsResult.success ? walletsResult.wallets : []);
      setTransactions(transactionsResult.success ? transactionsResult.transactions : []);
      setNotifications(notificationsResult.success ? notificationsResult.notifications : []);
      setSavings(savingsResult.success ? savingsResult.savings : []);
      setLockedSavings(lockedResult.success ? lockedResult.savings : []);
      setVirtualCards(cardsResult.success ? cardsResult.cards : []);

    } catch (error) {
      console.error('Erreur chargement données:', error);
      Alert.alert('Erreur', 'Impossible de charger les données');
    } finally {
      setLoading(false);
    }
  };

  const totalBalance = wallets.reduce((sum, wallet) => sum + (wallet.balance || 0), 0);
  const unreadNotifications = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <View style={{ padding: 20 }}>
        <Text style={{ textAlign: 'center', color: theme.colors.textSecondary }}>
          Chargement du profil...
        </Text>
      </View>
    );
  }

  return (
    <View style={{ padding: 20 }}>
      {/* Header */}
      <View style={{ 
        backgroundColor: theme.colors.primary, 
        padding: 20, 
        borderRadius: 15, 
        marginBottom: 20 
      }}>
        <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold' }}>
          Floriace FAVI
        </Text>
        <Text style={{ color: 'white', opacity: 0.9, marginTop: 5 }}>
          {user?.email || 'florifavi@gmail.com'}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
          <Wallet size={20} color="white" />
          <Text style={{ color: 'white', fontSize: 20, fontWeight: '600', marginLeft: 8 }}>
            {totalBalance.toLocaleString()} FCFA
          </Text>
        </View>
      </View>

      {/* Wallets */}
      <View style={{ marginBottom: 20 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
          <Briefcase size={18} color={theme.colors.text} />
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginLeft: 8, color: theme.colors.text }}>
            Portefeuilles
          </Text>
        </View>
        {wallets.map((wallet, index) => (
          <View key={index} style={{
            backgroundColor: theme.colors.cardBackground,
            padding: 15,
            borderRadius: 10,
            marginBottom: 10,
            borderWidth: 1,
            borderColor: theme.colors.border,
          }}>
            <Text style={{ fontWeight: '600', color: theme.colors.text }}>
              {wallet.provider}
            </Text>
            <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>
              {wallet.type} - {wallet.accountNumber}
            </Text>
            <Text style={{ 
              fontSize: 16, 
              fontWeight: 'bold', 
              color: wallet.balance > 0 ? theme.colors.success : theme.colors.textSecondary,
              marginTop: 5
            }}>
              {wallet.balance?.toLocaleString() || 0} FCFA
            </Text>
            {wallet.isPrimary && (
              <Text style={{ 
                backgroundColor: theme.colors.primary, 
                color: 'white', 
                paddingHorizontal: 8, 
                paddingVertical: 2, 
                borderRadius: 10, 
                fontSize: 10,
                alignSelf: 'flex-start',
                marginTop: 5
              }}>
                Principal
              </Text>
            )}
          </View>
        ))}
      </View>

      {/* Carte Virtuelle */}
      {virtualCards.length > 0 && (
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: theme.colors.text }}>
            Carte Virtuelle
          </Text>
          {virtualCards.map((card, index) => (
            <View key={index} style={{
              backgroundColor: theme.colors.cardBackground,
              padding: 15,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: theme.colors.border,
            }}>
              <Text style={{ fontWeight: '600', color: theme.colors.text }}>
                **** **** **** {card.cardNumber?.slice(-4)}
              </Text>
              <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>
                Exp: {card.expiryDate}
              </Text>
              <Text style={{ 
                fontSize: 16, 
                fontWeight: 'bold', 
                color: theme.colors.success,
                marginTop: 5
              }}>
                Solde: {card.balance?.toLocaleString() || 0} FCFA
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Épargne Bloquée */}
      {lockedSavings.length > 0 && (
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: theme.colors.text }}>
            Épargne Bloquée
          </Text>
          {lockedSavings.map((saving, index) => (
            <View key={index} style={{
              backgroundColor: theme.colors.cardBackground,
              padding: 15,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: theme.colors.border,
            }}>
              <Text style={{ fontWeight: '600', color: theme.colors.text }}>
                {saving.title}
              </Text>
              <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>
                {saving.description}
              </Text>
              <Text style={{ 
                fontSize: 16, 
                fontWeight: 'bold', 
                color: theme.colors.warning,
                marginTop: 5
              }}>
                {saving.amount?.toLocaleString() || 0} FCFA
              </Text>
              <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>
                Déblocage: {new Date(saving.unlockDate).toLocaleDateString()}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Cagnottes */}
      {savings.length > 0 && (
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: theme.colors.text }}>
            Cagnottes
          </Text>
          {savings.map((saving, index) => (
            <View key={index} style={{
              backgroundColor: theme.colors.cardBackground,
              padding: 15,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: theme.colors.border,
            }}>
              <Text style={{ fontWeight: '600', color: theme.colors.text }}>
                {saving.name}
              </Text>
              <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>
                Code: {saving.code}
              </Text>
              <Text style={{ 
                fontSize: 16, 
                fontWeight: 'bold', 
                color: theme.colors.primary,
                marginTop: 5
              }}>
                {saving.currentAmount?.toLocaleString() || 0} / {saving.targetAmount?.toLocaleString() || 0} FCFA
              </Text>
              <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>
                {Math.round((saving.currentAmount / saving.targetAmount) * 100)}% atteint
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Transactions Récentes */}
      <View style={{ marginBottom: 20 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: theme.colors.text }}>
          Transactions Récentes
        </Text>
        {transactions.slice(0, 3).map((transaction, index) => (
          <View key={index} style={{
            backgroundColor: theme.colors.cardBackground,
            padding: 15,
            borderRadius: 10,
            marginBottom: 10,
            borderWidth: 1,
            borderColor: theme.colors.border,
          }}>
            <Text style={{ fontWeight: '600', color: theme.colors.text }}>
              {transaction.type === 'send' ? '→ Envoyé' : transaction.type === 'receive' ? '← Reçu' : '↕ Dépôt'}
            </Text>
            <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>
              {transaction.description}
            </Text>
            <Text style={{ 
              fontSize: 16, 
              fontWeight: 'bold', 
              color: transaction.type === 'send' ? theme.colors.error : theme.colors.success,
              marginTop: 5
            }}>
              {transaction.type === 'send' ? '-' : '+'}{transaction.amount?.toLocaleString() || 0} FCFA
            </Text>
            <Text style={{ color: theme.colors.textSecondary, fontSize: 10 }}>
              {new Date(transaction.createdAt).toLocaleDateString()}
            </Text>
          </View>
        ))}
      </View>

      {/* Notifications */}
      <View style={{ marginBottom: 20 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: theme.colors.text }}>
          Notifications ({unreadNotifications} non lues)
        </Text>
        {notifications.slice(0, 3).map((notif, index) => (
          <View key={index} style={{
            backgroundColor: notif.read ? theme.colors.cardBackground : theme.colors.primary + '20',
            padding: 15,
            borderRadius: 10,
            marginBottom: 10,
            borderWidth: 1,
            borderColor: notif.read ? theme.colors.border : theme.colors.primary,
          }}>
            <Text style={{ fontWeight: '600', color: theme.colors.text }}>
              {notif.title}
            </Text>
            <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>
              {notif.message}
            </Text>
            <Text style={{ color: theme.colors.textSecondary, fontSize: 10, marginTop: 5 }}>
              {new Date(notif.createdAt).toLocaleDateString()}
            </Text>
          </View>
        ))}
      </View>

      {/* Bouton de rafraîchissement */}
      <TouchableOpacity
        onPress={loadFloriaceData}
        style={{
          backgroundColor: theme.colors.secondary,
          padding: 15,
          borderRadius: 10,
          alignItems: 'center',
        }}
      >
        <Text style={{ color: 'white', fontWeight: '600' }}>
          Actualiser les données
        </Text>
      </TouchableOpacity>
    </View>
  );
}

export default FloriaceProfile;
