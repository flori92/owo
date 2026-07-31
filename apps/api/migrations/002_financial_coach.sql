CREATE TABLE financial_profiles (
  user_id uuid PRIMARY KEY REFERENCES app_users(id) ON DELETE CASCADE,
  currency char(3) NOT NULL DEFAULT 'XAF' CHECK (currency = 'XAF'),
  monthly_income_minor bigint NOT NULL DEFAULT 0 CHECK (monthly_income_minor >= 0),
  current_savings_minor bigint NOT NULL DEFAULT 0 CHECK (current_savings_minor >= 0),
  debt_payments_minor bigint NOT NULL DEFAULT 0 CHECK (debt_payments_minor >= 0),
  emergency_fund_months smallint NOT NULL DEFAULT 3 CHECK (emergency_fund_months BETWEEN 1 AND 12),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE budget_categories (
  user_id uuid NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  code varchar(40) NOT NULL,
  name varchar(80) NOT NULL,
  spent_minor bigint NOT NULL DEFAULT 0 CHECK (spent_minor >= 0),
  limit_minor bigint NOT NULL DEFAULT 0 CHECK (limit_minor >= 0),
  essential boolean NOT NULL DEFAULT false,
  color varchar(9),
  display_order smallint NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, code)
);

CREATE INDEX budget_categories_user_order_idx
  ON budget_categories(user_id, display_order, code);

COMMENT ON TABLE financial_profiles IS 'Données explicites utilisées par le moteur budgétaire déterministe.';
COMMENT ON TABLE budget_categories IS 'Plafonds et consommation par catégorie. Les conversations du coach ne sont pas persistées par défaut.';
