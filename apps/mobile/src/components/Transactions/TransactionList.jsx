import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useNeon } from '../../hooks/useNeon';
import { useTheme } from '../../utils/useTheme';
import { ArrowUpRight, ArrowDownRight, Plus } from 'lucide-react-native';

export default function TransactionList({ userId, onNewTransaction }) {
  const { getTransactions, loading, error } = useNeon();
  const [transactions, setTransactions] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const theme = useTheme();

  const loadTransactions = async () => {
    const result = await getTransactions(userId);
    if (result.success) {
      setTransactions(result.data);
    }
  };

  useEffect(() => {
    if (userId) {
      loadTransactions();
    }
  }, [userId]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTransactions();
    setRefreshing(false);
  };

  const renderTransaction = ({ item }) => (
    <View
      style={{
        backgroundColor: theme.colors.card,
        padding: 16,
        marginVertical: 4,
        marginHorizontal: 16,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <View style={{ flex: 1 }}>
        <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: '600' }}>
          {item.description}
        </Text>
        <Text style={{ color: theme.colors.textSecondary, fontSize: 14, marginTop: 4 }}>
          {item.category}
        </Text>
        <Text style={{ color: theme.colors.textSecondary, fontSize: 12, marginTop: 2 }}>
          {new Date(item.created_at).toLocaleDateString()}
        </Text>
      </View>
      
      <View style={{ alignItems: 'flex-end' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {item.type === 'credit' ? (
            <ArrowDownRight size={16} color="#10B981" style={{ marginRight: 4 }} />
          ) : (
            <ArrowUpRight size={16} color="#EF4444" style={{ marginRight: 4 }} />
          )}
          <Text
            style={{
              fontSize: 18,
              fontWeight: '700',
              color: item.type === 'credit' ? '#10B981' : '#EF4444',
            }}
          >
            {item.type === 'credit' ? '+' : '-'} {item.amount.toLocaleString()} FCFA
          </Text>
        </View>
      </View>
    </View>
  );

  if (loading && transactions.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: theme.colors.text }}>Chargement des transactions...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={transactions}
        renderItem={renderTransaction}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={() => (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 40 }}>
            <Text style={{ color: theme.colors.textSecondary, fontSize: 16 }}>
              Aucune transaction trouvée
            </Text>
          </View>
        )}
      />
      
      <TouchableOpacity
        onPress={onNewTransaction}
        style={{
          position: 'absolute',
          bottom: 20,
          right: 20,
          backgroundColor: theme.colors.primary,
          width: 56,
          height: 56,
          borderRadius: 28,
          justifyContent: 'center',
          alignItems: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 4,
          elevation: 5,
        }}
      >
        <Plus size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}
