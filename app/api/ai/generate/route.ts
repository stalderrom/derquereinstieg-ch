import { createAnonClient } from '@/lib/supabase/server-anon'
import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import {
  buildCoverLetterPrompt,
  buildReviewPrompt,
  buildCVTipsPrompt,
  buildCVHighlightsPrompt,
} from '@/lib/dashboard/ai-prompts'
import type { Profile } from '@/types/database'

const DAILY_LIMIT = 20

export async function POST(request: NextRequest) {
  const supabase = await createAnonClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Tier-Check: nur Tier 3
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile || profile.tier < 3) {
    return NextResponse.json({ error: 'AI-Funktionen erfordern Tier 3 (AI-Paket)' }, { status: 403 })
  }

  const body = await request.json()
  const { type, jobText, userProfile, options } = body

  // Rate-Limit: max DAILY_LIMIT Generierungen pro Tag via einfachem Header-Check
  // In Produktion: Supabase-Tabelle für Usage-Tracking verwenden
  const today = new Date().toISOString().slice(0, 10)
  const rateLimitKey = `ai_usage:${user.id}:${today}`
  // Vereinfachtes Rate-Limiting via Supabase (ai_usage Tabelle optional)
  // Hier: kein hartes Limit im MVP, nur Logging

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY nicht konfiguriert' }, { status: 500 })
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  let systemPrompt: string
  let userPrompt: string

  const mergedProfile: Partial<Profile> = {
    ...profile,
    ...userProfile,
  }

  switch (type) {
    case 'cover_letter': {
      const p = buildCoverLetterPrompt(jobText ?? '', mergedProfile, options)
      systemPrompt = p.system
      userPrompt = p.user
      break
    }
    case 'review': {
      const p = buildReviewPrompt(jobText ?? '', mergedProfile)
      systemPrompt = p.system
      userPrompt = p.user
      break
    }
    case 'cv_tips': {
      const p = buildCVTipsPrompt(jobText ?? '', mergedProfile.target_field ?? 'allgemein')
      systemPrompt = p.system
      userPrompt = p.user
      break
    }
    case 'cv_highlights': {
      const p = buildCVHighlightsPrompt(jobText ?? '', mergedProfile)
      systemPrompt = p.system
      userPrompt = p.user
      break
    }
    default:
      return NextResponse.json({ error: 'Unbekannter type' }, { status: 400 })
  }

  // Streamed Response via SSE
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const response = await client.messages.create({
          model: 'claude-sonnet-4-6',
          max_tokens: 1500,
          system: systemPrompt,
          messages: [{ role: 'user', content: userPrompt }],
          stream: true,
        })

        for await (const event of response) {
          if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
            const chunk = `data: ${JSON.stringify({ text: event.delta.text })}\n\n`
            controller.enqueue(encoder.encode(chunk))
          }
        }

        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        controller.close()
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unbekannter Fehler'
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: msg })}\n\n`))
        controller.close()
      }
    },
  })

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
