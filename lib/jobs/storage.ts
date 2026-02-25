// Supabase Data-Access Layer für Job-Scraping

import { createClient } from '@/lib/supabase/server'
import type { Stellenanzeige, JobSource, ApiFetchLog, VerificationLog } from '@/types/database'
import { detectCanton, cantonToRegion, type RegionName } from './geo'
import { computeDedupKey } from './dedup'
import { cleanJobTitle } from './title-cleaner'

// ─── Stellenanzeigen ──────────────────────────────────────────────────────────

export async function getJobs(filters?: {
  canton?: string
  region?: string
  source_name?: string
  is_active?: boolean
}): Promise<Stellenanzeige[]> {
  const supabase = await createClient()
  let query = supabase
    .from('stellenanzeigen')
    .select('*')
    .order('first_seen_at', { ascending: false })

  if (filters?.canton) query = query.eq('canton', filters.canton)
  if (filters?.region) query = query.eq('region', filters.region)
  if (filters?.source_name) query = query.eq('source_name', filters.source_name)
  if (filters?.is_active !== undefined) query = query.eq('is_active', filters.is_active)

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function createJob(
  job: Omit<Stellenanzeige, 'id' | 'first_seen_at' | 'last_verified_at' | 'dedup_key'>
): Promise<Stellenanzeige | null> {
  const supabase = await createClient()

  // Dedup-Key berechnen und auf semantische Duplikate prüfen
  const dedupKey = computeDedupKey(job.title, job.company, job.canton)
  const { data: existing } = await supabase
    .from('stellenanzeigen')
    .select('id')
    .eq('dedup_key', dedupKey)
    .eq('is_active', true)
    .limit(1)
    .maybeSingle()

  if (existing) return null // semantisches Duplikat — anderer Quell-URL, gleiche Stelle

  const { data, error } = await supabase
    .from('stellenanzeigen')
    .insert({ ...job, dedup_key: dedupKey })
    .select()
    .single()

  if (error) {
    // Ignore unique constraint violations (duplicate source_url oder dedup_key race condition)
    if (error.code === '23505') return null
    throw new Error(error.message)
  }
  return data
}

export async function reactivateJob(id: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('stellenanzeigen')
    .update({ is_active: true, removed_at: null, last_verified_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw new Error(error.message)
}

export async function deactivateJob(id: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('stellenanzeigen')
    .update({ is_active: false, removed_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw new Error(error.message)
}

export async function deleteJob(id: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('stellenanzeigen')
    .delete()
    .eq('id', id)
  if (error) throw new Error(error.message)
}

export async function updateJobVerified(id: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('stellenanzeigen')
    .update({ last_verified_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw new Error(error.message)
}

export async function getJobsByRegion(): Promise<Record<RegionName, number>> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('stellenanzeigen')
    .select('region')
    .eq('is_active', true)
  if (error) throw new Error(error.message)

  const counts: Record<string, number> = {}
  for (const row of data ?? []) {
    const r = row.region ?? 'unzuordnungsbar'
    counts[r] = (counts[r] ?? 0) + 1
  }
  return counts as Record<RegionName, number>
}

// ─── Job Sources ──────────────────────────────────────────────────────────────

export async function getSources(): Promise<JobSource[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('job_sources')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function createSource(
  source: Omit<JobSource, 'id' | 'created_at' | 'last_scanned_at'>
): Promise<JobSource> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('job_sources')
    .insert(source)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data
}

export async function updateSource(
  id: string,
  updates: Partial<Omit<JobSource, 'id' | 'created_at'>>
): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('job_sources')
    .update(updates)
    .eq('id', id)
  if (error) throw new Error(error.message)
}

export async function deleteSource(id: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('job_sources')
    .delete()
    .eq('id', id)
  if (error) throw new Error(error.message)
}

export async function markSourceScanned(id: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('job_sources')
    .update({ last_scanned_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw new Error(error.message)
}

// ─── Logging ──────────────────────────────────────────────────────────────────

export async function logApiFetch(
  entry: Omit<ApiFetchLog, 'id' | 'fetched_at'>
): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase.from('api_fetch_log').insert(entry)
  if (error) throw new Error(error.message)
}

// Returns the timestamp of the last successful (non-skipped) fetch for a given
// api_name + search_term combination — used to pass `created_after` to Adzuna
// so we only request jobs published after our last scan.
export async function getLastFetchTime(
  apiName: string,
  searchTerm: string
): Promise<Date | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('api_fetch_log')
    .select('fetched_at')
    .eq('api_name', apiName)
    .eq('search_term', searchTerm)
    .eq('skipped', false)
    .order('fetched_at', { ascending: false })
    .limit(1)
    .single()

  if (error || !data) return null
  return new Date(data.fetched_at)
}

export async function getApiFetchLogs(limit = 50): Promise<ApiFetchLog[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('api_fetch_log')
    .select('*')
    .order('fetched_at', { ascending: false })
    .limit(limit)
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function logVerification(
  entry: Omit<VerificationLog, 'id' | 'recorded_at'>
): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('verification_log')
    .upsert(entry, { onConflict: 'date' })
  if (error) throw new Error(error.message)
}

// ─── Garbage-Titel bereinigen ─────────────────────────────────────────────────

// Findet Jobs mit Scraper-Garbage im Titel, versucht den echten Titel zu
// extrahieren und aktualisiert die DB — löscht nur wenn kein Titel übrig bleibt.
export async function cleanupGarbageTitles(): Promise<{
  cleaned: number
  deleted: number
  skipped: number
  log: string[]
}> {
  const supabase = await createClient()
  const { isGarbageTitle } = await import('./title-cleaner')

  // Alle aktiven und inaktiven Jobs laden (Garbage kann überall sein)
  const { data, error } = await supabase
    .from('stellenanzeigen')
    .select('id, title, is_active')

  if (error) throw new Error(error.message)

  let cleaned = 0
  let deleted = 0
  let skipped = 0
  const log: string[] = []

  for (const job of data ?? []) {
    if (!isGarbageTitle(job.title ?? '')) { skipped++; continue }

    const newTitle = cleanJobTitle(job.title ?? '')

    if (newTitle.length >= 8) {
      // Titel konnte gerettet werden → aktualisieren
      const { error: upErr } = await supabase
        .from('stellenanzeigen')
        .update({ title: newTitle })
        .eq('id', job.id)

      if (!upErr) {
        log.push(`✓ "${job.title?.slice(0, 60)}" → "${newTitle}"`)
        cleaned++
      } else {
        skipped++
      }
    } else {
      // Kein verwertbarer Titel — Job löschen
      await supabase.from('stellenanzeigen').delete().eq('id', job.id)
      log.push(`✗ deleted: "${job.title?.slice(0, 80)}"`)
      deleted++
    }
  }

  return { cleaned, deleted, skipped, log }
}

// ─── Re-Geocoding ─────────────────────────────────────────────────────────────

// Läuft durch alle Jobs ohne Kanton-Zuweisung und versucht,
// canton + region aus location + title + description zu ermitteln.
// Gibt zurück wie viele Jobs aktualisiert wurden.
export async function reGeocodeJobs(): Promise<{ updated: number; skipped: number }> {
  const supabase = await createClient()

  // Alle Jobs laden, die keinen Kanton haben (oder null region)
  const { data, error } = await supabase
    .from('stellenanzeigen')
    .select('id, location, title, description')
    .or('canton.is.null,region.eq.unzuordnungsbar')

  if (error) throw new Error(error.message)

  let updated = 0
  let skipped = 0

  for (const job of data ?? []) {
    const canton = detectCanton(job.location, job.title, job.description)
    if (!canton) { skipped++; continue }

    const region = cantonToRegion(canton)
    const { error: upErr } = await supabase
      .from('stellenanzeigen')
      .update({ canton, region })
      .eq('id', job.id)

    if (upErr) { skipped++; continue }
    updated++
  }

  return { updated, skipped }
}

// ─── Stats ────────────────────────────────────────────────────────────────────

export async function getStats() {
  const supabase = await createClient()

  const [totalRes, activeRes, regionRes, sourcesRes] = await Promise.all([
    supabase.from('stellenanzeigen').select('id', { count: 'exact', head: true }),
    supabase
      .from('stellenanzeigen')
      .select('id', { count: 'exact', head: true })
      .eq('is_active', true),
    supabase
      .from('stellenanzeigen')
      .select('region')
      .eq('is_active', true),
    supabase.from('job_sources').select('id', { count: 'exact', head: true }),
  ])

  // Alle 8 Regionen immer anzeigen, auch wenn 0 Jobs vorhanden
  const regionCounts: Record<string, number> = {
    'Zürich': 0, 'Ostschweiz': 0, 'Nordwestschweiz': 0,
    'Bern/Mittelland': 0, 'Zentralschweiz': 0, 'Vaud/Waadt': 0,
    'Wallis': 0, 'Tessin': 0, 'unzuordnungsbar': 0,
  }
  for (const row of regionRes.data ?? []) {
    const r = row.region ?? 'unzuordnungsbar'
    regionCounts[r] = (regionCounts[r] ?? 0) + 1
  }

  return {
    total: totalRes.count ?? 0,
    active: activeRes.count ?? 0,
    sources: sourcesRes.count ?? 0,
    regions: regionCounts,
  }
}
