'use client'

// Approximate job coverage per region (% of total Swiss job market)
const REGION_COVERAGE: Record<string, number> = {
  'Zürich': 28,
  'Bern': 14,
  'Basel': 10,
  'Aargau': 8,
  'Luzern': 7,
  'Zentralschweiz': 5,
  'Ostschweiz': 7,
  'Thurgau': 4,
  'Westschweiz': 12,
  'Tessin': 5,
}

// Key cantons per region (shown as hint)
const REGION_CANTONS: Record<string, string> = {
  'Westschweiz':    'GE, VD, VS, NE, FR, JU',
  'Basel':          'BS, BL',
  'Aargau':         'AG',
  'Zürich':         'ZH',
  'Thurgau':        'TG',
  'Ostschweiz':     'SG, GR, SH, AR, AI, GL',
  'Bern':           'BE, SO',
  'Luzern':         'LU',
  'Zentralschweiz': 'ZG, SZ, UR, OW, NW',
  'Tessin':         'TI',
}

// CSS Grid layout: 6 columns × 3 rows
// Each region: { col, row, colSpan, rowSpan }
const REGION_CELLS: Record<string, { col: number; row: number; colSpan: number; rowSpan: number }> = {
  'Westschweiz':     { col: 1, row: 1, colSpan: 1, rowSpan: 2 },
  'Basel':           { col: 2, row: 1, colSpan: 1, rowSpan: 1 },
  'Aargau':          { col: 3, row: 1, colSpan: 1, rowSpan: 1 },
  'Zürich':          { col: 4, row: 1, colSpan: 1, rowSpan: 1 },
  'Thurgau':         { col: 5, row: 1, colSpan: 1, rowSpan: 1 },
  'Ostschweiz':      { col: 6, row: 1, colSpan: 1, rowSpan: 2 },
  'Bern':            { col: 2, row: 2, colSpan: 2, rowSpan: 1 },
  'Luzern':          { col: 4, row: 2, colSpan: 1, rowSpan: 1 },
  'Zentralschweiz':  { col: 5, row: 2, colSpan: 1, rowSpan: 1 },
  'Tessin':          { col: 2, row: 3, colSpan: 5, rowSpan: 1 },
}

const ALL_REGIONS = Object.keys(REGION_CELLS)

interface RegionPickerProps {
  selected: string[]
  onChange: (regions: string[]) => void
  compact?: boolean
  jobCounts?: Record<string, number>
}

export default function RegionPicker({ selected, onChange, compact = false, jobCounts }: RegionPickerProps) {
  function toggle(region: string) {
    if (selected.includes(region)) {
      onChange(selected.filter(r => r !== region))
    } else {
      onChange([...selected, region])
    }
  }

  function selectAll() { onChange([...ALL_REGIONS]) }
  function clearAll() { onChange([]) }

  // Echte Job-Zahlen wenn vorhanden, sonst geschätzte Prozentzahlen
  const hasRealCounts = jobCounts && Object.keys(jobCounts).length > 0
  const totalJobs = hasRealCounts ? Object.values(jobCounts).reduce((a, b) => a + b, 0) : 0
  const selectedJobs = hasRealCounts ? selected.reduce((sum, r) => sum + (jobCounts[r] ?? 0), 0) : 0
  const totalCoverage = selected.reduce((sum, r) => sum + (REGION_COVERAGE[r] ?? 0), 0)
  const cappedCoverage = Math.min(totalCoverage, 100)
  const coveragePct = hasRealCounts && totalJobs > 0 ? Math.round((selectedJobs / totalJobs) * 100) : cappedCoverage

  return (
    <div>
      {/* Switzerland Map Grid */}
      <div style={{ position: 'relative', marginBottom: 10 }}>
        {/* Compass */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 4 }}>
          <span style={{ fontSize: 10, color: '#9CA3AF', fontWeight: 600, letterSpacing: '0.1em' }}>N</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ fontSize: 10, color: '#9CA3AF', fontWeight: 600, letterSpacing: '0.1em', writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>W</span>

          {/* Map grid */}
          <div style={{
            flex: 1,
            display: 'grid',
            gridTemplateColumns: compact ? 'repeat(6, 1fr)' : '1fr 1.2fr 1.2fr 1.2fr 1fr 1fr',
            gridTemplateRows: compact ? 'repeat(3, 44px)' : 'repeat(3, 62px)',
            gap: 3,
            background: '#EBF4F8',
            borderRadius: 8,
            padding: 6,
            border: '1px solid #D1E8F0',
          }}>
            {ALL_REGIONS.map(region => {
              const cell = REGION_CELLS[region]
              const isSelected = selected.includes(region)
              const coverage = REGION_COVERAGE[region]
              const cantons = REGION_CANTONS[region]
              // Wenn Counts geladen: fehlende Region = 0 Jobs (nicht undefined)
              const jobCount = hasRealCounts ? (jobCounts![region] ?? 0) : undefined

              return (
                <button
                  key={region}
                  onClick={() => toggle(region)}
                  style={{
                    gridColumn: `${cell.col} / span ${cell.colSpan}`,
                    gridRow: `${cell.row} / span ${cell.rowSpan}`,
                    background: isSelected
                      ? 'linear-gradient(135deg, #E67E22, #F39C12)'
                      : '#fff',
                    border: isSelected ? '2px solid #D35400' : '1.5px solid #D1D5DB',
                    borderRadius: 6,
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: compact ? '2px 3px' : '4px 6px',
                    transition: 'all 0.15s ease',
                    boxShadow: isSelected ? '0 2px 8px rgba(230,126,34,0.35)' : '0 1px 3px rgba(0,0,0,0.06)',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  {/* Topographic texture for unselected */}
                  {!isSelected && (
                    <div style={{
                      position: 'absolute', inset: 0,
                      background: 'repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(0,0,0,0.02) 4px, rgba(0,0,0,0.02) 5px)',
                      pointerEvents: 'none',
                    }} />
                  )}
                  <span style={{
                    fontSize: compact ? 9 : 10,
                    fontWeight: 700,
                    color: isSelected ? '#fff' : '#374151',
                    textAlign: 'center',
                    lineHeight: 1.2,
                    position: 'relative',
                  }}>
                    {region}
                  </span>
                  {/* Job-Anzahl (wenn verfügbar), sonst Kantone */}
                  {jobCount !== undefined ? (
                    <span style={{
                      fontSize: compact ? 8 : 9,
                      fontWeight: jobCount === 0 ? 400 : 700,
                      color: jobCount === 0
                        ? (isSelected ? 'rgba(255,255,255,0.5)' : '#D1D5DB')
                        : (isSelected ? 'rgba(255,255,255,0.9)' : '#374151'),
                      position: 'relative',
                      marginTop: 1,
                    }}>
                      {jobCount.toLocaleString('de-CH')} Jobs
                    </span>
                  ) : (
                    <span style={{
                      fontSize: compact ? 7 : 8,
                      color: isSelected ? 'rgba(255,255,255,0.7)' : '#9CA3AF',
                      position: 'relative',
                      textAlign: 'center',
                      lineHeight: 1.3,
                      marginTop: 1,
                    }}>
                      {cantons}
                    </span>
                  )}
                  {/* Kantone immer in non-compact wenn Platz */}
                  {!compact && jobCount !== undefined && (
                    <span style={{
                      fontSize: 7,
                      color: isSelected ? 'rgba(255,255,255,0.6)' : '#9CA3AF',
                      position: 'relative',
                      textAlign: 'center',
                    }}>
                      {cantons}
                    </span>
                  )}
                  {isSelected && (
                    <span style={{
                      position: 'absolute',
                      top: 3,
                      right: 4,
                      fontSize: 9,
                      color: 'rgba(255,255,255,0.9)',
                    }}>✓</span>
                  )}
                </button>
              )
            })}
          </div>

          <span style={{ fontSize: 10, color: '#9CA3AF', fontWeight: 600, letterSpacing: '0.1em', writingMode: 'vertical-rl' }}>O</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 4 }}>
          <span style={{ fontSize: 10, color: '#9CA3AF', fontWeight: 600, letterSpacing: '0.1em' }}>S</span>
        </div>
      </div>

      {/* Coverage indicator */}
      <div style={{
        background: '#F9FAFB',
        border: '1px solid #E5E7EB',
        borderRadius: 8,
        padding: '10px 14px',
        marginBottom: 8,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <span style={{ fontSize: 12, color: '#6B7280', fontWeight: 600 }}>
            {selected.length === 0
              ? 'Keine Region gewählt'
              : selected.length === ALL_REGIONS.length
              ? 'Ganze Schweiz'
              : `${selected.length} Region${selected.length !== 1 ? 'en' : ''} gewählt`}
          </span>
          <span style={{
            fontSize: 12,
            fontWeight: 700,
            color: coveragePct > 50 ? '#059669' : coveragePct > 20 ? '#D97706' : '#6B7280',
          }}>
            {hasRealCounts && selected.length > 0
              ? `${selectedJobs.toLocaleString('de-CH')} von ${totalJobs.toLocaleString('de-CH')} Jobs`
              : selected.length === 0 ? `${totalJobs > 0 ? totalJobs.toLocaleString('de-CH') + ' Jobs total' : '–'}`
              : `~${coveragePct}% aller Jobs`}
          </span>
        </div>
        {/* Progress bar */}
        <div style={{ height: 6, background: '#E5E7EB', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${coveragePct}%`,
            background: coveragePct > 50
              ? 'linear-gradient(90deg, #059669, #34D399)'
              : 'linear-gradient(90deg, #E67E22, #F59E0B)',
            borderRadius: 3,
            transition: 'width 0.3s ease',
          }} />
        </div>
        {selected.length > 0 && !compact && (
          <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 6 }}>
            {selected.slice(0, 5).join(', ')}{selected.length > 5 ? ` +${selected.length - 5} weitere` : ''}
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={selectAll}
          style={{ fontSize: 12, color: '#6B7280', background: '#F3F4F6', border: 'none', borderRadius: 6, padding: '5px 12px', cursor: 'pointer' }}
        >
          Alle
        </button>
        <button
          onClick={clearAll}
          style={{ fontSize: 12, color: '#6B7280', background: '#F3F4F6', border: 'none', borderRadius: 6, padding: '5px 12px', cursor: 'pointer' }}
        >
          Keine
        </button>
        {!compact && (
          <button
            onClick={() => onChange(['Zürich', 'Aargau', 'Zentralschweiz', 'Luzern'])}
            style={{ fontSize: 12, color: '#6B7280', background: '#F3F4F6', border: 'none', borderRadius: 6, padding: '5px 12px', cursor: 'pointer' }}
          >
            Innerschweiz
          </button>
        )}
      </div>
    </div>
  )
}
