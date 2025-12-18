import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ProgressBarAndroid } from 'react-native';
import { useNeon } from '../../hooks/useNeon';
import { useTheme } from '../../utils/useTheme';
import { Target, Plus, TrendingUp } from 'lucide-react-native';

export default function SavingsGoalList({ userId, onNewGoal }) {
  const { getSavingsGoals, loading, error } = useNeon();
  const [goals, setGoals] = useState([]);
  const theme = useTheme();

  const loadGoals = async () => {
    const result = await getSavingsGoals(userId);
    if (result.success) {
      setGoals(result.data);
    }
  };

  useEffect(() => {
    if (userId) {
      loadGoals();
    }
  }, [userId]);

  const renderGoal = ({ item }) => {
    const progress = (item.current_amount / item.target_amount) * 100;
    const isCompleted = progress >= 100;
    const daysLeft = item.deadline 
      ? Math.ceil((new Date(item.deadline) - new Date()) / (1000 * 60 * 60 * 24))
      : null;

    return (
      <View
        style={{
          backgroundColor: theme.colors.card,
          padding: 16,
          marginVertical: 4,
          marginHorizontal: 16,
          borderRadius: 12,
          borderLeftWidth: 4,
          borderLeftColor: isCompleted ? '#10B981' : theme.colors.primary,
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: '600' }}>
              {item.title}
            </Text>
            
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
              <Target size={16} color={theme.colors.textSecondary} style={{ marginRight: 4 }} />
              <Text style={{ color: theme.colors.textSecondary, fontSize: 14 }}>
                {item.current_amount.toLocaleString()} / {item.target_amount.toLocaleString()} FCFA
              </Text>
            </View>

            {daysLeft !== null && (
              <Text style={{ 
                color: daysLeft < 0 ? '#EF4444' : theme.colors.textSecondary, 
                fontSize: 12, 
                marginTop: 4 
              }}>
                {daysLeft < 0 
                  ? `En retard de ${Math.abs(daysLeft)} jours` 
                  : daysLeft === 0 
                    ? 'Dernier jour' 
                    : `${daysLeft} jours restants`
                }
              </Text>
            )}
          </View>

          {isCompleted && (
            <View style={{ 
              backgroundColor: '#10B981', 
              paddingHorizontal: 8, 
              paddingVertical: 4, 
              borderRadius: 6 
            }}>
              <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '600' }}>
                Atteint
              </Text>
            </View>
          )}
        </View>

        {/* Progress Bar */}
        <View style={{ marginTop: 12 }}>
          <View style={{ 
            height: 8, 
            backgroundColor: theme.colors.border, 
            borderRadius: 4,
            overflow: 'hidden'
          }}>
            <View style={{
              height: '100%',
              width: `${Math.min(progress, 100)}%`,
              backgroundColor: isCompleted ? '#10B981' : theme.colors.primary,
              borderRadius: 4,
            }} />
          </View>
          <Text style={{ 
            color: theme.colors.textSecondary, 
            fontSize: 12, 
            marginTop: 4,
            textAlign: 'right'
          }}>
            {progress.toFixed(1)}%
          </Text>
        </View>
      </View>
    );
  };

  if (loading && goals.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: theme.colors.text }}>Chargement des objectifs...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={{ 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: theme.colors.background
      }}>
        <Text style={{ color: theme.colors.text, fontSize: 20, fontWeight: '700' }}>
          Objectifs d'épargne
        </Text>
        <TouchableOpacity
          onPress={onNewGoal}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: theme.colors.primary,
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 8,
          }}
        >
          <Plus size={16} color="#FFFFFF" style={{ marginRight: 4 }} />
          <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '600' }}>
            Nouveau
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={goals}
        renderItem={renderGoal}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={() => (
          <View style={{ 
            flex: 1, 
            justifyContent: 'center', 
            alignItems: 'center', 
            paddingVertical: 40 
          }}>
            <TrendingUp size={48} color={theme.colors.textSecondary} style={{ marginBottom: 16 }} />
            <Text style={{ 
              color: theme.colors.textSecondary, 
              fontSize: 16, 
              textAlign: 'center',
              paddingHorizontal: 40 
            }}>
              Commencez à créer vos objectifs d'épargne pour atteindre vos rêves
            </Text>
          </View>
        )}
      />
    </View>
  );
}
