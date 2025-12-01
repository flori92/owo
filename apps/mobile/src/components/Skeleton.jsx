import React, { useEffect, useRef } from "react";
import { View, Animated, StyleSheet } from "react-native";
import { useTheme } from "@/utils/useTheme";

/**
 * Composant Skeleton pour les états de chargement
 * Affiche une animation de shimmer pendant le chargement des données
 */
export function Skeleton({ 
  width = "100%", 
  height = 20, 
  borderRadius = 8,
  style,
}) {
  const theme = useTheme();
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: theme.colors.border,
          opacity,
        },
        style,
      ]}
    />
  );
}

/**
 * Skeleton pour une carte de transaction
 */
export function TransactionSkeleton() {
  const theme = useTheme();
  
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        backgroundColor: theme.colors.cardBackground,
        borderRadius: 12,
        marginBottom: 8,
      }}
    >
      <Skeleton width={44} height={44} borderRadius={22} />
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Skeleton width="60%" height={16} style={{ marginBottom: 8 }} />
        <Skeleton width="40%" height={12} />
      </View>
      <Skeleton width={80} height={20} />
    </View>
  );
}

/**
 * Skeleton pour le solde
 */
export function BalanceSkeleton() {
  return (
    <View style={{ alignItems: "center", padding: 24 }}>
      <Skeleton width={120} height={14} style={{ marginBottom: 12 }} />
      <Skeleton width={200} height={40} style={{ marginBottom: 8 }} />
      <Skeleton width={100} height={14} />
    </View>
  );
}

/**
 * Skeleton pour une carte d'action rapide
 */
export function QuickActionSkeleton() {
  const theme = useTheme();
  
  return (
    <View
      style={{
        width: "47%",
        backgroundColor: theme.colors.cardBackground,
        borderRadius: 16,
        padding: 16,
        alignItems: "center",
      }}
    >
      <Skeleton width={44} height={44} borderRadius={22} style={{ marginBottom: 10 }} />
      <Skeleton width={60} height={14} style={{ marginBottom: 6 }} />
      <Skeleton width={80} height={10} />
    </View>
  );
}

/**
 * Skeleton pour le dashboard complet
 */
export function DashboardSkeleton() {
  const theme = useTheme();
  
  return (
    <View style={{ padding: 24 }}>
      {/* Header */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 24 }}>
        <View>
          <Skeleton width={100} height={14} style={{ marginBottom: 8 }} />
          <Skeleton width={150} height={24} />
        </View>
        <Skeleton width={40} height={40} borderRadius={20} />
      </View>

      {/* Balance */}
      <View
        style={{
          backgroundColor: theme.colors.primary,
          borderRadius: 20,
          padding: 24,
          marginBottom: 24,
        }}
      >
        <BalanceSkeleton />
      </View>

      {/* Quick Actions */}
      <Skeleton width={120} height={20} style={{ marginBottom: 16 }} />
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 24 }}>
        <QuickActionSkeleton />
        <QuickActionSkeleton />
        <QuickActionSkeleton />
        <QuickActionSkeleton />
      </View>

      {/* Transactions */}
      <Skeleton width={180} height={20} style={{ marginBottom: 16 }} />
      <TransactionSkeleton />
      <TransactionSkeleton />
      <TransactionSkeleton />
    </View>
  );
}

export default Skeleton;
