import React from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import TransactionList from '@/components/Transactions/TransactionList';
import ScreenContainer from '@/components/ScreenContainer';
import { useAuth } from '@/utils/auth/useAuth';
import { useTheme } from '@/utils/useTheme';

export default function TransactionsScreen() {
  const { user } = useAuth();
  const theme = useTheme();

  return (
    <ScreenContainer>
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <TransactionList
          userId={user?.uid}
          onNewTransaction={() => router.push('/(tabs)/add-transaction')}
        />
      </View>
    </ScreenContainer>
  );
}
