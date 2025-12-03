import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import * as Icons from 'lucide-react-native';

/**
 * Carte d'objectif d'épargne avec barre de progression
 */
export function GoalCard({ goal, theme }) {
  // Calculer la progression
  const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
  const remaining = Math.max(goal.targetAmount - goal.currentAmount, 0);

  // Récupérer l'icône dynamiquement
  const IconComponent = Icons[goal.icon] || Icons.Target;

  // Calculer le nombre de jours restants
  const getDaysRemaining = () => {
    const target = new Date(goal.targetDate);
    const now = new Date();
    const diffTime = target - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const daysRemaining = getDaysRemaining();

  // Déterminer le type d'objectif (individuel ou groupe)
  const isGroup = goal.memberCount !== undefined;

  return (
    <TouchableOpacity
      style={{
        backgroundColor: theme.colors.cardBackground,
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        shadowColor: theme.colors.shadowColor,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        borderWidth: 1,
        borderColor: theme.colors.border,
      }}
      onPress={() => router.push(`/savings/goal-details?id=${goal.id}`)}
    >
      {/* Header avec icône et info */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            backgroundColor: goal.color + '20',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12,
          }}
        >
          <IconComponent size={24} color={goal.color} strokeWidth={1.5} />
        </View>

        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
            <Text
              style={{
                fontFamily: 'Inter_600SemiBold',
                fontSize: 16,
                color: theme.colors.text,
                flex: 1,
              }}
              numberOfLines={1}
            >
              {goal.name}
            </Text>
            {isGroup && (
              <View
                style={{
                  backgroundColor: theme.colors.primary + '20',
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 8,
                  marginLeft: 8,
                }}
              >
                <Text
                  style={{
                    fontFamily: 'Inter_500Medium',
                    fontSize: 11,
                    color: theme.colors.primary,
                  }}
                >
                  Groupe
                </Text>
              </View>
            )}
          </View>
          <Text
            style={{
              fontFamily: 'Inter_400Regular',
              fontSize: 13,
              color: theme.colors.textSecondary,
            }}
            numberOfLines={1}
          >
            {goal.description}
          </Text>
        </View>
      </View>

      {/* Montants */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 12,
        }}
      >
        <View>
          <Text
            style={{
              fontFamily: 'Inter_400Regular',
              fontSize: 12,
              color: theme.colors.textSecondary,
              marginBottom: 4,
            }}
          >
            Économisé
          </Text>
          <Text
            style={{
              fontFamily: 'Inter_700Bold',
              fontSize: 20,
              color: theme.colors.text,
            }}
          >
            {goal.currentAmount.toLocaleString('fr-FR', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}{' '}
            {goal.currency}
          </Text>
        </View>

        <View style={{ alignItems: 'flex-end' }}>
          <Text
            style={{
              fontFamily: 'Inter_400Regular',
              fontSize: 12,
              color: theme.colors.textSecondary,
              marginBottom: 4,
            }}
          >
            Objectif
          </Text>
          <Text
            style={{
              fontFamily: 'Inter_600SemiBold',
              fontSize: 16,
              color: theme.colors.textSecondary,
            }}
          >
            {goal.targetAmount.toLocaleString('fr-FR', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}{' '}
            {goal.currency}
          </Text>
        </View>
      </View>

      {/* Barre de progression */}
      <View style={{ marginBottom: 12 }}>
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
              width: `${progress}%`,
              backgroundColor: goal.color,
              borderRadius: 4,
            }}
          />
        </View>
      </View>

      {/* Footer avec progression et jours restants */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text
            style={{
              fontFamily: 'Inter_600SemiBold',
              fontSize: 14,
              color: goal.color,
              marginRight: 8,
            }}
          >
            {progress.toFixed(0)}%
          </Text>
          <Text
            style={{
              fontFamily: 'Inter_400Regular',
              fontSize: 13,
              color: theme.colors.textSecondary,
            }}
          >
            • Reste {remaining.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} {goal.currency}
          </Text>
        </View>

        {daysRemaining > 0 && (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Icons.Calendar size={14} color={theme.colors.textSecondary} strokeWidth={1.5} />
            <Text
              style={{
                fontFamily: 'Inter_500Medium',
                fontSize: 12,
                color: theme.colors.textSecondary,
                marginLeft: 4,
              }}
            >
              {daysRemaining} jour{daysRemaining > 1 ? 's' : ''}
            </Text>
          </View>
        )}
      </View>

      {/* Badge pour auto-débit */}
      {goal.autoDebit && (
        <View
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            backgroundColor: theme.colors.success + '20',
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 8,
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <Icons.Zap size={12} color={theme.colors.success} strokeWidth={2} />
          <Text
            style={{
              fontFamily: 'Inter_600SemiBold',
              fontSize: 10,
              color: theme.colors.success,
              marginLeft: 4,
            }}
          >
            AUTO
          </Text>
        </View>
      )}

      {/* Badge pour objectif verrouillé */}
      {goal.locked && (
        <View
          style={{
            position: 'absolute',
            top: goal.autoDebit ? 42 : 12,
            right: 12,
            backgroundColor: theme.colors.warning + '20',
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 8,
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <Icons.Lock size={12} color={theme.colors.warning} strokeWidth={2} />
        </View>
      )}
    </TouchableOpacity>
  );
}
