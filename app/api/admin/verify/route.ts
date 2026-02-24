import { NextResponse } from 'next/server'
import axios from 'axios'
import { getJobs, deactivateJob, updateJobVerified, logVerification } from '@/lib/jobs/storage'

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

// Prüft ob ein Inserat noch aktiv ist.
// HEAD-Requests reichen nicht: job-portale wie jobs.ch / jobscout24 geben bei
// gelöschten Inseraten 200 zurück (Weiterleitung auf Suchseite statt 404).
// Deshalb: GET + Redirect-Erkennung + JSON-LD-Prüfung.
// Rückgabewerte:
//   true  → Job ist aktiv
//   false → Job ist definitiv weg (404/410 oder bestätigte Weiterleitung)
//   null  → unbekannt (Timeout, Netzwerkfehler) → nicht deaktivieren
async function checkJobStatus(url: string): Promise<boolean | null> {
  try {
    const res = await axios.get<string>(url, {
      timeout: 10_000,
      maxRedirects: 5,
      headers: { 'User-Agent': UA },
      validateStatus: () => true,
    })

    // Eindeutig gelöscht
    if (res.status === 404 || res.status === 410) return false

    // Server-Fehler = nicht deaktivieren (temporäres Problem)
    if (res.status >= 500) return null

    // Für Adzuna: finale URL prüfen
    if (url.includes('adzuna')) {
      const finalUrl: string = (res.request as { res?: { responseUrl?: string } })?.res?.responseUrl ?? url
      if (finalUrl.includes('/search') || finalUrl.includes('/jobs?')) return false
    }

    // Für jobscout24 / jobs.ch: Job-Detail-URL muss erhalten bleiben
    // (gelöschte Jobs werden auf Suchseite umgeleitet → finale URL ändert sich)
    const isJobDetailUrl = /\/(?:stelle|job)\/[\w-]{8,}/i.test(url)
    if (isJobDetailUrl) {
      const finalUrl: string = (res.request as { res?: { responseUrl?: string } })?.res?.responseUrl ?? url
      const finalIsDetail = /\/(?:stelle|job)\/[\w-]{8,}/i.test(finalUrl)
      if (!finalIsDetail && finalUrl !== url) return false
    }

    return res.status < 400
  } catch {
    // Timeout oder Netzwerkfehler → Status unbekannt, nicht deaktivieren
    return null
  }
}

export async function POST() {
  try {
    // Älteste zuerst (last_verified_at ascending) — so werden alle Jobs
    // über mehrere Läufe gleichmässig geprüft
    const activeJobs = await getJobs({ is_active: true })
    activeJobs.sort((a, b) =>
      new Date(a.last_verified_at).getTime() - new Date(b.last_verified_at).getTime()
    )

    let verified = 0
    let removed = 0

    for (const job of activeJobs) {
      const status = await checkJobStatus(job.source_url)

      if (status === true) {
        await updateJobVerified(job.id)
        verified++
      } else if (status === false) {
        // Nur bei bestätigtem 404/410 oder Redirect deaktivieren
        await deactivateJob(job.id)
        removed++
      }
      // status === null → Timeout/Fehler → unverändert lassen

      // Kurze Pause um Portale nicht zu überlasten
      await new Promise(r => setTimeout(r, 200))
    }

    const today = new Date().toISOString().slice(0, 10)
    await logVerification({
      date: today,
      verified,
      removed,
      total_active_after: activeJobs.length - removed,
    })

    return NextResponse.json({ success: true, verified, removed })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
