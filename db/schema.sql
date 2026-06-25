CREATE TABLE IF NOT EXISTS subscriptions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  price REAL NOT NULL CHECK (price > 0),
  currency TEXT NOT NULL DEFAULT 'USD',
  billing_cycle TEXT NOT NULL CHECK (billing_cycle IN ('monthly', 'yearly', 'weekly', 'quarterly', 'custom')),
  custom_interval_days INTEGER CHECK (custom_interval_days IS NULL OR custom_interval_days > 0),
  next_billing_date TEXT NOT NULL,
  last_billed_date TEXT,
  payment_method TEXT,
  status TEXT NOT NULL CHECK (status IN ('active', 'cancelled', 'paused')),
  priority INTEGER NOT NULL DEFAULT 0,
  is_unused INTEGER NOT NULL DEFAULT 0,
  trial_start_date TEXT,
  trial_end_date TEXT,
  previous_price REAL,
  price_changed_at TEXT,
  website_url TEXT,
  notes TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_category ON subscriptions(category);
CREATE INDEX IF NOT EXISTS idx_subscriptions_next_billing ON subscriptions(next_billing_date);
CREATE INDEX IF NOT EXISTS idx_subscriptions_priority ON subscriptions(priority);

CREATE TABLE IF NOT EXISTS income_sources (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('salary', 'freelance', 'passive', 'other')),
  amount REAL NOT NULL CHECK (amount > 0),
  currency TEXT NOT NULL DEFAULT 'USD',
  notes TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_income_sources_type ON income_sources(type);
