import { useState, useEffect } from 'react';
import { neonDB } from '../lib/neon';

export const useNeon = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = async (operation, ...args) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await neonDB[operation](...args);
      return { success: true, data: result };
    } catch (err) {
      const errorMessage = err.message || 'Erreur de base de données';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    execute,
    // Méthodes directes pour les opérations courantes
    getUser: (userId) => execute('getUser', userId),
    createUser: (userData) => execute('createUser', userData),
    updateUser: (userId, userData) => execute('updateUser', userId, userData),
    getTransactions: (userId) => execute('getTransactions', userId),
    createTransaction: (transactionData) => execute('createTransaction', transactionData),
    getSavingsGoals: (userId) => execute('getSavingsGoals', userId),
    createSavingsGoal: (goalData) => execute('createSavingsGoal', goalData),
    updateSavingsGoal: (goalId, updateData) => execute('updateSavingsGoal', goalId, updateData),
  };
};
