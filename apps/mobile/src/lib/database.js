import { neonDB } from './neon';
import { firebaseDB } from './firebase';

// Configuration hybride : Firebase pour l'auth et le real-time, Neon pour les données structurées
export const database = {
  // Utiliser Firebase pour l'authentification et les sessions en temps réel
  auth: firebaseDB.auth,
  
  // Utiliser Neon pour les données structurées (transactions, épargnes, etc.)
  users: neonDB,
  transactions: neonDB,
  savings: neonDB,
  
  // Synchronisation entre Firebase et Neon
  async syncUserToNeon(firebaseUser) {
    try {
      const existingUser = await neonDB.getUser(firebaseUser.uid);
      
      if (!existingUser) {
        await neonDB.createUser({
          email: firebaseUser.email,
          name: firebaseUser.displayName || firebaseUser.email,
          phone: firebaseUser.phoneNumber || '',
          created_at: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Erreur synchronisation utilisateur Neon:', error);
    }
  },
  
  // Fonctions de migration depuis Firebase vers Neon
  async migrateTransactionsFromFirebase(userId) {
    try {
      const firebaseTransactions = await firebaseDB.getTransactions(userId);
      
      for (const transaction of firebaseTransactions) {
        await neonDB.createTransaction({
          user_id: userId,
          type: transaction.type,
          amount: transaction.amount,
          description: transaction.description,
          category: transaction.category,
          created_at: transaction.created_at
        });
      }
    } catch (error) {
      console.error('Erreur migration transactions:', error);
    }
  }
};
