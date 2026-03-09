/**
 * Headless Scraper für JavaScript-gerenderte Karriereseiten
 * Läuft täglich via GitHub Actions — kein Vercel-Timeout-Problem.
 *
 * Quellen konfigurieren in: scripts/js-sources.json
 * Ergebnis wird per POST an /api/admin/import-jobs gesendet.
 */

import { chromium } from 'playwright'
import * as cheerio from 'cheerio'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const sources = JSON.parse(readFileSync(join(__dirname, 'js-sources.json'), 'utf-8'))

const IMPORT_URL = process.env.IMPORT_URL?.replace(/\/$/, '')
const IMPORT_SECRET = process.env.IMPORT_SECRET

if (!IMPORT_URL || !IMPORT_SECRET) {
  console.error('❌  IMPORT_URL und IMPORT_SECRET müssen gesetzt sein.')
  process.exit(1)
}

// ─── Keyword-Filter (identisch mit lib/jobs/scraper.ts) ───────────────────────

const KEYWORDS = [
  'quereinsteiger', 'quereinstieg', 'quer einsteiger', 'quer einstieg',
  'berufswechsel', 'umsatteln', 'umschulung', 'keine erfahrung',
  'auch ohne erfahrung', 'branchenwechsel', 'neueinsteiger',
  'berufsumstieg', 'willkommen auch', 'offen für',
  'zweitausbildung', 'zweite ausbildung', 'wiedereinstieg',
]

function containsKeyword(text) {
  const lower = text.toLowerCase()
  return KEYWORDS.some(k => lower.includes(k))
}

// ─── Job-Extraktion (Phase 1: JSON-LD) ────────────────────────────────────────

function extractJsonLd($, pageUrl) {
  const jobs = []
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
          item.jobLocation?.address?.addressRegion ?? ''
        const description = item.description ?? ''
        const url = item.url ?? pageUrl
        if (title && company) jobs.push({ title, company, location, description, source_url: url })
      }
    } catch { /* malformed JSON-LD */ }
  })
  return jobs
}

// ─── Job-Extraktion (Phase 1.5: /location/[city] Muster) ──────────────────────

function extractLocationListJobs($, pageUrl, companyName) {
  const seen = new Set()
  const jobs = []
  const overviewDescription = $('body').text().slice(0, 2000)
  const fallbackTitle = $('h1').first().text().trim()

  $('a[href]').each((_, el) => {
    const href = $(el).attr('href') ?? ''
    const locMatch = href.match(/\/location\/([^/?#]+)/)
    if (!locMatch) return
    let absolute
    try { absolute = new URL(href, pageUrl).toString() } catch { return }
    if (seen.has(absolute)) return
    seen.add(absolute)

    const city = locMatch[1].replace(/-/g, ' ')
    const linkText = $(el).text().replace(/\s+/g, ' ').trim()
    const cityLabel = linkText.length > 0 && linkText.length <= 40 ? linkText : city
    const title = fallbackTitle ? `${fallbackTitle} – ${cityLabel}` : cityLabel
    if (!title) return
    jobs.push({ title, company: companyName, location: city, description: overviewDescription, source_url: absolute })
  })
  return jobs.length >= 3 ? jobs : []
}

// ─── Job-Extraktion (Phase 2: Job-Links + Detail-Seiten) ──────────────────────

function extractJobLinks($, baseUrl) {
  const links = []
  const jobPatterns = [
    /\bjob(s)?\b/i, /\bstellen?\b/i, /\bcareer(s)?\b/i,
    /\bvacanci/i, /\boffene[-_]?stelle/i,
  ]
  $('a[href]').each((_, el) => {
    const href = $(el).attr('href') ?? ''
    const text = $(el).text().toLowerCase()
    if (jobPatterns.some(p => p.test(href) || p.test(text))) {
      try {
        const absolute = new URL(href, baseUrl).toString()
        if (absolute.startsWith('http')) links.push(absolute)
      } catch { /* ignore */ }
    }
  })
  return [...new Set(links)].slice(0, 30)
}

// ─── Einzelne Quelle scrapen ──────────────────────────────────────────────────

async function scrapeSource(browser, source) {
  const page = await browser.newPage()
  try {
    console.log(`  → Lade ${source.url}`)
    await page.goto(source.url, { waitUntil: 'networkidle', timeout: 30_000 })
    await page.waitForTimeout(2_000) // Kurz warten damit dynamische Listen fertig laden

    const html = await page.content()
    const $ = cheerio.load(html)

    // Phase 1: JSON-LD
    const jsonLdJobs = extractJsonLd($, source.url)
    if (jsonLdJobs.length > 0) {
      console.log(`  ✓ JSON-LD: ${jsonLdJobs.length} Jobs`)
      return jsonLdJobs
    }

    // Phase 1.5: /location/[city]
    const locationJobs = extractLocationListJobs($, source.url, source.name)
    if (locationJobs.length > 0) {
      console.log(`  ✓ Location-Liste: ${locationJobs.length} Jobs`)
      return locationJobs
    }

    // Phase 2: Job-Links → Detail-Seiten
    const links = extractJobLinks($, source.url)
    console.log(`  Phase 2: ${links.length} Links prüfen…`)
    const found = []
    for (const link of links) {
      try {
        await page.goto(link, { waitUntil: 'networkidle', timeout: 15_000 })
        const detailHtml = await page.content()
        const $d = cheerio.load(detailHtml)
        const ldJobs = extractJsonLd($d, link)
        if (ldJobs.length > 0) {
          found.push(...ldJobs)
        } else {
          const title = $d('h1').first().text().trim()
          const body = $d('body').text()
          if (title && containsKeyword(body)) {
            found.push({ title, company: source.name, location: '', description: body.slice(0, 500), source_url: link })
          }
        }
      } catch { /* Detail-Seite nicht erreichbar */ }
    }
    return found
  } finally {
    await page.close()
  }
}

// ─── Hauptprogramm ────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n🤖 DQ Headless Scraper — ${new Date().toISOString()}`)
  console.log(`   ${sources.length} Quelle(n) | Ziel: ${IMPORT_URL}\n`)

  const browser = await chromium.launch({ args: ['--no-sandbox'] })
  let totalAdded = 0
  let totalSkipped = 0

  for (const source of sources) {
    console.log(`▶ ${source.name}`)
    try {
      const rawJobs = await scrapeSource(browser, source)
      const filtered = source.skipKeywordFilter
        ? rawJobs
        : rawJobs.filter(j => containsKeyword((j.title ?? '') + ' ' + (j.description ?? '')))
      console.log(`  ${rawJobs.length} gefunden → ${filtered.length} relevant${source.skipKeywordFilter ? ' (vorgefilterter Kanal)' : ' mit Quereinstieg-Keyword'}`)

      if (filtered.length === 0) continue

      const payload = filtered.map(j => ({
        ...j,
        source_name: source.name,
        source_id: source.source_id ?? null,
      }))

      const res = await fetch(`${IMPORT_URL}/api/admin/import-jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${IMPORT_SECRET}`,
        },
        body: JSON.stringify({ jobs: payload }),
      })

      if (!res.ok) {
        console.error(`  ✗ API-Fehler: ${res.status} ${await res.text()}`)
        continue
      }

      const result = await res.json()
      console.log(`  ✓ ${result.added} neu, ${result.skipped} übersprungen`)
      totalAdded += result.added ?? 0
      totalSkipped += result.skipped ?? 0
    } catch (err) {
      console.error(`  ✗ Fehler bei ${source.name}: ${err.message}`)
    }
  }

  await browser.close()
  console.log(`\n📊 Gesamt: ${totalAdded} neu, ${totalSkipped} übersprungen\n`)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
