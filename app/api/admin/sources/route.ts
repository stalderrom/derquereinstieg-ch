import { NextRequest, NextResponse } from 'next/server'
import { getSources, createSource } from '@/lib/jobs/storage'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const [sources, supabase] = await Promise.all([getSources(), createClient()])

    // Zähle alle Inserate (aktiv + inaktiv) pro source_name
    const { data: rows } = await supabase
      .from('stellenanzeigen')
      .select('source_name')

    const jobCounts: Record<string, number> = {}
    for (const row of rows ?? []) {
      const sn = row.source_name as string
      jobCounts[sn] = (jobCounts[sn] ?? 0) + 1
    }

    const sourcesWithCount = sources.map(s => ({
      ...s,
      job_count: jobCounts[s.name] ?? 0,
    }))

    return NextResponse.json({ sources: sourcesWithCount })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, url, type } = body

    if (!name || !url) {
      return NextResponse.json(
        { error: 'name und url sind Pflichtfelder' },
        { status: 400 }
      )
    }

    const source = await createSource({
      name,
      url,
      type: type ?? 'career',
      is_active: true,
    })

    return NextResponse.json({ source }, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
