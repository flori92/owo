import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Target, ChevronRight, Plus } from 'lucide-react-native';
import * as Icons from 'lucide-react-native';

export function SavingsSection({ theme, savings, totalSaved }) {
  if (!savings || savings.length === 0) {
    return (
      <View style={{ marginBottom: 24 }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
          }}
        >
          <Text
            style={{
              fontFamily: 'Inter_600SemiBold',
              fontSize: 18,
              color: theme.colors.text,
            }}
          >
            Mes Objectifs
          </Text>
        </View>

        <TouchableOpacity
          style={{
            backgroundColor: theme.colors.cardBackground,
            borderRadius: 16,
            padding: 32,
            borderWidth: 1,
            borderColor: theme.colors.border,
            alignItems: 'center',
          }}
          onPress={() => router.push('/savings/create-goal')}
        >
          <View
            style={{
              width: 60,
              height: 60,
              borderRadius: 30,
              backgroundColor: theme.colors.primary + '20',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 12,
            }}
          >
            <Plus size={28} color={theme.colors.primary} strokeWidth={1.5} />
          </View>
          <Text
            style={{
              fontFamily: 'Inter_600SemiBold',
              fontSize: 15,
              color: theme.colors.text,
              marginBottom: 4,
            }}
          >
            Créer un objectif
          </Text>
          <Text
            style={{
              fontFamily: 'Inter_400Regular',
              fontSize: 13,
              color: theme.colors.textSecondary,
              textAlign: 'center',
            }}
          >
            Commencez à épargner pour vos projets
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ marginBottom: 24 }}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
        }}
      >
        <Text
          style={{
            fontFamily: 'Inter_600SemiBold',
            fontSize: 18,
            color: theme.colors.text,
          }}
        >
          Mes Objectifs
        </Text>
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 8,
            paddingHorizontal: 12,
            borderRadius: 10,
            backgroundColor: theme.colors.cardBackground,
          }}
          onPress={() => router.push('/savings')}
        >
          <Text
            style={{
              fontFamily: 'Inter_500Medium',
              fontSize: 13,
              color: theme.colors.primary,
              marginRight: 4,
            }}
          >
            Voir tout
          </Text>
          <ChevronRight size={16} color={theme.colors.primary} strokeWidth={1.5} />
        </TouchableOpacity>
      </View>

      {/* Total épargné */}
      <View
        style={{
          backgroundColor: theme.colors.primary + '15',
          borderRadius: 16,
          padding: 20,
          marginBottom: 16,
          borderWidth: 1,
          borderColor: theme.colors.primary + '30',
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <Target size={18} color={theme.colors.primary} strokeWidth={1.5} />
          <Text
            style={{
              fontFamily: 'Inter_500Medium',
              fontSize: 13,
              color: theme.colors.primary,
              marginLeft: 6,
            }}
          >
            Total épargné
          </Text>
        </View>
        <Text
          style={{
            fontFamily: 'Inter_700Bold',
            fontSize: 28,
            color: theme.colors.text,
            letterSpacing: -1,
          }}
        >
          {totalSaved.toLocaleString('fr-FR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}{' '}
          €
        </Text>
        <Text
          style={{
            fontFamily: 'Inter_400Regular',
            fontSize: 12,
            color: theme.colors.textSecondary,
            marginTop: 4,
          }}
        >
          Dans {savings.length} objectif{savings.length > 1 ? 's' : ''}
        </Text>
      </View>

      {/* Liste horizontale des objectifs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 12 }}
      >
        {savings.slice(0, 5).map((goal) => {
          const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
          const IconComponent = Icons[goal.icon] || Icons.Target;

          return (
            <TouchableOpacity
              key={goal.id}
              style={{
                width: 260,
                backgroundColor: theme.colors.cardBackground,
                borderRadius: 16,
                padding: 16,
                borderWidth: 1,
                borderColor: theme.colors.border,
              }}
              onPress={() => router.push(`/savings/goal-details?id=${goal.id}`)}
            >
              {/* Header */}
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    backgroundColor: goal.color + '20',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 12,
                  }}
                >
                  <IconComponent size={20} color={goal.color} strokeWidth={1.5} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontFamily: 'Inter_600SemiBold',
                      fontSize: 14,
                      color: theme.colors.text,
                    }}
                    numberOfLines={1}
                  >
                    {goal.name}
                  </Text>
                  {goal.memberCount && (
                    <Text
                      style={{
                        fontFamily: 'Inter_400Regular',
                        fontSize: 11,
                        color: theme.colors.textSecondary,
                        marginTop: 2,
                      }}
                    >
                      {goal.memberCount} membres
                    </Text>
                  )}
                </View>
              </View>

              {/* Montants */}
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginBottom: 10,
                }}
              >
                <View>
                  <Text
                    style={{
                      fontFamily: 'Inter_400Regular',
                      fontSize: 11,
                      color: theme.colors.textSecondary,
                      marginBottom: 4,
                    }}
                  >
                    Épargné
                  </Text>
                  <Text
                    style={{
                      fontFamily: 'Inter_700Bold',
                      fontSize: 16,
                      color: theme.colors.text,
                    }}
                  >
                    {goal.currentAmount.toLocaleString('fr-FR', {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })}{' '}
                    €
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text
                    style={{
                      fontFamily: 'Inter_400Regular',
                      fontSize: 11,
                      color: theme.colors.textSecondary,
                      marginBottom: 4,
                    }}
                  >
                    Objectif
                  </Text>
                  <Text
                    style={{
                      fontFamily: 'Inter_600SemiBold',
                      fontSize: 14,
                      color: theme.colors.textSecondary,
                    }}
                  >
                    {goal.targetAmount.toLocaleString('fr-FR', {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })}{' '}
                    €
                  </Text>
                </View>
              </View>

              {/* Barre de progression */}
              <View style={{ marginBottom: 8 }}>
                <View
                  style={{
                    height: 6,
                    backgroundColor: theme.colors.border,
                    borderRadius: 3,
                    overflow: 'hidden',
                  }}
                >
                  <View
                    style={{
                      height: '100%',
                      width: `${progress}%`,
                      backgroundColor: goal.color,
                      borderRadius: 3,
                    }}
                  />
                </View>
              </View>

              {/* Footer */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text
                  style={{
                    fontFamily: 'Inter_600SemiBold',
                    fontSize: 12,
                    color: goal.color,
                  }}
                >
                  {progress.toFixed(0)}%
                </Text>
                {goal.autoDebit && (
                  <View
                    style={{
                      backgroundColor: theme.colors.success + '20',
                      paddingHorizontal: 8,
                      paddingVertical: 3,
                      borderRadius: 6,
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: 'Inter_600SemiBold',
                        fontSize: 10,
                        color: theme.colors.success,
                      }}
                    >
                      AUTO
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        })}

        {/* Bouton Ajouter */}
        <TouchableOpacity
          style={{
            width: 140,
            backgroundColor: theme.colors.cardBackground,
            borderRadius: 16,
            padding: 16,
            borderWidth: 2,
            borderStyle: 'dashed',
            borderColor: theme.colors.border,
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onPress={() => router.push('/savings/create-goal')}
        >
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: theme.colors.primary + '20',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 8,
            }}
          >
            <Plus size={24} color={theme.colors.primary} strokeWidth={2} />
          </View>
          <Text
            style={{
              fontFamily: 'Inter_600SemiBold',
              fontSize: 13,
              color: theme.colors.primary,
              textAlign: 'center',
            }}
          >
            Nouvel{'\n'}objectif
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
