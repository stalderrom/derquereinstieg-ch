'use client'

// SwissRegionMap — SVG-basierte Schweizerkarte mit 8 vereinfachten Regionen
// Verwendung: Admin /admin/map + öffentliches Frontend

import { useState } from 'react'

export type RegionName =
  | 'Zürich'
  | 'Ostschweiz'
  | 'Nordwestschweiz'
  | 'Bern/Mittelland'
  | 'Zentralschweiz'
  | 'Vaud/Waadt'
  | 'Wallis'
  | 'Tessin'
  | 'unzuordnungsbar'

interface Props {
  data?: Record<string, number>
  onRegionClick?: (region: RegionName) => void
  selectedRegion?: string | null
  theme?: 'dark' | 'light'
}

// viewBox: 0 0 620 430
// Pfade sind vereinfachte geografische Annäherungen der 8 Regionen
const REGION_PATHS: Partial<Record<RegionName, { path: string; labelX: number; labelY: number }>> = {
  'Vaud/Waadt': {
    // Westlicher Teil: Genf + Waadt, nördlich des Genfersees
    path: 'M 78 188 L 58 228 L 72 258 L 105 268 L 158 258 L 195 238 L 208 198 L 188 168 L 148 158 L 108 175 Z',
    labelX: 133,
    labelY: 215,
  },
  'Wallis': {
    // Südlicher Teil: Rhonetal, unterhalb Vaud
    path: 'M 72 258 L 58 295 L 78 338 L 118 358 L 158 348 L 218 338 L 290 318 L 335 295 L 318 268 L 265 255 L 200 250 L 158 258 L 105 268 Z',
    labelX: 195,
    labelY: 305,
  },
  'Bern/Mittelland': {
    path: 'M 200 155 L 188 198 L 208 238 L 280 268 L 325 258 L 345 228 L 335 188 L 305 158 L 265 148 L 232 153 Z',
    labelX: 270,
    labelY: 210,
  },
  'Nordwestschweiz': {
    path: 'M 302 95 L 280 128 L 292 158 L 335 162 L 375 148 L 392 118 L 372 88 L 342 83 Z',
    labelX: 338,
    labelY: 128,
  },
  'Zürich': {
    path: 'M 392 88 L 372 118 L 382 158 L 422 172 L 462 162 L 482 138 L 472 103 L 442 83 Z',
    labelX: 432,
    labelY: 132,
  },
  'Zentralschweiz': {
    path: 'M 342 168 L 332 208 L 352 248 L 402 268 L 442 252 L 462 218 L 452 178 L 422 165 L 392 165 Z',
    labelX: 397,
    labelY: 215,
  },
  'Ostschweiz': {
    path: 'M 462 78 L 442 108 L 452 148 L 492 172 L 542 168 L 582 148 L 602 118 L 582 83 L 542 68 L 502 70 Z',
    labelX: 522,
    labelY: 122,
  },
  'Tessin': {
    path: 'M 385 278 L 362 318 L 372 372 L 412 402 L 452 392 L 472 352 L 462 302 L 432 275 Z',
    labelX: 418,
    labelY: 335,
  },
}

function getColor(count: number, max: number, isSelected: boolean, theme: 'dark' | 'light'): string {
  if (isSelected) return theme === 'dark' ? '#3b82f6' : '#2563eb'
  if (count === 0 || max === 0) return theme === 'dark' ? '#1e2a3a' : '#e2e8f0'
  const intensity = Math.max(0.18, count / max)
  if (theme === 'dark') {
    const b = Math.round(80 + intensity * 90)
    return `rgb(20, ${Math.round(40 + intensity * 55)}, ${b})`
  }
  const g = Math.round(80 + (1 - intensity) * 140)
  return `rgb(37, ${g}, 235)`
}

export function SwissRegionMap({ data = {}, onRegionClick, selectedRegion, theme = 'light' }: Props) {
  const [hovered, setHovered] = useState<RegionName | null>(null)

  const maxCount = Math.max(...Object.values(data).filter((_, i) =>
    Object.keys(data)[i] !== 'unzuordnungsbar'
  ), 1)

  const unassigned = data['unzuordnungsbar'] ?? 0
  const bg = theme === 'dark' ? '#0f1117' : '#f8fafc'
  const textColor = theme === 'dark' ? '#e2e8f0' : '#1e293b'
  const borderColor = theme === 'dark' ? '#1e2a3a' : '#cbd5e1'
  const stroke = theme === 'dark' ? '#0f1117' : '#fff'

  const activeRegion = hovered ?? (selectedRegion as RegionName | null)

  return (
    <div style={{ background: bg, borderRadius: 16, border: `1px solid ${borderColor}`, overflow: 'hidden' }}>
      {/* Tooltip bar */}
      <div style={{
        padding: '10px 18px',
        borderBottom: `1px solid ${borderColor}`,
        minHeight: 44,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {activeRegion && activeRegion !== 'unzuordnungsbar' ? (
            <>
              <span style={{ fontSize: 14, fontWeight: 600, color: textColor }}>{activeRegion}</span>
              <span style={{
                background: theme === 'dark' ? '#1e3a5f' : '#dbeafe',
                color: theme === 'dark' ? '#93c5fd' : '#1d4ed8',
                borderRadius: 999,
                padding: '2px 10px',
                fontSize: 13,
                fontWeight: 700,
              }}>
                {data[activeRegion] ?? 0} Stellen
              </span>
            </>
          ) : (
            <span style={{ fontSize: 13, color: theme === 'dark' ? '#475569' : '#94a3b8' }}>
              Region anklicken oder hovern
            </span>
          )}
        </div>

        {/* Unassigned badge — always visible when count > 0 */}
        {unassigned > 0 && (
          <button
            onClick={() => onRegionClick?.('unzuordnungsbar')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              background: selectedRegion === 'unzuordnungsbar'
                ? '#7c2d12'
                : theme === 'dark' ? '#1c1008' : '#fff7ed',
              border: `1px dashed ${selectedRegion === 'unzuordnungsbar' ? '#ea580c' : '#f97316'}`,
              borderRadius: 6,
              padding: '3px 10px',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            <span style={{ fontSize: 13, color: '#f97316' }}>⚠</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#f97316' }}>{unassigned}</span>
            <span style={{ fontSize: 11, color: theme === 'dark' ? '#c2410c' : '#ea580c' }}>
              nicht zugeordnet
            </span>
          </button>
        )}
      </div>

      {/* SVG Map */}
      <svg
        viewBox="50 60 580 370"
        style={{ width: '100%', display: 'block' }}
        aria-label="Schweizer Regionenkarte"
      >
        {(Object.entries(REGION_PATHS) as [RegionName, { path: string; labelX: number; labelY: number }][])
          .map(([region, { path, labelX, labelY }]) => {
            const count = data[region] ?? 0
            const isSelected = selectedRegion === region
            const isHovered = hovered === region
            const fill = getColor(count, maxCount, isSelected, theme)

            return (
              <g
                key={region}
                onClick={() => onRegionClick?.(region)}
                onMouseEnter={() => setHovered(region)}
                onMouseLeave={() => setHovered(null)}
                style={{ cursor: onRegionClick ? 'pointer' : 'default' }}
              >
                <path
                  d={path}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={isHovered || isSelected ? 2.5 : 1.5}
                  opacity={isHovered ? 0.88 : 1}
                  style={{ transition: 'fill 0.2s, stroke-width 0.15s' }}
                />
                {/* Region label */}
                <text
                  x={labelX}
                  y={labelY - 8}
                  textAnchor="middle"
                  fontSize={9}
                  fontWeight="500"
                  fill={theme === 'dark' ? '#94a3b8' : 'rgba(255,255,255,0.75)'}
                  style={{ pointerEvents: 'none', userSelect: 'none' }}
                >
                  {region}
                </text>
                {/* Count badge */}
                {count > 0 && (
                  <text
                    x={labelX}
                    y={labelY + 6}
                    textAnchor="middle"
                    fontSize={14}
                    fontWeight="700"
                    fill={theme === 'dark' ? '#f1f5f9' : '#fff'}
                    style={{ pointerEvents: 'none', userSelect: 'none' }}
                  >
                    {count}
                  </text>
                )}
              </g>
            )
          })}

        {/* Unzuordnungsbar — gestricheltes Fragezeichen-Feld rechts unten */}
        {unassigned > 0 && (
          <g
            onClick={() => onRegionClick?.('unzuordnungsbar')}
            style={{ cursor: onRegionClick ? 'pointer' : 'default' }}
            onMouseEnter={() => setHovered('unzuordnungsbar')}
            onMouseLeave={() => setHovered(null)}
          >
            <rect
              x={502}
              y={358}
              width={118}
              height={52}
              rx={8}
              fill={selectedRegion === 'unzuordnungsbar'
                ? 'rgba(234,88,12,0.25)'
                : hovered === 'unzuordnungsbar'
                  ? 'rgba(251,146,60,0.12)'
                  : 'rgba(234,88,12,0.08)'}
              stroke="#f97316"
              strokeWidth={1.5}
              strokeDasharray="5 3"
              style={{ transition: 'fill 0.15s' }}
            />
            <text x={520} y={378} fontSize={11} fill="#f97316" fontWeight="500"
              style={{ pointerEvents: 'none', userSelect: 'none' }}>
              ⚠ Nicht zugeordnet
            </text>
            <text x={561} y={398} fontSize={16} fontWeight="800" fill="#f97316" textAnchor="middle"
              style={{ pointerEvents: 'none', userSelect: 'none' }}>
              {unassigned}
            </text>
          </g>
        )}
      </svg>
    </div>
  )
}

export default SwissRegionMap
