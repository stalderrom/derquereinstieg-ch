import { createAnonClient } from '@/lib/supabase/server-anon'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createAnonClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function PATCH(request: NextRequest) {
  const supabase = await createAnonClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const allowed = ['full_name', 'target_field', 'region', 'regions', 'birthdate', 'application_profile']
  const updates: Record<string, unknown> = {}
  for (const key of allowed) {
    if (key in body) updates[key] = body[key]
  }

  let { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id)
    .select()
    .single()

  // Wenn regions-Spalte noch nicht existiert (SQL-Migration nicht ausgeführt),
  // nochmals ohne regions versuchen damit andere Felder trotzdem gespeichert werden
  if (error && (error.code === '42703' || error.message.includes('regions'))) {
    const { regions: _r, ...withoutRegions } = updates as Record<string, unknown> & { regions?: unknown }
    void _r
    const retry = await supabase
      .from('profiles')
      .update(withoutRegions)
      .eq('id', user.id)
      .select()
      .single()
    data = retry.data
    error = retry.error
  }

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
