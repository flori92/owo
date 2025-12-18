import React, { useState } from "react";
import { View } from "react-native";
import SavingsGoalList from "../../components/Savings/SavingsGoalList";
import NewSavingsGoalModal from "../../components/Savings/NewSavingsGoalModal";
import { useAuth } from "@/utils/auth/useAuth";
import { useTheme } from "@/utils/useTheme";
import ScreenContainer from "@/components/ScreenContainer";

export default function SavingsNewScreen() {
  const { user } = useAuth();
  const theme = useTheme();
  const [showNewGoalModal, setShowNewGoalModal] = useState(false);

  const handleNewGoalSuccess = () => {
    // La liste se rafraîchira automatiquement via le hook
  };

  return (
    <ScreenContainer>
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <SavingsGoalList
          userId={user?.uid}
          onNewGoal={() => setShowNewGoalModal(true)}
        />
        
        <NewSavingsGoalModal
          visible={showNewGoalModal}
          onClose={() => setShowNewGoalModal(false)}
          userId={user?.uid}
          onSuccess={handleNewGoalSuccess}
        />
      </View>
    </ScreenContainer>
  );
}
