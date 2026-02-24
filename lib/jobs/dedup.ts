// Duplikat-Erkennung für Stellenanzeigen
//
// Zwei Inserate gelten als dasselbe wenn:
//   normalize(title) + normalize(company) + canton  identisch sind.
//
// Unterschiedlicher Kanton = eigenständiges Inserat (z.B. Pflegefachperson
// in Zürich vs. Pflegefachperson in Bern sind zwei verschiedene Stellen).

import { createClient } from '@/lib/supabase/server'
import { cantonToRegion } from './geo'

// ─── Normalisierung ───────────────────────────────────────────────────────────

function normalizeForDedup(s: string): string {
  return s
    .toLowerCase()
    // Geschlechtsangaben: (m/w/d), (w/m/d), (m/f/d), (all genders) …
    .replace(/\(\s*[mwfd]\s*[/|\\]\s*[mwfd]\s*(?:[/|\\]\s*[mwfd])?\s*\)/gi, '')
    .replace(/\(all genders?\)/gi, '')
    // Pensum / Prozent: (80%), (80-100%), 80%, 80 %
    .replace(/\(?\d{1,3}\s*[-–]\s*\d{1,3}\s*%\)?/g, '')
    .replace(/\(?\d{1,3}\s*%\)?/g, '')
    // Rechtsformen (am Wortende oder alleinstehend)
    .replace(/\b(ag|gmbh|sa|sàrl|sarl|ltd|inc|corp|stiftung|genossenschaft|verein)\b/g, '')
    // Sonderzeichen → Leerzeichen (Umlaute bleiben)
    .replace(/[^a-z0-9äöüàáâéèêëíìîïóòôöúùûü]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

// Öffentlich exportiert für Tests und Storage-Layer
export function computeDedupKey(
  title: string,
  company: string,
  canton: string | null | undefined
): string {
  const t = normalizeForDedup(title)
  const c = normalizeForDedup(company)
  const k = canton?.toUpperCase() ?? 'CH'
  return `${t}|${c}|${k}`
}

// ─── Backfill + Bereinigung ───────────────────────────────────────────────────

interface DedupJob {
  id: string
  title: string
  company: string
  canton: string | null
  description: string | null
  location: string | null
  first_seen_at: string
  dedup_key: string | null
}

// Bewertet ein Inserat — mehr Punkte = vollständiger = bevorzugt behalten
function scoreJob(job: DedupJob): number {
  let score = 0
  if (job.canton) score += 3
  if (job.location) score += 2
  if (job.description && job.description.length > 50) score += 2
  return score
}

export interface DedupResult {
  keysSet: number       // Neue dedup_keys gesetzt
  duplicatesFound: number  // Bestehende Duplikat-Paare gefunden
  deactivated: number   // Minderwertige Duplikate deaktiviert
  errors: number
}

// Lädt alle Inserate, setzt dedup_key wo er fehlt,
// und deaktiviert schlechtere Duplikate bei Kollisionen.
export async function deduplicateJobs(): Promise<DedupResult> {
  const supabase = await createClient()
  const result: DedupResult = { keysSet: 0, duplicatesFound: 0, deactivated: 0, errors: 0 }

  // Alle aktiven Inserate laden (ohne dedup_key oder mit)
  const { data, error } = await supabase
    .from('stellenanzeigen')
    .select('id, title, company, canton, description, location, first_seen_at, dedup_key')
    .eq('is_active', true)

  if (error) throw new Error(error.message)
  const jobs = (data ?? []) as DedupJob[]

  // dedup_key für alle berechnen
  const withKey = jobs.map(j => ({
    ...j,
    computedKey: computeDedupKey(j.title, j.company, j.canton),
  }))

  // Gruppen nach dedup_key
  const groups = new Map<string, typeof withKey>()
  for (const j of withKey) {
    const list = groups.get(j.computedKey) ?? []
    list.push(j)
    groups.set(j.computedKey, list)
  }

  for (const [key, group] of groups) {
    if (group.length === 1) {
      // Kein Duplikat — einfach Key setzen falls noch nicht gesetzt
      const job = group[0]
      if (!job.dedup_key) {
        const { error: upErr } = await supabase
          .from('stellenanzeigen')
          .update({ dedup_key: key })
          .eq('id', job.id)
        if (upErr) { result.errors++; continue }
        result.keysSet++
      }
    } else {
      // Duplikate gefunden: bestes behalten, Rest deaktivieren
      result.duplicatesFound += group.length - 1

      // Sortieren: höchster Score zuerst; bei Gleichstand ältestes (first_seen_at)
      group.sort((a, b) => {
        const scoreDiff = scoreJob(b) - scoreJob(a)
        if (scoreDiff !== 0) return scoreDiff
        return new Date(a.first_seen_at).getTime() - new Date(b.first_seen_at).getTime()
      })

      const [winner, ...losers] = group

      // Winner: dedup_key setzen
      if (!winner.dedup_key || winner.dedup_key !== key) {
        const { error: upErr } = await supabase
          .from('stellenanzeigen')
          .update({ dedup_key: key })
          .eq('id', winner.id)
        if (upErr) { result.errors++; continue }
        result.keysSet++
      }

      // Losers: deaktivieren
      for (const loser of losers) {
        const { error: deactErr } = await supabase
          .from('stellenanzeigen')
          .update({ is_active: false, removed_at: new Date().toISOString() })
          .eq('id', loser.id)
        if (deactErr) { result.errors++ }
        else { result.deactivated++ }
      }
    }
  }

  return result
}
