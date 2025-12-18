import React, { useState } from "react";
import { View } from "react-native";
import TransactionList from "../../components/Transactions/TransactionList";
import NewTransactionModal from "../../components/Transactions/NewTransactionModal";
import { useAuth } from "@/utils/auth/useAuth";
import { useTheme } from "@/utils/useTheme";
import ScreenContainer from "@/components/ScreenContainer";

export default function TransactionsNewScreen() {
  const { user } = useAuth();
  const theme = useTheme();
  const [showNewTransactionModal, setShowNewTransactionModal] = useState(false);

  const handleNewTransactionSuccess = () => {
    // La liste se rafraîchira automatiquement via le hook
  };

  return (
    <ScreenContainer>
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <TransactionList
          userId={user?.uid}
          onNewTransaction={() => setShowNewTransactionModal(true)}
        />
        
        <NewTransactionModal
          visible={showNewTransactionModal}
          onClose={() => setShowNewTransactionModal(false)}
          userId={user?.uid}
          onSuccess={handleNewTransactionSuccess}
        />
      </View>
    </ScreenContainer>
  );
}
