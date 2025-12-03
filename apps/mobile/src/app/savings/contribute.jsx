import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Wallet,
  TrendingUp,
  CheckCircle2,
} from 'lucide-react-native';
import * as Icons from 'lucide-react-native';
import { useTheme } from '@/utils/useTheme';
import { useRequireAuth } from '@/utils/auth/useAuth';
import { useFirebaseAuth, useWallets } from '@/hooks/useFirebase';
import { useSavingsGoals, contributeToGoal, contributeToGroupSavings } from '@/hooks/useSavingsGoals';
import ScreenContainer from '@/components/ScreenContainer';
import LoadingScreen from '@/components/LoadingScreen';

export default function ContributeScreen() {
  // Require authentication
  useRequireAuth();

  const params = useLocalSearchParams();
  const goalId = params.id;

  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { user } = useFirebaseAuth();
  const { wallets, loading: walletsLoading } = useWallets(user?.uid);
  const { allGoals, loading: goalsLoading } = useSavingsGoals(user?.uid);

  // Trouver l'objectif
  const goal = allGoals.find((g) => g.id === goalId);

  // Form state
  const [amount, setAmount] = useState('');
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [loading, setLoading] = useState(false);

  // Sélectionner le wallet principal par défaut
  React.useEffect(() => {
    if (wallets.length > 0 && !selectedWallet) {
      const primaryWallet = wallets.find((w) => w.isPrimary) || wallets[0];
      setSelectedWallet(primaryWallet);
    }
  }, [wallets]);

  if (goalsLoading || walletsLoading) {
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

  // Calculer la progression actuelle et après contribution
  const currentProgress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
  const contributionAmount = parseFloat(amount) || 0;
  const newAmount = goal.currentAmount + contributionAmount;
  const newProgress = Math.min((newAmount / goal.targetAmount) * 100, 100);
  const remaining = Math.max(goal.targetAmount - newAmount, 0);

  // Montants suggérés
  const suggestedAmounts = [
    50, 100, 200, 500
  ];

  // Récupérer l'icône
  const IconComponent = Icons[goal.icon] || Icons.Target;

  // Déterminer si c'est un groupe
  const isGroup = goal.memberCount !== undefined;

  // Gérer la contribution
  const handleContribute = async () => {
    // Validation
    if (!amount || contributionAmount <= 0) {
      Alert.alert('Erreur', 'Veuillez saisir un montant valide');
      return;
    }

    if (!selectedWallet) {
      Alert.alert('Erreur', 'Veuillez sélectionner un compte source');
      return;
    }

    if (contributionAmount > selectedWallet.balance) {
      Alert.alert(
        'Solde insuffisant',
        'Le montant dépasse le solde disponible sur ce compte.'
      );
      return;
    }

    setLoading(true);

    let result;
    if (isGroup) {
      result = await contributeToGroupSavings(
        goal.id,
        contributionAmount,
        selectedWallet.id,
        user.uid
      );
    } else {
      result = await contributeToGoal(
        goal.id,
        contributionAmount,
        selectedWallet.id,
        user.uid
      );
    }

    setLoading(false);

    if (result.success) {
      Alert.alert(
        'Contribution réussie !',
        `Vous avez contribué ${contributionAmount.toLocaleString('fr-FR', {
          minimumFractionDigits: 2,
        })} € à "${goal.name}".`,
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } else {
      Alert.alert('Erreur', 'Une erreur est survenue lors de la contribution.');
    }
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
                marginRight: 12,
              }}
            >
              <ArrowLeft size={20} color={theme.colors.text} strokeWidth={1.5} />
            </TouchableOpacity>
            <Text
              style={{
                fontFamily: 'Inter_700Bold',
                fontSize: 28,
                color: theme.colors.text,
              }}
            >
              Contribuer
            </Text>
          </View>

          {/* Objectif */}
          <View
            style={{
              backgroundColor: goal.color + '20',
              borderRadius: 16,
              padding: 20,
              marginBottom: 24,
              borderWidth: 2,
              borderColor: goal.color,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  backgroundColor: goal.color,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 12,
                }}
              >
                <IconComponent size={24} color="#FFFFFF" strokeWidth={1.5} />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontFamily: 'Inter_600SemiBold',
                    fontSize: 18,
                    color: theme.colors.text,
                  }}
                >
                  {goal.name}
                </Text>
                <Text
                  style={{
                    fontFamily: 'Inter_400Regular',
                    fontSize: 14,
                    color: theme.colors.textSecondary,
                    marginTop: 2,
                  }}
                >
                  {goal.currentAmount.toLocaleString('fr-FR', {
                    minimumFractionDigits: 2,
                  })}{' '}
                  € / {goal.targetAmount.toLocaleString('fr-FR')} € • {currentProgress.toFixed(0)}%
                </Text>
              </View>
            </View>
          </View>

          {/* Saisie du montant */}
          <View style={{ marginBottom: 24 }}>
            <Text
              style={{
                fontFamily: 'Inter_600SemiBold',
                fontSize: 16,
                color: theme.colors.text,
                marginBottom: 12,
              }}
            >
              Montant à contribuer
            </Text>

            <View
              style={{
                backgroundColor: theme.colors.cardBackground,
                borderRadius: 16,
                padding: 24,
                borderWidth: 1,
                borderColor: theme.colors.border,
                alignItems: 'center',
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 20,
                }}
              >
                <TextInput
                  style={{
                    fontFamily: 'Inter_700Bold',
                    fontSize: 48,
                    color: theme.colors.text,
                    textAlign: 'center',
                    minWidth: 150,
                  }}
                  placeholder="0"
                  placeholderTextColor={theme.colors.textSecondary}
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="decimal-pad"
                />
                <Text
                  style={{
                    fontFamily: 'Inter_600SemiBold',
                    fontSize: 24,
                    color: theme.colors.textSecondary,
                    marginLeft: 8,
                  }}
                >
                  €
                </Text>
              </View>

              {/* Montants suggérés */}
              <View
                style={{
                  flexDirection: 'row',
                  gap: 8,
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                }}
              >
                {suggestedAmounts.map((suggested) => (
                  <TouchableOpacity
                    key={suggested}
                    style={{
                      paddingVertical: 10,
                      paddingHorizontal: 20,
                      borderRadius: 10,
                      backgroundColor:
                        amount === suggested.toString()
                          ? theme.colors.primary
                          : theme.colors.border,
                    }}
                    onPress={() => setAmount(suggested.toString())}
                  >
                    <Text
                      style={{
                        fontFamily: 'Inter_600SemiBold',
                        fontSize: 14,
                        color:
                          amount === suggested.toString()
                            ? '#FFFFFF'
                            : theme.colors.textSecondary,
                      }}
                    >
                      {suggested} €
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* Aperçu de la progression */}
          {contributionAmount > 0 && (
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
                <TrendingUp size={20} color={theme.colors.success} strokeWidth={1.5} />
                <Text
                  style={{
                    fontFamily: 'Inter_600SemiBold',
                    fontSize: 16,
                    color: theme.colors.text,
                    marginLeft: 8,
                  }}
                >
                  Nouvelle progression
                </Text>
              </View>

              {/* Barre de progression */}
              <View style={{ marginBottom: 16 }}>
                <View
                  style={{
                    height: 8,
                    backgroundColor: theme.colors.border,
                    borderRadius: 4,
                    overflow: 'hidden',
                  }}
                >
                  <View
                    style={{
                      height: '100%',
                      width: `${newProgress}%`,
                      backgroundColor: goal.color,
                      borderRadius: 4,
                    }}
                  />
                </View>
              </View>

              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginBottom: 12,
                }}
              >
                <Text
                  style={{
                    fontFamily: 'Inter_400Regular',
                    fontSize: 14,
                    color: theme.colors.textSecondary,
                  }}
                >
                  Nouveau total
                </Text>
                <Text
                  style={{
                    fontFamily: 'Inter_600SemiBold',
                    fontSize: 14,
                    color: theme.colors.text,
                  }}
                >
                  {newAmount.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                </Text>
              </View>

              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginBottom: 12,
                }}
              >
                <Text
                  style={{
                    fontFamily: 'Inter_400Regular',
                    fontSize: 14,
                    color: theme.colors.textSecondary,
                  }}
                >
                  Progression
                </Text>
                <Text
                  style={{
                    fontFamily: 'Inter_600SemiBold',
                    fontSize: 14,
                    color: goal.color,
                  }}
                >
                  {currentProgress.toFixed(0)}% → {newProgress.toFixed(0)}%
                </Text>
              </View>

              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
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
                    fontSize: 14,
                    color: theme.colors.text,
                  }}
                >
                  {remaining.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                </Text>
              </View>

              {newProgress >= 100 && (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginTop: 16,
                    padding: 12,
                    backgroundColor: theme.colors.success + '20',
                    borderRadius: 12,
                  }}
                >
                  <CheckCircle2 size={20} color={theme.colors.success} strokeWidth={1.5} />
                  <Text
                    style={{
                      fontFamily: 'Inter_600SemiBold',
                      fontSize: 14,
                      color: theme.colors.success,
                      marginLeft: 8,
                      flex: 1,
                    }}
                  >
                    Objectif atteint !
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Sélection du wallet */}
          <View style={{ marginBottom: 24 }}>
            <Text
              style={{
                fontFamily: 'Inter_600SemiBold',
                fontSize: 16,
                color: theme.colors.text,
                marginBottom: 12,
              }}
            >
              Compte source
            </Text>

            <View style={{ gap: 8 }}>
              {wallets.map((wallet) => {
                const isSelected = selectedWallet?.id === wallet.id;
                const hasEnough = wallet.balance >= contributionAmount;

                return (
                  <TouchableOpacity
                    key={wallet.id}
                    style={{
                      backgroundColor: isSelected
                        ? theme.colors.primary + '20'
                        : theme.colors.cardBackground,
                      borderRadius: 12,
                      padding: 16,
                      borderWidth: 2,
                      borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                      opacity: contributionAmount > 0 && !hasEnough ? 0.5 : 1,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                    onPress={() => setSelectedWallet(wallet)}
                    disabled={contributionAmount > 0 && !hasEnough}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                      <View
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 10,
                          backgroundColor: isSelected
                            ? theme.colors.primary
                            : theme.colors.border,
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginRight: 12,
                        }}
                      >
                        <Wallet
                          size={20}
                          color={isSelected ? '#FFFFFF' : theme.colors.textSecondary}
                          strokeWidth={1.5}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            fontFamily: 'Inter_600SemiBold',
                            fontSize: 15,
                            color: isSelected ? theme.colors.primary : theme.colors.text,
                          }}
                        >
                          {wallet.name}
                        </Text>
                        <Text
                          style={{
                            fontFamily: 'Inter_400Regular',
                            fontSize: 13,
                            color: theme.colors.textSecondary,
                            marginTop: 2,
                          }}
                        >
                          {wallet.balance.toLocaleString('fr-FR', {
                            minimumFractionDigits: 2,
                          })}{' '}
                          {wallet.currency}
                        </Text>
                      </View>
                    </View>
                    {contributionAmount > 0 && !hasEnough && (
                      <Text
                        style={{
                          fontFamily: 'Inter_500Medium',
                          fontSize: 12,
                          color: theme.colors.error,
                        }}
                      >
                        Insuffisant
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Bouton de contribution */}
          <TouchableOpacity
            style={{
              backgroundColor: theme.colors.primary,
              borderRadius: 16,
              padding: 18,
              alignItems: 'center',
              shadowColor: theme.colors.primary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 6,
              opacity:
                loading ||
                !amount ||
                contributionAmount <= 0 ||
                !selectedWallet ||
                contributionAmount > (selectedWallet?.balance || 0)
                  ? 0.5
                  : 1,
            }}
            onPress={handleContribute}
            disabled={
              loading ||
              !amount ||
              contributionAmount <= 0 ||
              !selectedWallet ||
              contributionAmount > (selectedWallet?.balance || 0)
            }
          >
            {loading ? (
              <Text
                style={{
                  fontFamily: 'Inter_700Bold',
                  fontSize: 16,
                  color: '#FFFFFF',
                }}
              >
                Contribution en cours...
              </Text>
            ) : (
              <Text
                style={{
                  fontFamily: 'Inter_700Bold',
                  fontSize: 16,
                  color: '#FFFFFF',
                }}
              >
                Confirmer la contribution
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </ScreenContainer>
    </>
  );
}
