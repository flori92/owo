import type { Database, Queryable } from '../database.js';
import { normalizeE164 } from '../domain/phone.js';
import type { AuthenticatedUser } from '../types.js';
import { getMarket, type MarketCode } from '../domain/markets.js';

type UserRow = {
  id: string;
  firebase_uid: string;
  email: string | null;
  display_name: string | null;
  phone_e164: string | null;
  status: string;
  country_code: string;
  region_code: string;
  preferred_currency: string;
};

type AccountRow = {
  id: string;
  public_reference: string;
  currency: string;
  status: string;
  balance_minor: string;
  available_balance_minor: string;
};

async function upsertUser(client: Queryable, user: AuthenticatedUser): Promise<UserRow> {
  const result = await client.query<UserRow>(
    `INSERT INTO app_users (firebase_uid, email, display_name, phone_e164)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (firebase_uid) DO UPDATE
       SET email = COALESCE(EXCLUDED.email, app_users.email),
           display_name = COALESCE(EXCLUDED.display_name, app_users.display_name),
           phone_e164 = COALESCE(EXCLUDED.phone_e164, app_users.phone_e164),
           updated_at = now()
     RETURNING id, firebase_uid, email, display_name, phone_e164, status,
               country_code, region_code, preferred_currency`,
    [user.uid, user.email ?? null, user.name ?? null, normalizeE164(user.phone)],
  );
  return result.rows[0]!;
}

export async function synchronizeUser(database: Database, user: AuthenticatedUser) {
  return database.transaction(async (client) => {
    const persisted = await upsertUser(client, user);
    await client.query(
      `INSERT INTO accounts (owner_user_id, public_reference, account_type, currency, normal_side, is_primary)
       VALUES ($1, 'OWO-' || upper(substr(encode(digest($2, 'sha256'), 'hex'), 1, 12)) || '-' || $3, 'wallet', $3, 'debit', true)
       ON CONFLICT (owner_user_id, currency) WHERE is_primary DO NOTHING`,
      [persisted.id, user.uid, persisted.preferred_currency],
    );
    return persisted;
  });
}

export async function updateUserMarket(database: Database, firebaseUid: string, countryCode: MarketCode) {
  const market = getMarket(countryCode);
  if (!market) throw new Error('unsupported_market');
  return database.transaction(async (client) => {
    const result = await client.query<UserRow>(
      `UPDATE app_users
          SET country_code = $2, region_code = $3, preferred_currency = $4, updated_at = now()
        WHERE firebase_uid = $1
        RETURNING id, firebase_uid, email, display_name, phone_e164, status,
                  country_code, region_code, preferred_currency`,
      [firebaseUid, market.countryCode, market.region, market.currency],
    );
    const user = result.rows[0];
    if (!user) throw new Error('market_user_not_found');
    await client.query(
      `INSERT INTO accounts (owner_user_id, public_reference, account_type, currency, normal_side, is_primary)
       VALUES ($1, 'OWO-' || upper(substr(encode(digest($2, 'sha256'), 'hex'), 1, 12)) || '-' || $3, 'wallet', $3, 'debit', true)
       ON CONFLICT (owner_user_id, currency) WHERE is_primary DO NOTHING`,
      [user.id, firebaseUid, market.currency],
    );
    return user;
  });
}

export async function listAccounts(database: Database, firebaseUid: string): Promise<AccountRow[]> {
  const result = await database.query<AccountRow>(
    `SELECT a.id, a.public_reference, a.currency, a.status,
            COALESCE(b.balance_minor, 0)::text AS balance_minor,
            (COALESCE(b.balance_minor, 0) - COALESCE(h.held_minor, 0))::text AS available_balance_minor
       FROM accounts a
       JOIN app_users u ON u.id = a.owner_user_id
       LEFT JOIN account_balances b ON b.account_id = a.id
       LEFT JOIN (
         SELECT account_id, sum(amount_minor)::bigint AS held_minor
           FROM account_holds
          WHERE status = 'active'
          GROUP BY account_id
       ) h ON h.account_id = a.id
      WHERE u.firebase_uid = $1
      ORDER BY a.is_primary DESC, a.created_at ASC`,
    [firebaseUid],
  );
  return result.rows;
}
