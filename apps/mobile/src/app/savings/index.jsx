import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { router, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Target,
  Plus,
  Users,
  TrendingUp,
  Filter,
  ArrowLeft,
  PiggyBank,
} from 'lucide-react-native';
import { useTheme } from '@/utils/useTheme';
import { useRequireAuth } from '@/utils/auth/useAuth';
import { useFirebaseAuth } from '@/hooks/useFirebase';
import { useSavingsGoals } from '@/hooks/useSavingsGoals';
import ScreenContainer from '@/components/ScreenContainer';
import LoadingScreen from '@/components/LoadingScreen';
import { GoalCard } from '@/components/Savings/GoalCard';

export default function SavingsGoalsScreen() {
  // Require authentication
  useRequireAuth();

  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { user } = useFirebaseAuth();
  const {
    allGoals,
    lockedSavings,
    groupSavings,
    loading,
    totalSaved,
    activeGoalsCount,
  } = useSavingsGoals(user?.uid);

  const [refreshing, setRefreshing] = useState(false);
  const [filterType, setFilterType] = useState('all'); // all, individual, group

  // Pull to refresh
  const onRefresh = async () => {
    setRefreshing(true);
    // Dans un cas réel, on rafraîchirait les données Firebase
    setTimeout(() => setRefreshing(false), 1000);
  };

  // Filtrer les objectifs
  const filteredGoals = allGoals.filter((goal) => {
    if (filterType === 'individual') return !goal.memberCount;
    if (filterType === 'group') return goal.memberCount !== undefined;
    return true;
  });

  // Trier par priorité et date
  const sortedGoals = [...filteredGoals].sort((a, b) => {
    // Priorité d'abord
    if (a.priority !== b.priority) {
      return (a.priority || 999) - (b.priority || 999);
    }
    // Puis par date de création (plus récent d'abord)
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <ScreenContainer>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingTop: insets.top + 16,
            paddingHorizontal: 24,
            paddingBottom: insets.bottom + 100,
          }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.colors.primary}
              colors={[theme.colors.primary]}
              progressBackgroundColor={theme.colors.cardBackground}
            />
          }
        >
          {/* Header */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 24,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity
                onPress={() => router.back()}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  backgroundColor: theme.colors.cardBackground,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 12,
                }}
              >
                <ArrowLeft size={20} color={theme.colors.text} strokeWidth={1.5} />
              </TouchableOpacity>
              <View>
                <Text
                  style={{
                    fontFamily: 'Inter_700Bold',
                    fontSize: 28,
                    color: theme.colors.text,
                  }}
                >
                  Mes Objectifs
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => router.push('/savings/create-goal')}
              style={{
                width: 48,
                height: 48,
                borderRadius: 16,
                backgroundColor: theme.colors.primary,
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: theme.colors.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 6,
              }}
            >
              <Plus size={24} color="#FFFFFF" strokeWidth={2} />
            </TouchableOpacity>
          </View>

          {/* Résumé total */}
          <View
            style={{
              backgroundColor: theme.colors.primary,
              borderRadius: 20,
              padding: 24,
              marginBottom: 24,
              shadowColor: theme.colors.shadowColor,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 12,
              elevation: 8,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <PiggyBank size={24} color="#FFFFFF" strokeWidth={1.5} />
              <Text
                style={{
                  fontFamily: 'Inter_500Medium',
                  fontSize: 14,
                  color: 'rgba(255,255,255,0.8)',
                  marginLeft: 8,
                }}
              >
                Total épargné
              </Text>
            </View>

            <Text
              style={{
                fontFamily: 'Inter_700Bold',
                fontSize: 36,
                color: '#FFFFFF',
                marginBottom: 16,
                letterSpacing: -1,
              }}
            >
              {totalSaved.toLocaleString('fr-FR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{' '}
              €
            </Text>

            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                paddingTop: 16,
                borderTopWidth: 1,
                borderTopColor: 'rgba(255,255,255,0.2)',
              }}
            >
              <View>
                <Text
                  style={{
                    fontFamily: 'Inter_400Regular',
                    fontSize: 12,
                    color: 'rgba(255,255,255,0.7)',
                    marginBottom: 4,
                  }}
                >
                  Objectifs actifs
                </Text>
                <Text
                  style={{
                    fontFamily: 'Inter_600SemiBold',
                    fontSize: 18,
                    color: '#FFFFFF',
                  }}
                >
                  {activeGoalsCount}
                </Text>
              </View>

              <View>
                <Text
                  style={{
                    fontFamily: 'Inter_400Regular',
                    fontSize: 12,
                    color: 'rgba(255,255,255,0.7)',
                    marginBottom: 4,
                  }}
                >
                  Individuels
                </Text>
                <Text
                  style={{
                    fontFamily: 'Inter_600SemiBold',
                    fontSize: 18,
                    color: '#FFFFFF',
                  }}
                >
                  {lockedSavings.length}
                </Text>
              </View>

              <View>
                <Text
                  style={{
                    fontFamily: 'Inter_400Regular',
                    fontSize: 12,
                    color: 'rgba(255,255,255,0.7)',
                    marginBottom: 4,
                  }}
                >
                  Groupes
                </Text>
                <Text
                  style={{
                    fontFamily: 'Inter_600SemiBold',
                    fontSize: 18,
                    color: '#FFFFFF',
                  }}
                >
                  {groupSavings.length}
                </Text>
              </View>
            </View>
          </View>

          {/* Filtres */}
          <View
            style={{
              flexDirection: 'row',
              gap: 12,
              marginBottom: 20,
            }}
          >
            <TouchableOpacity
              style={{
                flex: 1,
                paddingVertical: 12,
                paddingHorizontal: 16,
                borderRadius: 12,
                backgroundColor:
                  filterType === 'all'
                    ? theme.colors.primary
                    : theme.colors.cardBackground,
                borderWidth: 1,
                borderColor:
                  filterType === 'all'
                    ? theme.colors.primary
                    : theme.colors.border,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onPress={() => setFilterType('all')}
            >
              <Target
                size={18}
                color={filterType === 'all' ? '#FFFFFF' : theme.colors.textSecondary}
                strokeWidth={1.5}
              />
              <Text
                style={{
                  fontFamily: 'Inter_600SemiBold',
                  fontSize: 14,
                  color:
                    filterType === 'all' ? '#FFFFFF' : theme.colors.textSecondary,
                  marginLeft: 6,
                }}
              >
                Tous
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                flex: 1,
                paddingVertical: 12,
                paddingHorizontal: 16,
                borderRadius: 12,
                backgroundColor:
                  filterType === 'individual'
                    ? theme.colors.primary
                    : theme.colors.cardBackground,
                borderWidth: 1,
                borderColor:
                  filterType === 'individual'
                    ? theme.colors.primary
                    : theme.colors.border,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onPress={() => setFilterType('individual')}
            >
              <TrendingUp
                size={18}
                color={
                  filterType === 'individual' ? '#FFFFFF' : theme.colors.textSecondary
                }
                strokeWidth={1.5}
              />
              <Text
                style={{
                  fontFamily: 'Inter_600SemiBold',
                  fontSize: 14,
                  color:
                    filterType === 'individual'
                      ? '#FFFFFF'
                      : theme.colors.textSecondary,
                  marginLeft: 6,
                }}
              >
                Perso
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                flex: 1,
                paddingVertical: 12,
                paddingHorizontal: 16,
                borderRadius: 12,
                backgroundColor:
                  filterType === 'group'
                    ? theme.colors.primary
                    : theme.colors.cardBackground,
                borderWidth: 1,
                borderColor:
                  filterType === 'group'
                    ? theme.colors.primary
                    : theme.colors.border,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onPress={() => setFilterType('group')}
            >
              <Users
                size={18}
                color={filterType === 'group' ? '#FFFFFF' : theme.colors.textSecondary}
                strokeWidth={1.5}
              />
              <Text
                style={{
                  fontFamily: 'Inter_600SemiBold',
                  fontSize: 14,
                  color:
                    filterType === 'group' ? '#FFFFFF' : theme.colors.textSecondary,
                  marginLeft: 6,
                }}
              >
                Groupe
              </Text>
            </TouchableOpacity>
          </View>

          {/* Liste des objectifs */}
          {sortedGoals.length === 0 ? (
            <View
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 60,
              }}
            >
              <View
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  backgroundColor: theme.colors.primary + '20',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 16,
                }}
              >
                <Target size={40} color={theme.colors.primary} strokeWidth={1.5} />
              </View>
              <Text
                style={{
                  fontFamily: 'Inter_600SemiBold',
                  fontSize: 18,
                  color: theme.colors.text,
                  marginBottom: 8,
                }}
              >
                Aucun objectif
              </Text>
              <Text
                style={{
                  fontFamily: 'Inter_400Regular',
                  fontSize: 14,
                  color: theme.colors.textSecondary,
                  textAlign: 'center',
                  paddingHorizontal: 40,
                  marginBottom: 24,
                }}
              >
                Commencez par créer votre premier objectif d'épargne
              </Text>
              <TouchableOpacity
                style={{
                  backgroundColor: theme.colors.primary,
                  paddingVertical: 12,
                  paddingHorizontal: 24,
                  borderRadius: 12,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
                onPress={() => router.push('/savings/create-goal')}
              >
                <Plus size={20} color="#FFFFFF" strokeWidth={2} />
                <Text
                  style={{
                    fontFamily: 'Inter_600SemiBold',
                    fontSize: 14,
                    color: '#FFFFFF',
                    marginLeft: 8,
                  }}
                >
                  Créer un objectif
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              <Text
                style={{
                  fontFamily: 'Inter_600SemiBold',
                  fontSize: 16,
                  color: theme.colors.text,
                  marginBottom: 16,
                }}
              >
                {filterType === 'all' && 'Tous les objectifs'}
                {filterType === 'individual' && 'Objectifs personnels'}
                {filterType === 'group' && 'Épargnes de groupe'}
                {' • '}
                <Text style={{ color: theme.colors.textSecondary }}>
                  {sortedGoals.length}
                </Text>
              </Text>

              {sortedGoals.map((goal) => (
                <GoalCard key={goal.id} goal={goal} theme={theme} />
              ))}
            </View>
          )}
        </ScrollView>
      </ScreenContainer>
    </>
  );
}
