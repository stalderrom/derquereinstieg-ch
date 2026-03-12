// Dry-Run-Test für eine einzelne Quelle — importiert nichts, gibt nur Vorschau zurück.

import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'
import * as cheerio from 'cheerio'
import { getSources } from '@/lib/jobs/storage'
import { extractJsonVar } from '@/lib/jobs/portal-scraper'

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

const KEYWORDS = [
  'quereinsteiger', 'quereinstieg', 'quer einsteiger', 'berufswechsel',
  'umsatteln', 'umschulung', 'keine erfahrung', 'auch ohne erfahrung',
  'branchenwechsel', 'neueinsteiger', 'berufsumstieg', 'willkommen auch',
  'offen für', 'seiteneinstieg',
]

function passesFilter(title: string, desc = ''): boolean {
  const t = (title + ' ' + desc).toLowerCase()
  return KEYWORDS.some(k => t.includes(k))
}

interface JobSample { title: string; company: string; location: string; passesFilter: boolean }

function extractJsonLd(html: string, pageUrl: string): JobSample[] {
  const $ = cheerio.load(html)
  const jobs: JobSample[] = []
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const parsed = JSON.parse($(el).html() ?? '')
      const items = Array.isArray(parsed) ? parsed : [parsed]
      for (const item of items) {
        if (item['@type'] !== 'JobPosting') continue
        const title = item.title ?? ''
        const company = item.hiringOrganization?.name ?? ''
        const location = item.jobLocation?.address?.addressLocality ?? ''
        const desc = item.description ?? ''
        if (title) jobs.push({ title, company, location, passesFilter: passesFilter(title, desc) })
      }
    } catch { /* skip */ }
  })
  return jobs
}

function extractInit(html: string): JobSample[] {
  const jobs: JobSample[] = []

  // __INIT__ (JobCloud: jobs.ch, jobscout24.ch)
  const initData = extractJsonVar(html, '__INIT__')
  const main = (initData as { vacancy?: { results?: { main?: { results?: { title?: string; company?: { name?: string }; place?: string }[] } } } } | null)
    ?.vacancy?.results?.main
  for (const raw of main?.results ?? []) {
    if (raw.title) jobs.push({ title: raw.title, company: raw.company?.name ?? '', location: raw.place ?? '', passesFilter: passesFilter(raw.title) })
  }
  if (jobs.length > 0) return jobs

  // __PRELOADED_STATE__ (myjob.ch, sozjobs.ch)
  const preloaded = extractJsonVar(html, '__PRELOADED_STATE__')
  const items = (preloaded as { jobSearch?: { results?: { items?: { title?: string; company?: { name?: string }; workplaceCity?: string }[] } } } | null)
    ?.jobSearch?.results?.items ?? []
  for (const raw of items) {
    if (raw.title) jobs.push({ title: raw.title, company: raw.company?.name ?? '', location: raw.workplaceCity ?? '', passesFilter: passesFilter(raw.title) })
  }
  return jobs
}

function extractLocationLinks(html: string, pageUrl: string): JobSample[] {
  const $ = cheerio.load(html)
  const fallbackTitle = $('h1').first().text().trim()
  const jobs: JobSample[] = []
  const seen = new Set<string>()
  $('a[href]').each((_, el) => {
    const href = $(el).attr('href') ?? ''
    const m = href.match(/\/location\/([^/?#]+)/)
    if (!m) return
    try { const abs = new URL(href, pageUrl).toString(); if (seen.has(abs)) return; seen.add(abs) } catch { return }
    const city = m[1].replace(/-/g, ' ')
    const title = fallbackTitle ? `${fallbackTitle} – ${city}` : city
    jobs.push({ title, company: '', location: city, passesFilter: true })
  })
  return jobs.length >= 3 ? jobs : []
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const sources = await getSources()
  const source = sources.find(s => s.id === id)
  if (!source) return NextResponse.json({ error: 'Quelle nicht gefunden' }, { status: 404 })

  // Headless-Quellen können wir mit einem einfachen HTTP-Fetch nicht testen
  if (source.use_headless) {
    return NextResponse.json({
      reachable: null,
      warning: 'Headless-Quelle — JavaScript-gerendert, nur via GitHub Actions testbar.',
      total: null,
      keywordHits: null,
      samples: [],
    })
  }

  try {
    const { data: html, status } = await axios.get<string>(source.url, {
      timeout: 15_000,
      headers: { 'User-Agent': UA },
      validateStatus: () => true,
    })

    if (status >= 400) {
      return NextResponse.json({ reachable: false, error: `HTTP ${status}`, total: 0, keywordHits: 0, samples: [] })
    }

    // Extraktion versuchen — drei Strategien
    let jobs: JobSample[] = extractJsonLd(html, source.url)
    let method = 'JSON-LD'

    if (jobs.length === 0) {
      jobs = extractInit(html)
      method = '__INIT__ / __PRELOADED_STATE__'
    }

    if (jobs.length === 0) {
      jobs = extractLocationLinks(html, source.url)
      method = 'Location-Links'
    }

    const keywordHits = jobs.filter(j => j.passesFilter).length
    const samples = jobs.slice(0, 8)

    let warning: string | undefined
    if (jobs.length === 0) {
      warning = 'Keine Jobs extrahiert — Seite evtl. JS-gerendert (Headless Toggle aktivieren)'
    } else if (keywordHits === 0 && !source.skip_keyword_filter) {
      warning = 'Keine Jobs mit Quereinsteiger-Keyword — werden beim echten Scan gefiltert'
    }

    return NextResponse.json({
      reachable: true,
      method,
      total: jobs.length,
      keywordHits,
      samples,
      warning,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    const isTimeout = msg.toLowerCase().includes('timeout')
    return NextResponse.json({
      reachable: false,
      error: isTimeout ? 'Timeout (>15s)' : msg,
      total: 0,
      keywordHits: 0,
      samples: [],
    })
  }
}
