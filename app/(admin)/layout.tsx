import type { Metadata } from 'next'
import type { Route } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Admin — derquereinstieg.ch',
  robots: { index: false, follow: false },
}

const NAV_ITEMS: { href: Route; label: string; icon: string }[] = [
  { href: '/admin/dashboard' as Route, label: 'Dashboard', icon: '◈' },
  { href: '/admin/jobs' as Route, label: 'Stellen', icon: '◉' },
  { href: '/admin/sources' as Route, label: 'Quellen', icon: '⬡' },
  { href: '/admin/scan' as Route, label: 'Scan', icon: '⟳' },
  { href: '/admin/map' as Route, label: 'Karte', icon: '◎' },
  { href: '/admin/analytics' as Route, label: 'Analytics', icon: '▦' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-root" style={{ display: 'flex', minHeight: '100vh', background: '#0f1117', color: '#e2e8f0', fontFamily: 'system-ui, sans-serif' }}>
      {/* Sidebar */}
      <aside style={{
        width: 220,
        background: '#161b27',
        borderRight: '1px solid #1e2a3a',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        position: 'sticky',
        top: 0,
        height: '100vh',
        overflowY: 'auto',
      }}>
        {/* Logo */}
        <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid #1e2a3a' }}>
          <Link href={'/admin/dashboard' as Route} style={{ textDecoration: 'none' }}>
            <div style={{ fontSize: 13, color: '#64748b', marginBottom: 2 }}>derquereinstieg.ch</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9', letterSpacing: '-0.3px' }}>Admin Panel</div>
          </Link>
        </div>

        {/* Navigation */}
        <nav style={{ padding: '12px 12px', flex: 1 }}>
          {NAV_ITEMS.map(item => (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '9px 12px',
                borderRadius: 8,
                textDecoration: 'none',
                color: '#94a3b8',
                fontSize: 14,
                fontWeight: 500,
                marginBottom: 2,
                transition: 'background 0.15s, color 0.15s',
              }}
              className="admin-nav-link"
            >
              <span style={{ fontSize: 16, opacity: 0.7 }}>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Footer link */}
        <div style={{ padding: '12px 20px 20px', borderTop: '1px solid #1e2a3a' }}>
          <Link href={'/' as Route} style={{ fontSize: 12, color: '#475569', textDecoration: 'none' }}>
            ← Zur Website
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, overflow: 'auto', minWidth: 0 }}>
        {children}
      </main>

      <style>{`
        .admin-nav-link:hover {
          background: #1e2d40 !important;
          color: #e2e8f0 !important;
        }
        * { box-sizing: border-box; }
      `}</style>
    </div>
  )
}
