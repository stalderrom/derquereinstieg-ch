import { createAnonClient } from '@/lib/supabase/server-anon'
import { NextRequest, NextResponse } from 'next/server'
import { categorize } from '@/lib/jobs/categories'

const PAGE_SIZE = 20

export async function GET(request: NextRequest) {
  const supabase = await createAnonClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)

  // Schnelle Abfrage: Job-Anzahl pro Region zurückgeben
  if (searchParams.get('counts') === 'true') {
    const { data, error } = await supabase
      .from('stellenanzeigen')
      .select('region')
      .eq('is_active', true)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    const counts: Record<string, number> = {}
    for (const row of data ?? []) {
      if (row.region) counts[row.region] = (counts[row.region] ?? 0) + 1
    }
    return NextResponse.json({ counts })
  }

  const category = searchParams.get('category') ?? ''
  // Support both single region (legacy) and multiple regions array
  const regionParam = searchParams.get('region') ?? ''
  const regionsParam = searchParams.get('regions') ?? ''
  const regions = regionsParam
    ? regionsParam.split(',').map(r => r.trim()).filter(Boolean)
    : regionParam ? [regionParam] : []
  const q = searchParams.get('q') ?? ''
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  let query = supabase
    .from('stellenanzeigen')
    .select('id, title, company, location, canton, region, source_url, source_name, posted_at, first_seen_at, keywords, description', { count: 'exact' })
    .eq('is_active', true)
    .order('first_seen_at', { ascending: false })
    .range(from, to)

  if (regions.length === 1) {
    query = query.eq('region', regions[0])
  } else if (regions.length > 1) {
    query = query.in('region', regions)
  }
  if (q) query = query.or(`title.ilike.%${q}%,company.ilike.%${q}%`)

  const { data, error, count } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Client-seitige Kategorie-Filterung (da kein Kategorie-Feld in der DB)
  let jobs = data ?? []
  if (category) {
    jobs = jobs.filter(j => categorize(j.title ?? '') === category)
  }

  // Kategorie zu jedem Job hinzufügen (für Drawer-Enrichment)
  const enrichedJobs = jobs.map(j => ({ ...j, category: categorize(j.title ?? '') }))

  return NextResponse.json({ jobs: enrichedJobs, total: count ?? 0, page, pageSize: PAGE_SIZE })
}
