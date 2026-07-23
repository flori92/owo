CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE user_status AS ENUM ('active', 'suspended', 'deletion_requested', 'deleted');
CREATE TYPE account_status AS ENUM ('active', 'blocked', 'closed');
CREATE TYPE account_type AS ENUM ('wallet', 'provider_clearing', 'fee', 'treasury');
CREATE TYPE ledger_side AS ENUM ('debit', 'credit');
CREATE TYPE ledger_status AS ENUM ('draft', 'posted', 'reversed');
CREATE TYPE payment_intent_type AS ENUM ('send', 'receive', 'deposit');
CREATE TYPE payment_intent_status AS ENUM (
  'pending', 'requires_action', 'processing', 'completed', 'failed', 'cancelled'
);
CREATE TYPE hold_status AS ENUM ('active', 'captured', 'released', 'expired');

CREATE TABLE app_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  firebase_uid text NOT NULL UNIQUE,
  email text,
  display_name text,
  phone_e164 varchar(16),
  status user_status NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX app_users_phone_e164_unique
  ON app_users(phone_e164)
  WHERE phone_e164 IS NOT NULL;

CREATE TABLE accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id uuid REFERENCES app_users(id),
  public_reference text NOT NULL UNIQUE,
  account_type account_type NOT NULL,
  currency char(3) NOT NULL CHECK (currency = upper(currency)),
  normal_side ledger_side NOT NULL,
  status account_status NOT NULL DEFAULT 'active',
  is_primary boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK ((account_type = 'wallet' AND owner_user_id IS NOT NULL) OR account_type <> 'wallet')
);

CREATE UNIQUE INDEX one_primary_account_per_currency
  ON accounts(owner_user_id, currency)
  WHERE is_primary;

CREATE TABLE payment_intents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference text NOT NULL UNIQUE DEFAULT ('PAY-' || upper(encode(gen_random_bytes(8), 'hex'))),
  user_id uuid NOT NULL REFERENCES app_users(id),
  source_account_id uuid NOT NULL REFERENCES accounts(id),
  destination_account_id uuid REFERENCES accounts(id),
  idempotency_key text NOT NULL CHECK (length(idempotency_key) BETWEEN 8 AND 128),
  request_hash char(64) NOT NULL,
  type payment_intent_type NOT NULL,
  status payment_intent_status NOT NULL DEFAULT 'pending',
  amount_minor bigint NOT NULL CHECK (amount_minor > 0),
  currency char(3) NOT NULL CHECK (currency = upper(currency)),
  title varchar(120) NOT NULL,
  description varchar(500),
  recipient_name varchar(120),
  recipient_phone varchar(24),
  provider text,
  provider_reference text,
  settlement_path text CHECK (settlement_path IN ('internal', 'external')),
  failure_code text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  processing_at timestamptz,
  completed_at timestamptz,
  UNIQUE (user_id, idempotency_key),
  CHECK (type <> 'send' OR (recipient_name IS NOT NULL AND recipient_phone IS NOT NULL))
);

CREATE INDEX payment_intents_user_created_idx ON payment_intents(user_id, created_at DESC);
CREATE UNIQUE INDEX payment_intents_provider_reference_idx
  ON payment_intents(provider, provider_reference)
  WHERE provider_reference IS NOT NULL;

CREATE TABLE account_holds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_intent_id uuid NOT NULL UNIQUE REFERENCES payment_intents(id),
  account_id uuid NOT NULL REFERENCES accounts(id),
  amount_minor bigint NOT NULL CHECK (amount_minor > 0),
  currency char(3) NOT NULL CHECK (currency = upper(currency)),
  status hold_status NOT NULL DEFAULT 'active',
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  released_at timestamptz
);

CREATE INDEX account_holds_active_idx
  ON account_holds(account_id, expires_at)
  WHERE status = 'active';

CREATE TABLE ledger_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference text NOT NULL UNIQUE DEFAULT ('LED-' || upper(encode(gen_random_bytes(8), 'hex'))),
  payment_intent_id uuid UNIQUE REFERENCES payment_intents(id),
  kind text NOT NULL,
  status ledger_status NOT NULL DEFAULT 'draft',
  description text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  posted_at timestamptz,
  CHECK ((status = 'posted' AND posted_at IS NOT NULL) OR status <> 'posted')
);

CREATE TABLE ledger_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id uuid NOT NULL REFERENCES ledger_transactions(id) ON DELETE RESTRICT,
  account_id uuid NOT NULL REFERENCES accounts(id) ON DELETE RESTRICT,
  side ledger_side NOT NULL,
  amount_minor bigint NOT NULL CHECK (amount_minor > 0),
  currency char(3) NOT NULL CHECK (currency = upper(currency)),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX ledger_entries_transaction_idx ON ledger_entries(transaction_id);
CREATE INDEX ledger_entries_account_idx ON ledger_entries(account_id, created_at DESC);

CREATE OR REPLACE FUNCTION assert_ledger_transaction_balanced()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  target_transaction_id uuid;
  transaction_status ledger_status;
BEGIN
  IF TG_TABLE_NAME = 'ledger_entries' THEN
    target_transaction_id := COALESCE(NEW.transaction_id, OLD.transaction_id);
  ELSE
    target_transaction_id := COALESCE(NEW.id, OLD.id);
  END IF;

  SELECT status INTO transaction_status
    FROM ledger_transactions
   WHERE id = target_transaction_id;

  IF transaction_status = 'posted' THEN
    IF (SELECT count(*) FROM ledger_entries WHERE transaction_id = target_transaction_id) < 2 THEN
      RAISE EXCEPTION 'posted ledger transaction % must contain at least two entries', target_transaction_id;
    END IF;

    IF EXISTS (
      SELECT 1
        FROM ledger_entries e
       WHERE e.transaction_id = target_transaction_id
       GROUP BY e.currency
      HAVING sum(CASE WHEN e.side = 'debit' THEN e.amount_minor ELSE -e.amount_minor END) <> 0
    ) THEN
      RAISE EXCEPTION 'ledger transaction % is not balanced', target_transaction_id;
    END IF;

    IF EXISTS (
      SELECT 1
        FROM ledger_entries e
        JOIN accounts a ON a.id = e.account_id
       WHERE e.transaction_id = target_transaction_id
         AND e.currency <> a.currency
    ) THEN
      RAISE EXCEPTION 'ledger transaction % contains an account currency mismatch', target_transaction_id;
    END IF;
  END IF;
  RETURN NULL;
END;
$$;

CREATE CONSTRAINT TRIGGER ledger_entries_balance_guard
AFTER INSERT OR UPDATE OR DELETE ON ledger_entries
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW EXECUTE FUNCTION assert_ledger_transaction_balanced();

CREATE CONSTRAINT TRIGGER ledger_transaction_status_guard
AFTER UPDATE OF status ON ledger_transactions
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW EXECUTE FUNCTION assert_ledger_transaction_balanced();

CREATE CONSTRAINT TRIGGER ledger_transaction_insert_guard
AFTER INSERT ON ledger_transactions
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW EXECUTE FUNCTION assert_ledger_transaction_balanced();

CREATE VIEW account_balances AS
SELECT
  a.id AS account_id,
  a.currency,
  COALESCE(
    sum(
      CASE
        WHEN a.normal_side = e.side THEN e.amount_minor
        ELSE -e.amount_minor
      END
    ) FILTER (WHERE t.status = 'posted'),
    0
  )::bigint AS balance_minor
FROM accounts a
LEFT JOIN ledger_entries e ON e.account_id = a.id
LEFT JOIN ledger_transactions t ON t.id = e.transaction_id
GROUP BY a.id, a.currency;

CREATE TABLE outbox_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  aggregate_type text NOT NULL,
  aggregate_id uuid NOT NULL,
  event_type text NOT NULL,
  payload jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  published_at timestamptz,
  attempts integer NOT NULL DEFAULT 0,
  UNIQUE (aggregate_id, event_type)
);

CREATE INDEX outbox_unpublished_idx ON outbox_events(created_at) WHERE published_at IS NULL;

CREATE TABLE account_deletion_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES app_users(id),
  reason varchar(500),
  status text NOT NULL DEFAULT 'requested' CHECK (status IN ('requested', 'processing', 'completed', 'rejected')),
  requested_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

CREATE UNIQUE INDEX one_open_deletion_request_per_user
  ON account_deletion_requests(user_id)
  WHERE status IN ('requested', 'processing');
