'use client'

import { useEffect, useState } from 'react'

interface Stats {
  total: number
  active: number
  sources: number
  regions: Record<string, number>
}

const REGION_ORDER = [
  'Zürich', 'Ostschweiz', 'Nordwestschweiz', 'Bern/Mittelland',
  'Zentralschweiz', 'Vaud/Waadt', 'Wallis', 'Tessin', 'unzuordnungsbar',
]

function StatCard({ label, value, sub }: { label: string; value: number | string; sub?: string }) {
  return (
    <div style={{
      background: '#161b27',
      border: '1px solid #1e2a3a',
      borderRadius: 12,
      padding: '20px 24px',
      minWidth: 160,
    }}>
      <div style={{ fontSize: 13, color: '#64748b', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 32, fontWeight: 700, color: '#f1f5f9', lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: '#475569', marginTop: 6 }}>{sub}</div>}
    </div>
  )
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/stats')
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      setStats(json.stats)
    } catch (e) {
      setError(String(e))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  return (
    <div style={{ padding: '32px 40px', maxWidth: 1100 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#f1f5f9', margin: 0 }}>Dashboard</h1>
        <p style={{ fontSize: 14, color: '#64748b', marginTop: 6 }}>
          Übersicht aller gescrapten Stellenanzeigen
        </p>
      </div>

      {loading && (
        <div style={{ color: '#64748b', fontSize: 14 }}>Lade Daten...</div>
      )}
      {error && (
        <div style={{ color: '#f87171', background: '#1e1a1a', padding: 16, borderRadius: 8, fontSize: 14 }}>
          Fehler: {error}
        </div>
      )}

      {stats && (
        <>
          {/* Top stats */}
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 32 }}>
            <StatCard label="Stellen gesamt" value={stats.total} />
            <StatCard label="Aktiv" value={stats.active} sub={`${stats.total - stats.active} inaktiv`} />
            <StatCard label="Quellen" value={stats.sources} />
          </div>

          {/* Region breakdown */}
          <div style={{
            background: '#161b27',
            border: '1px solid #1e2a3a',
            borderRadius: 12,
            padding: '24px',
          }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: '#cbd5e1', margin: '0 0 20px' }}>
              Stellen nach Region
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
              {REGION_ORDER.map(region => {
                const count = stats.regions[region] ?? 0
                const maxCount = Math.max(...Object.values(stats.regions), 1)
                const pct = Math.round((count / maxCount) * 100)
                const isUnassigned = region === 'unzuordnungsbar'
                return (
                  <div key={region} style={{
                    background: isUnassigned ? '#1a0f00' : '#0f1117',
                    borderRadius: 8,
                    padding: '12px 16px',
                    border: isUnassigned ? '1px dashed #c2410c' : '1px solid #1e2a3a',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontSize: 13, color: isUnassigned ? '#f97316' : '#94a3b8', display: 'flex', alignItems: 'center', gap: 5 }}>
                        {isUnassigned && <span>⚠</span>}
                        {region}
                      </span>
                      <span style={{ fontSize: 14, fontWeight: 700, color: isUnassigned ? '#f97316' : '#e2e8f0' }}>{count}</span>
                    </div>
                    <div style={{ height: 4, background: '#1e2a3a', borderRadius: 2 }}>
                      <div style={{
                        height: '100%',
                        width: `${pct}%`,
                        background: isUnassigned ? '#ea580c' : '#3b82f6',
                        borderRadius: 2,
                        transition: 'width 0.5s ease',
                      }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
