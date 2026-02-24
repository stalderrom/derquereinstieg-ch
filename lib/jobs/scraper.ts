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

  return [...new Set(links)].slice(0, 20)
}

// Scrape a single page for jobs
async function scrapePage(url: string, companyName: string): Promise<ScrapedJob[]> {
  const { data: html } = await axios.get<string>(url, {
    timeout: 10_000,
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; DQScraperBot/1.0)' },
  })
  const $ = cheerio.load(html)

  // Phase 1: JSON-LD
  const jsonLdJobs = extractJsonLdJobs($, url)
  if (jsonLdJobs.length > 0) return jsonLdJobs

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
            location: '',
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
): Promise<{ added: number; skipped: number }> {
  let added = 0
  let skipped = 0

  try {
    const jobs = await scrapePage(source.url, source.name)
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
