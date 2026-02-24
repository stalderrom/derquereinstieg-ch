// Detailseiten-Geocoding: Holt die source_url jedes unzuordbaren Jobs
// und extrahiert Standort via JSON-LD JobPosting-Schema oder PLZ-Pattern.

import axios from 'axios'
import * as cheerio from 'cheerio'
import { createClient } from '@/lib/supabase/server'
import { detectCanton, cantonToRegion } from './geo'

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

// Extrahiert Ortsinfo aus JSON-LD JobPosting-Schema
// Gibt { postalCode, locality, region } zurück (alles optional)
interface JsonLdAddress {
  postalCode?: string
  addressLocality?: string
  addressRegion?: string
}

function extractJsonLdAddress(html: string): JsonLdAddress | null {
  const $ = cheerio.load(html)
  let result: JsonLdAddress | null = null

  $('script[type="application/ld+json"]').each((_, el) => {
    if (result) return
    try {
      const raw = $(el).html()
      if (!raw) return
      const parsed = JSON.parse(raw)
      const items = Array.isArray(parsed) ? parsed : [parsed]
      for (const item of items) {
        if (item['@type'] !== 'JobPosting') continue
        const addr = item?.jobLocation?.address
        if (!addr) continue
        result = {
          postalCode: addr.postalCode ?? undefined,
          addressLocality: addr.addressLocality ?? undefined,
          addressRegion: addr.addressRegion ?? undefined,
        }
        break
      }
    } catch {
      // malformed JSON-LD — skip
    }
  })

  return result
}

// Holt eine Detailseite und versucht canton zu bestimmen.
// Gibt null zurück wenn nichts gefunden (z.B. 404, Timeout, kein Ort).
async function fetchCanton(url: string): Promise<string | null> {
  let html: string
  try {
    const { data } = await axios.get<string>(url, {
      timeout: 12_000,
      headers: { 'User-Agent': UA },
      maxRedirects: 5,
    })
    html = data
  } catch {
    return null
  }

  // 1. JSON-LD: addressRegion ist direkt der Kanton-Code (z.B. "ZH")
  const addr = extractJsonLdAddress(html)
  if (addr) {
    const canton = detectCanton(
      addr.addressRegion,
      addr.addressLocality,
      addr.postalCode
    )
    if (canton) return canton
  }

  // 2. Fallback: PLZ + Stadtname direkt im HTML-Text
  const $ = cheerio.load(html)
  const bodyText = $('body').text()
  const canton = detectCanton(bodyText.slice(0, 5000)) // Nur ersten 5000 Zeichen
  return canton
}

export interface DetailGeocodeResult {
  updated: number
  skipped: number    // kein Kanton gefunden oder HTTP-Fehler
  errors: number     // DB-Fehler
  log: { id: string; url: string; canton: string | null; status: 'updated' | 'skipped' | 'error' }[]
}

// Holt alle Jobs ohne Kanton aus der DB, besucht jede source_url
// und aktualisiert canton + region. Arbeitet mit Delay um nicht zu spammen.
export async function geocodeFromDetailPages(
  opts: { delayMs?: number; limit?: number } = {}
): Promise<DetailGeocodeResult> {
  const { delayMs = 500, limit = 200 } = opts
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('stellenanzeigen')
    .select('id, source_url, location, title')
    .or('canton.is.null,region.eq.unzuordnungsbar')
    .limit(limit)

  if (error) throw new Error(error.message)

  const result: DetailGeocodeResult = { updated: 0, skipped: 0, errors: 0, log: [] }

  for (const job of data ?? []) {
    if (!job.source_url) {
      result.skipped++
      result.log.push({ id: job.id, url: '', canton: null, status: 'skipped' })
      continue
    }

    const canton = await fetchCanton(job.source_url)

    if (!canton) {
      result.skipped++
      result.log.push({ id: job.id, url: job.source_url, canton: null, status: 'skipped' })
    } else {
      const region = cantonToRegion(canton)
      const { error: upErr } = await supabase
        .from('stellenanzeigen')
        .update({ canton, region })
        .eq('id', job.id)

      if (upErr) {
        result.errors++
        result.log.push({ id: job.id, url: job.source_url, canton, status: 'error' })
      } else {
        result.updated++
        result.log.push({ id: job.id, url: job.source_url, canton, status: 'updated' })
      }
    }

    // Höfliche Pause zwischen Requests
    await new Promise(r => setTimeout(r, delayMs))
  }

  return result
}
