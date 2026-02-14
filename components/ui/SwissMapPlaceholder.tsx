// Vereinfachter Schweizer Karten-Platzhalter
// Interaktive Live-Karte wird eingebaut sobald API verbunden ist

type Canton = { abbr: string; xPct: number; yPct: number }

// Positionen in % des SVG-ViewBox (600 × 380)
const CANTONS: Canton[] = [
  { abbr: 'ZH', xPct: 67, yPct: 24 },
  { abbr: 'BE', xPct: 38, yPct: 44 },
  { abbr: 'BS', xPct: 26, yPct: 16 },
  { abbr: 'LU', xPct: 53, yPct: 39 },
  { abbr: 'SG', xPct: 81, yPct: 27 },
  { abbr: 'AG', xPct: 47, yPct: 28 },
  { abbr: 'GE', xPct: 15, yPct: 64 },
  { abbr: 'TI', xPct: 72, yPct: 80 },
  { abbr: 'VS', xPct: 42, yPct: 73 },
  { abbr: 'GR', xPct: 76, yPct: 50 },
]

export default function SwissMapPlaceholder() {
  return (
    <div
      className="relative w-full rounded-2xl overflow-hidden bg-blue/[0.04] border border-border"
      style={{ paddingBottom: '58%' }}
      aria-label="Karte der Schweiz mit Quereinsteiger-Stellen nach Kanton"
    >
      <div className="absolute inset-0">
        {/* SVG Schweizer Umriss */}
        <svg
          viewBox="0 0 600 380"
          className="absolute inset-0 w-full h-full"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M 140,50 L 220,35 L 320,30 L 420,45 L 480,60
               L 555,110 L 570,170 L 545,200 L 510,210
               L 490,250 L 460,290 L 440,320 L 415,350
               L 395,360 L 380,345 L 355,320 L 310,300
               L 260,285 L 210,280 L 165,265 L 95,245
               L 75,215 L 90,175 L 120,135 L 140,50 Z"
            fill="var(--color-blue)"
            fillOpacity="0.08"
            stroke="var(--color-blue)"
            strokeOpacity="0.22"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>

        {/* Kantons-Pins */}
        {CANTONS.map((c) => (
          <div
            key={c.abbr}
            className="absolute"
            style={{
              left: `${c.xPct}%`,
              top: `${c.yPct}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <div className="w-7 h-7 rounded-full bg-orange/15 border border-orange/35 flex items-center justify-center hover:bg-orange/25 transition-colors cursor-default">
              <span className="text-[9px] font-bold text-dark/55 select-none">{c.abbr}</span>
            </div>
          </div>
        ))}

        {/* Coming-soon Badge oben rechts */}
        <div className="absolute top-4 right-4">
          <span className="inline-flex items-center gap-1.5 bg-white border border-border text-xs font-semibold text-muted px-3 py-1.5 rounded-full shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-orange animate-pulse" />
            Live-Karte folgt
          </span>
        </div>

        {/* Unten: Quelle */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center">
          <p className="text-[11px] text-muted/50">
            425+ Stellen · täglich aktualisiert aus Schweizer Jobportalen
          </p>
        </div>
      </div>
    </div>
  )
}
