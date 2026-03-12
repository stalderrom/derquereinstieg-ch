/**
 * Portal-Scraper: jobs.ch + JobScout24
 * Läuft täglich via GitHub Actions — kein Vercel-Timeout-Problem.
 * Ergebnis wird per POST an /api/admin/import-jobs gesendet.
 */

import * as cheerio from 'cheerio'

const IMPORT_URL = process.env.IMPORT_URL?.replace(/\/$/, '')
const IMPORT_SECRET = process.env.IMPORT_SECRET

if (!IMPORT_URL || !IMPORT_SECRET) {
  console.error('❌  IMPORT_URL und IMPORT_SECRET müssen gesetzt sein.')
  process.exit(1)
}

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
const TERMS = ['quereinsteiger', 'quereinstieg']
const MAX_PAGES = 10

// ─── __INIT__ JSON extrahieren (gleiche Logik wie portal-scraper.ts) ──────────

function extractJsonVar(html, varName) {
  const marker = `${varName} =`
  const markerIdx = html.indexOf(marker)
  if (markerIdx === -1) return null

  let start = markerIdx + marker.length
  while (start < html.length && html[start] !== '{') {
    if (!/\s/.test(html[start])) return null
    start++
  }
  if (start >= html.length) return null

  let depth = 0, inString = false, escape = false
  for (let i = start; i < html.length; i++) {
    const c = html[i]
    if (escape) { escape = false; continue }
    if (c === '\\' && inString) { escape = true; continue }
    if (c === '"') { inString = !inString; continue }
    if (inString) continue
    if (c === '{') depth++
    else if (c === '}') {
      depth--
      if (depth === 0) {
        try { return JSON.parse(html.slice(start, i + 1)) } catch { return null }
      }
    }
  }
  return null
}

async function fetchHtml(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': UA },
    signal: AbortSignal.timeout(20_000),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.text()
}

// ─── jobs.ch ──────────────────────────────────────────────────────────────────

async function scrapeJobsCh(term) {
  const jobs = []
  const firstUrl = `https://www.jobs.ch/de/stellenangebote/?term=${encodeURIComponent(term)}`

  let numPages = 1
  try {
    const html = await fetchHtml(firstUrl)
    const initData = extractJsonVar(html, '__INIT__')
    const main = initData?.vacancy?.results?.main
    numPages = Math.min(main?.meta?.numPages ?? 1, MAX_PAGES)
    for (const raw of main?.results ?? []) {
      if (raw.id && raw.title) {
        jobs.push({
          title: raw.title,
          company: raw.company?.name ?? 'Unbekannt',
          location: raw.place ?? '',
          source_url: `https://www.jobs.ch/de/stellenangebote/detail/${raw.id}/`,
          source_name: 'jobs.ch',
          posted_at: raw.publicationDate ?? null,
        })
      }
    }
  } catch (err) {
    console.error(`  ✗ jobs.ch (${term}) Seite 1: ${err.message}`)
    return []
  }

  for (let page = 2; page <= numPages; page++) {
    const url = `https://www.jobs.ch/de/stellenangebote/${page}/?term=${encodeURIComponent(term)}`
    try {
      const html = await fetchHtml(url)
      const main = extractJsonVar(html, '__INIT__')?.vacancy?.results?.main
      for (const raw of main?.results ?? []) {
        if (raw.id && raw.title) {
          jobs.push({
            title: raw.title,
            company: raw.company?.name ?? 'Unbekannt',
            location: raw.place ?? '',
            source_url: `https://www.jobs.ch/de/stellenangebote/detail/${raw.id}/`,
            source_name: 'jobs.ch',
            posted_at: raw.publicationDate ?? null,
          })
        }
      }
      await new Promise(r => setTimeout(r, 300))
    } catch (err) {
      console.warn(`  ⚠ jobs.ch (${term}) Seite ${page}: ${err.message}`)
    }
  }

  return jobs
}

// ─── JobScout24 ───────────────────────────────────────────────────────────────

const MAX_PAGES_JS24 = 10
function isJobDetailUrl(href) { return /\/stelle\/\d+/i.test(href) }
function isValidTitle(t) {
  if (!t || t.length < 8) return false
  const l = t.toLowerCase()
  return !l.includes('@') && !/^(tipps? für|jetzt bewerben|online bewerben)/.test(l)
    && !/\b(jobs|stellen)\s*$/.test(l)
}

function parseJS24InitData(html) {
  const initData = extractJsonVar(html, '__INIT__')
  const main = initData?.vacancy?.results?.main
  const numPages = Math.min(main?.meta?.numPages ?? 1, MAX_PAGES_JS24)
  const results = []
  for (const raw of main?.results ?? []) {
    const id = String(raw.id)
    if (id && raw.title && isValidTitle(raw.title)) {
      results.push({
        title: raw.title,
        company: raw.company?.name ?? 'Unbekannt',
        location: raw.place ?? '',
        source_url: `https://www.jobscout24.ch/de/stelle/${id}/`,
        source_name: 'JobScout24',
        posted_at: raw.publicationDate ?? null,
      })
    }
  }
  return { results, numPages }
}

async function scrapeJobScout24(term) {
  const jobs = []
  try {
    const html1 = await fetchHtml(`https://www.jobscout24.ch/de/jobs/${encodeURIComponent(term)}/`)
    const { results: page1, numPages } = parseJS24InitData(html1)

    if (page1.length > 0) {
      jobs.push(...page1)
      console.log(`  Seite 1/${numPages} → ${page1.length} Jobs`)

      for (let page = 2; page <= numPages; page++) {
        try {
          const html = await fetchHtml(`https://www.jobscout24.ch/de/jobs/${encodeURIComponent(term)}/${page}/`)
          const { results } = parseJS24InitData(html)
          jobs.push(...results)
          console.log(`  Seite ${page}/${numPages} → ${results.length} Jobs`)
          await new Promise(r => setTimeout(r, 300))
        } catch (err) {
          console.warn(`  ⚠ Seite ${page}: ${err.message}`)
        }
      }
      return jobs
    }

    // Fallback: Cheerio
    const $ = cheerio.load(html1)
    $('a[href]').each((_, el) => {
      const href = $(el).attr('href') ?? ''
      if (!isJobDetailUrl(href)) return
      const title = $(el).find('h2, h3, [data-cy="job-title"]').first().text().trim()
      const company = $(el).find('[data-cy="company-name"], [class*="company"]').first().text().trim()
      const location = $(el).find('[data-cy="job-location"], [class*="location"]').first().text().trim()
      if (!isValidTitle(title)) return
      jobs.push({
        title, company: company || 'Unbekannt', location,
        source_url: href.startsWith('http') ? href : `https://www.jobscout24.ch${href}`,
        source_name: 'JobScout24',
        posted_at: null,
      })
    })
  } catch (err) {
    console.error(`  ✗ JobScout24 (${term}): ${err.message}`)
  }
  return jobs
}

// ─── Import via API ───────────────────────────────────────────────────────────

async function importJobs(jobs) {
  if (jobs.length === 0) return { added: 0, skipped: 0 }
  const res = await fetch(`${IMPORT_URL}/api/admin/import-jobs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${IMPORT_SECRET}` },
    body: JSON.stringify({ jobs }),
    signal: AbortSignal.timeout(30_000),
  })
  if (!res.ok) throw new Error(`import-jobs HTTP ${res.status}: ${await res.text()}`)
  return res.json()
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n📰 DQ Portal-Scraper — ${new Date().toISOString()}\n`)

  const allJobs = []

  for (const term of TERMS) {
    console.log(`▶ jobs.ch "${term}"`)
    const found = await scrapeJobsCh(term)
    console.log(`  ${found.length} gefunden`)
    allJobs.push(...found)
  }

  for (const term of TERMS) {
    console.log(`▶ JobScout24 "${term}"`)
    const found = await scrapeJobScout24(term)
    console.log(`  ${found.length} gefunden`)
    allJobs.push(...found)
  }

  // Deduplizieren nach source_url
  const seen = new Set()
  const unique = allJobs.filter(j => {
    if (!j.source_url || seen.has(j.source_url)) return false
    seen.add(j.source_url)
    return true
  })
  console.log(`\n  ${allJobs.length} total → ${unique.length} nach Dedup`)

  // In Batches von 100 importieren
  let totalAdded = 0, totalSkipped = 0
  for (let i = 0; i < unique.length; i += 100) {
    const batch = unique.slice(i, i + 100)
    const result = await importJobs(batch)
    totalAdded += result.added ?? 0
    totalSkipped += result.skipped ?? 0
  }

  console.log(`\n📊 Gesamt: ${totalAdded} neu, ${totalSkipped} übersprungen\n`)
}

main().catch(err => { console.error(err); process.exit(1) })
