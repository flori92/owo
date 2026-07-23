import type { Database } from '../database.js';
import type { AuthenticatedUser } from '../types.js';
import { synchronizeUser } from './users.js';

type DeletionRequestRow = {
  id: string;
  status: string;
  requested_at: Date;
};

export async function requestAccountDeletion(
  database: Database,
  actor: AuthenticatedUser,
  reason: string | null,
) {
  const user = await synchronizeUser(database, actor);
  return database.transaction(async (client) => {
    await client.query(
      `UPDATE app_users
          SET status = 'deletion_requested', updated_at = now()
        WHERE id = $1 AND status <> 'deleted'`,
      [user.id],
    );
    const result = await client.query<DeletionRequestRow>(
      `INSERT INTO account_deletion_requests (user_id, reason)
       VALUES ($1, $2)
       ON CONFLICT (user_id) WHERE status IN ('requested', 'processing')
       DO UPDATE SET reason = COALESCE(EXCLUDED.reason, account_deletion_requests.reason)
       RETURNING id, status, requested_at`,
      [user.id, reason],
    );
    return result.rows[0]!;
  });
}
