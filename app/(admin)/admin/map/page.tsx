'use client'

import { useEffect, useState } from 'react'
import { SwissRegionMap } from '@/components/ui/SwissRegionMap'

export default function MapPage() {
  const [regionData, setRegionData] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(r => r.json())
      .then(json => {
        setRegionData(json.stats?.regions ?? {})
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div style={{ padding: '32px 40px', maxWidth: 900 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#f1f5f9', margin: 0 }}>Schweizer Karte</h1>
        <p style={{ fontSize: 14, color: '#64748b', marginTop: 6 }}>
          Stellenverteilung nach Region
        </p>
      </div>

      {loading ? (
        <div style={{ color: '#64748b', fontSize: 14 }}>Lade Daten...</div>
      ) : (
        <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <div style={{ flex: '1 1 400px', minWidth: 320 }}>
            <SwissRegionMap
              data={regionData}
              onRegionClick={setSelected}
              selectedRegion={selected}
              theme="dark"
            />
          </div>

          {/* Legend */}
          <div style={{ flex: '0 0 220px' }}>
            <div style={{ background: '#161b27', border: '1px solid #1e2a3a', borderRadius: 12, padding: 20 }}>
              <h3 style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8', margin: '0 0 16px' }}>Regionen</h3>
              {Object.entries(regionData)
                .sort((a, b) => b[1] - a[1])
                .map(([region, count]) => (
                  <button
                    key={region}
                    onClick={() => setSelected(selected === region ? null : region)}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      width: '100%',
                      background: selected === region ? '#1e3a5f' : 'transparent',
                      border: 'none',
                      borderRadius: 6,
                      padding: '6px 8px',
                      cursor: 'pointer',
                      marginBottom: 2,
                    }}
                  >
                    <span style={{ fontSize: 13, color: '#94a3b8' }}>{region}</span>
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#e2e8f0' }}>{count}</span>
                  </button>
                ))}
              {Object.keys(regionData).length === 0 && (
                <p style={{ fontSize: 13, color: '#475569' }}>Noch keine Daten</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
