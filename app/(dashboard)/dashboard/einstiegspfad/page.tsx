import { redirect } from 'next/navigation'
import { createAnonClient } from '@/lib/supabase/server-anon'
import type { Profile } from '@/types/database'
import EinstiegspfadClient from './EinstiegspfadClient'

export default async function EinstiegspfadPage() {
  const supabase = await createAnonClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single() as { data: Profile | null }

  if (!profile) redirect('/login')

  return <EinstiegspfadClient profile={profile} />
}
