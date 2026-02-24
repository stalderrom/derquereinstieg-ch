-- Migration: dedup_key für stellenanzeigen
-- Ausführen im Supabase SQL-Editor: https://app.supabase.com → SQL Editor

-- 1. Spalte hinzufügen (nullable, damit bestehende Zeilen nicht brechen)
ALTER TABLE stellenanzeigen
  ADD COLUMN IF NOT EXISTS dedup_key text;

-- 2. Partieller Unique-Index: nur Zeilen mit gesetztem dedup_key sind unique
--    → bestehende NULL-Zeilen blockieren nichts, bis der Backfill läuft
CREATE UNIQUE INDEX IF NOT EXISTS stellenanzeigen_dedup_key_uidx
  ON stellenanzeigen(dedup_key)
  WHERE dedup_key IS NOT NULL;

-- Index für schnelle Lookup-Abfragen
CREATE INDEX IF NOT EXISTS idx_stellenanzeigen_dedup_key
  ON stellenanzeigen(dedup_key);
