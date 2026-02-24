import { NextRequest, NextResponse } from 'next/server'
import { getSources, markSourceScanned, reGeocodeJobs } from '@/lib/jobs/storage'
import { scrapeCareerPage } from '@/lib/jobs/scraper'
import { scrapePortals } from '@/lib/jobs/portal-scraper'
import { fetchFromApis } from '@/lib/jobs/api-sources'
import { geocodeFromDetailPages } from '@/lib/jobs/detail-geocoder'
import { deduplicateJobs } from '@/lib/jobs/dedup'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const mode: string = body.mode ?? 'all' // 'all' | 'career' | 'portals' | 'apis' | 're-geocode' | 'detail-geocode' | 'dedup'

    const results: Record<string, unknown> = {}

    // Scrape custom career pages
    if (mode === 'all' || mode === 'career') {
      const sources = await getSources()
      const careerSources = sources.filter(s => s.type === 'career' && s.is_active)

      let careerAdded = 0
      let careerSkipped = 0

      for (const source of careerSources) {
        const res = await scrapeCareerPage(source)
        careerAdded += res.added
        careerSkipped += res.skipped
        await markSourceScanned(source.id)
      }

      results.career = { added: careerAdded, skipped: careerSkipped, sources: careerSources.length }
    }

    // Scrape job portals
    if (mode === 'all' || mode === 'portals') {
      const portalRes = await scrapePortals()
      results.portals = portalRes
    }

    // Fetch from APIs
    if (mode === 'all' || mode === 'apis') {
      const apiRes = await fetchFromApis()
      results.apis = apiRes
    }

    // Re-Geocoding aus location/title/description-Feldern (schnell, kein HTTP)
    if (mode === 're-geocode') {
      results.reGeocode = await reGeocodeJobs()
    }

    // Detail-Geocoding: Besucht die source_url jedes unzuordbaren Jobs (langsam, HTTP)
    if (mode === 'detail-geocode') {
      results.detailGeocode = await geocodeFromDetailPages({ delayMs: 400 })
    }

    // Dedup: Berechnet dedup_keys für alle bestehenden Jobs, deaktiviert Duplikate
    if (mode === 'dedup') {
      results.dedup = await deduplicateJobs()
    }

    return NextResponse.json({ success: true, results })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
