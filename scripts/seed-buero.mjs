/**
 * Seed-Skript: Erstellt /quereinstieg-buero als DRAFT in Sanity
 *
 * Voraussetzung:
 *   SANITY_WRITE_TOKEN in .env.local (Editor-Token von sanity.io/manage)
 *
 * Ausführen:
 *   node scripts/seed-buero.mjs
 */

import { createClient } from '@sanity/client'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

// .env.local manuell parsen (kein dotenv nötig)
const __dirname = dirname(fileURLToPath(import.meta.url))
const envPath = resolve(__dirname, '../.env.local')
const envContent = readFileSync(envPath, 'utf-8')
const env = Object.fromEntries(
  envContent
    .split('\n')
    .filter((l) => l && !l.startsWith('#'))
    .map((l) => l.split('=').map((s) => s.trim()))
    .filter(([k]) => k)
    .map(([k, ...v]) => [k, v.join('=')])
)

const projectId = env['NEXT_PUBLIC_SANITY_PROJECT_ID']
const dataset   = env['NEXT_PUBLIC_SANITY_DATASET'] ?? 'production'
const token     = env['SANITY_WRITE_TOKEN']

if (!projectId) {
  console.error('Fehler: NEXT_PUBLIC_SANITY_PROJECT_ID fehlt in .env.local')
  process.exit(1)
}
if (!token) {
  console.error('Fehler: SANITY_WRITE_TOKEN fehlt in .env.local')
  console.error('')
  console.error('Token erstellen:')
  console.error(`  https://www.sanity.io/organizations/oCcpI7CgN/project/${projectId}/api#tokens`)
  console.error('  → "Add API token" → Name: "Seed" → Rolle: "Editor"')
  console.error('  → Token in .env.local einfügen: SANITY_WRITE_TOKEN=sk...')
  process.exit(1)
}

const client = createClient({ projectId, dataset, token, apiVersion: '2024-01-01', useCdn: false })

// ─── Draft-Dokument ────────────────────────────────────────────────────────────
// Drafts haben _id mit Präfix "drafts." → unsichtbar für CDN/public fetches
const DOC_ID = 'drafts.quereinstieg-buero'

const document = {
  _id:   DOC_ID,
  _type: 'branchenSeite',

  title:        'Quereinstieg Büro & Administration',
  slug:         { _type: 'slug', current: 'quereinstieg-buero' },
  brancheLabel: 'Büro & Administration',

  // ── Hero ──────────────────────────────────────────────────────────────────
  heroHeadline: 'Quereinstieg Büro: Bürojobs in der Schweiz ohne klassische Büroausbildung',
  heroSubline:  'Sachbearbeitung, HR-Assistenz, Office-Management — viele Büropositionen setzen keine kaufmännische Grundausbildung voraus. Was zählt, zeigen wir dir.',
  heroStats: [
    { _key: 'stat1', value: '38+',        label: 'offene Bürojobs mit explizitem Quereinstieg-Willkommen' },
    { _key: 'stat2', value: 'CHF 58–78k', label: 'Lohnpotenzial nach 2 Jahren im neuen Büroberuf' },
    { _key: 'stat3', value: '3–6 Mo.',    label: 'kürzester Qualifikationsweg (Zertifikat berufsbegleitend)' },
  ],

  // ── Einleitung ────────────────────────────────────────────────────────────
  introText:
    'Der «klassische» Weg in den Bürobereich — kaufmännische Lehre oder KV-Ausbildung — ist längst nicht der einzige. Schweizer KMU und Grossunternehmen suchen dringend Sachbearbeiter, Office-Koordinatoren und HR-Assistenten. Wer strukturiert arbeiten kann, kommunikativ ist und digitale Tools beherrscht, hat gute Chancen — unabhängig vom Ausbildungshintergrund.',

  // ── Warum diese Branche ──────────────────────────────────────────────────
  warumHeadline: 'Warum jetzt Quereinstieg in Büro & Administration?',
  warumGruende: [
    {
      _key: 'grund1',
      titel: 'Transferkompetenzen zählen mehr als Abschlüsse',
      text:  'Wer in der Gastronomie Abläufe koordiniert hat, in der Logistik Daten gepflegt hat oder im Detailhandel Bestellungen abgewickelt hat — bringt exakt die Kompetenzen mit, die Büroarbeitgeber suchen. Ohne KV-EFZ.',
    },
    {
      _key: 'grund2',
      titel: 'Fachkräftemangel im kaufmännischen Bereich',
      text:  'Laut SECO fehlen in der Schweiz ca. 8\'000 Personen im kaufmännisch-administrativen Bereich. Viele Stellen werden bewusst an Quereinsteiger mit nachgewiesener Eigenverantwortung ausgeschrieben.',
    },
    {
      _key: 'grund3',
      titel: 'Kurze Zertifikatswege sind anerkannt',
      text:  'MS-Office-Zertifizierungen, Kaufmännisches Zertifikat (SVAEB), CAS Personalmanagement oder Projektmanagement-Zertifikate (IPMA Level D) gelten bei vielen Arbeitgebern als gleichwertig zu einem EFZ-Abschluss.',
    },
    {
      _key: 'grund4',
      titel: 'Home-Office & Hybrid als Einstiegsvorteil',
      text:  'Administrative Stellen werden in der Schweiz häufiger hybrid ausgeschrieben als andere Berufsfelder. Für Quereinsteiger mit Familienpflichten oder langen Arbeitswegen ein klarer Standortvorteil.',
    },
  ],

  // ── Typische Stellen ─────────────────────────────────────────────────────
  stellenHeadline: 'Bürojobs, in die Quereinsteiger direkt einsteigen können',
  typischeStellen: [
    {
      _key: 'stelle1',
      titel:        'Sachbearbeiter/in Administration',
      gehalt:       'CHF 55–68k/Jahr',
      barrier:      'Niedrig',
      beschreibung: 'Korrespondenz, Datenpflege, Terminkoordination. Oft Direkteinstieg möglich, wenn Grundkompetenzen Word/Excel und strukturiertes Arbeiten nachgewiesen werden.',
    },
    {
      _key: 'stelle2',
      titel:        'HR-Assistent/in',
      gehalt:       'CHF 60–72k/Jahr',
      barrier:      'Niedrig',
      beschreibung: 'Bewerbungsmanagement, Onboarding, Zeiterfassung. Viele KMU suchen kommunikative Personen — das HR-Grundwissen wird intern vermittelt oder über einen CAS (6 Monate) erworben.',
    },
    {
      _key: 'stelle3',
      titel:        'Office-Manager/in',
      gehalt:       'CHF 62–78k/Jahr',
      barrier:      'Niedrig',
      beschreibung: 'Koordination Büroalltag, Empfang, Event-Organisation, Lieferantenmanagement. Idealer Einstieg für Personen aus Gastronomie, Hotel oder Veranstaltungsbereich.',
    },
    {
      _key: 'stelle4',
      titel:        'Projektkoordinator/in',
      gehalt:       'CHF 65–85k/Jahr',
      barrier:      'Mittel',
      beschreibung: 'Terminplanung, Stakeholder-Kommunikation, Protokollführung. Mit IPMA Level D oder CAS Projektmanagement (3–6 Mo.) gut erreichbar.',
    },
    {
      _key: 'stelle5',
      titel:        'Kundenbetreuung B2B / Inside Sales',
      gehalt:       'CHF 58–72k/Jahr',
      barrier:      'Niedrig',
      beschreibung: 'Kundenpflege, Angebotserstellung, CRM-Pflege. Erfahrungen aus Verkauf, Gastronomie oder Logistik werden aktiv als Vorteil gewertet.',
    },
    {
      _key: 'stelle6',
      titel:        'Lohnbuchhaltungs-Assistent/in',
      gehalt:       'CHF 62–76k/Jahr',
      barrier:      'Mittel',
      beschreibung: 'Salärverarbeitung, Debitoren/Kreditoren. Einstieg über Buchhaltungszertifikat (z. B. VEBO, 4–6 Mo.) oder direkte Einarbeitung bei KMU.',
    },
  ],

  // ── Schritte ─────────────────────────────────────────────────────────────
  schritteHeadline: 'In 5 Schritten zum Bürojob als Quereinsteiger',
  schritte: [
    {
      _key: 'schritt1',
      nummer: 1,
      titel: 'Übertragbare Skills inventarisieren',
      text:  'Schreib auf, was du täglich machst: Koordinierst du Abläufe? Pflegst du Listen? Kommunizierst du mit Kunden? Fast jeder Beruf liefert administrative Transferkompetenzen.',
    },
    {
      _key: 'schritt2',
      nummer: 2,
      titel: 'Lücken mit Zertifikat schliessen',
      text:  'MS-Office (MO-200/201), SVAEB Kaufmännisches Zertifikat oder IPMA Level D sind die drei häufigsten Eintrittskarten. Kosten: CHF 500–2\'500. Dauer: 1–6 Monate, berufsbegleitend.',
    },
    {
      _key: 'schritt3',
      nummer: 3,
      titel: 'Ziel-Unternehmen identifizieren',
      text:  'KMU unter 50 Personen, Temporärbüros (Manpower, Adecco) und Startups sind am offensten für Quereinsteiger in Büropositionen. Grosse Konzerne verlangen häufig noch das KV-EFZ.',
    },
    {
      _key: 'schritt4',
      nummer: 4,
      titel: 'Bewerbung auf Quereinsteiger-Profil zuschneiden',
      text:  'Kein klassisches Berufsfeld-Bewerbungsschreiben. Statt Entschuldigung: Selbstbewusste Darstellung der Transferstärken. "Ich koordiniere seit 4 Jahren X und bringe Y mit."',
    },
    {
      _key: 'schritt5',
      nummer: 5,
      titel: 'Temporär als Sprungbrett nutzen',
      text:  'Manpower und Adecco vermitteln regelmässig Büroquereinsteiger mit 0–6 Monaten Erfahrung. 60% der Temporäreinsätze im kaufmännischen Bereich führen zu einer Festanstellung.',
    },
  ],

  // ── Lohntabelle ──────────────────────────────────────────────────────────
  lohnTabelle: [
    { _key: 'lohn1', position: 'Sachbearbeiter/in Administration', einsteiger: 'CHF 52–60k', erfahren: 'CHF 60–68k', senior: 'CHF 68–78k' },
    { _key: 'lohn2', position: 'HR-Assistent/in',                  einsteiger: 'CHF 55–62k', erfahren: 'CHF 62–72k', senior: 'CHF 72–85k' },
    { _key: 'lohn3', position: 'Office-Manager/in',                einsteiger: 'CHF 58–65k', erfahren: 'CHF 65–75k', senior: 'CHF 75–88k' },
    { _key: 'lohn4', position: 'Projektkoordinator/in',            einsteiger: 'CHF 62–70k', erfahren: 'CHF 70–82k', senior: 'CHF 82–98k' },
    { _key: 'lohn5', position: 'Lohnbuchhaltungs-Assistent/in',    einsteiger: 'CHF 58–66k', erfahren: 'CHF 66–76k', senior: 'CHF 76–88k' },
  ],

  // ── Bedenken / Mythen ─────────────────────────────────────────────────────
  bedenken: [
    {
      _key: 'bedenken1',
      mythos:    'Ohne KV-EFZ nehmen mich Büroarbeitgeber nicht ernst.',
      realitaet: 'KMU (80% der Schweizer Unternehmen) entscheiden pragmatisch: Wer den Job kann und schnell produktiv ist, wird genommen. Das EFZ ist ein Qualifikationsnachweis — kein Persilschein.',
    },
    {
      _key: 'bedenken2',
      mythos:    'Büroarbeit ist zu langweilig nach meinem bisherigen Job.',
      realitaet: 'Moderne Bürojobs sind hybrid, projektbasiert und digital. Office-Manager, Projektkoordinatoren und HR-Generalisten haben abwechslungsreiche, verantwortungsvolle Rollen — nichts mit 9-to-5-Aktenheften.',
    },
    {
      _key: 'bedenken3',
      mythos:    'Ich verdiene als Quereinsteiger viel weniger als ausgebildete Kaufleute.',
      realitaet: 'Im ersten Jahr liegt der Lohn meist 10–15% unter dem einer Person mit EFZ. Nach 2 Jahren sind die meisten Quereinsteiger auf gleichem oder höherem Niveau — weil sie Berufserfahrung aus einem anderen Bereich mitbringen.',
    },
    {
      _key: 'bedenken4',
      mythos:    'Ich bin zu alt für einen Einstieg ins Büro.',
      realitaet: 'Das Durchschnittsalter von Quereinsteigern in kaufmännischen Berufen liegt in der Schweiz bei 38 Jahren. Lebenserfahrung, Kundenumgang und Eigenverantwortung werden explizit gesucht.',
    },
  ],

  // ── FAQ ───────────────────────────────────────────────────────────────────
  faq: [
    {
      _key: 'faq1',
      frage:   'Welche Ausbildung brauche ich für einen Bürojob in der Schweiz?',
      antwort: 'Für viele Büropositionen reicht ein Zertifikatskurs (MS-Office, SVAEB, IPMA Level D) kombiniert mit nachgewiesener Berufserfahrung. Das KV-EFZ (kaufmännische Grundbildung) ist bei Grossunternehmen oft Voraussetzung, bei KMU und Temporärvermittlungen aber häufig verzichtbar.',
    },
    {
      _key: 'faq2',
      frage:   'Was ist das kaufmännische Zertifikat SVAEB?',
      antwort: 'Das SVAEB-Kaufmännische Zertifikat ist ein anerkannter Schweizer Abschluss für kaufmännische Grundkenntnisse — erworben in ca. 4 Monaten berufsbegleitend. Es ist kein EFZ-Ersatz, aber von vielen KMU als Eintrittsnachweis akzeptiert. Kosten: ca. CHF 1\'200–1\'800.',
    },
    {
      _key: 'faq3',
      frage:   'Wie finde ich Bürojobs mit Quereinstieg-Willkommen in der Schweiz?',
      antwort: 'Filtere auf Jobs.ch, Indeed.ch oder Jobup.ch nach "Quereinsteiger" + "Administration" oder "Sachbearbeitung". Temporärbüros (Manpower, Adecco, Kelly) bieten gezielt Einstiegspositionen für Quereinsteiger an — direkt auf deren Websites bewerben.',
    },
    {
      _key: 'faq4',
      frage:   'Was verdient ein Quereinsteiger im Bürobereich in der Schweiz?',
      antwort: 'Einstieg: CHF 52–65k/Jahr je nach Position und Kanton. Nach 2 Jahren liegen die meisten Quereinsteiger im kaufmännischen Bereich bei CHF 62–78k. Projektkoordinatoren und Office-Manager mit Verantwortung erreichen CHF 80–95k nach 4–5 Jahren.',
    },
    {
      _key: 'faq5',
      frage:   'Gibt es staatliche Förderung für den Quereinstieg ins Büro?',
      antwort: 'Ja: RAV (Regionales Arbeitsvermittlungszentrum) kann Kurskosten für Stellensuchende übernehmen. Auch Bildungsgutscheine der Kantone (z. B. Zürich, Bern) decken bis zu CHF 7\'500 Kurskosten für Erwachsene im Erstabschluss oder Berufsumstieg.',
    },
  ],

  // ── SEO ───────────────────────────────────────────────────────────────────
  seoTitle:       'Quereinstieg Büro Schweiz 2026 | Bürojobs ohne KV-EFZ | derquereinstieg.ch',
  seoDescription: 'Bürojob ohne kaufmännische Ausbildung? In der Schweiz möglich. 38+ offene Stellen, konkrete Zertifikatswege, Lohndaten für Quereinsteiger in Administration, HR und Office-Management.',
}

// ─── Upload ────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`Verbinde mit Sanity (Projekt: ${projectId}, Dataset: ${dataset}) ...`)
  try {
    const result = await client.createOrReplace(document)
    console.log(`\nDraft erstellt: ${result._id}`)
    console.log(`Typ: ${result._type}`)
    console.log(`\nIm Studio sichtbar unter: localhost:3004/studio`)
    console.log(`Slug: quereinstieg-buero`)
    console.log(`\nHinweis: Das Dokument ist ein Draft (nicht published).`)
    console.log(`Erst nach "Publish" im Studio ist es auf der Website sichtbar.`)
  } catch (err) {
    console.error('Fehler beim Erstellen:', err.message)
    process.exit(1)
  }
}

main()
