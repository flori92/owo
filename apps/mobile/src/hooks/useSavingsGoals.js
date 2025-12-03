import { useState, useEffect, useCallback } from 'react';
// ⚠️ IMPORTS FIREBASE DÉSACTIVÉS pour Expo Go
// import {
//   collection,
//   doc,
//   getDoc,
//   getDocs,
//   setDoc,
//   addDoc,
//   updateDoc,
//   query,
//   where,
//   orderBy,
//   limit,
//   increment,
//   serverTimestamp,
// } from 'firebase/firestore';
// import { db } from '@/lib/firebase';
import { USE_MOCK, MOCK_SESSION_KEY } from '@/lib/config';

// ============================================
// HOOK POUR LES ÉPARGNES BLOQUÉES (OBJECTIFS INDIVIDUELS)
// ============================================

/**
 * Hook pour les épargnes bloquées (objectifs individuels)
 * @param {string} userId - ID de l'utilisateur
 * @returns {Object} { savings, loading, getTotalSaved, getProgress }
 */
export function useLockedSavings(userId) {
  const [savings, setSavings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setSavings([]);
      setLoading(false);
      return;
    }

    const fetchLockedSavings = async () => {
      try {
        // MODE MOCK pour Expo Go : Objectifs d'épargne Floriace FAVI
        const now = new Date();
        const mockSavings = [
          {
            id: 'ls1',
            userId,
            name: 'Nouveau MacBook Pro',
            description: 'MacBook Pro M3 16 pouces pour le développement',
            targetAmount: 2000.00,
            currentAmount: 850.00,
            currency: 'EUR',
            category: 'tech',
            icon: 'Laptop',
            color: '#3B82F6',
            startDate: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 60).toISOString(), // Il y a 60 jours
            targetDate: new Date(now.getTime() + 1000 * 60 * 60 * 24 * 240).toISOString(), // Dans 240 jours
            frequency: 'monthly', // daily, weekly, monthly
            autoDebit: true,
            autoDebitAmount: 200.00,
            autoDebitDay: 5, // Jour du mois
            walletId: 'w1', // Wallet source
            locked: true, // Argent verrouillé jusqu'à l'objectif
            status: 'active', // active, paused, completed, cancelled
            priority: 1, // 1 = high, 2 = medium, 3 = low
            createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 60).toISOString(),
            updatedAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 2).toISOString(),
          },
          {
            id: 'ls2',
            userId,
            name: 'Voyage à Paris',
            description: 'Vacances d\'été 2025 avec la famille',
            targetAmount: 3500.00,
            currentAmount: 1250.00,
            currency: 'EUR',
            category: 'travel',
            icon: 'Plane',
            color: '#10B981',
            startDate: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 45).toISOString(),
            targetDate: new Date(now.getTime() + 1000 * 60 * 60 * 24 * 180).toISOString(), // Dans 180 jours
            frequency: 'weekly',
            autoDebit: true,
            autoDebitAmount: 50.00,
            autoDebitDay: 1, // Lundi
            walletId: 'w1',
            locked: true,
            status: 'active',
            priority: 1,
            createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 45).toISOString(),
            updatedAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 1).toISOString(),
          },
          {
            id: 'ls3',
            userId,
            name: 'Fonds d\'urgence',
            description: 'Épargne de sécurité pour imprévus',
            targetAmount: 5000.00,
            currentAmount: 3200.00,
            currency: 'EUR',
            category: 'emergency',
            icon: 'Shield',
            color: '#EF4444',
            startDate: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 120).toISOString(),
            targetDate: new Date(now.getTime() + 1000 * 60 * 60 * 24 * 365).toISOString(), // Dans 1 an
            frequency: 'monthly',
            autoDebit: true,
            autoDebitAmount: 150.00,
            autoDebitDay: 1,
            walletId: 'w1',
            locked: false, // Accessible en cas d'urgence
            status: 'active',
            priority: 2,
            createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 120).toISOString(),
            updatedAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 5).toISOString(),
          },
          {
            id: 'ls4',
            userId,
            name: 'Nouvelle voiture',
            description: 'Apport pour voiture électrique',
            targetAmount: 8000.00,
            currentAmount: 1500.00,
            currency: 'EUR',
            category: 'vehicle',
            icon: 'Car',
            color: '#F59E0B',
            startDate: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 30).toISOString(),
            targetDate: new Date(now.getTime() + 1000 * 60 * 60 * 24 * 540).toISOString(), // Dans 18 mois
            frequency: 'monthly',
            autoDebit: false,
            autoDebitAmount: 0,
            walletId: 'w1',
            locked: true,
            status: 'active',
            priority: 3,
            createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 30).toISOString(),
            updatedAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 3).toISOString(),
          },
        ];

        setSavings(mockSavings);
        setLoading(false);

        // ⚠️ CODE FIREBASE RÉEL DÉSACTIVÉ pour Expo Go
        // const savingsRef = collection(db, 'lockedSavings');
        // const q = query(
        //   savingsRef,
        //   where('userId', '==', userId),
        //   orderBy('priority', 'asc'),
        //   orderBy('createdAt', 'desc')
        // );
        // const querySnapshot = await getDocs(q);
        //
        // const savingsData = querySnapshot.docs.map(doc => ({
        //   id: doc.id,
        //   ...doc.data()
        // }));
        //
        // setSavings(savingsData);
      } catch (error) {
        console.error('Error fetching locked savings:', error);
        setSavings([]);
        setLoading(false);
      }
    };

    fetchLockedSavings();
  }, [userId]);

  // Calculer le total épargné
  const getTotalSaved = useCallback(() => {
    return savings.reduce((total, saving) => total + (saving.currentAmount || 0), 0);
  }, [savings]);

  // Calculer la progression d'un objectif
  const getProgress = useCallback((savingId) => {
    const saving = savings.find(s => s.id === savingId);
    if (!saving) return 0;
    return Math.min((saving.currentAmount / saving.targetAmount) * 100, 100);
  }, [savings]);

  return { savings, loading, getTotalSaved, getProgress };
}

// ============================================
// HOOK POUR LES ÉPARGNES DE GROUPE
// ============================================

/**
 * Hook pour les épargnes de groupe (épargnes collectives)
 * @param {string} userId - ID de l'utilisateur
 * @returns {Object} { groupSavings, loading, getUserContribution }
 */
export function useGroupSavings(userId) {
  const [groupSavings, setGroupSavings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setGroupSavings([]);
      setLoading(false);
      return;
    }

    const fetchGroupSavings = async () => {
      try {
        // MODE MOCK pour Expo Go : Épargnes de groupe
        const now = new Date();
        const mockGroupSavings = [
          {
            id: 'gs1',
            name: 'Épargne Famille 2025',
            description: 'Épargne collective pour le projet familial',
            targetAmount: 10000.00,
            currentAmount: 4500.00,
            currency: 'EUR',
            category: 'family',
            icon: 'Users',
            color: '#8B5CF6',
            adminId: userId,
            memberIds: [userId, 'user2', 'user3', 'user4'],
            memberCount: 4,
            startDate: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 90).toISOString(),
            targetDate: new Date(now.getTime() + 1000 * 60 * 60 * 24 * 275).toISOString(),
            contributionRules: {
              minAmount: 50.00,
              frequency: 'monthly',
              equalSplit: true, // Tous contribuent le même montant
              suggestedAmount: 250.00,
            },
            distributionRules: {
              type: 'equal', // equal, proportional, custom
              locked: true, // Verrouillé jusqu'à l'objectif
            },
            status: 'active',
            visibility: 'private', // private, public
            inviteCode: 'FAM2025',
            createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 90).toISOString(),
            updatedAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 2).toISOString(),
            // Contributions par membre
            contributions: [
              { userId: userId, amount: 1500.00, percentage: 33.33 },
              { userId: 'user2', amount: 1200.00, percentage: 26.67 },
              { userId: 'user3', amount: 1000.00, percentage: 22.22 },
              { userId: 'user4', amount: 800.00, percentage: 17.78 },
            ],
          },
          {
            id: 'gs2',
            name: 'Projet Communautaire',
            description: 'Construction du centre communautaire',
            targetAmount: 15000.00,
            currentAmount: 8750.00,
            currency: 'EUR',
            category: 'community',
            icon: 'Building2',
            color: '#06B6D4',
            adminId: 'user5',
            memberIds: ['user5', userId, 'user6', 'user7', 'user8', 'user9'],
            memberCount: 6,
            startDate: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 120).toISOString(),
            targetDate: new Date(now.getTime() + 1000 * 60 * 60 * 24 * 365).toISOString(),
            contributionRules: {
              minAmount: 100.00,
              frequency: 'flexible',
              equalSplit: false,
              suggestedAmount: 200.00,
            },
            distributionRules: {
              type: 'proportional',
              locked: true,
            },
            status: 'active',
            visibility: 'public',
            inviteCode: 'COMM2025',
            createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 120).toISOString(),
            updatedAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 7).toISOString(),
            contributions: [
              { userId: 'user5', amount: 2500.00, percentage: 28.57 },
              { userId: userId, amount: 1800.00, percentage: 20.57 },
              { userId: 'user6', amount: 1500.00, percentage: 17.14 },
              { userId: 'user7', amount: 1200.00, percentage: 13.71 },
              { userId: 'user8', amount: 1000.00, percentage: 11.43 },
              { userId: 'user9', amount: 750.00, percentage: 8.57 },
            ],
          },
        ];

        setGroupSavings(mockGroupSavings);
        setLoading(false);

        // ⚠️ CODE FIREBASE RÉEL DÉSACTIVÉ pour Expo Go
        // const groupSavingsRef = collection(db, 'groupSavings');
        // const q = query(
        //   groupSavingsRef,
        //   where('memberIds', 'array-contains', userId),
        //   orderBy('createdAt', 'desc')
        // );
        // const querySnapshot = await getDocs(q);
        //
        // const groupSavingsData = querySnapshot.docs.map(doc => ({
        //   id: doc.id,
        //   ...doc.data()
        // }));
        //
        // setGroupSavings(groupSavingsData);
      } catch (error) {
        console.error('Error fetching group savings:', error);
        setGroupSavings([]);
        setLoading(false);
      }
    };

    fetchGroupSavings();
  }, [userId]);

  // Obtenir la contribution d'un utilisateur dans un groupe
  const getUserContribution = useCallback((groupId) => {
    const group = groupSavings.find(g => g.id === groupId);
    if (!group) return 0;
    const contribution = group.contributions.find(c => c.userId === userId);
    return contribution?.amount || 0;
  }, [groupSavings, userId]);

  return { groupSavings, loading, getUserContribution };
}

// ============================================
// HOOK COMBINÉ POUR TOUS LES OBJECTIFS D'ÉPARGNE
// ============================================

/**
 * Hook pour obtenir tous les objectifs d'épargne (individuels + groupe)
 * @param {string} userId - ID de l'utilisateur
 * @returns {Object} { allGoals, loading, totalSaved, activeGoalsCount }
 */
export function useSavingsGoals(userId) {
  const { savings: lockedSavings, loading: lockedLoading, getTotalSaved } = useLockedSavings(userId);
  const { groupSavings, loading: groupLoading, getUserContribution } = useGroupSavings(userId);

  const loading = lockedLoading || groupLoading;

  // Combiner tous les objectifs
  const allGoals = [...lockedSavings, ...groupSavings];

  // Total épargné dans tous les objectifs
  const totalSaved = getTotalSaved() + groupSavings.reduce((sum, g) => {
    const contrib = g.contributions.find(c => c.userId === userId);
    return sum + (contrib?.amount || 0);
  }, 0);

  // Nombre d'objectifs actifs
  const activeGoalsCount = allGoals.filter(g => g.status === 'active').length;

  return {
    allGoals,
    lockedSavings,
    groupSavings,
    loading,
    totalSaved,
    activeGoalsCount,
    getTotalSaved,
    getUserContribution,
  };
}

// ============================================
// FONCTIONS POUR CRÉER ET GÉRER LES OBJECTIFS
// ============================================

/**
 * Créer un nouvel objectif d'épargne individuel
 * @param {Object} goalData - Données de l'objectif
 * @returns {Promise<Object>} { success, goalId?, error? }
 */
export async function createSavingsGoal(goalData) {
  try {
    // MODE MOCK pour Expo Go
    console.log('🔧 MODE MOCK: Création objectif épargne', goalData.name);
    await new Promise(r => setTimeout(r, 800));

    const mockGoalId = 'ls_' + Date.now();
    return { success: true, goalId: mockGoalId };

    // ⚠️ CODE FIREBASE RÉEL DÉSACTIVÉ pour Expo Go
    // const savingsRef = collection(db, 'lockedSavings');
    // const newGoal = {
    //   ...goalData,
    //   currentAmount: 0,
    //   status: 'active',
    //   createdAt: serverTimestamp(),
    //   updatedAt: serverTimestamp(),
    // };
    //
    // const docRef = await addDoc(savingsRef, newGoal);
    // return { success: true, goalId: docRef.id };
  } catch (error) {
    console.error('Error creating savings goal:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Contribuer à un objectif d'épargne
 * @param {string} goalId - ID de l'objectif
 * @param {number} amount - Montant à contribuer
 * @param {string} walletId - ID du wallet source
 * @param {string} userId - ID de l'utilisateur
 * @returns {Promise<Object>} { success, error? }
 */
export async function contributeToGoal(goalId, amount, walletId, userId) {
  try {
    // MODE MOCK pour Expo Go
    console.log('🔧 MODE MOCK: Contribution objectif', goalId, amount);
    await new Promise(r => setTimeout(r, 800));

    return { success: true };

    // ⚠️ CODE FIREBASE RÉEL DÉSACTIVÉ pour Expo Go
    // // Mettre à jour le montant de l'objectif
    // const goalRef = doc(db, 'lockedSavings', goalId);
    // await updateDoc(goalRef, {
    //   currentAmount: increment(amount),
    //   updatedAt: serverTimestamp(),
    // });
    //
    // // Créer une transaction
    // const transactionsRef = collection(db, 'transactions');
    // await addDoc(transactionsRef, {
    //   userId,
    //   type: 'savings_contribution',
    //   amount,
    //   currency: 'EUR',
    //   walletId,
    //   savingsGoalId: goalId,
    //   description: `Contribution à l'objectif d'épargne`,
    //   status: 'completed',
    //   createdAt: serverTimestamp(),
    // });
    //
    // // Déduire du wallet
    // const walletRef = doc(db, 'wallets', walletId);
    // await updateDoc(walletRef, {
    //   balance: increment(-amount),
    // });
    //
    // return { success: true };
  } catch (error) {
    console.error('Error contributing to goal:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Créer un groupe d'épargne
 * @param {Object} groupData - Données du groupe
 * @returns {Promise<Object>} { success, groupId?, error? }
 */
export async function createGroupSavings(groupData) {
  try {
    // MODE MOCK pour Expo Go
    console.log('🔧 MODE MOCK: Création groupe épargne', groupData.name);
    await new Promise(r => setTimeout(r, 800));

    const mockGroupId = 'gs_' + Date.now();
    return { success: true, groupId: mockGroupId };

    // ⚠️ CODE FIREBASE RÉEL DÉSACTIVÉ pour Expo Go
    // const groupRef = collection(db, 'groupSavings');
    // const newGroup = {
    //   ...groupData,
    //   currentAmount: 0,
    //   contributions: [],
    //   status: 'active',
    //   createdAt: serverTimestamp(),
    //   updatedAt: serverTimestamp(),
    // };
    //
    // const docRef = await addDoc(groupRef, newGroup);
    // return { success: true, groupId: docRef.id };
  } catch (error) {
    console.error('Error creating group savings:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Contribuer à un groupe d'épargne
 * @param {string} groupId - ID du groupe
 * @param {number} amount - Montant à contribuer
 * @param {string} walletId - ID du wallet source
 * @param {string} userId - ID de l'utilisateur
 * @returns {Promise<Object>} { success, error? }
 */
export async function contributeToGroupSavings(groupId, amount, walletId, userId) {
  try {
    // MODE MOCK pour Expo Go
    console.log('🔧 MODE MOCK: Contribution groupe', groupId, amount);
    await new Promise(r => setTimeout(r, 800));

    return { success: true };

    // ⚠️ CODE FIREBASE RÉEL DÉSACTIVÉ pour Expo Go
    // const groupRef = doc(db, 'groupSavings', groupId);
    // const groupDoc = await getDoc(groupRef);
    //
    // if (!groupDoc.exists()) {
    //   return { success: false, error: 'Groupe non trouvé' };
    // }
    //
    // const groupData = groupDoc.data();
    // const contributions = groupData.contributions || [];
    //
    // // Trouver ou créer la contribution de l'utilisateur
    // const existingContrib = contributions.find(c => c.userId === userId);
    // if (existingContrib) {
    //   existingContrib.amount += amount;
    // } else {
    //   contributions.push({ userId, amount, percentage: 0 });
    // }
    //
    // // Recalculer les pourcentages
    // const newTotal = groupData.currentAmount + amount;
    // contributions.forEach(c => {
    //   c.percentage = (c.amount / newTotal) * 100;
    // });
    //
    // // Mettre à jour le groupe
    // await updateDoc(groupRef, {
    //   currentAmount: increment(amount),
    //   contributions,
    //   updatedAt: serverTimestamp(),
    // });
    //
    // // Créer une transaction
    // const transactionsRef = collection(db, 'transactions');
    // await addDoc(transactionsRef, {
    //   userId,
    //   type: 'group_savings_contribution',
    //   amount,
    //   currency: 'EUR',
    //   walletId,
    //   groupSavingsId: groupId,
    //   description: `Contribution au groupe d'épargne`,
    //   status: 'completed',
    //   createdAt: serverTimestamp(),
    // });
    //
    // // Déduire du wallet
    // const walletRef = doc(db, 'wallets', walletId);
    // await updateDoc(walletRef, {
    //   balance: increment(-amount),
    // });
    //
    // return { success: true };
  } catch (error) {
    console.error('Error contributing to group savings:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Mettre en pause un objectif d'épargne
 * @param {string} goalId - ID de l'objectif
 * @returns {Promise<Object>} { success, error? }
 */
export async function pauseSavingsGoal(goalId) {
  try {
    // MODE MOCK pour Expo Go
    console.log('🔧 MODE MOCK: Pause objectif', goalId);
    await new Promise(r => setTimeout(r, 500));
    return { success: true };

    // ⚠️ CODE FIREBASE RÉEL DÉSACTIVÉ pour Expo Go
    // const goalRef = doc(db, 'lockedSavings', goalId);
    // await updateDoc(goalRef, {
    //   status: 'paused',
    //   updatedAt: serverTimestamp(),
    // });
    // return { success: true };
  } catch (error) {
    console.error('Error pausing savings goal:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Reprendre un objectif d'épargne
 * @param {string} goalId - ID de l'objectif
 * @returns {Promise<Object>} { success, error? }
 */
export async function resumeSavingsGoal(goalId) {
  try {
    // MODE MOCK pour Expo Go
    console.log('🔧 MODE MOCK: Reprise objectif', goalId);
    await new Promise(r => setTimeout(r, 500));
    return { success: true };

    // ⚠️ CODE FIREBASE RÉEL DÉSACTIVÉ pour Expo Go
    // const goalRef = doc(db, 'lockedSavings', goalId);
    // await updateDoc(goalRef, {
    //   status: 'active',
    //   updatedAt: serverTimestamp(),
    // });
    // return { success: true };
  } catch (error) {
    console.error('Error resuming savings goal:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Débloquer et retirer l'argent d'un objectif d'épargne atteint
 * @param {string} goalId - ID de l'objectif
 * @param {string} walletId - ID du wallet de destination
 * @param {string} userId - ID de l'utilisateur
 * @returns {Promise<Object>} { success, amount?, error? }
 */
export async function withdrawFromGoal(goalId, walletId, userId) {
  try {
    // MODE MOCK pour Expo Go
    console.log('🔧 MODE MOCK: Retrait objectif', goalId);
    await new Promise(r => setTimeout(r, 800));
    return { success: true, amount: 2000.00 };

    // ⚠️ CODE FIREBASE RÉEL DÉSACTIVÉ pour Expo Go
    // const goalRef = doc(db, 'lockedSavings', goalId);
    // const goalDoc = await getDoc(goalRef);
    //
    // if (!goalDoc.exists()) {
    //   return { success: false, error: 'Objectif non trouvé' };
    // }
    //
    // const goalData = goalDoc.data();
    //
    // // Vérifier si l'objectif est atteint ou si la date est passée
    // if (goalData.locked && goalData.currentAmount < goalData.targetAmount) {
    //   const targetDate = new Date(goalData.targetDate);
    //   const now = new Date();
    //   if (now < targetDate) {
    //     return { success: false, error: 'Objectif verrouillé - non atteint' };
    //   }
    // }
    //
    // const amount = goalData.currentAmount;
    //
    // // Marquer l'objectif comme complété
    // await updateDoc(goalRef, {
    //   status: 'completed',
    //   completedAt: serverTimestamp(),
    //   updatedAt: serverTimestamp(),
    // });
    //
    // // Créer une transaction de retrait
    // const transactionsRef = collection(db, 'transactions');
    // await addDoc(transactionsRef, {
    //   userId,
    //   type: 'savings_withdrawal',
    //   amount,
    //   currency: 'EUR',
    //   walletId,
    //   savingsGoalId: goalId,
    //   description: `Retrait de l'objectif d'épargne: ${goalData.name}`,
    //   status: 'completed',
    //   createdAt: serverTimestamp(),
    // });
    //
    // // Ajouter au wallet
    // const walletRef = doc(db, 'wallets', walletId);
    // await updateDoc(walletRef, {
    //   balance: increment(amount),
    // });
    //
    // return { success: true, amount };
  } catch (error) {
    console.error('Error withdrawing from goal:', error);
    return { success: false, error: error.message };
  }
}
