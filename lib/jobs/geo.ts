// Geo-Mapping: Kanton-Erkennung + 8-Regionen-Mapping

export const REGIONS = {
  'Zürich':           ['ZH'],
  'Ostschweiz':       ['SG', 'TG', 'AR', 'AI', 'GL', 'SH', 'GR'],
  'Nordwestschweiz':  ['BS', 'BL', 'AG', 'SO'],
  'Bern/Mittelland':  ['BE', 'FR', 'NE', 'JU'],
  'Zentralschweiz':   ['LU', 'ZG', 'SZ', 'OW', 'NW', 'UR'],
  'Vaud/Waadt':       ['GE', 'VD'],
  'Wallis':           ['VS'],
  'Tessin':           ['TI'],
} as const

export type RegionName = keyof typeof REGIONS | 'unzuordnungsbar'

// Maps each canton code to its region
const CANTON_TO_REGION: Record<string, RegionName> = {}
for (const [region, cantons] of Object.entries(REGIONS)) {
  for (const canton of cantons) {
    CANTON_TO_REGION[canton] = region as RegionName
  }
}

// Keyword → canton mapping (cities, canton names, abbreviations)
const LOCATION_KEYWORDS: Record<string, string> = {
  // ZH
  'zürich': 'ZH', 'zuerich': 'ZH', 'winterthur': 'ZH', 'uster': 'ZH',
  'dübendorf': 'ZH', 'dietikon': 'ZH', 'kloten': 'ZH', 'horgen': 'ZH',

  // BE
  'bern': 'BE', 'berne': 'BE', 'biel': 'BE', 'bienne': 'BE', 'thun': 'BE',
  'köniz': 'BE', 'burgdorf': 'BE', 'langenthal': 'BE',

  // LU
  'luzern': 'LU', 'lucerne': 'LU', 'kriens': 'LU', 'emmen': 'LU',
  'sursee': 'LU', 'willisau': 'LU',

  // UR
  'altdorf': 'UR',

  // SZ
  'schwyz': 'SZ', 'lachen': 'SZ',

  // OW
  'sarnen': 'OW',

  // NW
  'stans': 'NW',

  // GL
  'glarus': 'GL',

  // ZG
  'zug': 'ZG', 'baar': 'ZG', 'cham': 'ZG',

  // FR
  'freiburg': 'FR', 'fribourg': 'FR', 'bulle': 'FR',

  // SO
  'solothurn': 'SO', 'olten': 'SO', 'grenchen': 'SO',

  // BS
  'basel': 'BS', 'bâle': 'BS',

  // BL
  'liestal': 'BL', 'allschwil': 'BL', 'reinach': 'BL',

  // SH
  'schaffhausen': 'SH',

  // AR
  'herisau': 'AR',

  // AI
  'appenzell': 'AI',

  // SG
  'st. gallen': 'SG', 'st gallen': 'SG', 'st.gallen': 'SG', 'Sankt gallen': 'SG',
  'wil': 'SG', 'rapperswil': 'SG', 'buchs': 'SG',

  // GR
  'chur': 'GR', 'davos': 'GR', 'arosa': 'GR', 'graubünden': 'GR',

  // AG
  'aarau': 'AG', 'aargau': 'AG', 'baden': 'AG', 'wettingen': 'AG',
  'rheinfelden': 'AG', 'brugg': 'AG',

  // TG
  'frauenfeld': 'TG', 'kreuzlingen': 'TG', 'thurgau': 'TG',

  // TI
  'lugano': 'TI', 'bellinzona': 'TI', 'locarno': 'TI', 'tessin': 'TI',
  'ticino': 'TI', 'mendrisio': 'TI',

  // VD  (Vaud/Waadt)
  'lausanne': 'VD', 'nyon': 'VD', 'yverdon': 'VD', 'vevey': 'VD',
  'montreux': 'VD', 'waadt': 'VD', 'vaud': 'VD', 'morges': 'VD',
  'renens': 'VD', 'prilly': 'VD',

  // VS  (Wallis)
  'sion': 'VS', 'sitten': 'VS', 'brig': 'VS', 'visp': 'VS',
  'martigny': 'VS', 'monthey': 'VS', 'wallis': 'VS', 'valais': 'VS',
  'zermatt': 'VS', 'saas-fee': 'VS', 'leuk': 'VS',

  // NE
  'neuchâtel': 'NE', 'neuenburg': 'NE', 'la chaux-de-fonds': 'NE',

  // GE  (Vaud/Waadt region)
  'genf': 'GE', 'genève': 'GE', 'geneva': 'GE', 'carouge': 'GE', 'lancy': 'GE',
  'meyrin': 'GE', 'vernier': 'GE', 'thônex': 'GE',

  // JU
  'delémont': 'JU', 'jura': 'JU',
}

// Canton abbreviations (e.g. "ZH" anywhere in the text)
const CANTON_CODES = new Set(Object.keys(CANTON_TO_REGION))

// Swiss PLZ (4-digit postal code) range → canton
// Ranges are approximate but cover the vast majority of Swiss addresses
function plzToCanton(plz: number): string | null {
  if (plz >= 1000 && plz <= 1299) return 'VD' // Lausanne, Nyon, etc. (GE overlap at 12xx handled below)
  if (plz >= 1200 && plz <= 1299) return 'GE' // Genf überlagert VD-Range
  if (plz >= 1300 && plz <= 1545) return 'VD'
  if (plz >= 1580 && plz <= 1699) return 'FR' // Murten, Freiburg-Umgebung
  if (plz >= 1700 && plz <= 1799) return 'FR' // Freiburg/Fribourg
  if (plz >= 1800 && plz <= 1899) return 'VD' // Vevey, Montreux
  if (plz >= 1900 && plz <= 1999) return 'VS' // Martigny, Sion-West
  if (plz >= 2000 && plz <= 2099) return 'NE' // Neuchâtel
  if (plz >= 2300 && plz <= 2399) return 'NE' // La Chaux-de-Fonds
  if (plz >= 2400 && plz <= 2699) return 'BE' // Biel, Solothurn-Rand
  if (plz >= 2800 && plz <= 2999) return 'JU' // Delémont, Jura
  if (plz >= 3000 && plz <= 3999) return 'BE' // Bern, Thun
  if (plz >= 3900 && plz <= 3999) return 'VS' // Visp, Brig, Zermatt
  if (plz >= 4000 && plz <= 4059) return 'BS' // Basel-Stadt
  if (plz >= 4100 && plz <= 4499) return 'BL' // Basel-Landschaft
  if (plz >= 4500 && plz <= 4799) return 'SO' // Solothurn, Olten
  if (plz >= 5000 && plz <= 5799) return 'AG' // Aarau, Baden
  if (plz >= 6000 && plz <= 6059) return 'LU' // Luzern
  if (plz >= 6060 && plz <= 6099) return 'OW' // Sarnen
  if (plz >= 6100 && plz <= 6299) return 'LU'
  if (plz >= 6300 && plz <= 6399) return 'ZG' // Zug, Baar
  if (plz >= 6400 && plz <= 6499) return 'SZ' // Schwyz, Küssnacht
  if (plz >= 6460 && plz <= 6499) return 'UR' // Altdorf (overlap, UR spezifischer)
  if (plz >= 6370 && plz <= 6389) return 'NW' // Stans
  if (plz >= 6500 && plz <= 6999) return 'TI' // Tessin
  if (plz >= 7000 && plz <= 7999) return 'GR' // Graubünden
  if (plz >= 8000 && plz <= 8199) return 'ZH' // Zürich Stadt + Umgebung
  if (plz >= 8200 && plz <= 8299) return 'SH' // Schaffhausen
  if (plz >= 8300 && plz <= 8499) return 'ZH'
  if (plz >= 8500 && plz <= 8599) return 'TG' // Frauenfeld
  if (plz >= 8600 && plz <= 8799) return 'ZH' // Dübendorf, Uster, Horgen
  if (plz >= 8800 && plz <= 8899) return 'ZH' // Horgen, Richterswil
  if (plz >= 8900 && plz <= 8999) return 'ZH' // Affoltern
  if (plz >= 9000 && plz <= 9299) return 'SG' // St. Gallen
  if (plz >= 9400 && plz <= 9499) return 'AR' // Herisau
  if (plz >= 9050 && plz <= 9108) return 'AI' // Appenzell
  if (plz >= 9300 && plz <= 9399) return 'TG'
  if (plz >= 9500 && plz <= 9699) return 'SG'
  return null
}

// Accepts multiple text fragments (e.g. location + title + description snippet)
// and returns the first canton that can be identified.
export function detectCanton(...textFragments: (string | null | undefined)[]): string | null {
  const combined = textFragments.filter(Boolean).join(' ')
  if (!combined) return null

  const lower = combined.toLowerCase().trim()

  // 1. Explicit canton abbreviation like "(ZH)" or ", ZH" or "ZH "
  const codeMatch = combined.match(/\b([A-Z]{2})\b/)
  if (codeMatch && CANTON_CODES.has(codeMatch[1])) {
    return codeMatch[1]
  }

  // 2. Keyword mapping (city names, canton names)
  for (const [keyword, canton] of Object.entries(LOCATION_KEYWORDS)) {
    if (lower.includes(keyword.toLowerCase())) {
      return canton
    }
  }

  // 3. Swiss PLZ (4-digit number) → canton
  const plzMatches = combined.match(/\b(\d{4})\b/g)
  if (plzMatches) {
    for (const match of plzMatches) {
      const canton = plzToCanton(parseInt(match, 10))
      if (canton) return canton
    }
  }

  return null
}

export function cantonToRegion(canton: string | null | undefined): RegionName {
  if (!canton) return 'unzuordnungsbar'
  return CANTON_TO_REGION[canton.toUpperCase()] ?? 'unzuordnungsbar'
}

export function getRegionStats(
  jobs: Array<{ region?: string | null }>
): Record<RegionName, number> {
  const stats: Record<string, number> = {
    'Zürich': 0,
    'Ostschweiz': 0,
    'Nordwestschweiz': 0,
    'Bern/Mittelland': 0,
    'Zentralschweiz': 0,
    'Vaud/Waadt': 0,
    'Wallis': 0,
    'Tessin': 0,
    'unzuordnungsbar': 0,
  }

  for (const job of jobs) {
    const region = job.region ?? 'unzuordnungsbar'
    if (region in stats) {
      stats[region]++
    } else {
      stats['unzuordnungsbar']++
    }
  }

  return stats as Record<RegionName, number>
}
