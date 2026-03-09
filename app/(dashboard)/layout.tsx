import type { Metadata } from 'next'
import type { Route } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createAnonClient } from '@/lib/supabase/server-anon'
import type { Profile } from '@/types/database'

export const metadata: Metadata = {
  title: 'Dashboard — derquereinstieg.ch',
  robots: { index: false, follow: false },
}

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Übersicht', icon: '🏠' },
  { href: '/dashboard/jobs', label: 'Jobs', icon: '🔍' },
  { href: '/dashboard/einstiegspfad', label: 'Einstiegspfad', icon: '🗺️' },
  { href: '/dashboard/bewerbungen', label: 'Bewerbungen', icon: '📋', tierRequired: 2 },
  { href: '/dashboard/ai', label: 'KI-Assistent', icon: '🤖', tierRequired: 3 },
  { href: '/dashboard/profil', label: 'Profil', icon: '👤' },
]

function TierBadge({ tier }: { tier: number }) {
  if (tier === 1) return (
    <span style={{
      display: 'inline-block',
      padding: '2px 8px',
      background: '#E5E7EB',
      color: '#6B7280',
      borderRadius: 20,
      fontSize: 11,
      fontWeight: 600,
    }}>Free</span>
  )
  if (tier === 2) return (
    <span style={{
      display: 'inline-block',
      padding: '2px 8px',
      background: '#FEF3C7',
      color: '#B45309',
      borderRadius: 20,
      fontSize: 11,
      fontWeight: 600,
    }}>Pro</span>
  )
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 8px',
      background: 'linear-gradient(90deg, #6366F1, #8B5CF6)',
      color: '#fff',
      borderRadius: 20,
      fontSize: 11,
      fontWeight: 600,
    }}>AI</span>
  )
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createAnonClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single() as { data: Profile | null }

  if (!profile) redirect('/login')

  const initials = profile.full_name
    ? profile.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : user.email?.[0].toUpperCase() ?? '?'

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F8F6F2', fontFamily: 'system-ui, sans-serif' }}>
      {/* Sidebar */}
      <aside style={{
        width: 260,
        background: '#fff',
        borderRight: '1px solid #E5E0D8',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        position: 'sticky',
        top: 0,
        height: '100vh',
        overflowY: 'auto',
      }}>
        {/* User-Bereich */}
        <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid #E5E0D8' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            {/* Avatar */}
            <div style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: '#E67E22',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 700,
              fontSize: 16,
              flexShrink: 0,
            }}>
              {initials}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#1A2332', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {profile.full_name ?? 'Hallo!'}
              </div>
              <TierBadge tier={profile.tier} />
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ padding: '12px 12px', flex: 1 }}>
          {NAV_ITEMS.map(item => {
            const locked = item.tierRequired && profile.tier < item.tierRequired
            return (
              <Link
                key={item.href}
                href={item.href as Route}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 10,
                  padding: '10px 12px',
                  borderRadius: 8,
                  textDecoration: 'none',
                  color: locked ? '#9CA3AF' : '#374151',
                  fontSize: 14,
                  fontWeight: 500,
                  marginBottom: 2,
                }}
                className="dash-nav-link"
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 16 }}>{item.icon}</span>
                  {item.label}
                </span>
                {locked && <span style={{ fontSize: 12 }}>🔒</span>}
              </Link>
            )
          })}
        </nav>

        {/* Upgrade-Banner Tier 1 */}
        {profile.tier === 1 && (
          <div style={{
            margin: '0 12px 12px',
            padding: '14px 14px',
            background: 'linear-gradient(135deg, #FFF7ED, #FEF3C7)',
            borderRadius: 10,
            border: '1px solid #FCD34D',
          }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#92400E', marginBottom: 4 }}>
              Upgrade zu Pro
            </div>
            <div style={{ fontSize: 11, color: '#78350F', lineHeight: 1.4, marginBottom: 8 }}>
              Alle Einstiegspfade, Bewerbungs-Tracker + Gehalts-Benchmarks
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#B45309' }}>CHF 29/Monat</div>
          </div>
        )}

        {/* Footer */}
        <div style={{ padding: '12px 16px 20px', borderTop: '1px solid #E5E0D8' }}>
          <form action="/api/auth/signout" method="POST" style={{ marginBottom: 8 }}>
            <button type="submit" style={{
              width: '100%',
              padding: '8px 12px',
              background: 'transparent',
              border: '1px solid #E5E0D8',
              borderRadius: 6,
              color: '#6B7280',
              fontSize: 13,
              cursor: 'pointer',
              textAlign: 'left',
            }}>
              Abmelden
            </button>
          </form>
          <Link href="/" style={{ fontSize: 12, color: '#9CA3AF', textDecoration: 'none' }}>
            ← Zur Website
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, overflow: 'auto', minWidth: 0 }}>
        {children}
      </main>

      <style>{`
        .dash-nav-link:hover {
          background: #F8F6F2 !important;
          color: #E67E22 !important;
        }
        * { box-sizing: border-box; }
      `}</style>
    </div>
  )
}
