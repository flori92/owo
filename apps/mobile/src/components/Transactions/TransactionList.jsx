import React from 'react';
import { FlatList, RefreshControl, Text, TouchableOpacity, View } from 'react-native';
import { ArrowDownRight, ArrowUpRight, Plus } from 'lucide-react-native';
import { useTransactions } from '@/hooks/useFirebase';
import { useTheme } from '@/utils/useTheme';

const toDate = (value) => value?.toDate?.() || (value ? new Date(value) : new Date());

const statusLabels = {
  pending: 'En attente',
  processing: 'En traitement',
  completed: 'Effectuée',
  failed: 'Échouée',
  cancelled: 'Annulée',
  demo: 'Démo',
};

export default function TransactionList({ userId, onNewTransaction }) {
  const { transactions, loading, refetch } = useTransactions(userId, 50);
  const theme = useTheme();

  const renderTransaction = ({ item }) => {
    const incoming = item.type === 'receive' || item.type === 'deposit';
    return (
      <View
        style={{
          backgroundColor: theme.colors.elevated,
          padding: 16,
          marginVertical: 4,
          marginHorizontal: 16,
          borderRadius: 12,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <View style={{ flex: 1, paddingRight: 12 }}>
          <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: '600' }}>
            {item.description || item.title || 'Transaction'}
          </Text>
          <Text style={{ color: theme.colors.textSecondary, fontSize: 12, marginTop: 4 }}>
            {toDate(item.createdAt).toLocaleDateString('fr-FR')}
          </Text>
          {item.status ? (
            <Text
              style={{
                color:
                  item.status === 'completed'
                    ? theme.colors.success
                    : item.status === 'failed'
                      ? theme.colors.error
                      : theme.colors.warning || '#F59E0B',
                fontSize: 12,
                fontWeight: '600',
                marginTop: 4,
              }}
            >
              {statusLabels[item.status] || item.status}
            </Text>
          ) : null}
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {incoming ? <ArrowDownRight size={16} color={theme.colors.success} /> : <ArrowUpRight size={16} color={theme.colors.error} />}
          <Text style={{ marginLeft: 4, fontSize: 16, fontWeight: '700', color: incoming ? theme.colors.success : theme.colors.error }}>
            {incoming ? '+' : '-'} {Number(item.amount || 0).toLocaleString('fr-FR')} FCFA
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={transactions}
        renderItem={renderTransaction}
        keyExtractor={(item) => item.id || item.$id}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refetch} />}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', paddingVertical: 48, paddingHorizontal: 24 }}>
            <Text style={{ color: theme.colors.textSecondary, fontSize: 16, textAlign: 'center' }}>
              Aucune transaction enregistrée
            </Text>
          </View>
        }
      />
      <TouchableOpacity
        accessibilityLabel="Ajouter une transaction"
        onPress={onNewTransaction}
        style={{ position: 'absolute', bottom: 20, right: 20, backgroundColor: theme.colors.primary, width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', elevation: 5 }}
      >
        <Plus size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}
