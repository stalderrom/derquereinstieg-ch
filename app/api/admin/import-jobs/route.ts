// Empfängt Job-Daten von externen Scrapern (z.B. GitHub Actions Headless-Scraper)
// und importiert sie in die Datenbank — gleiche Logik wie der interne Scraper.
//
// Authentifizierung: Bearer IMPORT_SECRET (Umgebungsvariable)

import { NextRequest, NextResponse } from 'next/server'
import { createJob } from '@/lib/jobs/storage'
import { detectCanton, cantonToRegion } from '@/lib/jobs/geo'

const QUEREINSTEIGER_KEYWORDS = [
  'quereinsteiger', 'quereinstieg', 'quer einsteiger', 'quer einstieg',
  'berufswechsel', 'umsatteln', 'umschulung', 'keine erfahrung',
  'auch ohne erfahrung', 'branchenwechsel', 'neueinsteiger',
  'berufsumstieg', 'willkommen auch', 'offen für',
]

interface IncomingJob {
  title: string
  company: string
  location: string | null
  description: string | null
  source_url: string
  source_name: string
  source_id: string | null
}

export async function POST(req: NextRequest) {
  const secret = process.env.IMPORT_SECRET
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => ({}))
  const jobs: IncomingJob[] = body.jobs ?? []

  if (!Array.isArray(jobs) || jobs.length === 0) {
    return NextResponse.json({ added: 0, skipped: 0 })
  }

  let added = 0
  let skipped = 0

  for (const job of jobs) {
    if (!job.title || !job.source_url) { skipped++; continue }

    const canton = detectCanton(job.location ?? '')
    const region = cantonToRegion(canton)
    const text = ((job.title ?? '') + ' ' + (job.description ?? '')).toLowerCase()
    const keywords = QUEREINSTEIGER_KEYWORDS.filter(k => text.includes(k))

    const result = await createJob({
      title: job.title,
      company: job.company ?? '',
      location: job.location ?? '',
      canton,
      region,
      description: job.description ?? '',
      source_url: job.source_url,
      source_name: job.source_name ?? '',
      source_id: job.source_id ?? null,
      keywords,
      is_active: true,
      posted_at: null,
      removed_at: null,
    })

    if (result) added++
    else skipped++
  }

  return NextResponse.json({ added, skipped })
}
