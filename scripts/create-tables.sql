-- Job-Scraping Tabellen für derquereinstieg.ch
-- Ausführen im Supabase SQL-Editor unter: https://app.supabase.com → SQL Editor

-- ─── 1. job_sources ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS job_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  url text NOT NULL,
  type text NOT NULL DEFAULT 'career',  -- 'career' | 'portal' | 'api'
  is_active boolean NOT NULL DEFAULT true,
  last_scanned_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ─── 2. stellenanzeigen ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS stellenanzeigen (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  company text NOT NULL,
  location text,
  canton text,                           -- 2-Buchstaben-Code (ZH, BE, ...) oder NULL
  region text,                           -- Regionname oder 'unzuordnungsbar'
  description text,
  source_url text NOT NULL UNIQUE,
  source_name text NOT NULL,
  source_id uuid REFERENCES job_sources(id) ON DELETE SET NULL,
  keywords text[],
  is_active boolean NOT NULL DEFAULT true,
  posted_at timestamptz,
  first_seen_at timestamptz NOT NULL DEFAULT now(),
  last_verified_at timestamptz NOT NULL DEFAULT now(),
  removed_at timestamptz
);

-- Index für häufige Abfragen
CREATE INDEX IF NOT EXISTS idx_stellenanzeigen_active ON stellenanzeigen(is_active);
CREATE INDEX IF NOT EXISTS idx_stellenanzeigen_region ON stellenanzeigen(region);
CREATE INDEX IF NOT EXISTS idx_stellenanzeigen_canton ON stellenanzeigen(canton);

-- ─── 3. api_fetch_log ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS api_fetch_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  api_name text NOT NULL,
  search_term text,
  fetched_at timestamptz NOT NULL DEFAULT now(),
  results_found integer NOT NULL DEFAULT 0,
  new_jobs_added integer NOT NULL DEFAULT 0,
  api_calls_used integer NOT NULL DEFAULT 0,
  skipped boolean NOT NULL DEFAULT false
);

-- ─── 4. verification_log ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS verification_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date text NOT NULL UNIQUE,            -- ISO-Datum: '2026-02-22'
  verified integer NOT NULL DEFAULT 0,
  removed integer NOT NULL DEFAULT 0,
  total_active_after integer NOT NULL DEFAULT 0,
  recorded_at timestamptz NOT NULL DEFAULT now()
);
