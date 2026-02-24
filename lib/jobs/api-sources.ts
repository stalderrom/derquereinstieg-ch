// API-Integration: Adzuna (primär) + JSearch/RapidAPI (sekundär)
//
// Minimaler API-Verbrauch:
// - Pro Suchbegriff wird der Timestamp des letzten erfolgreichen Scans gelesen.
// - Adzuna erhält `created_after` (Unix-Sekunden) → gibt nur NEU veröffentlichte
//   Stellen zurück. Bereits importierte Stellen kosten keinen einzigen Call.
// - Zweite Sicherheitslage: source_url UNIQUE im DB verhindert Duplikate,
//   falls Adzuna doch etwas doppelt zurückgibt.

import axios from 'axios'
import { detectCanton, cantonToRegion } from './geo'
import { createJob, logApiFetch, getLastFetchTime } from './storage'

const SEARCH_TERMS = [
  'quereinsteiger',
  'quereinstieg',
  'ohne erfahrung',
]

const FILTER_KEYWORDS = [
  'quereinsteiger', 'quereinstieg', 'quer einsteiger', 'quer einstieg',
  'berufswechsel', 'neueinsteiger', 'ohne erfahrung', 'keine erfahrung',
  'umsatteln', 'umschulung', 'branchenwechsel', 'berufsumstieg',
  'auch ohne', 'willkommen auch', 'offen für quereinsteiger',
]

function passesKeywordFilter(title: string, description: string): boolean {
  const text = (title + ' ' + description).toLowerCase()
  return FILTER_KEYWORDS.some(k => text.includes(k))
}

interface ApiJob {
  title: string
  company: string
  location: string
  description: string
  url: string
  posted_at: string | null
}

// ─── Adzuna ───────────────────────────────────────────────────────────────────

async function fetchAdzuna(
  term: string,
  createdAfter: Date | null
): Promise<{ jobs: ApiJob[]; callsUsed: number; skipped: boolean }> {
  const appId = process.env.ADZUNA_APP_ID
  const appKey = process.env.ADZUNA_APP_KEY
  if (!appId || !appKey) return { jobs: [], callsUsed: 0, skipped: true }

  const params: Record<string, string | number> = {
    app_id: appId,
    app_key: appKey,
    what: term,
    results_per_page: 50,
  }

  // Nur Stellen abrufen, die nach dem letzten Scan veröffentlicht wurden
  if (createdAfter) {
    params.created_after = Math.floor(createdAfter.getTime() / 1000)
  }

  const { data } = await axios.get(
    'https://api.adzuna.com/v1/api/jobs/ch/search/1',
    { params, timeout: 15_000 }
  )

  // Wenn Adzuna 0 neue Stellen hat, kostet das trotzdem 1 Call — aber das ist
  // unvermeidlich. Entscheidend: wir schicken nie mehr als 1 Call pro Term.
  const count: number = data.count ?? 0
  if (count === 0) return { jobs: [], callsUsed: 1, skipped: true }

  const raw: ApiJob[] = (data.results ?? []).map((r: Record<string, unknown>) => ({
    title: (r.title as string) ?? '',
    company: (r.company as { display_name?: string })?.display_name ?? 'Unbekannt',
    location: (r.location as { display_name?: string })?.display_name ?? '',
    description: (r.description as string) ?? '',
    url: (r.redirect_url as string) ?? '',
    posted_at: (r.created as string) ?? null,
  }))

  const jobs = raw.filter(j => passesKeywordFilter(j.title, j.description))
  return { jobs, callsUsed: 1, skipped: false }
}

// ─── JSearch / RapidAPI ───────────────────────────────────────────────────────

async function fetchJSearch(
  term: string,
  createdAfter: Date | null
): Promise<{ jobs: ApiJob[]; callsUsed: number; skipped: boolean }> {
  const rapidKey = process.env.RAPIDAPI_KEY
  if (!rapidKey) return { jobs: [], callsUsed: 0, skipped: true }

  const params: Record<string, string | number> = {
    query: `${term} Schweiz`,
    num_pages: 1,
  }

  // JSearch unterstützt kein `created_after` — wir filtern nachträglich
  // anhand des `job_posted_at_datetime_utc`-Felds.
  const { data } = await axios.get('https://jsearch.p.rapidapi.com/search', {
    params,
    headers: {
      'X-RapidAPI-Key': rapidKey,
      'X-RapidAPI-Host': 'jsearch.p.rapidapi.com',
    },
    timeout: 15_000,
  })

  const raw: ApiJob[] = (data.data ?? []).map((r: Record<string, unknown>) => ({
    title: (r.job_title as string) ?? '',
    company: (r.employer_name as string) ?? 'Unbekannt',
    location: `${r.job_city ?? ''} ${r.job_country ?? ''}`.trim(),
    description: (r.job_description as string) ?? '',
    url: (r.job_apply_link as string) ?? '',
    posted_at: r.job_posted_at_datetime_utc ? String(r.job_posted_at_datetime_utc) : null,
  }))

  // Nachträglicher Zeitfilter (da kein API-Parameter verfügbar)
  const filtered = raw.filter(j => {
    if (createdAfter && j.posted_at) {
      return new Date(j.posted_at) > createdAfter
    }
    return true
  })

  const jobs = filtered.filter(j => passesKeywordFilter(j.title, j.description))
  return { jobs, callsUsed: 1, skipped: jobs.length === 0 }
}

// ─── Main export ─────────────────────────────────────────────────────────────

export async function fetchFromApis(): Promise<{
  added: number
  skipped: number
  apiCallsUsed: number
  details: { term: string; fetched: number; added: number; createdAfter: string | null }[]
}> {
  let added = 0
  let skipped = 0
  let apiCallsUsed = 0
  const details = []

  for (const term of SEARCH_TERMS) {
    // Letzten Scan-Zeitpunkt laden → wird als `created_after` an Adzuna übergeben
    const lastFetch = await getLastFetchTime('adzuna', term)

    const [adzunaRes, jsearchRes] = await Promise.allSettled([
      fetchAdzuna(term, lastFetch),
      fetchJSearch(term, lastFetch),
    ])

    const allJobs: ApiJob[] = []

    if (adzunaRes.status === 'fulfilled') {
      allJobs.push(...adzunaRes.value.jobs)
      apiCallsUsed += adzunaRes.value.callsUsed
    } else {
      console.error('[api-sources] Adzuna error:', adzunaRes.reason)
    }

    if (jsearchRes.status === 'fulfilled') {
      allJobs.push(...jsearchRes.value.jobs)
      apiCallsUsed += jsearchRes.value.callsUsed
    } else {
      console.error('[api-sources] JSearch error:', jsearchRes.reason)
    }

    let newAdded = 0
    for (const job of allJobs) {
      if (!job.url) continue
      // Lokation aus location + title + description (Adzuna/JSearch liefern oft PLZ in description)
      const canton = detectCanton(job.location, job.title, job.description)
      const region = cantonToRegion(canton)

      const result = await createJob({
        title: job.title,
        company: job.company,
        location: job.location,
        canton,
        region,
        description: job.description,
        source_url: job.url,
        source_name: 'adzuna',
        source_id: null,
        keywords: FILTER_KEYWORDS.filter(k =>
          (job.title + ' ' + job.description).toLowerCase().includes(k)
        ),
        is_active: true,
        posted_at: job.posted_at,
        removed_at: null,
      })

      if (result) { added++; newAdded++ }
      else skipped++
    }

    // Log nur wenn tatsächlich ein Call gemacht wurde
    if (apiCallsUsed > 0) {
      await logApiFetch({
        api_name: 'adzuna',
        search_term: term,
        results_found: allJobs.length,
        new_jobs_added: newAdded,
        api_calls_used: apiCallsUsed,
        skipped: allJobs.length === 0,
      })
    }

    details.push({
      term,
      fetched: allJobs.length,
      added: newAdded,
      createdAfter: lastFetch?.toISOString() ?? null,
    })
  }

  return { added, skipped, apiCallsUsed, details }
}
