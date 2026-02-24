// Schweizer Karten-Platzhalter mit Live-Daten-Feeling
// Interaktive Karte mit echten Stellenzahlen folgt sobald API verbunden ist
import type { Route } from 'next'
import Link from 'next/link'

type Canton = {
  abbr: string
  xPct: number
  yPct: number
  count: number
  href?: string
}

const CANTONS: Canton[] = [
  { abbr: 'ZH', xPct: 67, yPct: 24, count: 120 },
  { abbr: 'BE', xPct: 38, yPct: 44, count: 85 },
  { abbr: 'LU', xPct: 53, yPct: 39, count: 58, href: '/quereinsteiger-jobs-luzern' },
  { abbr: 'BS', xPct: 26, yPct: 16, count: 42 },
  { abbr: 'SG', xPct: 81, yPct: 27, count: 38 },
  { abbr: 'AG', xPct: 47, yPct: 28, count: 35 },
  { abbr: 'GE', xPct: 15, yPct: 64, count: 28 },
  { abbr: 'TI', xPct: 72, yPct: 80, count: 8 },
  { abbr: 'VS', xPct: 42, yPct: 73, count: 6 },
  { abbr: 'GR', xPct: 76, yPct: 50, count: 5 },
]

// Server-side: Stunden bis zum nächsten Scan um 06:00 Schweizer Zeit
function getNextUpdateLabel(): string {
  const now = new Date()
  const month = now.getUTCMonth()
  const isDST = month >= 2 && month <= 9
  const swissHour = (now.getUTCHours() + (isDST ? 2 : 1)) % 24
  const hoursTo6 = swissHour < 6 ? 6 - swissHour : 24 - swissHour + 6
  if (hoursTo6 <= 1) return 'in weniger als 1 Stunde'
  return `in ${hoursTo6} Stunden`
}

// Pin-Grösse nach Stellenanzahl
function pinSize(count: number): string {
  if (count >= 80) return 'w-11 h-11'
  if (count >= 40) return 'w-9 h-9'
  if (count >= 20) return 'w-8 h-8'
  return 'w-7 h-7'
}

function pinOpacity(count: number): string {
  if (count >= 80) return 'bg-orange/25 border-orange/60'
  if (count >= 40) return 'bg-orange/18 border-orange/45'
  if (count >= 20) return 'bg-orange/12 border-orange/35'
  return 'bg-orange/8 border-orange/25'
}

export default function SwissMapPlaceholder() {
  const nextUpdate = getNextUpdateLabel()

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
            fillOpacity="0.07"
            stroke="var(--color-blue)"
            strokeOpacity="0.18"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>

        {/* Kantons-Pins mit Stellenanzahl */}
        {CANTONS.map((c) => {
          const pin = (
            <div
              className={`flex flex-col items-center gap-0.5 group`}
              title={`${c.count} Quereinsteiger-Stellen in ${c.abbr}`}
            >
              <div
                className={`${pinSize(c.count)} rounded-full ${pinOpacity(c.count)} border flex items-center justify-center transition-all hover:scale-110`}
              >
                <span className="text-[9px] font-extrabold text-dark/70 select-none leading-none">
                  {c.abbr}
                </span>
              </div>
              <span className="text-[8px] font-bold text-dark/40 tabular-nums leading-none select-none">
                {c.count}
              </span>
            </div>
          )

          return (
            <div
              key={c.abbr}
              className="absolute"
              style={{
                left: `${c.xPct}%`,
                top: `${c.yPct}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              {c.href ? (
                <Link href={c.href as Route} title={`Quereinsteiger Jobs ${c.abbr} ansehen`}>
                  {pin}
                </Link>
              ) : (
                <div className="cursor-default">{pin}</div>
              )}
            </div>
          )
        })}

        {/* Oben links: Live-Zähler */}
        <div className="absolute top-4 left-4">
          <span className="inline-flex items-center gap-1.5 bg-white border border-border text-xs font-semibold text-dark px-3 py-1.5 rounded-full shadow-sm">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse flex-shrink-0" />
            425 Stellen aktuell
          </span>
        </div>

        {/* Oben rechts: Nächstes Update */}
        <div className="absolute top-4 right-4">
          <span className="inline-flex items-center gap-1.5 bg-white border border-border text-xs font-semibold text-muted px-3 py-1.5 rounded-full shadow-sm">
            <svg
              className="w-3 h-3 text-orange flex-shrink-0"
              viewBox="0 0 12 12"
              fill="none"
              aria-hidden="true"
            >
              <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M6 3v3l2 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            Nächstes Update {nextUpdate}
          </span>
        </div>

        {/* Unten: Quellen + Versprechen */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white/80 to-transparent pt-6 pb-3 px-4">
          <p className="text-center text-[10px] text-muted/70 leading-relaxed">
            <span className="font-semibold text-dark/60">Alle mit explizitem Quereinstieg-Willkommen</span>
            {' · '}gescannt aus Jobs.ch, Indeed.ch, JobScout24, Jobup.ch, Jobagent.ch
          </p>
        </div>

      </div>
    </div>
  )
}
