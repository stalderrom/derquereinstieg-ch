import { NextRequest, NextResponse } from 'next/server'
import { getSources } from '@/lib/jobs/storage'

export async function GET(req: NextRequest) {
  const secret = process.env.IMPORT_SECRET
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const all = await getSources()
  const sources = all
    .filter(s => s.is_active && s.use_headless)
    .map(s => ({ name: s.name, url: s.url, source_id: s.id, skipKeywordFilter: s.skip_keyword_filter }))
  return NextResponse.json({ sources })
}
