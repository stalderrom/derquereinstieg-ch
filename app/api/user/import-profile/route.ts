import { createAnonClient } from '@/lib/supabase/server-anon'
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const ALLOWED_PATTERNS = [
  /^https?:\/\/(www\.)?linkedin\.com\/in\//,
  /^https?:\/\/(www\.)?xing\.com\/profile\//,
]

function isAllowedUrl(url: string) {
  return ALLOWED_PATTERNS.some(p => p.test(url))
}

export async function POST(request: NextRequest) {
  const supabase = await createAnonClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY nicht konfiguriert' }, { status: 500 })
  }

  const body = await request.json()
  const { url, text }: { url?: string; text?: string } = body

  if (!url && !text) {
    return NextResponse.json({ error: 'url oder text erforderlich' }, { status: 400 })
  }

  let profileText = text ?? ''

  if (url) {
    if (!isAllowedUrl(url)) {
      return NextResponse.json({
        error: 'Nur LinkedIn (linkedin.com/in/…) und Xing (xing.com/profile/…) werden unterstützt.',
      }, { status: 400 })
    }

    // LinkedIn blockt externe Scraper zuverlässig → direkt Text-Fallback empfehlen
    if (/linkedin\.com/i.test(url)) {
      return NextResponse.json({
        error: 'LinkedIn blockiert automatische Importe. Bitte Profil-Text manuell einfügen: Profil öffnen → Ctrl+A → Ctrl+C → unten einfügen.',
        fallback: true,
      }, { status: 422 })
    }

    const jinaUrl = `https://r.jina.ai/${url}`
    let fetched: string
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 30000)
      const res = await fetch(jinaUrl, {
        headers: {
          'Accept': 'text/plain',
          'X-Return-Format': 'text',
          'User-Agent': 'Mozilla/5.0 (compatible; derquereinstieg-import/1.0)',
        },
        signal: controller.signal,
      })
      clearTimeout(timeout)
      if (!res.ok) {
        console.error(`[import-profile] Jina fetch failed: ${res.status} ${res.statusText}`)
        return NextResponse.json({
          error: `Profil konnte nicht geladen werden (HTTP ${res.status}). Bitte Profil-Text manuell einfügen.`,
          fallback: true,
        }, { status: 422 })
      }
      fetched = await res.text()
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.error(`[import-profile] Jina fetch error: ${msg}`)
      return NextResponse.json({
        error: 'Profil konnte nicht geladen werden. Bitte Profil-Text manuell einfügen.',
        fallback: true,
      }, { status: 422 })
    }

    const lower = fetched.toLowerCase()
    if (
      fetched.length < 1500 ||
      lower.includes('anmelden') ||
      lower.includes('sign in') ||
      lower.includes('log in') ||
      lower.includes('einloggen')
    ) {
      return NextResponse.json({
        error: 'Das Profil ist nicht öffentlich zugänglich. Bitte "Öffentliches Profil" in LinkedIn/Xing aktivieren oder den Profil-Text manuell einfügen.',
        fallback: true,
      }, { status: 422 })
    }

    profileText = fetched
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  const systemPrompt = `Du extrahierst strukturierte Berufsinformationen aus einem LinkedIn- oder Xing-Profiltext.
Antworte NUR mit einem JSON-Objekt — kein Markdown, keine Erklärungen, kein Text davor oder danach.
Alle Felder als String. Wenn ein Feld nicht vorhanden ist, leerer String "".`

  const userPrompt = `Extrahiere folgende Felder aus diesem Profil:
- currentJob: Aktuelle oder letzte Stelle + Firma + Dauer (z.B. "Senior Projektmanager bei Migros, 8 Jahre")
- currentJobDesc: Tätigkeiten in 2-3 Sätzen (Verantwortlichkeiten, Projekte, Erfolge)
- prevJob: Frühere relevante Stelle, kurz (oder leer wenn nicht relevant)
- education: Höchster Abschluss + Institution (z.B. "Bachelor BWL, Universität Zürich")
- skills: Kommaseparierte Fähigkeiten (z.B. "Projektmanagement, Excel, Teamführung, Deutsch, Englisch")

Profil-Text:
${profileText.slice(0, 8000)}

Antworte nur mit JSON:
{"currentJob":"...","currentJobDesc":"...","prevJob":"...","education":"...","skills":"..."}`

  let extracted: Record<string, string>
  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 600,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    })

    const raw = response.content[0].type === 'text' ? response.content[0].text.trim() : ''
    // Strip potential markdown code fences
    const jsonStr = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()
    extracted = JSON.parse(jsonStr)
  } catch {
    return NextResponse.json({ error: 'Extraktion fehlgeschlagen. Bitte nochmals versuchen.' }, { status: 500 })
  }

  const hasData = Object.values(extracted).some(v => typeof v === 'string' && v.trim().length > 0)
  if (!hasData) {
    return NextResponse.json({ error: 'Keine Profildaten gefunden. Bitte Text manuell einfügen.' }, { status: 422 })
  }

  return NextResponse.json({
    profile: {
      currentJob: String(extracted.currentJob ?? ''),
      currentJobDesc: String(extracted.currentJobDesc ?? ''),
      prevJob: String(extracted.prevJob ?? ''),
      education: String(extracted.education ?? ''),
      skills: String(extracted.skills ?? ''),
    },
  })
}
