// Bereinigt Scraper-Garbage aus rohen Stellentiteln.
//
// Problem: jobscout24 (und ähnliche Portale) bauen Job-Karten so, dass
// das <a>-Element den GESAMTEN Kartentext enthält:
//   "Letzten MonatJob-TitelArbeitsort:OrtPensum:80%VertragsartFirmaIst der Job..."
// Wenn der gezielte Selektor ([data-cy="job-title"]) nicht matched,
// landet dieser Volltext als "Titel" in der DB.
//
// Diese Funktion extrahiert nur den echten Stellentitel.

export function cleanJobTitle(raw: string): string {
  if (!raw) return ''

  let t = raw.trim()

  // 1. Zeitstempel-Präfix abschneiden (direkt verklebt ohne Leerzeichen)
  //    Bsp: "VorgesternBauleiter" → "Bauleiter"
  //         "Letzten MonatConsultant ..." → "Consultant ..."
  t = t.replace(/^(?:letzten\s+monat|vor\s+\d+\s+wochen?|vor\s+\d+\s+tagen?|gestern|vorgestern|heute)\s*/i, '')

  // 2. Metadaten-Suffix abschneiden (alles ab den Job-Karten-Labels)
  t = t.replace(/\s*arbeitsort\s*:.*$/is, '')
  t = t.replace(/\s*pensum\s*:.*$/is, '')
  t = t.replace(/\s*vertragsart\s*:.*$/is, '')
  t = t.replace(/\s*ist der job relevant.*$/i, '')
  t = t.replace(/\s*einfach bewerben.*$/i, '')

  return t.trim()
}

// Erkennt ob ein bereinigter Titel noch Scraper-Garbage enthält
export function isGarbageTitle(title: string): boolean {
  const t = title.toLowerCase()
  if (t.includes('arbeitsort:')) return true
  if (t.includes('pensum:')) return true
  if (t.includes('vertragsart:')) return true
  if (t.includes('ist der job relevant')) return true
  if (/^(?:letzten monat|vor \d+ wochen?|vor \d+ tagen?|gestern|vorgestern|heute)/i.test(title)) return true
  return false
}
