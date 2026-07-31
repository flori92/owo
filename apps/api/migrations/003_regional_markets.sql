ALTER TABLE app_users
  ADD COLUMN country_code char(2) NOT NULL DEFAULT 'CM',
  ADD COLUMN region_code varchar(8) NOT NULL DEFAULT 'CEMAC',
  ADD COLUMN preferred_currency char(3) NOT NULL DEFAULT 'XAF',
  ADD CONSTRAINT app_users_country_code_check CHECK (country_code IN ('CM', 'BJ', 'CI', 'SN')),
  ADD CONSTRAINT app_users_region_code_check CHECK (region_code IN ('CEMAC', 'UEMOA')),
  ADD CONSTRAINT app_users_preferred_currency_check CHECK (preferred_currency IN ('XAF', 'XOF')),
  ADD CONSTRAINT app_users_market_currency_check CHECK (
    (region_code = 'CEMAC' AND preferred_currency = 'XAF') OR
    (region_code = 'UEMOA' AND preferred_currency = 'XOF')
  );

ALTER TABLE financial_profiles
  DROP CONSTRAINT financial_profiles_currency_check,
  ADD CONSTRAINT financial_profiles_currency_check CHECK (currency IN ('XAF', 'XOF'));

COMMENT ON COLUMN app_users.country_code IS 'Marché réglementaire actif au format ISO 3166-1 alpha-2.';
COMMENT ON COLUMN app_users.preferred_currency IS 'Devise ISO du marché actif, XAF pour la CEMAC ou XOF pour l’UEMOA.';

