// Portal-Scraping: jobs.ch (Suche via __INIT__ JSON) + JobScout24

import axios from 'axios'
import * as cheerio from 'cheerio'
import { detectCanton, cantonToRegion } from './geo'
import { createJob } from './storage'
import { cleanJobTitle } from './title-cleaner'

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

// Suchbegriffe für jobs.ch — die Suche ist bereits ein vorfilter,
// alle zurückgegebenen Stellen sind thematisch relevant.
const JOBS_CH_TERMS = ['quereinsteiger', 'quereinstieg']

// Maximale Anzahl Seiten pro Suchbegriff (20 Jobs/Seite)
const MAX_PAGES = 10

// Brace-counter JSON extraction — robuster als Regex bei tief verschachteltem JSON
function extractJsonVar(html: string, varName: string): Record<string, unknown> | null {
  const marker = `${varName} = `
  const start = html.indexOf(marker)
  if (start === -1 || html[start + marker.length] !== '{') return null

  let depth = 0
  let inString = false
  let escape = false

  for (let i = start + marker.length; i < html.length; i++) {
    const c = html[i]
    if (escape) { escape = false; continue }
    if (c === '\\' && inString) { escape = true; continue }
    if (c === '"') { inString = !inString; continue }
    if (inString) continue
    if (c === '{') depth++
    else if (c === '}') {
      depth--
      if (depth === 0) {
        try { return JSON.parse(html.slice(start + marker.length, i + 1)) }
        catch { return null }
      }
    }
  }
  return null
}

interface PortalJob {
  title: string
  company: string
  location: string
  url: string
  posted_at: string | null
  source_name: string
}

interface JobsChRaw {
  id: string
  title: string
  place?: string
  publicationDate?: string
  company?: { name?: string }
}

interface JobsChMain {
  results?: JobsChRaw[]
  meta?: { numPages?: number; totalHits?: number }
}

// ─── jobs.ch ─────────────────────────────────────────────────────────────────
// Sucht direkt nach Quereinsteiger-relevanten Stellen.
// Die Suche filtert vorab — wir übernehmen alle Treffer ohne Nachfilter.
// Paginierung: /de/stellenangebote/{page}/?term={term} (20 Jobs/Seite)

async function scrapeJobsChTerm(term: string): Promise<PortalJob[]> {
  const jobs: PortalJob[] = []

  // Seite 1 abrufen + Seitenanzahl ermitteln
  const firstUrl = `https://www.jobs.ch/de/stellenangebote/?term=${encodeURIComponent(term)}`
  let numPages = 1

  try {
    const { data: html1 } = await axios.get<string>(firstUrl, {
      timeout: 15_000,
      headers: { 'User-Agent': UA },
    })

    const initData = extractJsonVar(html1, '__INIT__')
    if (!initData) {
      console.warn(`[portal-scraper] jobs.ch (${term}): __INIT__ nicht gefunden`)
      return []
    }

    const main = (initData as { vacancy?: { results?: { main?: JobsChMain } } })
      ?.vacancy?.results?.main

    numPages = Math.min(main?.meta?.numPages ?? 1, MAX_PAGES)

    for (const raw of main?.results ?? []) {
      if (raw.id && raw.title) {
        jobs.push({
          title: raw.title,
          company: raw.company?.name ?? 'Unbekannt',
          location: raw.place ?? '',
          url: `https://www.jobs.ch/de/stellenangebote/detail/${raw.id}/`,
          posted_at: raw.publicationDate ?? null,
          source_name: 'jobs.ch',
        })
      }
    }
  } catch (err) {
    console.error(`[portal-scraper] jobs.ch (${term}) Seite 1:`, err)
    return []
  }

  // Restliche Seiten (2..numPages) sequenziell abrufen
  for (let page = 2; page <= numPages; page++) {
    const url = `https://www.jobs.ch/de/stellenangebote/${page}/?term=${encodeURIComponent(term)}`
    try {
      const { data: html } = await axios.get<string>(url, {
        timeout: 15_000,
        headers: { 'User-Agent': UA },
      })

      const initData = extractJsonVar(html, '__INIT__')
      const main = (initData as { vacancy?: { results?: { main?: JobsChMain } } } | null)
        ?.vacancy?.results?.main

      for (const raw of main?.results ?? []) {
        if (raw.id && raw.title) {
          jobs.push({
            title: raw.title,
            company: raw.company?.name ?? 'Unbekannt',
            location: raw.place ?? '',
            url: `https://www.jobs.ch/de/stellenangebote/detail/${raw.id}/`,
            posted_at: raw.publicationDate ?? null,
            source_name: 'jobs.ch',
          })
        }
      }

      // Kurze Pause zwischen Seiten-Requests
      await new Promise(r => setTimeout(r, 300))
    } catch (err) {
      console.warn(`[portal-scraper] jobs.ch (${term}) Seite ${page} übersprungen:`, err)
    }
  }

  return jobs
}

// ─── JobScout24 ───────────────────────────────────────────────────────────────

// Prüft ob ein Titel ein echter Stellentitel ist (keine Buttons, Kategorien, etc.)
function isValidJobTitle(title: string): boolean {
  if (!title || title.length < 8) return false
  const t = title.toLowerCase()
  if (t.includes('@')) return false              // E-Mail-Adresse
  if (t === 'online bewerben') return false      // Bewerbungs-Button
  if (/^tipps?\s+für/.test(t)) return false     // Ratgeber-Links
  if (/^jetzt bewerben/.test(t)) return false   // Bewerbungs-Button
  if (/\bjobs\s*$/.test(t)) return false        // Kategorie-Links wie "Steuerberater Jobs"
  if (/\bstellen\s*$/.test(t)) return false     // Kategorie-Links wie "IT Stellen"
  // Scraper-Garbage-Erkennung (Sicherheitsnetz, falls cleanJobTitle nicht greift)
  if (t.includes('arbeitsort:')) return false
  if (t.includes('pensum:')) return false
  if (t.includes('vertragsart:')) return false
  if (t.includes('ist der job relevant')) return false
  return true
}

// JobScout24 Job-Detail-URLs: /stelle/ + numerische ID (nicht Kategorien unter /jobs/stichwort/)
function isJobDetailUrl(href: string): boolean {
  return /\/stelle\/\d+/i.test(href)
}

interface JobScout24Raw {
  id: string | number
  title: string
  place?: string
  publicationDate?: string
  company?: { name?: string }
}

interface JobScout24Main {
  results?: JobScout24Raw[]
  meta?: { numPages?: number }
}

async function scrapeJobScout24(term: string): Promise<PortalJob[]> {
  const jobs: PortalJob[] = []

  try {
    const { data: html } = await axios.get<string>(
      `https://www.jobscout24.ch/de/jobs/${encodeURIComponent(term)}/`,
      { timeout: 15_000, headers: { 'User-Agent': UA } }
    )

    // Primär: __INIT__ JSON (gleiche Struktur wie jobs.ch, da beide JobCloud)
    const initData = extractJsonVar(html, '__INIT__')
    if (initData) {
      const main = (initData as { vacancy?: { results?: { main?: JobScout24Main } } })
        ?.vacancy?.results?.main
      for (const raw of main?.results ?? []) {
        const id = String(raw.id)
        if (id && raw.title && isValidJobTitle(raw.title)) {
          jobs.push({
            title: raw.title,
            company: raw.company?.name ?? 'Unbekannt',
            location: raw.place ?? '',
            url: `https://www.jobscout24.ch/de/stelle/${id}/`,
            posted_at: raw.publicationDate ?? null,
            source_name: 'jobscout24',
          })
        }
      }
      if (jobs.length > 0) {
        console.log(`[portal-scraper] JobScout24 (${term}): ${jobs.length} via __INIT__`)
        return jobs
      }
    }

    // Fallback: data-cy Selektoren
    const $ = cheerio.load(html)
    $('[data-cy="job-link"]').each((_, el) => {
      const href = $(el).attr('href') ?? ''
      const rawTitle = $(el).find('[data-cy="job-title"], h2, h3').first().text().trim()
        || $(el).attr('title')?.trim() || ''
      const title = cleanJobTitle(rawTitle)
      const company = $(el).find('[data-cy="company-name"]').first().text().trim()
      const location = $(el).find('[data-cy="job-location"]').first().text().trim()

      if (!isValidJobTitle(title) || !isJobDetailUrl(href)) return
      const url = href.startsWith('http') ? href : `https://www.jobscout24.ch${href}`
      jobs.push({ title, company: company || 'Unbekannt', location, url, posted_at: null, source_name: 'jobscout24' })
    })

    // Letzter Fallback: alle Links mit /stelle/NUMMER/ URLs
    if (jobs.length === 0) {
      $('a[href]').each((_, el) => {
        const href = $(el).attr('href') ?? ''
        if (!isJobDetailUrl(href)) return
        const rawTitle = $(el).find('h2, h3').first().text().trim()
          || $(el).attr('title')?.trim() || ''
        const title = cleanJobTitle(rawTitle)
        const company = $(el).find('[class*="company"]').first().text().trim()
        const location = $(el).find('[class*="location"]').first().text().trim()
        if (!isValidJobTitle(title)) return
        const url = href.startsWith('http') ? href : `https://www.jobscout24.ch${href}`
        jobs.push({ title, company: company || 'Unbekannt', location, url, posted_at: null, source_name: 'jobscout24' })
      })
    }
  } catch (err) {
    console.error('[portal-scraper] JobScout24 error:', err)
  }

  return jobs
}

// ─── Main export ─────────────────────────────────────────────────────────────

export async function scrapePortals(): Promise<{
  added: number
  skipped: number
  errors: string[]
  details: { source: string; found: number; added: number }[]
}> {
  let added = 0
  let skipped = 0
  const errors: string[] = []
  const details: { source: string; found: number; added: number }[] = []

  // jobs.ch — pro Suchbegriff paginiert
  const jobsChJobs: PortalJob[] = []
  for (const term of JOBS_CH_TERMS) {
    try {
      const found = await scrapeJobsChTerm(term)
      jobsChJobs.push(...found)
      console.log(`[portal-scraper] jobs.ch (${term}): ${found.length} Stellen gefunden`)
    } catch (err) {
      errors.push(`jobs.ch (${term}): ${String(err)}`)
    }
  }

  // JobScout24 — pro Suchbegriff
  const js24Jobs: PortalJob[] = []
  for (const term of ['quereinsteiger', 'quereinstieg']) {
    try {
      js24Jobs.push(...await scrapeJobScout24(term))
    } catch (err) {
      errors.push(`JobScout24 (${term}): ${String(err)}`)
    }
  }

  // Zusammenführen + Deduplizieren (URL als Schlüssel)
  const allJobs = [...jobsChJobs, ...js24Jobs]
  const seen = new Set<string>()
  const unique = allJobs.filter(j => {
    if (!j.url || seen.has(j.url)) return false
    seen.add(j.url)
    return true
  })

  const perSource: Record<string, { found: number; added: number }> = {
    'jobs.ch': { found: jobsChJobs.length, added: 0 },
    'jobscout24': { found: js24Jobs.length, added: 0 },
  }

  for (const job of unique) {
    // Lokation aus location-Feld + Titel (enthält oft Ortsangaben wie "diverse Standorte, Zürich")
    const canton = detectCanton(job.location, job.title)
    const region = cantonToRegion(canton)

    const result = await createJob({
      title: job.title,
      company: job.company,
      location: job.location,
      canton,
      region,
      description: '',
      source_url: job.url,
      source_name: job.source_name,
      source_id: null,
      keywords: [],
      is_active: true,
      posted_at: job.posted_at,
      removed_at: null,
    })

    if (result) {
      added++
      perSource[job.source_name].added++
    } else {
      skipped++
    }
  }

  for (const [source, counts] of Object.entries(perSource)) {
    details.push({ source, ...counts })
  }

  return { added, skipped, errors, details }
}
