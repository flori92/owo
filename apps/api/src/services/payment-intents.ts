import { createHash } from 'node:crypto';
import type { Database, Queryable } from '../database.js';
import { normalizeE164 } from '../domain/phone.js';
import type { ProviderResult } from '../providers/types.js';
import type { AuthenticatedUser } from '../types.js';

export type PaymentIntentInput = {
  sourceAccountId: string;
  type: 'send' | 'receive' | 'deposit';
  amountMinor: number;
  currency: string;
  title: string;
  description?: string | null;
  recipientName?: string | null;
  recipientPhone?: string | null;
};

export type IntentRow = {
  id: string;
  reference: string;
  status: 'pending' | 'requires_action' | 'processing' | 'completed' | 'failed' | 'cancelled';
  type: PaymentIntentInput['type'];
  amount_minor: string;
  currency: string;
  title: string;
  description: string | null;
  recipient_name: string | null;
  recipient_phone: string | null;
  settlement_path: 'internal' | 'external' | null;
  failure_code: string | null;
  request_hash: string;
  created_at: Date;
  updated_at: Date;
  completed_at: Date | null;
};

type OwnedAccount = { id: string; user_id: string; currency: string };
type InternalRecipient = { user_id: string; account_id: string };

export class IdempotencyConflictError extends Error {}
export class AccountAccessError extends Error {}

const intentColumns = `
  id, reference, status, type, amount_minor::text, currency, title, description,
  recipient_name, recipient_phone, settlement_path, failure_code, request_hash,
  created_at, updated_at, completed_at
`;

const intentColumnsFromP = `
  p.id, p.reference, p.status, p.type, p.amount_minor::text, p.currency, p.title, p.description,
  p.recipient_name, p.recipient_phone, p.settlement_path, p.failure_code, p.request_hash,
  p.created_at, p.updated_at, p.completed_at
`;

function hashRequest(input: PaymentIntentInput): string {
  return createHash('sha256').update(JSON.stringify(input)).digest('hex');
}

async function findOwnedAccount(
  client: Queryable,
  firebaseUid: string,
  accountId: string,
): Promise<OwnedAccount | undefined> {
  const result = await client.query<OwnedAccount>(
    `SELECT a.id, u.id AS user_id, a.currency
       FROM accounts a
       JOIN app_users u ON u.id = a.owner_user_id
      WHERE a.id = $1 AND u.firebase_uid = $2 AND a.status = 'active' AND u.status = 'active'`,
    [accountId, firebaseUid],
  );
  return result.rows[0];
}

async function findInternalRecipient(
  client: Queryable,
  phone: string,
  currency: string,
): Promise<InternalRecipient | undefined> {
  const result = await client.query<InternalRecipient>(
    `SELECT u.id AS user_id, a.id AS account_id
       FROM app_users u
       JOIN accounts a ON a.owner_user_id = u.id
      WHERE u.phone_e164 = $1
        AND u.status = 'active'
        AND a.status = 'active'
        AND a.is_primary = true
        AND a.currency = $2
      LIMIT 1`,
    [phone, currency],
  );
  return result.rows[0];
}

async function lockAccounts(client: Queryable, accountIds: readonly string[]): Promise<void> {
  await client.query(
    `SELECT id
       FROM accounts
      WHERE id = ANY($1::uuid[])
      ORDER BY id
      FOR UPDATE`,
    [[...accountIds].sort()],
  );
}

async function getAvailableBalance(client: Queryable, accountId: string): Promise<bigint> {
  const result = await client.query<{ available_balance_minor: string }>(
    `SELECT (
       COALESCE(b.balance_minor, 0) - COALESCE((
         SELECT sum(h.amount_minor)
           FROM account_holds h
          WHERE h.account_id = a.id
            AND h.status = 'active'
       ), 0)
     )::text AS available_balance_minor
       FROM accounts a
       LEFT JOIN account_balances b ON b.account_id = a.id
      WHERE a.id = $1`,
    [accountId],
  );
  return BigInt(result.rows[0]?.available_balance_minor ?? '0');
}

async function reloadIntent(client: Queryable, intentId: string): Promise<IntentRow> {
  const result = await client.query<IntentRow>(
    `SELECT ${intentColumns} FROM payment_intents WHERE id = $1`,
    [intentId],
  );
  return result.rows[0]!;
}

async function addOutboxEvent(
  client: Queryable,
  intent: IntentRow,
  userId: string,
  eventType: string,
): Promise<void> {
  await client.query(
    `INSERT INTO outbox_events (aggregate_type, aggregate_id, event_type, payload)
     VALUES ('payment_intent', $1, $2, $3::jsonb)
     ON CONFLICT (aggregate_id, event_type) DO NOTHING`,
    [intent.id, eventType, JSON.stringify({ paymentIntentId: intent.id, userId, status: intent.status })],
  );
}

async function failIntent(
  client: Queryable,
  intentId: string,
  userId: string,
  failureCode: string,
): Promise<IntentRow> {
  await client.query(
    `UPDATE payment_intents
        SET status = 'failed', failure_code = $2, updated_at = now()
      WHERE id = $1`,
    [intentId, failureCode],
  );
  const intent = await reloadIntent(client, intentId);
  await addOutboxEvent(client, intent, userId, 'payment_intent.failed');
  return intent;
}

async function settleInternalTransfer(
  client: Queryable,
  intent: IntentRow,
  source: OwnedAccount,
  recipient: InternalRecipient,
): Promise<IntentRow> {
  if (recipient.user_id === source.user_id) {
    return failIntent(client, intent.id, source.user_id, 'self_transfer_not_allowed');
  }

  await lockAccounts(client, [source.id, recipient.account_id]);
  if ((await getAvailableBalance(client, source.id)) < BigInt(intent.amount_minor)) {
    return failIntent(client, intent.id, source.user_id, 'insufficient_funds');
  }

  const ledger = await client.query<{ id: string }>(
    `INSERT INTO ledger_transactions (payment_intent_id, kind, description, metadata)
     VALUES ($1, 'internal_transfer', $2, $3::jsonb)
     RETURNING id`,
    [intent.id, intent.title, JSON.stringify({ channel: 'owo_internal' })],
  );
  const ledgerTransactionId = ledger.rows[0]!.id;

  await client.query(
    `INSERT INTO ledger_entries (transaction_id, account_id, side, amount_minor, currency)
     VALUES
       ($1, $2, 'credit', $4, $5),
       ($1, $3, 'debit',  $4, $5)`,
    [ledgerTransactionId, source.id, recipient.account_id, intent.amount_minor, intent.currency],
  );
  await client.query(
    `UPDATE ledger_transactions
        SET status = 'posted', posted_at = now()
      WHERE id = $1`,
    [ledgerTransactionId],
  );
  await client.query(
    `UPDATE payment_intents
        SET status = 'completed', settlement_path = 'internal', destination_account_id = $2,
            completed_at = now(), updated_at = now()
      WHERE id = $1`,
    [intent.id, recipient.account_id],
  );

  const completed = await reloadIntent(client, intent.id);
  await addOutboxEvent(client, completed, source.user_id, 'payment_intent.completed');
  return completed;
}

async function queueExternalProcessing(
  client: Queryable,
  intent: IntentRow,
  source: OwnedAccount,
): Promise<IntentRow> {
  await lockAccounts(client, [source.id]);

  if (intent.type === 'send') {
    if ((await getAvailableBalance(client, source.id)) < BigInt(intent.amount_minor)) {
      return failIntent(client, intent.id, source.user_id, 'insufficient_funds');
    }
    await client.query(
      `INSERT INTO account_holds (
         payment_intent_id, account_id, amount_minor, currency, expires_at
       ) VALUES ($1, $2, $3, $4, now() + interval '30 minutes')`,
      [intent.id, source.id, intent.amount_minor, intent.currency],
    );
  }

  await client.query(
    `UPDATE payment_intents
        SET status = 'processing', settlement_path = 'external', processing_at = now(), updated_at = now()
      WHERE id = $1`,
    [intent.id],
  );
  const processing = await reloadIntent(client, intent.id);
  await addOutboxEvent(client, processing, source.user_id, 'payment_intent.processing_requested');
  return processing;
}

export async function createPaymentIntent(
  database: Database,
  actor: AuthenticatedUser,
  idempotencyKey: string,
  input: PaymentIntentInput,
): Promise<IntentRow> {
  const requestHash = hashRequest(input);
  return database.transaction(async (client) => {
    const source = await findOwnedAccount(client, actor.uid, input.sourceAccountId);
    if (!source) throw new AccountAccessError('Compte source inaccessible.');
    if (source.currency.trim() !== input.currency) {
      throw new AccountAccessError('La devise ne correspond pas au compte source.');
    }

    const inserted = await client.query<IntentRow>(
      `INSERT INTO payment_intents (
         user_id, source_account_id, idempotency_key, request_hash, type,
         amount_minor, currency, title, description, recipient_name, recipient_phone
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       ON CONFLICT (user_id, idempotency_key) DO NOTHING
       RETURNING ${intentColumns}`,
      [
        source.user_id,
        source.id,
        idempotencyKey,
        requestHash,
        input.type,
        input.amountMinor,
        input.currency,
        input.title,
        input.description ?? null,
        input.recipientName ?? null,
        input.recipientPhone ?? null,
      ],
    );

    const newIntent = inserted.rows[0];
    if (!newIntent) {
      const existing = await client.query<IntentRow>(
        `SELECT ${intentColumns}
           FROM payment_intents
          WHERE user_id = $1 AND idempotency_key = $2`,
        [source.user_id, idempotencyKey],
      );
      const intent = existing.rows[0];
      if (!intent || intent.request_hash !== requestHash) {
        throw new IdempotencyConflictError('La clé a déjà été utilisée pour une autre demande.');
      }
      return intent;
    }

    const normalizedRecipient = normalizeE164(input.recipientPhone);
    if (input.type === 'send' && normalizedRecipient) {
      const recipient = await findInternalRecipient(client, normalizedRecipient, input.currency);
      if (recipient) return settleInternalTransfer(client, newIntent, source, recipient);
    }

    return queueExternalProcessing(client, newIntent, source);
  });
}

export async function getPaymentIntent(
  database: Database,
  firebaseUid: string,
  intentId: string,
): Promise<IntentRow | undefined> {
  const result = await database.query<IntentRow>(
    `SELECT ${intentColumnsFromP}
       FROM payment_intents p
       JOIN app_users u ON u.id = p.user_id
      WHERE p.id = $1 AND u.firebase_uid = $2`,
    [intentId, firebaseUid],
  );
  return result.rows[0];
}

export async function applyProviderResult(
  database: Database,
  intentId: string,
  result: ProviderResult,
): Promise<IntentRow> {
  return database.transaction(async (client) => {
    const locked = await client.query<IntentRow & { source_account_id: string; user_id: string }>(
      `SELECT ${intentColumns}, source_account_id, user_id
         FROM payment_intents
        WHERE id = $1
        FOR UPDATE`,
      [intentId],
    );
    const intent = locked.rows[0];
    if (!intent) throw new Error('payment_intent_not_found');
    if (intent.status === 'completed' || intent.status === 'failed' || intent.status === 'cancelled') {
      return intent;
    }
    if (intent.settlement_path !== 'external') throw new Error('external_settlement_required');

    if (result.status === 'processing') {
      await client.query(
        `UPDATE payment_intents
            SET provider = $2, provider_reference = $3, status = 'processing', updated_at = now()
          WHERE id = $1`,
        [intent.id, result.provider, result.providerReference],
      );
      return reloadIntent(client, intent.id);
    }

    if (result.status === 'failed') {
      await client.query(
        `UPDATE account_holds
            SET status = 'released', released_at = now()
          WHERE payment_intent_id = $1 AND status = 'active'`,
        [intent.id],
      );
      await client.query(
        `UPDATE payment_intents
            SET provider = $2, provider_reference = $3, status = 'failed',
                failure_code = $4, updated_at = now()
          WHERE id = $1`,
        [intent.id, result.provider, result.providerReference, result.failureCode || 'provider_rejected'],
      );
      const failed = await reloadIntent(client, intent.id);
      await addOutboxEvent(client, failed, intent.user_id, 'payment_intent.failed');
      return failed;
    }

    const providerKey = result.provider.toUpperCase().replace(/[^A-Z0-9_-]/g, '').slice(0, 32);
    if (!providerKey) throw new Error('invalid_provider_name');
    const clearing = await client.query<{ id: string }>(
      `INSERT INTO accounts (public_reference, account_type, currency, normal_side, is_primary)
       VALUES ($1, 'provider_clearing', $2, 'debit', false)
       ON CONFLICT (public_reference) DO UPDATE SET updated_at = now()
       RETURNING id`,
      [`CLEARING-${providerKey}-${intent.currency.trim()}`, intent.currency],
    );
    const clearingAccountId = clearing.rows[0]!.id;
    await lockAccounts(client, [intent.source_account_id, clearingAccountId]);

    if (intent.type === 'send') {
      const activeHold = await client.query<{ id: string }>(
        `SELECT id
           FROM account_holds
          WHERE payment_intent_id = $1 AND status = 'active'
          FOR UPDATE`,
        [intent.id],
      );
      if (!activeHold.rows[0]) throw new Error('active_hold_required');
    }

    const ledger = await client.query<{ id: string }>(
      `INSERT INTO ledger_transactions (payment_intent_id, kind, description, metadata)
       VALUES ($1, 'provider_settlement', $2, $3::jsonb)
       RETURNING id`,
      [
        intent.id,
        intent.title,
        JSON.stringify({ provider: result.provider, providerReference: result.providerReference }),
      ],
    );
    const ledgerTransactionId = ledger.rows[0]!.id;
    const sourceSide = intent.type === 'send' ? 'credit' : 'debit';
    const clearingSide = intent.type === 'send' ? 'debit' : 'credit';
    await client.query(
      `INSERT INTO ledger_entries (transaction_id, account_id, side, amount_minor, currency)
       VALUES ($1, $2, $4::ledger_side, $6, $7), ($1, $3, $5::ledger_side, $6, $7)`,
      [
        ledgerTransactionId,
        intent.source_account_id,
        clearingAccountId,
        sourceSide,
        clearingSide,
        intent.amount_minor,
        intent.currency,
      ],
    );
    await client.query(
      `UPDATE ledger_transactions SET status = 'posted', posted_at = now() WHERE id = $1`,
      [ledgerTransactionId],
    );
    await client.query(
      `UPDATE account_holds
          SET status = 'captured', released_at = now()
        WHERE payment_intent_id = $1 AND status = 'active'`,
      [intent.id],
    );
    await client.query(
      `UPDATE payment_intents
          SET provider = $2, provider_reference = $3, status = 'completed',
              completed_at = now(), updated_at = now()
        WHERE id = $1`,
      [intent.id, result.provider, result.providerReference],
    );
    const completed = await reloadIntent(client, intent.id);
    await addOutboxEvent(client, completed, intent.user_id, 'payment_intent.completed');
    return completed;
  });
}

export async function listPaymentIntents(database: Database, firebaseUid: string, limit: number) {
  const result = await database.query<IntentRow>(
    `SELECT ${intentColumnsFromP}
       FROM payment_intents p
       JOIN app_users u ON u.id = p.user_id
      WHERE u.firebase_uid = $1
      ORDER BY p.created_at DESC
      LIMIT $2`,
    [firebaseUid, limit],
  );
  return result.rows;
}
