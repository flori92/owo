import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createDatabase, type Database } from '../src/database.js';
import { applyProviderResult, createPaymentIntent } from '../src/services/payment-intents.js';

const databaseUrl = process.env.TEST_DATABASE_URL;
const integration = describe.skipIf(!databaseUrl);
let database: Database;
let sourceAccountId: string;

integration('transfert interne instantané', () => {
  beforeAll(async () => {
    database = createDatabase(databaseUrl!, false);
    await database.query(
      `TRUNCATE account_deletion_requests, outbox_events, account_holds, ledger_entries,
                ledger_transactions, payment_intents, accounts, app_users CASCADE`,
    );

    const users = await database.query<{ id: string; firebase_uid: string }>(
      `INSERT INTO app_users (firebase_uid, display_name, phone_e164)
       VALUES
         ('sender-firebase', 'Sender', '+237699000001'),
         ('recipient-firebase', 'Recipient', '+237699000002')
       RETURNING id, firebase_uid`,
    );
    const senderId = users.rows.find((user) => user.firebase_uid === 'sender-firebase')!.id;
    const recipientId = users.rows.find((user) => user.firebase_uid === 'recipient-firebase')!.id;

    const accounts = await database.query<{ id: string; public_reference: string }>(
      `INSERT INTO accounts (owner_user_id, public_reference, account_type, currency, normal_side, is_primary)
       VALUES
         ($1, 'OWO-SENDER', 'wallet', 'XOF', 'debit', true),
         ($2, 'OWO-RECIPIENT', 'wallet', 'XOF', 'debit', true),
         (NULL, 'OWO-TREASURY-XOF', 'treasury', 'XOF', 'credit', false)
       RETURNING id, public_reference`,
      [senderId, recipientId],
    );
    sourceAccountId = accounts.rows.find((account) => account.public_reference === 'OWO-SENDER')!.id;
    const treasuryId = accounts.rows.find((account) => account.public_reference === 'OWO-TREASURY-XOF')!.id;

    await database.transaction(async (client) => {
      const seed = await client.query<{ id: string }>(
        `INSERT INTO ledger_transactions (kind, description)
         VALUES ('test_funding', 'Test funding')
         RETURNING id`,
      );
      await client.query(
        `INSERT INTO ledger_entries (transaction_id, account_id, side, amount_minor, currency)
         VALUES ($1, $2, 'debit', 100000, 'XOF'), ($1, $3, 'credit', 100000, 'XOF')`,
        [seed.rows[0]!.id, sourceAccountId, treasuryId],
      );
      await client.query(
        `UPDATE ledger_transactions SET status = 'posted', posted_at = now() WHERE id = $1`,
        [seed.rows[0]!.id],
      );
    });
  });

  afterAll(async () => database?.close());

  it('poste débit et crédit avant de répondre et reste idempotent', async () => {
    const input = {
      sourceAccountId,
      type: 'send' as const,
      amountMinor: 10_000,
      currency: 'XOF',
      title: 'Transfert famille',
      recipientName: 'Recipient',
      recipientPhone: '+237 699 000 002',
    };
    const first = await createPaymentIntent(
      database,
      { uid: 'sender-firebase' },
      'internal-transfer-001',
      input,
    );
    const retry = await createPaymentIntent(
      database,
      { uid: 'sender-firebase' },
      'internal-transfer-001',
      input,
    );

    expect(first.status).toBe('completed');
    expect(first.settlement_path).toBe('internal');
    expect(retry.id).toBe(first.id);

    const balances = await database.query<{ public_reference: string; balance_minor: string }>(
      `SELECT a.public_reference, b.balance_minor::text
         FROM accounts a
         JOIN account_balances b ON b.account_id = a.id
        WHERE a.public_reference IN ('OWO-SENDER', 'OWO-RECIPIENT')`,
    );
    expect(balances.rows.find((row) => row.public_reference === 'OWO-SENDER')?.balance_minor).toBe('90000');
    expect(balances.rows.find((row) => row.public_reference === 'OWO-RECIPIENT')?.balance_minor).toBe('10000');
  });

  it('réserve un envoi externe puis ne comptabilise le règlement qu\'une fois', async () => {
    const queued = await createPaymentIntent(
      database,
      { uid: 'sender-firebase' },
      'external-transfer-001',
      {
        sourceAccountId,
        type: 'send',
        amountMinor: 20_000,
        currency: 'XOF',
        title: 'Mobile money',
        recipientName: 'External recipient',
        recipientPhone: '+237699999999',
      },
    );

    expect(queued.status).toBe('processing');
    expect(queued.settlement_path).toBe('external');
    const heldBalance = await database.query<{ ledger: string; available: string }>(
      `SELECT b.balance_minor::text AS ledger,
              (b.balance_minor - sum(h.amount_minor) FILTER (WHERE h.status = 'active'))::text AS available
         FROM account_balances b
         JOIN account_holds h ON h.account_id = b.account_id
        WHERE b.account_id = $1
        GROUP BY b.balance_minor`,
      [sourceAccountId],
    );
    expect(heldBalance.rows[0]).toEqual({ ledger: '90000', available: '70000' });

    const result = {
      provider: 'sandbox-mobile-money',
      providerReference: 'sandbox-001',
      status: 'completed' as const,
    };
    const completed = await applyProviderResult(database, queued.id, result);
    const duplicateWebhook = await applyProviderResult(database, queued.id, result);
    expect(completed.status).toBe('completed');
    expect(duplicateWebhook.status).toBe('completed');

    const settled = await database.query<{ balance_minor: string; hold_status: string; ledgers: string }>(
      `SELECT b.balance_minor::text, h.status::text AS hold_status,
              count(t.id)::text AS ledgers
         FROM account_balances b
         JOIN account_holds h ON h.account_id = b.account_id
         JOIN payment_intents p ON p.id = h.payment_intent_id
         JOIN ledger_transactions t ON t.payment_intent_id = p.id
        WHERE b.account_id = $1 AND p.id = $2
        GROUP BY b.balance_minor, h.status`,
      [sourceAccountId, queued.id],
    );
    expect(settled.rows[0]).toEqual({ balance_minor: '70000', hold_status: 'captured', ledgers: '1' });
  });

  it('libère la réservation si le prestataire refuse', async () => {
    const queued = await createPaymentIntent(
      database,
      { uid: 'sender-firebase' },
      'external-transfer-002',
      {
        sourceAccountId,
        type: 'send',
        amountMinor: 15_000,
        currency: 'XOF',
        title: 'Mobile money refusé',
        recipientName: 'External recipient',
        recipientPhone: '+237688888888',
      },
    );
    const failed = await applyProviderResult(database, queued.id, {
      provider: 'sandbox-mobile-money',
      providerReference: 'sandbox-002',
      status: 'failed',
      failureCode: 'recipient_unavailable',
    });

    expect(failed.status).toBe('failed');
    expect(failed.failure_code).toBe('recipient_unavailable');
    const state = await database.query<{ balance_minor: string; status: string }>(
      `SELECT b.balance_minor::text, h.status::text
         FROM account_balances b
         JOIN account_holds h ON h.account_id = b.account_id
        WHERE b.account_id = $1 AND h.payment_intent_id = $2`,
      [sourceAccountId, queued.id],
    );
    expect(state.rows[0]).toEqual({ balance_minor: '70000', status: 'released' });
  });
});
