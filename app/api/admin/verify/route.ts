import { NextResponse } from 'next/server'
import axios from 'axios'
import { getJobs, deactivateJob, updateJobVerified, logVerification } from '@/lib/jobs/storage'

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

// Prüft ob ein Inserat noch aktiv ist.
// HEAD-Requests reichen nicht: job-portale wie jobs.ch / jobscout24 geben bei
// gelöschten Inseraten 200 zurück (Weiterleitung auf Suchseite statt 404).
// Deshalb: GET + Redirect-Erkennung + JSON-LD-Prüfung.
async function isJobStillActive(url: string): Promise<boolean> {
  try {
    const res = await axios.get<string>(url, {
      timeout: 8_000,
      maxRedirects: 5,
      headers: { 'User-Agent': UA },
      validateStatus: () => true, // Kein throw bei 4xx/5xx
    })

    // Klares 404 / Server-Fehler → weg
    if (res.status === 404 || res.status === 410) return false
    if (res.status >= 500) return true // Server-Fehler ≠ Job gelöscht, nicht deaktivieren

    // Für jobscout24 / jobs.ch / jobcloud-Portale:
    // Wenn die Seite kein JSON-LD JobPosting mehr enthält, wurde das Inserat
    // wahrscheinlich auf eine Suchseite umgeleitet.
    const isJobCloud = url.includes('jobscout24') || url.includes('jobs.ch')
    if (isJobCloud) {
      const html = typeof res.data === 'string' ? res.data : ''
      const hasJobPosting = html.includes('"JobPosting"')
      return hasJobPosting
    }

    // Für Adzuna-Redirect-URLs: finale URL prüfen
    if (url.includes('adzuna')) {
      const finalUrl: string = (res.request as { res?: { responseUrl?: string } })?.res?.responseUrl ?? url
      // Adzuna leitet gelöschte Jobs auf die Suche um (/search oder /jobs?)
      if (finalUrl.includes('/search') || finalUrl.includes('/jobs?')) return false
    }

    // Allgemein: wenn die ursprüngliche URL eine Detail-Seite war
    // und die finale URL auf eine Listen-/Suchseite zeigt → weg
    const isDetailUrl = /\/(stelle|job|jobs?)\/[\w-]{8,}/i.test(url)
    if (isDetailUrl) {
      const finalUrl: string = (res.request as { res?: { responseUrl?: string } })?.res?.responseUrl ?? url
      const finalIsDetail = /\/(stelle|job|jobs?)\/[\w-]{8,}/i.test(finalUrl)
      if (!finalIsDetail && finalUrl !== url) return false
    }

    return res.status < 400
  } catch {
    // Timeout, connection refused → als offline werten
    return false
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
      const stillActive = await isJobStillActive(job.source_url)

      if (stillActive) {
        await updateJobVerified(job.id)
        verified++
      } else {
        await deactivateJob(job.id)
        removed++
      }

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
