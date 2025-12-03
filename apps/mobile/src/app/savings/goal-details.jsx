import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Plus,
  Pause,
  Play,
  Download,
  Calendar,
  Zap,
  Lock,
  Unlock,
  Users,
  TrendingUp,
} from 'lucide-react-native';
import * as Icons from 'lucide-react-native';
import { useTheme } from '@/utils/useTheme';
import { useRequireAuth } from '@/utils/auth/useAuth';
import { useFirebaseAuth } from '@/hooks/useFirebase';
import { useSavingsGoals, pauseSavingsGoal, resumeSavingsGoal, withdrawFromGoal } from '@/hooks/useSavingsGoals';
import ScreenContainer from '@/components/ScreenContainer';
import LoadingScreen from '@/components/LoadingScreen';

export default function GoalDetailsScreen() {
  // Require authentication
  useRequireAuth();

  const params = useLocalSearchParams();
  const goalId = params.id;

  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { user } = useFirebaseAuth();
  const { allGoals, loading } = useSavingsGoals(user?.uid);

  // Trouver l'objectif
  const goal = allGoals.find((g) => g.id === goalId);

  if (loading) {
    return <LoadingScreen />;
  }

  if (!goal) {
    return (
      <ScreenContainer>
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 40,
          }}
        >
          <Text
            style={{
              fontFamily: 'Inter_600SemiBold',
              fontSize: 18,
              color: theme.colors.text,
              textAlign: 'center',
            }}
          >
            Objectif introuvable
          </Text>
          <TouchableOpacity
            style={{
              marginTop: 20,
              backgroundColor: theme.colors.primary,
              paddingVertical: 12,
              paddingHorizontal: 24,
              borderRadius: 12,
            }}
            onPress={() => router.back()}
          >
            <Text
              style={{
                fontFamily: 'Inter_600SemiBold',
                fontSize: 14,
                color: '#FFFFFF',
              }}
            >
              Retour
            </Text>
          </TouchableOpacity>
        </View>
      </ScreenContainer>
    );
  }

  // Calculer la progression
  const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
  const remaining = Math.max(goal.targetAmount - goal.currentAmount, 0);

  // Calculer le nombre de jours restants
  const getDaysRemaining = () => {
    const target = new Date(goal.targetDate);
    const now = new Date();
    const diffTime = target - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const daysRemaining = getDaysRemaining();

  // Déterminer si c'est un groupe
  const isGroup = goal.memberCount !== undefined;

  // Récupérer l'icône
  const IconComponent = Icons[goal.icon] || Icons.Target;

  // Actions
  const handleContribute = () => {
    router.push(`/savings/contribute?id=${goal.id}`);
  };

  const handlePause = async () => {
    Alert.alert(
      'Mettre en pause',
      'Voulez-vous mettre cet objectif en pause ? Les prélèvements automatiques seront suspendus.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer',
          onPress: async () => {
            const result = await pauseSavingsGoal(goal.id);
            if (result.success) {
              Alert.alert('Succès', 'L\'objectif a été mis en pause.');
              router.back();
            }
          },
        },
      ]
    );
  };

  const handleResume = async () => {
    const result = await resumeSavingsGoal(goal.id);
    if (result.success) {
      Alert.alert('Succès', 'L\'objectif a été repris.');
      router.back();
    }
  };

  const handleWithdraw = async () => {
    if (goal.locked && goal.currentAmount < goal.targetAmount && daysRemaining > 0) {
      Alert.alert(
        'Objectif verrouillé',
        'Cet objectif est verrouillé et n\'a pas encore été atteint. Vous ne pouvez pas retirer l\'argent maintenant.'
      );
      return;
    }

    Alert.alert(
      'Retirer l\'épargne',
      `Voulez-vous retirer ${goal.currentAmount.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} € vers votre compte principal ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Retirer',
          style: 'destructive',
          onPress: async () => {
            const result = await withdrawFromGoal(goal.id, goal.walletId, user.uid);
            if (result.success) {
              Alert.alert(
                'Retrait effectué',
                `${result.amount.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} € ont été transférés vers votre compte.`,
                [{ text: 'OK', onPress: () => router.back() }]
              );
            }
          },
        },
      ]
    );
  };

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
            <TouchableOpacity
              onPress={() => router.back()}
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                backgroundColor: theme.colors.cardBackground,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ArrowLeft size={20} color={theme.colors.text} strokeWidth={1.5} />
            </TouchableOpacity>

            <View style={{ flexDirection: 'row', gap: 8 }}>
              {goal.status === 'active' && (
                <TouchableOpacity
                  onPress={handlePause}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    backgroundColor: theme.colors.cardBackground,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Pause size={20} color={theme.colors.text} strokeWidth={1.5} />
                </TouchableOpacity>
              )}
              {goal.status === 'paused' && (
                <TouchableOpacity
                  onPress={handleResume}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    backgroundColor: theme.colors.success + '20',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Play size={20} color={theme.colors.success} strokeWidth={1.5} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Carte principale */}
          <View
            style={{
              backgroundColor: goal.color,
              borderRadius: 24,
              padding: 28,
              marginBottom: 24,
              shadowColor: goal.color,
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.3,
              shadowRadius: 20,
              elevation: 12,
            }}
          >
            {/* Icône et titre */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
              <View
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 16,
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 16,
                }}
              >
                <IconComponent size={32} color="#FFFFFF" strokeWidth={1.5} />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontFamily: 'Inter_700Bold',
                    fontSize: 24,
                    color: '#FFFFFF',
                    marginBottom: 4,
                  }}
                >
                  {goal.name}
                </Text>
                <Text
                  style={{
                    fontFamily: 'Inter_400Regular',
                    fontSize: 14,
                    color: 'rgba(255,255,255,0.8)',
                  }}
                >
                  {goal.description}
                </Text>
              </View>
            </View>

            {/* Montant actuel */}
            <View style={{ marginBottom: 20 }}>
              <Text
                style={{
                  fontFamily: 'Inter_500Medium',
                  fontSize: 14,
                  color: 'rgba(255,255,255,0.8)',
                  marginBottom: 8,
                }}
              >
                Épargne actuelle
              </Text>
              <Text
                style={{
                  fontFamily: 'Inter_700Bold',
                  fontSize: 42,
                  color: '#FFFFFF',
                  letterSpacing: -2,
                }}
              >
                {goal.currentAmount.toLocaleString('fr-FR', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{' '}
                €
              </Text>
            </View>

            {/* Barre de progression */}
            <View style={{ marginBottom: 16 }}>
              <View
                style={{
                  height: 12,
                  backgroundColor: 'rgba(255,255,255,0.3)',
                  borderRadius: 6,
                  overflow: 'hidden',
                }}
              >
                <View
                  style={{
                    height: '100%',
                    width: `${progress}%`,
                    backgroundColor: '#FFFFFF',
                    borderRadius: 6,
                  }}
                />
              </View>
            </View>

            {/* Progression et objectif */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <View>
                <Text
                  style={{
                    fontFamily: 'Inter_700Bold',
                    fontSize: 24,
                    color: '#FFFFFF',
                  }}
                >
                  {progress.toFixed(0)}%
                </Text>
                <Text
                  style={{
                    fontFamily: 'Inter_400Regular',
                    fontSize: 13,
                    color: 'rgba(255,255,255,0.8)',
                  }}
                >
                  de l'objectif atteint
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text
                  style={{
                    fontFamily: 'Inter_600SemiBold',
                    fontSize: 18,
                    color: '#FFFFFF',
                  }}
                >
                  {goal.targetAmount.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                </Text>
                <Text
                  style={{
                    fontFamily: 'Inter_400Regular',
                    fontSize: 13,
                    color: 'rgba(255,255,255,0.8)',
                  }}
                >
                  Objectif
                </Text>
              </View>
            </View>
          </View>

          {/* Actions rapides */}
          <View
            style={{
              flexDirection: 'row',
              gap: 12,
              marginBottom: 24,
            }}
          >
            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: theme.colors.primary,
                borderRadius: 16,
                paddingVertical: 16,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: theme.colors.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 6,
              }}
              onPress={handleContribute}
            >
              <Plus size={20} color="#FFFFFF" strokeWidth={2} />
              <Text
                style={{
                  fontFamily: 'Inter_700Bold',
                  fontSize: 15,
                  color: '#FFFFFF',
                  marginLeft: 8,
                }}
              >
                Contribuer
              </Text>
            </TouchableOpacity>

            {progress >= 100 && (
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: theme.colors.success,
                  borderRadius: 16,
                  paddingVertical: 16,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  shadowColor: theme.colors.success,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 6,
                }}
                onPress={handleWithdraw}
              >
                <Download size={20} color="#FFFFFF" strokeWidth={2} />
                <Text
                  style={{
                    fontFamily: 'Inter_700Bold',
                    fontSize: 15,
                    color: '#FFFFFF',
                    marginLeft: 8,
                  }}
                >
                  Retirer
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Informations */}
          <View
            style={{
              backgroundColor: theme.colors.cardBackground,
              borderRadius: 16,
              padding: 20,
              marginBottom: 24,
              borderWidth: 1,
              borderColor: theme.colors.border,
            }}
          >
            <Text
              style={{
                fontFamily: 'Inter_600SemiBold',
                fontSize: 16,
                color: theme.colors.text,
                marginBottom: 16,
              }}
            >
              Informations
            </Text>

            {/* Reste à épargner */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingVertical: 12,
                borderBottomWidth: 1,
                borderBottomColor: theme.colors.border,
              }}
            >
              <Text
                style={{
                  fontFamily: 'Inter_400Regular',
                  fontSize: 14,
                  color: theme.colors.textSecondary,
                }}
              >
                Reste à épargner
              </Text>
              <Text
                style={{
                  fontFamily: 'Inter_600SemiBold',
                  fontSize: 15,
                  color: theme.colors.text,
                }}
              >
                {remaining.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
              </Text>
            </View>

            {/* Jours restants */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingVertical: 12,
                borderBottomWidth: 1,
                borderBottomColor: theme.colors.border,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Calendar size={16} color={theme.colors.textSecondary} strokeWidth={1.5} />
                <Text
                  style={{
                    fontFamily: 'Inter_400Regular',
                    fontSize: 14,
                    color: theme.colors.textSecondary,
                    marginLeft: 8,
                  }}
                >
                  Jours restants
                </Text>
              </View>
              <Text
                style={{
                  fontFamily: 'Inter_600SemiBold',
                  fontSize: 15,
                  color: theme.colors.text,
                }}
              >
                {daysRemaining} jour{daysRemaining > 1 ? 's' : ''}
              </Text>
            </View>

            {/* Date cible */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingVertical: 12,
                borderBottomWidth: 1,
                borderBottomColor: theme.colors.border,
              }}
            >
              <Text
                style={{
                  fontFamily: 'Inter_400Regular',
                  fontSize: 14,
                  color: theme.colors.textSecondary,
                }}
              >
                Date cible
              </Text>
              <Text
                style={{
                  fontFamily: 'Inter_600SemiBold',
                  fontSize: 15,
                  color: theme.colors.text,
                }}
              >
                {new Date(goal.targetDate).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </Text>
            </View>

            {/* Auto-débit */}
            {goal.autoDebit && (
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingVertical: 12,
                  borderBottomWidth: 1,
                  borderBottomColor: theme.colors.border,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Zap size={16} color={theme.colors.success} strokeWidth={1.5} />
                  <Text
                    style={{
                      fontFamily: 'Inter_400Regular',
                      fontSize: 14,
                      color: theme.colors.textSecondary,
                      marginLeft: 8,
                    }}
                  >
                    Prélèvement auto
                  </Text>
                </View>
                <Text
                  style={{
                    fontFamily: 'Inter_600SemiBold',
                    fontSize: 15,
                    color: theme.colors.success,
                  }}
                >
                  {goal.autoDebitAmount.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} € /{' '}
                  {goal.frequency === 'daily' && 'jour'}
                  {goal.frequency === 'weekly' && 'semaine'}
                  {goal.frequency === 'monthly' && 'mois'}
                </Text>
              </View>
            )}

            {/* Verrouillé */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingVertical: 12,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {goal.locked ? (
                  <Lock size={16} color={theme.colors.warning} strokeWidth={1.5} />
                ) : (
                  <Unlock size={16} color={theme.colors.success} strokeWidth={1.5} />
                )}
                <Text
                  style={{
                    fontFamily: 'Inter_400Regular',
                    fontSize: 14,
                    color: theme.colors.textSecondary,
                    marginLeft: 8,
                  }}
                >
                  État
                </Text>
              </View>
              <Text
                style={{
                  fontFamily: 'Inter_600SemiBold',
                  fontSize: 15,
                  color: goal.locked ? theme.colors.warning : theme.colors.success,
                }}
              >
                {goal.locked ? 'Verrouillé' : 'Accessible'}
              </Text>
            </View>
          </View>

          {/* Si c'est un groupe : afficher les membres */}
          {isGroup && (
            <View
              style={{
                backgroundColor: theme.colors.cardBackground,
                borderRadius: 16,
                padding: 20,
                marginBottom: 24,
                borderWidth: 1,
                borderColor: theme.colors.border,
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: 16,
                }}
              >
                <Users size={20} color={theme.colors.primary} strokeWidth={1.5} />
                <Text
                  style={{
                    fontFamily: 'Inter_600SemiBold',
                    fontSize: 16,
                    color: theme.colors.text,
                    marginLeft: 8,
                  }}
                >
                  Membres ({goal.memberCount})
                </Text>
              </View>

              {goal.contributions?.map((contrib, index) => (
                <View
                  key={contrib.userId}
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingVertical: 12,
                    borderBottomWidth:
                      index < goal.contributions.length - 1 ? 1 : 0,
                    borderBottomColor: theme.colors.border,
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontFamily: 'Inter_500Medium',
                        fontSize: 14,
                        color: theme.colors.text,
                      }}
                    >
                      {contrib.userId === user.uid ? 'Vous' : `Membre ${index + 1}`}
                    </Text>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginTop: 4,
                      }}
                    >
                      <View
                        style={{
                          width: 60,
                          height: 4,
                          backgroundColor: theme.colors.border,
                          borderRadius: 2,
                          overflow: 'hidden',
                          marginRight: 8,
                        }}
                      >
                        <View
                          style={{
                            width: `${contrib.percentage}%`,
                            height: '100%',
                            backgroundColor: theme.colors.primary,
                          }}
                        />
                      </View>
                      <Text
                        style={{
                          fontFamily: 'Inter_400Regular',
                          fontSize: 12,
                          color: theme.colors.textSecondary,
                        }}
                      >
                        {contrib.percentage.toFixed(1)}%
                      </Text>
                    </View>
                  </View>
                  <Text
                    style={{
                      fontFamily: 'Inter_600SemiBold',
                      fontSize: 15,
                      color: theme.colors.text,
                    }}
                  >
                    {contrib.amount.toLocaleString('fr-FR', {
                      minimumFractionDigits: 2,
                    })}{' '}
                    €
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Statistiques */}
          <View
            style={{
              backgroundColor: theme.colors.cardBackground,
              borderRadius: 16,
              padding: 20,
              borderWidth: 1,
              borderColor: theme.colors.border,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 16,
              }}
            >
              <TrendingUp size={20} color={theme.colors.primary} strokeWidth={1.5} />
              <Text
                style={{
                  fontFamily: 'Inter_600SemiBold',
                  fontSize: 16,
                  color: theme.colors.text,
                  marginLeft: 8,
                }}
              >
                Statistiques
              </Text>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontFamily: 'Inter_400Regular',
                    fontSize: 13,
                    color: theme.colors.textSecondary,
                    marginBottom: 8,
                  }}
                >
                  Épargne mensuelle moyenne
                </Text>
                <Text
                  style={{
                    fontFamily: 'Inter_600SemiBold',
                    fontSize: 18,
                    color: theme.colors.text,
                  }}
                >
                  {goal.autoDebit && goal.frequency === 'monthly'
                    ? goal.autoDebitAmount.toLocaleString('fr-FR', {
                        minimumFractionDigits: 2,
                      })
                    : '—'}{' '}
                  €
                </Text>
              </View>

              <View style={{ flex: 1, alignItems: 'flex-end' }}>
                <Text
                  style={{
                    fontFamily: 'Inter_400Regular',
                    fontSize: 13,
                    color: theme.colors.textSecondary,
                    marginBottom: 8,
                  }}
                >
                  Jours écoulés
                </Text>
                <Text
                  style={{
                    fontFamily: 'Inter_600SemiBold',
                    fontSize: 18,
                    color: theme.colors.text,
                  }}
                >
                  {Math.ceil(
                    (new Date() - new Date(goal.startDate)) /
                      (1000 * 60 * 60 * 24)
                  )}{' '}
                  j
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </ScreenContainer>
    </>
  );
}
