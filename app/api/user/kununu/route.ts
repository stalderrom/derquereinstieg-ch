// Kununu Arbeitgeberbewertungen — server-side scraper mit 24h Cache
// Strategie: 1) direkter Slug-Versuch  2) Suche via searchterm  3) Fallback-Link

import { NextRequest, NextResponse } from 'next/server'
import { createAnonClient } from '@/lib/supabase/server-anon'
import axios from 'axios'

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
const TTL = 24 * 60 * 60 * 1000 // 24h
const BASE = 'https://www.kununu.com/ch'

export interface KununuReview {
  rating: number
  title: string
  pros?: string
  cons?: string
  jobTitle?: string
}

export interface KununuData {
  found: boolean
  score?: number
  reviewCount?: number
  recommendRate?: number
  profileUrl: string
  topReviews?: KununuReview[]
  worstReviews?: KununuReview[]
}

const cache = new Map<string, { data: KununuData; at: number }>()

/** Kununu-Slug: lowercase + alle Nicht-Alphanumerischen entfernen.
 *  Beispiel: "SBB CFF FFS" → "sbbcffffs"
 *            "Post CH AG"  → "postchaag"
 */
function nameToSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]/g, '')
}

function extractNextData(html: string): Record<string, unknown> | null {
  const m = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/)
  if (!m) return null
  try { return JSON.parse(m[1]) } catch { return null }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function dig(obj: any, ...paths: string[][]): unknown {
  for (const path of paths) {
    let cur = obj
    for (const key of path) {
      if (cur == null) break
      cur = cur[key]
    }
    if (cur != null) return cur
  }
  return undefined
}

const HEADERS = {
  'User-Agent': UA,
  'Accept-Language': 'de-CH,de;q=0.9,en;q=0.8',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
}

async function getHtml(url: string): Promise<{ html: string; ok: boolean }> {
  const { data, status } = await axios.get<string>(url, {
    headers: HEADERS,
    timeout: 12_000,
    validateStatus: () => true,
  })
  return { html: typeof data === 'string' ? data : '', ok: status === 200 }
}

function parseCompanyPage(html: string, profileUrl: string, scoreHint?: number, countHint?: number): KununuData {
  const nd = extractNextData(html)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cp = (nd as any)?.props?.pageProps

  const rawReviews: unknown[] = (
    dig(cp, ['reviews']) ??
    dig(cp, ['reviewList', 'reviews']) ??
    dig(cp, ['data', 'reviews']) ??
    dig(cp, ['profileData', 'reviews']) ??
    []
  ) as unknown[]

  const reviews: KununuReview[] = rawReviews
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((r: any) => ({
      rating: Number(r?.ratingAverage ?? r?.rating ?? r?.score ?? 0),
      title: String(r?.title ?? r?.headline ?? '').trim(),
      pros: String(r?.pros ?? r?.positives ?? r?.positive ?? '').trim().slice(0, 220) || undefined,
      cons: String(r?.cons ?? r?.negatives ?? r?.negative ?? '').trim().slice(0, 220) || undefined,
      jobTitle: String(r?.jobTitle ?? r?.position ?? r?.job ?? '').trim() || undefined,
    }))
    .filter(r => r.title && r.rating > 0)

  const sorted = [...reviews].sort((a, b) => b.rating - a.rating)
  const topReviews = sorted.filter(r => r.rating >= 4).slice(0, 2)
  const worstReviews = sorted.filter(r => r.rating <= 2).slice(-2).reverse()

  const recRaw = dig(cp, ['company', 'recommendationRate'])
    ?? dig(cp, ['recommendRate'])
    ?? dig(cp, ['data', 'company', 'recommendationRate'])
  const recommendRate = recRaw != null ? Math.round(Number(recRaw)) : undefined

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const score = scoreHint
    ?? (dig(cp, ['company', 'kunuScore']) as number | undefined)
    ?? (dig(cp, ['kunuScore']) as number | undefined)

  return {
    found: true,
    score,
    reviewCount: countHint ?? reviews.length,
    recommendRate,
    profileUrl,
    topReviews: topReviews.length > 0 ? topReviews : undefined,
    worstReviews: worstReviews.length > 0 ? worstReviews : undefined,
  }
}

async function fetchKununuData(company: string): Promise<KununuData> {
  const fallbackUrl = `${BASE}/search?searchterm=${encodeURIComponent(company)}`

  try {
    // ── Strategie 1: Direkter Slug-Versuch ────────────────────────────────────
    const slug = nameToSlug(company)
    if (slug.length >= 2) {
      const directUrl = `${BASE}/${slug}`
      const { html: directHtml, ok: directOk } = await getHtml(directUrl)
      if (directOk && extractNextData(directHtml)) {
        return parseCompanyPage(directHtml, directUrl)
      }
    }

    // ── Strategie 2: Suche ────────────────────────────────────────────────────
    const { html: searchHtml, ok: searchOk } = await getHtml(
      `${BASE}/search?searchterm=${encodeURIComponent(company)}`
    )
    if (!searchOk) return { found: false, profileUrl: fallbackUrl }

    const nd = extractNextData(searchHtml)
    if (!nd) return { found: false, profileUrl: fallbackUrl }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const p = (nd as any)?.props?.pageProps
    const companies: unknown[] = (
      dig(p, ['searchResults', 'companies']) ??
      dig(p, ['companies']) ??
      dig(p, ['results', 'companies']) ??
      dig(p, ['data', 'companies']) ??
      []
    ) as unknown[]

    if (!Array.isArray(companies) || companies.length === 0) {
      return { found: false, profileUrl: fallbackUrl }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const first = companies[0] as any
    const foundSlug: string | undefined = first?.slug ?? first?.encodedName ?? first?.urlSlug
    const scoreHint: number | undefined = first?.kunuScore ?? first?.ratingAverage ?? first?.score
    const countHint: number | undefined = first?.reviewsCount ?? first?.reviewCount ?? first?.totalReviews

    if (!foundSlug) return { found: false, profileUrl: fallbackUrl }

    const profileUrl = `${BASE}/${foundSlug}`
    const { html: companyHtml, ok: companyOk } = await getHtml(profileUrl)

    if (!companyOk) {
      return { found: true, score: scoreHint, reviewCount: countHint, profileUrl }
    }

    return parseCompanyPage(companyHtml, profileUrl, scoreHint, countHint)
  } catch {
    return { found: false, profileUrl: fallbackUrl }
  }
}

export async function GET(req: NextRequest) {
  const supabase = await createAnonClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const company = req.nextUrl.searchParams.get('company')?.trim()
  if (!company) return NextResponse.json({ found: false, profileUrl: '' }, { status: 400 })

  const key = company.toLowerCase()
  const cached = cache.get(key)
  if (cached && Date.now() - cached.at < TTL) {
    return NextResponse.json(cached.data)
  }

  const data = await fetchKununuData(company)
  cache.set(key, { data, at: Date.now() })
  return NextResponse.json(data)
}
