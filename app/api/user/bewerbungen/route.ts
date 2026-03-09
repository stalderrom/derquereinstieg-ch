import { createAnonClient } from '@/lib/supabase/server-anon'
import { NextRequest, NextResponse } from 'next/server'

async function requireTier2(supabase: Awaited<ReturnType<typeof createAnonClient>>, userId: string) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('tier')
    .eq('id', userId)
    .single()
  if (!profile || profile.tier < 2) return false
  return true
}

export async function GET() {
  const supabase = await createAnonClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!await requireTier2(supabase, user.id)) return NextResponse.json({ error: 'Pro erforderlich' }, { status: 403 })

  const { data, error } = await supabase
    .from('bewerbungen')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ bewerbungen: data ?? [] })
}

export async function POST(request: NextRequest) {
  const supabase = await createAnonClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!await requireTier2(supabase, user.id)) return NextResponse.json({ error: 'Pro erforderlich' }, { status: 403 })

  const body = await request.json()
  const { firma, stelle, status, notiz, datum } = body
  if (!firma || !stelle) return NextResponse.json({ error: 'firma und stelle erforderlich' }, { status: 400 })

  const { data, error } = await supabase
    .from('bewerbungen')
    .insert({ user_id: user.id, firma, stelle, status: status ?? 'gespeichert', notiz, datum })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}

export async function PATCH(request: NextRequest) {
  const supabase = await createAnonClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!await requireTier2(supabase, user.id)) return NextResponse.json({ error: 'Pro erforderlich' }, { status: 403 })

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id fehlt' }, { status: 400 })

  const body = await request.json()
  const allowed = ['firma', 'stelle', 'status', 'notiz', 'datum']
  const updates: Record<string, unknown> = {}
  for (const key of allowed) {
    if (key in body) updates[key] = body[key]
  }

  const { data, error } = await supabase
    .from('bewerbungen')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(request: NextRequest) {
  const supabase = await createAnonClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!await requireTier2(supabase, user.id)) return NextResponse.json({ error: 'Pro erforderlich' }, { status: 403 })

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id fehlt' }, { status: 400 })

  const { error } = await supabase
    .from('bewerbungen')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
