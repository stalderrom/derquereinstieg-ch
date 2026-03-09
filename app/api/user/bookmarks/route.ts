import { createAnonClient } from '@/lib/supabase/server-anon'
import { NextRequest, NextResponse } from 'next/server'

const FREE_TIER_LIMIT = 20

export async function GET() {
  const supabase = await createAnonClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('job_bookmarks')
    .select('*, stellenanzeigen(id, title, company, location, region, source_url, posted_at)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ bookmarks: data ?? [] })
}

export async function POST(request: NextRequest) {
  const supabase = await createAnonClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Tier prüfen
  const { data: profile } = await supabase
    .from('profiles')
    .select('tier')
    .eq('id', user.id)
    .single()

  // Free-Tier Limit prüfen
  if (!profile || profile.tier === 1) {
    const { count } = await supabase
      .from('job_bookmarks')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
    if ((count ?? 0) >= FREE_TIER_LIMIT) {
      return NextResponse.json({ error: 'Free-Tier Limit erreicht (max 20 Bookmarks)', code: 'LIMIT_REACHED' }, { status: 403 })
    }
  }

  const { stellenanzeige_id } = await request.json()
  if (!stellenanzeige_id) return NextResponse.json({ error: 'stellenanzeige_id fehlt' }, { status: 400 })

  const { data, error } = await supabase
    .from('job_bookmarks')
    .insert({ user_id: user.id, stellenanzeige_id })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') return NextResponse.json({ error: 'Bereits gebookmarkt' }, { status: 409 })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json(data, { status: 201 })
}

export async function DELETE(request: NextRequest) {
  const supabase = await createAnonClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id fehlt' }, { status: 400 })

  const { error } = await supabase
    .from('job_bookmarks')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
