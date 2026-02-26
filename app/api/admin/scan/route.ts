import { NextRequest, NextResponse } from 'next/server'
import { getSources, markSourceScanned, reGeocodeJobs, reactivateJob, deleteJob, cleanupGarbageTitles } from '@/lib/jobs/storage'
import { scrapeCareerPage } from '@/lib/jobs/scraper'
import { scrapePortalSource } from '@/lib/jobs/db-portal-scraper'
import { scrapePortals } from '@/lib/jobs/portal-scraper'
import { fetchFromApis } from '@/lib/jobs/api-sources'
import { geocodeFromDetailPages } from '@/lib/jobs/detail-geocoder'
import { deduplicateJobs } from '@/lib/jobs/dedup'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const mode: string = body.mode ?? 'all' // 'all' | 'career' | 'portals' | 'apis' | 're-geocode' | 'detail-geocode' | 'dedup' | 'rescue' | 'cleanup-titles'

    const results: Record<string, unknown> = {}

    // Scrape custom career pages (type=career) + portal-type DB sources (type=portal)
    if (mode === 'all' || mode === 'career') {
      const sources = await getSources()

      let careerAdded = 0
      let careerSkipped = 0
      const careerDetails: { source: string; added: number; skipped: number }[] = []

      for (const source of sources.filter(s => s.type === 'career' && s.is_active)) {
        const res = await scrapeCareerPage(source)
        careerAdded += res.added
        careerSkipped += res.skipped
        careerDetails.push({ source: source.name, added: res.added, skipped: res.skipped })
        await markSourceScanned(source.id)
      }

      for (const source of sources.filter(s => s.type === 'portal' && s.is_active)) {
        const res = await scrapePortalSource(source)
        careerAdded += res.added
        careerSkipped += res.skipped
        careerDetails.push({ source: source.name, added: res.added, skipped: res.skipped })
        await markSourceScanned(source.id)
      }

      results.career = { added: careerAdded, skipped: careerSkipped, sources: careerDetails.length, details: careerDetails }
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

    // Rescue: Re-aktiviert heute fälschlicherweise deaktivierte Jobs (200-Status)
    // und löscht Schrott-Importe (Kategorie-Seiten, keine echten Inserate)
    if (mode === 'rescue') {
      const supabase = await (await import('@/lib/supabase/server')).createClient()
      const today = new Date().toISOString().slice(0, 10)

      // Heute deaktivierte Jobs laden
      const { data: deactivated } = await supabase
        .from('stellenanzeigen')
        .select('id, source_url, title')
        .eq('is_active', false)
        .gte('removed_at', today)

      let reactivated = 0
      let deleted = 0

      for (const job of deactivated ?? []) {
        // Schrott-Importe: Kategorie-URLs oder Nicht-Deutsch-Englisch Seiten → löschen
        const isGarbage = /\/(?:de|fr|en)\/jobs\/[^/]+\/?$/.test(job.source_url)
          || /\/(?:fr|en)\/jobs\//.test(job.source_url)
          || /bewerbungsratgeber/.test(job.source_url)

        if (isGarbage) {
          await deleteJob(job.id)
          deleted++
          continue
        }

        // Echten Job prüfen — bei 200 re-aktivieren
        try {
          const res = await (await import('axios')).default.head(job.source_url, {
            timeout: 8_000,
            maxRedirects: 5,
            headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36' },
            validateStatus: () => true,
          })
          if (res.status >= 200 && res.status < 400) {
            await reactivateJob(job.id)
            reactivated++
          }
        } catch { /* bleibt deaktiviert */ }

        await new Promise(r => setTimeout(r, 150))
      }

      results.rescue = { checked: deactivated?.length ?? 0, reactivated, deleted }
    }

    // Cleanup: Bereinigt Scraper-Garbage in Titeln (z.B. jobscout24 Karten-Text)
    if (mode === 'cleanup-titles') {
      results.cleanupTitles = await cleanupGarbageTitles()
    }

    return NextResponse.json({ success: true, results })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
