// Vercel Cron Job — täglich 07:00 Uhr Schweizer Zeit (06:00 UTC Winter / 05:00 UTC Sommer)
// Konfiguriert in vercel.json
//
// Ablauf:
//   1. Neue Inserate scannen (Portale + APIs)
//   2. Bestehende Inserate auf Aktualität prüfen
//
// Sicherheit: Vercel sendet automatisch Authorization: Bearer CRON_SECRET
// Ohne gültigen Secret wird der Request abgelehnt.

import { NextRequest, NextResponse } from 'next/server'
import { scrapePortals } from '@/lib/jobs/portal-scraper'
import { fetchFromApis } from '@/lib/jobs/api-sources'
import { getJobs, getSources, markSourceScanned, deactivateJob, updateJobVerified, logVerification } from '@/lib/jobs/storage'
import { scrapeCareerPage } from '@/lib/jobs/scraper'
import { scrapePortalSource } from '@/lib/jobs/db-portal-scraper'
import axios from 'axios'

// Vercel Cron darf bis zu 300s laufen (Pro-Plan) — wir setzen 290s als Limit
export const maxDuration = 290

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

function checkAuth(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return false // Kein Secret konfiguriert → blockieren
  const auth = req.headers.get('authorization')
  return auth === `Bearer ${secret}`
}

async function isJobStillActive(url: string): Promise<boolean | null> {
  try {
    const res = await axios.get<string>(url, {
      timeout: 7_000,
      maxRedirects: 5,
      headers: { 'User-Agent': UA },
      validateStatus: () => true,
    })

    if (res.status === 404 || res.status === 410) return false
    if (res.status >= 500) return null // Temporärer Fehler → nicht deaktivieren

    const finalUrl: string = (res.request as { res?: { responseUrl?: string } })?.res?.responseUrl ?? url

    if (url.includes('adzuna')) {
      if (finalUrl.includes('/search') || finalUrl.includes('/jobs?')) return false
    }

    const isJobScout24Detail = /\/(?:job|stelle)\/[\w-]{5,}/i.test(url) && url.includes('jobscout24')
    if (isJobScout24Detail) {
      const finalIsDetail = /\/(?:job|stelle)\/[\w-]{5,}/i.test(finalUrl)
      if (!finalIsDetail && finalUrl !== url) return false
    }

    const isJobsChDetail = /\/stellenangebote\/detail\/[\w-]{5,}/i.test(url)
    if (isJobsChDetail) {
      const finalIsDetail = /\/stellenangebote\/detail\/[\w-]{5,}/i.test(finalUrl)
      if (!finalIsDetail && finalUrl !== url) return false
    }

    return res.status < 400
  } catch {
    return null // Timeout → nicht deaktivieren
  }
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const startedAt = Date.now()
  const results: Record<string, unknown> = {}

  // ── 1. Scan: neue Inserate suchen ────────────────────────────────────────────
  try {
    const [portalRes, apiRes] = await Promise.allSettled([
      scrapePortals(),
      fetchFromApis(),
    ])

    // DB-Portal-Quellen (branchenspezifische Jobbörsen aus der Datenbank)
    let dbPortalAdded = 0
    let dbPortalSkipped = 0
    const dbPortalDetails: { source: string; added: number; skipped: number }[] = []
    try {
      const sources = await getSources()
      const portalSources = sources.filter(s => s.type === 'portal' && s.is_active)
      for (const source of portalSources) {
        const res = await scrapePortalSource(source)
        dbPortalAdded += res.added
        dbPortalSkipped += res.skipped
        dbPortalDetails.push({ source: source.name, added: res.added, skipped: res.skipped })
        await markSourceScanned(source.id)
      }
    } catch (err) {
      console.error('[cron/morning] DB-Portal-Scan Fehler:', err)
    }

    results.scan = {
      portals:  portalRes.status === 'fulfilled' ? portalRes.value : { error: String((portalRes as PromiseRejectedResult).reason) },
      apis:     apiRes.status    === 'fulfilled' ? apiRes.value    : { error: String((apiRes    as PromiseRejectedResult).reason) },
      dbPortals: { added: dbPortalAdded, skipped: dbPortalSkipped, details: dbPortalDetails },
    }
  } catch (err) {
    results.scan = { error: String(err) }
  }

  // ── 2. Verify: bestehende Inserate prüfen ────────────────────────────────────
  // Älteste zuletzt geprüfte Jobs zuerst (gleichmässige Abdeckung über mehrere Tage)
  try {
    const activeJobs = await getJobs({ is_active: true })
    activeJobs.sort((a, b) =>
      new Date(a.last_verified_at).getTime() - new Date(b.last_verified_at).getTime()
    )

    let verified = 0
    let removed = 0

    for (const job of activeJobs) {
      // Sicherheits-Timeout: nicht mehr als 240s für Verifikation (60s Reserve für Scan)
      if (Date.now() - startedAt > 240_000) break

      const status = await isJobStillActive(job.source_url)
      if (status === true) {
        await updateJobVerified(job.id)
        verified++
      } else if (status === false) {
        await deactivateJob(job.id)
        removed++
      }

      await new Promise(r => setTimeout(r, 150))
    }

    const today = new Date().toISOString().slice(0, 10)
    await logVerification({
      date: today,
      verified,
      removed,
      total_active_after: activeJobs.length - removed,
    })

    results.verify = { verified, removed }
  } catch (err) {
    results.verify = { error: String(err) }
  }

  const durationMs = Date.now() - startedAt
  return NextResponse.json({ success: true, durationMs, results })
}
