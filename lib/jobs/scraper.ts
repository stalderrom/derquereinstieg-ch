// Karriereseiten-Scraping: JSON-LD + Link-Extraktion

import axios from 'axios'
import * as cheerio from 'cheerio'
import { detectCanton, cantonToRegion } from './geo'
import { createJob } from './storage'
import type { JobSource } from '@/types/database'

const QUEREINSTEIGER_KEYWORDS = [
  'quereinsteiger', 'quereinstieg', 'quer einsteiger', 'quer einstieg',
  'berufswechsel', 'umsatteln', 'umschulung', 'keine erfahrung',
  'auch ohne erfahrung', 'branchenwechsel', 'neueinsteiger',
  'berufsumstieg', 'willkommen auch', 'offen für',
]

interface ScrapedJob {
  title: string
  company: string
  location: string
  description: string
  source_url: string
}

function containsQuereinsteiger(text: string): boolean {
  const lower = text.toLowerCase()
  return QUEREINSTEIGER_KEYWORDS.some(k => lower.includes(k))
}

// Phase 1: Extract jobs from JSON-LD structured data
function extractJsonLdJobs($: cheerio.CheerioAPI, pageUrl: string): ScrapedJob[] {
  const jobs: ScrapedJob[] = []

  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const raw = $(el).html()
      if (!raw) return
      const parsed = JSON.parse(raw)
      const items = Array.isArray(parsed) ? parsed : [parsed]

      for (const item of items) {
        if (item['@type'] !== 'JobPosting') continue
        const title = item.title ?? ''
        const company = item.hiringOrganization?.name ?? ''
        const location =
          item.jobLocation?.address?.addressLocality ??
          item.jobLocation?.address?.addressRegion ??
          ''
        const description = item.description ?? ''
        const url = item.url ?? pageUrl

        if (!title || !company) continue
        jobs.push({ title, company, location, description, source_url: url })
      }
    } catch {
      // malformed JSON-LD — skip
    }
  })

  return jobs
}

// Extracts a location hint from URL path (e.g. /location/zuerich → "zuerich")
function locationFromUrl(url: string): string {
  const m = url.match(/\/location\/([^/?#]+)/)
  if (m) return m[1].replace(/-/g, ' ')  // "la-chaux-de-fonds" → "la chaux de fonds"
  return ''
}

// Phase 1.5: Erkennt Seiten die Jobs in vielen Städten auflisten (z.B. /location/[city]-Muster).
// Statt 100 Einzelseiten zu besuchen, extrahiert diese Funktion alle Jobs direkt von der
// Übersichtsseite — viel schneller und zuverlässiger.
function extractLocationListJobs(
  $: cheerio.CheerioAPI,
  pageUrl: string,
  companyName: string
): ScrapedJob[] {
  const seen = new Set<string>()
  const jobs: ScrapedJob[] = []

  // Beschreibung aus der Übersichtsseite (enthält "Quereinstieg" im Breadcrumb/H1)
  const overviewDescription = $('body').text().slice(0, 2000)

  // Fallback-Titel: Stellenbezeichnung aus dem ersten Link-Text oder H1
  const fallbackTitle = $('h1').first().text().trim()

  $('a[href]').each((_, el) => {
    const href = $(el).attr('href') ?? ''
    const locMatch = href.match(/\/location\/([^/?#]+)/)
    if (!locMatch) return

    let absolute: string
    try { absolute = new URL(href, pageUrl).toString() } catch { return }

    if (seen.has(absolute)) return
    seen.add(absolute)

    const city = locMatch[1].replace(/-/g, ' ')

    // Link-Text enthält oft den Ortsnamen mit korrekten Umlauten (z.B. "Zürich", "Küssnacht").
    // Wenn er kurz genug ist (<= 40 Zeichen), nehmen wir ihn als Ortsbezeichnung;
    // sonst verwenden wir den URL-Slug.
    const linkText = $(el).text().replace(/\s+/g, ' ').trim()
    const cityLabel = linkText.length > 0 && linkText.length <= 40 ? linkText : city

    // Titel = H1 + Ort → jede Stadt erhält einen eindeutigen dedup_key.
    // Fallback: nur Link-Text wenn H1 fehlt.
    const title = fallbackTitle ? `${fallbackTitle} – ${cityLabel}` : cityLabel

    if (!title) return

    jobs.push({
      title,
      company: companyName,
      location: city,
      description: overviewDescription,
      source_url: absolute,
    })
  })

  // Nur zurückgeben wenn mindestens 3 Stadt-Links gefunden → echtes Locations-Muster
  return jobs.length >= 3 ? jobs : []
}

// Phase 2: Find job-detail links on career pages
function extractJobLinks($: cheerio.CheerioAPI, baseUrl: string): string[] {
  const links: string[] = []
  const jobPatterns = [
    /\bjob(s)?\b/i, /\bstellen?\b/i, /\bcareer(s)?\b/i,
    /\bvacanci/i, /\boffene[-_]?stelle/i, /\barbeitsplatz/i,
  ]

  $('a[href]').each((_, el) => {
    const href = $(el).attr('href') ?? ''
    const text = $(el).text().toLowerCase()
    if (jobPatterns.some(p => p.test(href) || p.test(text))) {
      try {
        const absolute = new URL(href, baseUrl).toString()
        if (absolute.startsWith('http')) links.push(absolute)
      } catch {
        // relative link conversion failed
      }
    }
  })

  return [...new Set(links)].slice(0, 150)
}

// Erkennt JavaScript-gerenderte Seiten (SPAs) die ohne Browser-JS keine Inhalte zeigen.
// Heuristiken: sehr wenig sichtbarer Text, typische SPA-Platzhalter, leere body-Elemente.
function isJsRendered($: cheerio.CheerioAPI): boolean {
  const bodyText = $('body').text().replace(/\s+/g, ' ').trim()
  // Weniger als 200 Zeichen sichtbarer Text → wahrscheinlich leere SPA-Shell
  if (bodyText.length < 200) return true
  // Template-Platzhalter (z.B. ERB-Syntax, Handlebars, Mustache, SuccessFactors)
  if (/<%[-=]?\s*\w/.test($('body').html() ?? '')) return true
  // Typische "Loading..." / "JavaScript required" Hinweise
  if (/javascript (ist |is )?(erforderlich|required|aktiviert|enabled)/i.test(bodyText)) return true
  return false
}

// Scrape a single page for jobs
async function scrapePage(url: string, companyName: string): Promise<ScrapedJob[] | 'js-rendered'> {
  const { data: html } = await axios.get<string>(url, {
    timeout: 10_000,
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; DQScraperBot/1.0)' },
  })
  const $ = cheerio.load(html)

  // Frühzeitig erkennen wenn die Seite JavaScript benötigt
  if (isJsRendered($)) return 'js-rendered'

  // Phase 1: JSON-LD
  const jsonLdJobs = extractJsonLdJobs($, url)
  if (jsonLdJobs.length > 0) return jsonLdJobs

  // Phase 1.5: Location-Listen-Muster (/location/[city]) — direkt von der Übersichtsseite
  const locationListJobs = extractLocationListJobs($, url, companyName)
  if (locationListJobs.length > 0) return locationListJobs

  // Phase 2: Scan linked pages for JSON-LD
  const links = extractJobLinks($, url)
  const found: ScrapedJob[] = []

  for (const link of links) {
    try {
      const { data: detailHtml } = await axios.get<string>(link, {
        timeout: 8_000,
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; DQScraperBot/1.0)' },
      })
      const $d = cheerio.load(detailHtml)
      const ldJobs = extractJsonLdJobs($d, link)
      if (ldJobs.length > 0) {
        found.push(...ldJobs)
      } else {
        // Fallback: try to extract title + text from page
        const title = $d('h1').first().text().trim()
        const body = $d('body').text()
        if (title && containsQuereinsteiger(body)) {
          found.push({
            title,
            company: companyName,
            location: locationFromUrl(link),
            description: body.slice(0, 500),
            source_url: link,
          })
        }
      }
    } catch {
      // network error on detail page — skip
    }
  }

  return found
}

// Main: scrape a job source and persist new jobs
export async function scrapeCareerPage(
  source: JobSource
): Promise<{ added: number; skipped: number; warning?: string }> {
  let added = 0
  let skipped = 0

  try {
    const result = await scrapePage(source.url, source.name)

    if (result === 'js-rendered') {
      return { added: 0, skipped: 0, warning: 'JavaScript-gerenderte Seite — nicht scrapbar ohne Headless Browser (z.B. SuccessFactors, Workday, Greenhouse)' }
    }

    const jobs = result
    const filtered = jobs.filter(j =>
      containsQuereinsteiger(j.title + ' ' + j.description)
    )

    for (const job of filtered) {
      const canton = detectCanton(job.location)
      const region = cantonToRegion(canton)

      const result = await createJob({
        title: job.title,
        company: job.company,
        location: job.location,
        canton,
        region,
        description: job.description,
        source_url: job.source_url,
        source_name: source.name,
        source_id: source.id,
        keywords: QUEREINSTEIGER_KEYWORDS.filter(k =>
          (job.title + ' ' + job.description).toLowerCase().includes(k)
        ),
        is_active: true,
        posted_at: null,
        removed_at: null,
      })

      if (result) {
        added++
      } else {
        skipped++
      }
    }
  } catch (err) {
    console.error(`[scraper] Error scraping ${source.url}:`, err)
  }

  return { added, skipped }
}
