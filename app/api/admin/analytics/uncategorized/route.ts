// Debug-Endpoint: zeigt alle aktiven Stellentitel die in "Weitere" landen.
// Aufruf: GET /api/admin/analytics/uncategorized
// Gibt sortierte Titelliste zurück — nur für Entwicklung/Analyse.

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { categorize } from '@/lib/jobs/categories'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('stellenanzeigen')
      .select('title')
      .eq('is_active', true)

    const weitere: string[] = []
    for (const row of data ?? []) {
      if (categorize(row.title ?? '') === 'Weitere') {
        weitere.push(row.title ?? '')
      }
    }

    return NextResponse.json({
      count: weitere.length,
      total: data?.length ?? 0,
      titles: weitere.sort((a, b) => a.localeCompare(b, 'de')),
    })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
