import { neon } from '@neondatabase/serverless';

let _sql = null;

const getSql = () => {
  if (_sql) return _sql;
  const url = process.env.NEON_DATABASE_URL;
  if (!url) {
    throw new Error(
      'NEON_DATABASE_URL manquante: Neon est désactivé (mode démo).'
    );
  }
  _sql = neon(url);
  return _sql;
};

const sql = (...args) => {
  return getSql()(...args);
};

export { sql };

// Fonctions utilitaires pour la base de données
export const neonDB = {
  // Utilisateurs
  async getUser(userId) {
    const result = await sql`SELECT * FROM users WHERE id = ${userId}`;
    return result[0];
  },
  
  async createUser(userData) {
    const { email, name, phone, created_at } = userData;
    const result = await sql`
      INSERT INTO users (email, name, phone, created_at)
      VALUES (${email}, ${name}, ${phone}, ${created_at})
      RETURNING *
    `;
    return result[0];
  },
  
  async updateUser(userId, userData) {
    const { name, phone, updated_at } = userData;
    const result = await sql`
      UPDATE users 
      SET name = ${name}, phone = ${phone}, updated_at = ${updated_at}
      WHERE id = ${userId}
      RETURNING *
    `;
    return result[0];
  },
  
  // Transactions
  async getTransactions(userId) {
    return await sql`
      SELECT * FROM transactions 
      WHERE user_id = ${userId} 
      ORDER BY created_at DESC
    `;
  },
  
  async createTransaction(transactionData) {
    const { user_id, type, amount, description, category, created_at } = transactionData;
    const result = await sql`
      INSERT INTO transactions (user_id, type, amount, description, category, created_at)
      VALUES (${user_id}, ${type}, ${amount}, ${description}, ${category}, ${created_at})
      RETURNING *
    `;
    return result[0];
  },
  
  // Épargnes
  async getSavingsGoals(userId) {
    return await sql`
      SELECT * FROM savings_goals 
      WHERE user_id = ${userId} 
      ORDER BY created_at DESC
    `;
  },
  
  async createSavingsGoal(goalData) {
    const { user_id, title, target_amount, current_amount, deadline, created_at } = goalData;
    const result = await sql`
      INSERT INTO savings_goals (user_id, title, target_amount, current_amount, deadline, created_at)
      VALUES (${user_id}, ${title}, ${target_amount}, ${current_amount}, ${deadline}, ${created_at})
      RETURNING *
    `;
    return result[0];
  },
  
  async updateSavingsGoal(goalId, updateData) {
    const { current_amount, updated_at } = updateData;
    const result = await sql`
      UPDATE savings_goals 
      SET current_amount = ${current_amount}, updated_at = ${updated_at}
      WHERE id = ${goalId}
      RETURNING *
    `;
    return result[0];
  }
};
