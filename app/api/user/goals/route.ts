import { createAnonClient } from '@/lib/supabase/server-anon'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createAnonClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data } = await supabase
    .from('career_goals')
    .select('*')
    .eq('user_id', user.id)
    .single()

  return NextResponse.json({ goal: data ?? null })
}

export async function POST(request: NextRequest) {
  const supabase = await createAnonClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const allowed = ['job_title', 'job_company', 'job_description', 'job_category', 'job_field', 'job_region', 'job_source_url', 'skill_gaps', 'skills_at_save']
  const payload: Record<string, unknown> = { user_id: user.id }
  for (const key of allowed) {
    if (key in body) payload[key] = body[key]
  }

  // Upsert: one goal per user
  const { data, error } = await supabase
    .from('career_goals')
    .upsert(payload, { onConflict: 'user_id' })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ goal: data })
}

export async function DELETE() {
  const supabase = await createAnonClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { error } = await supabase
    .from('career_goals')
    .delete()
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
