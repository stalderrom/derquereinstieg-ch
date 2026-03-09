import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { Route } from 'next'
import { createAnonClient } from '@/lib/supabase/server-anon'
import type { Profile, Stellenanzeige } from '@/types/database'
import { FIELD_LABELS, type EntryField } from '@/lib/dashboard/entry-paths'
import GoalWidget from '@/components/dashboard/GoalWidget'

// Profil-Vollständigkeit berechnen
function profileCompleteness(profile: Profile): { percent: number; missing: string[] } {
  const missing: string[] = []
  if (!profile.full_name) missing.push('Name')
  if (!profile.target_field) missing.push('Zielberuf')
  const hasRegion = (profile.regions && profile.regions.length > 0) || !!profile.region
  if (!hasRegion) missing.push('Region')
  const percent = Math.round(((3 - missing.length) / 3) * 100)
  return { percent, missing }
}

export default async function DashboardPage() {
  const supabase = await createAnonClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single() as { data: Profile | null }

  if (!profile) redirect('/login')

  // Letzte 5 aktive Jobs (gefiltert nach target_field wenn vorhanden)
  let jobsQuery = supabase
    .from('stellenanzeigen')
    .select('id, title, company, location, region, source_url, posted_at, first_seen_at')
    .eq('is_active', true)
    .order('first_seen_at', { ascending: false })
    .limit(5)

  if (profile.target_field && profile.region) {
    jobsQuery = jobsQuery.eq('region', profile.region)
  }

  const { data: jobs } = await jobsQuery

  // Bookmark-Count
  const { count: bookmarkCount } = await supabase
    .from('job_bookmarks')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)

  const { percent, missing } = profileCompleteness(profile)
  const fieldLabel = profile.target_field ? FIELD_LABELS[profile.target_field as EntryField] : null
  const firstName = profile.full_name?.split(' ')[0] ?? 'da'

  return (
    <div style={{ padding: '32px 40px', maxWidth: 1100, margin: '0 auto' }}>
      {/* Willkommen */}
      <div style={{
        background: 'linear-gradient(135deg, #E67E22, #c96a12)',
        borderRadius: 16,
        padding: '28px 32px',
        color: '#fff',
        marginBottom: 28,
      }}>
        <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>
          Hallo {firstName}! 👋
        </div>
        <div style={{ fontSize: 15, opacity: 0.9 }}>
          {fieldLabel
            ? `Dein Weg in ${fieldLabel} – du schaffst das!`
            : 'Wähle deinen Zielberuf im Profil, um personalisierte Jobs zu sehen.'}
        </div>
      </div>

      {/* Ziel-Widget — volle Breite */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 0, marginBottom: 20 }}>
        <GoalWidget />
      </div>

      {/* 3-Spalten Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20, marginBottom: 28 }}>
        {/* Profil-Vollständigkeit */}
        <div style={{ background: '#fff', borderRadius: 12, padding: '20px 24px', border: '1px solid #E5E0D8' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#6B7280', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Profil
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#1A2332', marginBottom: 8 }}>{percent}%</div>
          <div style={{ height: 6, background: '#F3F4F6', borderRadius: 3, marginBottom: 10 }}>
            <div style={{ height: '100%', background: percent === 100 ? '#10B981' : '#E67E22', borderRadius: 3, width: `${percent}%` }} />
          </div>
          {missing.length > 0 && (
            <div style={{ fontSize: 12, color: '#9CA3AF' }}>
              Fehlt: {missing.join(', ')}{' '}
              <Link href="/dashboard/profil" style={{ color: '#E67E22', textDecoration: 'none', fontWeight: 600 }}>
                Ergänzen →
              </Link>
            </div>
          )}
        </div>

        {/* Merkliste */}
        <div style={{ background: '#fff', borderRadius: 12, padding: '20px 24px', border: '1px solid #E5E0D8' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#6B7280', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Merkliste
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#1A2332', marginBottom: 4 }}>
            {bookmarkCount ?? 0}
            {profile.tier === 1 && <span style={{ fontSize: 14, color: '#9CA3AF' }}> / 20</span>}
          </div>
          <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 10 }}>
            {profile.tier === 1 ? 'Jobs gespeichert (Free: max 20)' : 'Jobs gespeichert'}
          </div>
          <Link href="/dashboard/jobs" style={{ fontSize: 13, color: '#E67E22', textDecoration: 'none', fontWeight: 600 }}>
            Jobs durchsuchen →
          </Link>
        </div>

        {/* Einstiegspfad */}
        <div style={{ background: '#fff', borderRadius: 12, padding: '20px 24px', border: '1px solid #E5E0D8' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#6B7280', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Einstiegspfad
          </div>
          {fieldLabel ? (
            <>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#1A2332', marginBottom: 8 }}>{fieldLabel}</div>
              <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 10 }}>Schritt 1: Standortbestimmung</div>
              <Link href="/dashboard/einstiegspfad" style={{ fontSize: 13, color: '#E67E22', textDecoration: 'none', fontWeight: 600 }}>
                Vollständig ansehen →
              </Link>
            </>
          ) : (
            <>
              <div style={{ fontSize: 14, color: '#9CA3AF', marginBottom: 10 }}>Noch kein Zielberuf gewählt</div>
              <Link href="/dashboard/profil" style={{ fontSize: 13, color: '#E67E22', textDecoration: 'none', fontWeight: 600 }}>
                Zielberuf wählen →
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Aktuelle Jobs */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E0D8', marginBottom: 24 }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #E5E0D8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#1A2332' }}>
            Aktuelle Jobs {fieldLabel ? `in ${fieldLabel}` : ''}
          </div>
          <Link href={'/dashboard/jobs' as Route} style={{ fontSize: 13, color: '#E67E22', textDecoration: 'none', fontWeight: 600 }}>
            Alle anzeigen
          </Link>
        </div>
        {(jobs ?? []).length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: '#9CA3AF', fontSize: 14 }}>
            Keine Jobs gefunden. Passe dein Profil an.
          </div>
        ) : (
          <div>
            {(jobs as Stellenanzeige[]).map((job, i) => (
              <a
                key={job.id}
                href={job.source_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 24px',
                  borderBottom: i < (jobs?.length ?? 0) - 1 ? '1px solid #F3F4F6' : 'none',
                  textDecoration: 'none',
                  color: 'inherit',
                  transition: 'background 0.1s',
                }}
                className="job-row"
              >
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#1A2332', marginBottom: 2 }}>{job.title}</div>
                  <div style={{ fontSize: 12, color: '#6B7280' }}>{job.company} · {job.location ?? job.region}</div>
                </div>
                <div style={{ fontSize: 11, color: '#9CA3AF', flexShrink: 0, marginLeft: 16 }}>
                  {job.posted_at ? new Date(job.posted_at).toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit' }) : ''}
                </div>
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Upgrade-CTA für Tier 1 */}
      {profile.tier === 1 && (
        <div style={{
          background: 'linear-gradient(135deg, #FFF7ED, #FEF3C7)',
          border: '1px solid #FCD34D',
          borderRadius: 12,
          padding: '24px 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
        }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#92400E', marginBottom: 6 }}>
              Mit Pro schneller zum Ziel
            </div>
            <div style={{ fontSize: 13, color: '#78350F', lineHeight: 1.5 }}>
              Alle 8 Einstiegspfade · Gehalts-Benchmarks · Bewerbungs-Tracker · Unbegrenzte Bookmarks
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#B45309', marginBottom: 8 }}>CHF 29 / Monat</div>
            <button style={{
              padding: '10px 24px',
              background: '#E67E22',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
            }}>
              Jetzt upgraden
            </button>
          </div>
        </div>
      )}

      <style>{`
        .job-row:hover { background: #F9F8F6 !important; }
      `}</style>
    </div>
  )
}
