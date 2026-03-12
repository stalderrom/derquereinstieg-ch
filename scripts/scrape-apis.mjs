/**
 * API-Scraper: Adzuna
 * Läuft täglich via GitHub Actions — kein Vercel-Timeout-Problem.
 * Ergebnis wird per POST an /api/admin/import-jobs gesendet.
 */

const IMPORT_URL = process.env.IMPORT_URL?.replace(/\/$/, '')
const IMPORT_SECRET = process.env.IMPORT_SECRET
const ADZUNA_APP_ID = process.env.ADZUNA_APP_ID
const ADZUNA_APP_KEY = process.env.ADZUNA_APP_KEY

if (!IMPORT_URL || !IMPORT_SECRET) {
  console.error('❌  IMPORT_URL und IMPORT_SECRET müssen gesetzt sein.')
  process.exit(1)
}
if (!ADZUNA_APP_ID || !ADZUNA_APP_KEY) {
  console.warn('⚠  ADZUNA_APP_ID / ADZUNA_APP_KEY fehlen — Adzuna-Scan übersprungen.')
  process.exit(0)
}

const SEARCH_TERMS = [
  'quereinsteiger', 'quereinstieg', 'ohne erfahrung', 'berufswechsel',
  'neueinsteiger', 'einsteiger', 'career change', 'no experience required',
]

const FILTER_KEYWORDS = [
  'quereinsteiger', 'quereinstieg', 'quer einsteiger', 'quer einstieg',
  'berufswechsel', 'neueinsteiger', 'berufseinsteiger', 'einsteiger',
  'ohne erfahrung', 'keine erfahrung', 'auch ohne erfahrung',
  'umsatteln', 'umschulung', 'branchenwechsel', 'berufsumstieg',
  'career change', 'career changer', 'no experience', 'entry level', 'entry-level',
]

function passesFilter(title, description) {
  const text = (title + ' ' + description).toLowerCase()
  return FILTER_KEYWORDS.some(k => text.includes(k))
}

async function fetchAdzuna(term) {
  const params = new URLSearchParams({
    app_id: ADZUNA_APP_ID,
    app_key: ADZUNA_APP_KEY,
    what: term,
    results_per_page: '50',
  })
  const res = await fetch(
    `https://api.adzuna.com/v1/api/jobs/ch/search/1?${params}`,
    { signal: AbortSignal.timeout(20_000) }
  )
  if (!res.ok) throw new Error(`Adzuna HTTP ${res.status}`)
  const data = await res.json()
  return (data.results ?? [])
    .map(r => ({
      title: r.title ?? '',
      company: r.company?.display_name ?? 'Unbekannt',
      location: r.location?.display_name ?? '',
      description: r.description ?? '',
      source_url: r.redirect_url ?? '',
      source_name: 'adzuna',
      posted_at: r.created ?? null,
    }))
    .filter(j => j.source_url && passesFilter(j.title, j.description))
}

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

async function main() {
  console.log(`\n🔌 DQ API-Scraper (Adzuna) — ${new Date().toISOString()}\n`)

  let totalAdded = 0, totalSkipped = 0

  for (const term of SEARCH_TERMS) {
    console.log(`▶ "${term}"`)
    try {
      const jobs = await fetchAdzuna(term)
      console.log(`  ${jobs.length} relevant`)
      if (jobs.length > 0) {
        const result = await importJobs(jobs)
        console.log(`  ✓ ${result.added} neu, ${result.skipped} übersprungen`)
        totalAdded += result.added ?? 0
        totalSkipped += result.skipped ?? 0
      }
      await new Promise(r => setTimeout(r, 500))
    } catch (err) {
      console.error(`  ✗ ${err.message}`)
    }
  }

  console.log(`\n📊 Gesamt: ${totalAdded} neu, ${totalSkipped} übersprungen\n`)
}

main().catch(err => { console.error(err); process.exit(1) })
