// Dedizierte Scraper für DB-Portal-Quellen (Typ "portal")
// Ergänzt portal-scraper.ts für branchenspezifische Jobbörsen:
//   myjob.ch, sozjobs.ch, publicjobs.ch, workpool-jobs.ch
// jobs.admin.ch wird übersprungen (reine JS-SPA mit Auth-Anforderung)

import axios from 'axios'
import * as cheerio from 'cheerio'
import { extractJsonVar } from './portal-scraper'
import { detectCanton, cantonToRegion } from './geo'
import { createJob } from './storage'
import { cleanJobTitle } from './title-cleaner'
import type { JobSource } from '@/types/database'

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

// Keyword-Filter: Nur Stellen mit Quereinsteiger-Bezug übernehmen
// (wird für Portale verwendet, die nicht bereits via ?q= vorfiltern)
const PORTAL_KEYWORDS = [
  'quereinstieg', 'quereinsteiger', 'quereinstiegerin',
  'berufswechsel', 'berufsumstieg', 'umschulung',
  'seiteneinstieg', 'seiteneinsteiger',
  'ohne berufserfahrung', 'keine berufserfahrung',
  'ohne ausbildung', 'offene stelle',
  'neustart', 'neueinsteiger',
]

function passesKeywordFilter(title: string, description?: string): boolean {
  const text = `${title} ${description ?? ''}`.toLowerCase()
  return PORTAL_KEYWORDS.some(kw => text.includes(kw))
}

// Slug für myjob.ch URL-Aufbau (Umlaute + Sonderzeichen → ASCII-Bindestrich)
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// ─── myjob.ch ─────────────────────────────────────────────────────────────────
// Sucht via ?q=quereinsteiger — vorab gefiltert, kein Keyword-Filter nötig.
// Extraktion: __PRELOADED_STATE__ JSON im HTML.

interface MyJobItem {
  id: string | number
  title?: string
  company?: { name?: string }
  workplaceCity?: string
  dateStart?: string
}

interface MyJobState {
  vacancySearch?: {
    data?: {
      items?: MyJobItem[]
    }
  }
}

async function scrapeMyJob(source: JobSource): Promise<{ added: number; skipped: number }> {
  let added = 0
  let skipped = 0

  try {
    const { data: html } = await axios.get<string>(
      'https://www.myjob.ch/job/alle-jobs?q=quereinsteiger',
      { timeout: 15_000, headers: { 'User-Agent': UA } }
    )

    const state = extractJsonVar(html, '__PRELOADED_STATE__') as MyJobState | null
    const items = state?.vacancySearch?.data?.items ?? []

    if (items.length === 0) {
      console.warn('[db-portal-scraper] myjob.ch: keine Items in __PRELOADED_STATE__')
    }

    for (const item of items) {
      const id = String(item.id ?? '')
      const rawTitle = item.title ?? ''
      if (!id || !rawTitle) continue

      const title = cleanJobTitle(rawTitle)
      const company = item.company?.name ?? 'Unbekannt'
      const location = item.workplaceCity ?? ''
      const canton = detectCanton(location, title)
      const region = cantonToRegion(canton)
      const url = `https://www.myjob.ch/job/${slugify(rawTitle)}/${id}`

      const result = await createJob({
        title,
        company,
        location,
        canton,
        region,
        description: '',
        source_url: url,
        source_name: source.name,
        source_id: null,
        keywords: [],
        is_active: true,
        posted_at: item.dateStart ?? null,
        removed_at: null,
      })

      if (result) added++
      else skipped++
    }
  } catch (err) {
    console.error('[db-portal-scraper] myjob.ch Fehler:', err)
  }

  console.log(`[db-portal-scraper] myjob.ch: added=${added} skipped=${skipped}`)
  return { added, skipped }
}

// ─── sozjobs.ch ───────────────────────────────────────────────────────────────
// Sucht via ?search=quereinsteiger — Cheerio HTML-Extraktion.
// Job-Links: a[href] mit Pfad-Muster /job/.../J\d+
// Keyword-Filter: sozjobs kann allgemeine Pflege-Jobs zurückgeben

async function scrapeSozJobs(source: JobSource): Promise<{ added: number; skipped: number }> {
  let added = 0
  let skipped = 0

  try {
    const { data: html } = await axios.get<string>(
      'https://www.sozjobs.ch/suche?search=quereinsteiger',
      { timeout: 15_000, headers: { 'User-Agent': UA } }
    )

    const $ = cheerio.load(html)
    const seen = new Set<string>()

    // Collect matching jobs first (cheerio .each ist synchron)
    const jobsToInsert: { title: string; company: string; location: string; url: string }[] = []

    $('a[href]').each((_, el) => {
      const href = $(el).attr('href') ?? ''
      if (!/\/job\/[^/]+\/J\d+/i.test(href)) return

      const url = href.startsWith('http') ? href : `https://www.sozjobs.ch${href}`
      if (seen.has(url)) return
      seen.add(url)

      const rawTitle = $(el).text().trim() || $(el).attr('title')?.trim() || ''
      const title = cleanJobTitle(rawTitle)
      if (!title || title.length < 5) return
      if (!passesKeywordFilter(title)) return

      // Firma + Ort aus benachbarten Elementen (Eltern-Container)
      const container = $(el).closest('article, li, .job-item, [class*="job"]')
      const company = container.find('[class*="company"], [class*="employer"], [class*="firma"]').first().text().trim() || 'Unbekannt'
      const location = container.find('[class*="location"], [class*="ort"], [class*="city"]').first().text().trim() || ''

      jobsToInsert.push({ title, company, location, url })
    })

    for (const job of jobsToInsert) {
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
        source_name: source.name,
        source_id: null,
        keywords: [],
        is_active: true,
        posted_at: null,
        removed_at: null,
      })

      if (result) added++
      else skipped++
    }
  } catch (err) {
    console.error('[db-portal-scraper] sozjobs.ch Fehler:', err)
  }

  console.log(`[db-portal-scraper] sozjobs.ch: added=${added} skipped=${skipped}`)
  return { added, skipped }
}

// ─── publicjobs.ch ────────────────────────────────────────────────────────────
// SvelteKit SSR: Job-Daten sind in einem <script>-Tag mit JSON eingebettet.
// Erkennungsmerkmal: enthält "contactCompany" (Arbeitgeber-Feld)

interface PublicJobRaw {
  title?: string
  contactCompany?: string
  workingAddressCity?: string
  workingAddressRegion?: string  // Kanton-Kürzel, z.B. "ZH"
  path?: string
  publicFrom?: string
}

async function scrapePublicJobs(source: JobSource): Promise<{ added: number; skipped: number }> {
  let added = 0
  let skipped = 0

  try {
    const { data: html } = await axios.get<string>(
      'https://www.publicjobs.ch/jobs',
      { timeout: 15_000, headers: { 'User-Agent': UA } }
    )

    const $ = cheerio.load(html)

    // SvelteKit bettet Daten in <script type="application/json"> oder normale <script>-Tags ein
    let jobItems: PublicJobRaw[] = []

    $('script').each((_, el) => {
      const content = $(el).html() ?? ''
      if (!content.includes('contactCompany')) return

      // Versuche als reines JSON (SvelteKit data-Script)
      try {
        const parsed = JSON.parse(content)
        // Pfad: data.jobSearch.data[] oder ähnlich
        const items = parsed?.data?.jobSearch?.data ?? parsed?.jobSearch?.data ?? parsed?.data ?? []
        if (Array.isArray(items) && items.length > 0) {
          jobItems = items as PublicJobRaw[]
          return false // break .each()
        }
        // Flaches Array direkt
        if (Array.isArray(parsed) && parsed[0]?.contactCompany !== undefined) {
          jobItems = parsed as PublicJobRaw[]
          return false
        }
      } catch { /* kein reines JSON — versuche Variablen-Extraktion */ }

      // Variablen-Muster: window.__data = {...} oder ähnlich
      const varMatch = content.match(/(?:window\.__\w+|__data|__props)\s*=\s*(\{[\s\S]*\})/)
      if (varMatch) {
        try {
          const obj = JSON.parse(varMatch[1])
          const items = obj?.data?.jobSearch?.data ?? obj?.jobSearch?.data ?? []
          if (Array.isArray(items)) jobItems = items as PublicJobRaw[]
        } catch { /* ignorieren */ }
      }
    })

    if (jobItems.length === 0) {
      console.warn('[db-portal-scraper] publicjobs.ch: keine Job-Items gefunden')
    }

    for (const item of jobItems) {
      const rawTitle = item.title ?? ''
      if (!rawTitle) continue

      const title = cleanJobTitle(rawTitle)
      if (!passesKeywordFilter(title)) continue

      const company = item.contactCompany ?? 'Unbekannt'
      const city = item.workingAddressCity ?? ''
      const regionHint = item.workingAddressRegion ?? ''  // Kanton-Kürzel
      const location = [city, regionHint].filter(Boolean).join(', ')

      // workingAddressRegion ist oft direkt das Kanton-Kürzel
      const canton = detectCanton(regionHint, city, title)
      const region = cantonToRegion(canton)

      const path = item.path ?? ''
      const url = path.startsWith('http') ? path : `https://www.publicjobs.ch${path}`

      const result = await createJob({
        title,
        company,
        location,
        canton,
        region,
        description: '',
        source_url: url,
        source_name: source.name,
        source_id: null,
        keywords: [],
        is_active: true,
        posted_at: item.publicFrom ?? null,
        removed_at: null,
      })

      if (result) added++
      else skipped++
    }
  } catch (err) {
    console.error('[db-portal-scraper] publicjobs.ch Fehler:', err)
  }

  console.log(`[db-portal-scraper] publicjobs.ch: added=${added} skipped=${skipped}`)
  return { added, skipped }
}

// ─── workpool-jobs.ch ─────────────────────────────────────────────────────────
// Cheerio HTML-Extraktion mit Pagination (&seite=N, bis 3 Seiten)

const MAX_WORKPOOL_PAGES = 3

async function scrapeWorkpoolPage(pageNum: number): Promise<{
  title: string; company: string; location: string; url: string; date: string | null
}[]> {
  const pageParam = pageNum === 1 ? '' : `&seite=${pageNum}`
  const url = `https://www.workpool-jobs.ch/jobs?was=quereinsteiger${pageParam}`

  try {
    const { data: html } = await axios.get<string>(url, {
      timeout: 15_000,
      headers: { 'User-Agent': UA },
    })

    const $ = cheerio.load(html)
    const jobs: { title: string; company: string; location: string; url: string; date: string | null }[] = []

    $('.job-card, [class*="job-card"], article[class*="job"]').each((_, el) => {
      const titleEl = $(el).find('.job-title a, [class*="job-title"] a, h2 a, h3 a').first()
      const rawTitle = titleEl.text().trim() || $(el).find('h2, h3').first().text().trim()
      const href = titleEl.attr('href') ?? $(el).find('a').first().attr('href') ?? ''

      if (!rawTitle || !href) return

      const jobUrl = href.startsWith('http') ? href : `https://www.workpool-jobs.ch${href}`
      const company = $(el).find('.company-name, [class*="company"]').first().text().trim() || 'Unbekannt'
      const location = $(el).find('.location, [class*="location"], [class*="ort"]').first().text().trim() || ''
      const date = $(el).find('.date, [class*="date"], time').first().text().trim() || null

      jobs.push({ title: rawTitle, company, location, url: jobUrl, date })
    })

    return jobs
  } catch (err) {
    console.warn(`[db-portal-scraper] workpool-jobs.ch Seite ${pageNum} Fehler:`, err)
    return []
  }
}

async function scrapeWorkpool(source: JobSource): Promise<{ added: number; skipped: number }> {
  let added = 0
  let skipped = 0
  const seen = new Set<string>()

  for (let page = 1; page <= MAX_WORKPOOL_PAGES; page++) {
    if (page > 1) await new Promise(r => setTimeout(r, 300))

    const rawJobs = await scrapeWorkpoolPage(page)
    if (rawJobs.length === 0) break

    for (const raw of rawJobs) {
      if (seen.has(raw.url)) continue
      seen.add(raw.url)

      const title = cleanJobTitle(raw.title)
      if (!title || title.length < 5) continue
      if (!passesKeywordFilter(title)) continue

      const canton = detectCanton(raw.location, title)
      const region = cantonToRegion(canton)

      const result = await createJob({
        title,
        company: raw.company,
        location: raw.location,
        canton,
        region,
        description: '',
        source_url: raw.url,
        source_name: source.name,
        source_id: null,
        keywords: [],
        is_active: true,
        posted_at: raw.date,
        removed_at: null,
      })

      if (result) added++
      else skipped++
    }
  }

  console.log(`[db-portal-scraper] workpool-jobs.ch: added=${added} skipped=${skipped}`)
  return { added, skipped }
}

// ─── Dispatcher ───────────────────────────────────────────────────────────────

export async function scrapePortalSource(source: JobSource): Promise<{ added: number; skipped: number }> {
  let hostname: string
  try {
    hostname = new URL(source.url).hostname.replace(/^www\./, '')
  } catch {
    console.warn(`[db-portal-scraper] Ungültige URL für Source "${source.name}": ${source.url}`)
    return { added: 0, skipped: 0 }
  }

  if (hostname.includes('myjob.ch')) return scrapeMyJob(source)
  if (hostname.includes('sozjobs.ch')) return scrapeSozJobs(source)
  if (hostname.includes('publicjobs.ch')) return scrapePublicJobs(source)
  if (hostname.includes('workpool-jobs.ch')) return scrapeWorkpool(source)

  if (hostname.includes('jobs.admin.ch')) {
    console.warn(`[db-portal-scraper] jobs.admin.ch übersprungen (JS-SPA + Auth erforderlich)`)
    return { added: 0, skipped: 0 }
  }

  console.warn(`[db-portal-scraper] Kein dedizierter Scraper für "${hostname}" — übersprungen`)
  return { added: 0, skipped: 0 }
}
