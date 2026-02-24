/**
 * Seed-Skript: Erstellt /quereinstieg-it als DRAFT in Sanity
 *
 * Ausführen:
 *   node scripts/seed-it.mjs
 */

import { createClient } from '@sanity/client'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

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

if (!projectId) { console.error('Fehler: NEXT_PUBLIC_SANITY_PROJECT_ID fehlt'); process.exit(1) }
if (!token)     { console.error('Fehler: SANITY_WRITE_TOKEN fehlt'); process.exit(1) }

const client = createClient({ projectId, dataset, token, apiVersion: '2024-01-01', useCdn: false })

const DOC_ID = 'drafts.quereinstieg-it'

const document = {
  _id:   DOC_ID,
  _type: 'branchenSeite',

  title:        'Quereinstieg IT & Technik',
  slug:         { _type: 'slug', current: 'quereinstieg-it' },
  brancheLabel: 'IT & Technik',

  // ── Hero ──────────────────────────────────────────────────────────────────
  heroHeadline: 'Quereinstieg IT Schweiz: In die Tech-Branche ohne Informatikstudium',
  heroSubline:  'IT-Support, Web-Entwicklung, Data-Analyse — die Schweizer IT-Branche sucht händeringend Fachkräfte und bildet Quereinsteiger gezielt ein. Mit dem richtigen Weg in 3–12 Monaten.',
  heroStats: [
    { _key: 'stat1', value: '46+',        label: 'offene IT-Jobs mit explizitem Quereinstieg-Willkommen' },
    { _key: 'stat2', value: 'CHF 65–95k', label: 'Lohnpotenzial nach 2 Jahren in der IT' },
    { _key: 'stat3', value: '3 Mo.',       label: 'kürzester Weg via IT-Support-Zertifikat (CompTIA A+)' },
  ],

  // ── Einleitung ────────────────────────────────────────────────────────────
  introText:
    'Die Schweiz hat einen der schärfsten IT-Fachkräftemangel Europas: ICTswitzerland schätzt, dass bis 2030 rund 40\'000 IT-Stellen unbesetzt bleiben. Das öffnet Türen für Quereinsteiger — aber nur für diejenigen, die strategisch vorgehen. Ein Informatikstudium ist in den meisten Einstiegspositionen keine Voraussetzung. Was zählt: nachgewiesene Skills, ein anerkanntes Zertifikat und die Bereitschaft, kontinuierlich zu lernen.',

  // ── Warum diese Branche ──────────────────────────────────────────────────
  warumHeadline: 'Warum jetzt Quereinstieg in die IT?',
  warumGruende: [
    {
      _key: 'grund1',
      titel: 'Akutester Fachkräftemangel in der Schweiz',
      text:  'ICTswitzerland: 2024 fehlten schweizweit über 22\'000 IT-Fachkräfte. Besonders gesucht: IT-Support, Cloud-Administration und Webentwicklung. Viele Firmen setzen explizit auf Quereinsteiger mit Bootcamp-Abschluss statt auf klassische Informatiker.',
    },
    {
      _key: 'grund2',
      titel: 'Skills zählen — nicht Titel',
      text:  'In der IT-Branche gilt das Meritokratie-Prinzip: Wer ein Problem löst, bekommt den Job. GitHub-Portfolio, Zertifikate und Bootcamp-Projekte werden gleichwertig zu Uni-Abschlüssen bewertet — in keiner anderen Branche ist das so ausgeprägt.',
    },
    {
      _key: 'grund3',
      titel: 'Kurze, anerkannte Ausbildungswege',
      text:  'CompTIA A+ (IT-Support, 3 Mo.), Google IT-Zertifikat (Coursera, 6 Mo.), AWS Certified Cloud Practitioner (2–3 Mo.), ISTQB Softwaretester (2 Mo.) — alles berufsbegleitend möglich und von Schweizer Arbeitgebern anerkannt.',
    },
    {
      _key: 'grund4',
      titel: 'Höchste Lohnprogression aller Quereinsteiger-Berufe',
      text:  'Kein anderes Berufsfeld zeigt eine steilere Lohnkurve als IT. Quereinsteiger mit 2 Jahren IT-Erfahrung verdienen in der Schweiz oft mehr als in ihrem ursprünglichen Beruf nach 10 Jahren. CHF 80k nach 3 Jahren ist realistisch.',
    },
  ],

  // ── Typische Stellen ─────────────────────────────────────────────────────
  stellenHeadline: 'IT-Jobs, in die Quereinsteiger direkt einsteigen können',
  typischeStellen: [
    {
      _key: 'stelle1',
      titel:        'IT-Support / Helpdesk',
      gehalt:       'CHF 55–70k/Jahr',
      barrier:      'Niedrig',
      beschreibung: 'Erster und häufigster Einstieg. Mit CompTIA A+ oder Google IT-Zertifikat (3–6 Mo.) sofort bewerbbar. Viele Schweizer KMU bieten interne Weiterbildung zur Systemadministration.',
    },
    {
      _key: 'stelle2',
      titel:        'Webentwickler/in (Frontend)',
      gehalt:       'CHF 68–88k/Jahr',
      barrier:      'Niedrig',
      beschreibung: 'HTML, CSS, JavaScript und ein Framework (React/Vue) reichen für Junior-Stellen. Mit Portfolio auf GitHub und 6-monatigem Bootcamp direkt einstiegsfähig. Viele Remote-Möglichkeiten.',
    },
    {
      _key: 'stelle3',
      titel:        'Data Analyst / BI Analyst',
      gehalt:       'CHF 72–95k/Jahr',
      barrier:      'Mittel',
      beschreibung: 'SQL, Python-Grundlagen, Excel/Power BI. Besonders attraktiv für Quereinsteiger aus Finanz, Marketing oder Logistik — Branchenverständnis wird als Mehrwert gewertet. Google Data Analytics Certificate (6 Mo.) als Einstieg.',
    },
    {
      _key: 'stelle4',
      titel:        'Cloud Administrator (Azure/AWS)',
      gehalt:       'CHF 75–98k/Jahr',
      barrier:      'Mittel',
      beschreibung: 'AWS Certified Cloud Practitioner oder Microsoft AZ-900 als Einstiegszertifikat (je 2–3 Mo.). Cloud-Skills sind derzeit das am stärksten wachsende IT-Segment in der Schweiz.',
    },
    {
      _key: 'stelle5',
      titel:        'IT-Projektkoordinator/in',
      gehalt:       'CHF 70–90k/Jahr',
      barrier:      'Niedrig',
      beschreibung: 'Kombination aus Projektmanagement und IT-Grundverständnis. Ideal für Quereinsteiger aus Management oder Administration. IPMA Level D + ITIL Foundation als Qualifikationsweg.',
    },
    {
      _key: 'stelle6',
      titel:        'Software-Tester / QA-Engineer',
      gehalt:       'CHF 65–85k/Jahr',
      barrier:      'Niedrig',
      beschreibung: 'ISTQB Foundation Level (2 Mo., ca. CHF 600) ist der anerkannteste Einstieg. Quereinsteiger mit analytischem Hintergrund (Qualitätssicherung, Pharma, Produktion) sind besonders gefragt.',
    },
  ],

  // ── Schritte ─────────────────────────────────────────────────────────────
  schritteHeadline: 'In 5 Schritten in die IT als Quereinsteiger',
  schritte: [
    {
      _key: 'schritt1',
      nummer: 1,
      titel: 'IT-Richtung wählen',
      text:  'Support, Entwicklung, Daten oder Cloud? Die Richtung bestimmt den Weg. Faustregel: IT-Support ist der schnellste Einstieg (3 Mo.), Webentwicklung der populärste (6 Mo.), Data Analytics der lukrativste für Seiteneinsteiger mit Branchenkenntnis.',
    },
    {
      _key: 'schritt2',
      nummer: 2,
      titel: 'Anerkanntes Zertifikat erwerben',
      text:  'CompTIA A+ (Support), Google IT/Data Certificate (Coursera), AWS Cloud Practitioner, ISTQB Foundation oder freeCodeCamp + eigene Projekte für Webentwicklung. Kosten: CHF 0–2\'500. Alle berufsbegleitend möglich.',
    },
    {
      _key: 'schritt3',
      nummer: 3,
      titel: 'Portfolio aufbauen',
      text:  'GitHub-Account mit 3–5 eigenen Projekten ist in der IT wichtiger als jedes Zertifikat. Für Support: homelab dokumentieren. Für Daten: Kaggle-Challenges. Für Web: eigene kleine Websites oder Open-Source-Beiträge.',
    },
    {
      _key: 'schritt4',
      nummer: 4,
      titel: 'Über Temporär oder Praktikum einsteigen',
      text:  'IT-Temporärstellen (Manpower IT, Hays, Michael Page) sind ein bewährter Einstieg ohne formalen Abschluss. Auch 3-monatige Praktika in Schweizer KMU öffnen Türen — viele KMU übernehmen direkt.',
    },
    {
      _key: 'schritt5',
      nummer: 5,
      titel: 'Netzwerk in der Schweizer IT-Community',
      text:  'Swiss ICT Meetups, DevZürich, Bern IT Meetup, Women in Tech Switzerland. 40% der IT-Jobs in der Schweiz werden über Netzwerke besetzt — nicht über Jobportale. LinkedIn-Profil mit Skills und Projekten ist Pflicht.',
    },
  ],

  // ── Lohntabelle ──────────────────────────────────────────────────────────
  lohnTabelle: [
    { _key: 'lohn1', position: 'IT-Support / Helpdesk',         einsteiger: 'CHF 55–62k', erfahren: 'CHF 62–72k', senior: 'CHF 72–85k'  },
    { _key: 'lohn2', position: 'Webentwickler/in Frontend',      einsteiger: 'CHF 65–75k', erfahren: 'CHF 75–90k', senior: 'CHF 90–115k' },
    { _key: 'lohn3', position: 'Data Analyst',                   einsteiger: 'CHF 68–78k', erfahren: 'CHF 78–95k', senior: 'CHF 95–125k' },
    { _key: 'lohn4', position: 'Cloud Administrator',            einsteiger: 'CHF 72–82k', erfahren: 'CHF 82–98k', senior: 'CHF 98–130k' },
    { _key: 'lohn5', position: 'Software-Tester / QA-Engineer',  einsteiger: 'CHF 62–72k', erfahren: 'CHF 72–88k', senior: 'CHF 88–108k' },
    { _key: 'lohn6', position: 'IT-Projektkoordinator/in',       einsteiger: 'CHF 68–78k', erfahren: 'CHF 78–92k', senior: 'CHF 92–115k' },
  ],

  // ── Bedenken / Mythen ─────────────────────────────────────────────────────
  bedenken: [
    {
      _key: 'bedenken1',
      mythos:    'Ohne Informatikstudium nehmt mich kein IT-Arbeitgeber ernst.',
      realitaet: 'Das Schweizer IT-Jobportale zeigen: über 60% der ausgeschriebenen IT-Einstiegsstellen nennen kein Informatikstudium als Anforderung — sondern "nachgewiesene Skills" oder "Zertifikat". Gerade KMU und Startups prüfen Fähigkeiten, nicht Diplome.',
    },
    {
      _key: 'bedenken2',
      mythos:    'IT ist zu technisch — ich bin nicht der "Computertyp".',
      realitaet: 'IT-Support, Projektkoordination und Softwaretesting erfordern primär analytisches Denken, Kommunikationsstärke und Sorgfalt — keine Mathematikkenntnisse aus dem Studium. Wer strukturiert denkt, findet in der IT seinen Platz.',
    },
    {
      _key: 'bedenken3',
      mythos:    'Ein Bootcamp reicht nicht — Arbeitgeber wollen echte Ausbildungen.',
      realitaet: 'Google, IBM und Microsoft bieten eigene Zertifikatsprogramme an, die von Schweizer Arbeitgebern explizit als gleichwertig anerkannt werden. Viele Hiring-Manager haben selbst einen Quereinstieg gemacht.',
    },
    {
      _key: 'bedenken4',
      mythos:    'Mit über 35 lerne ich das nicht mehr.',
      realitaet: 'Das Durchschnittsalter von IT-Quereinsteigern in der Schweiz liegt bei 34 Jahren. Erfahrung aus anderen Branchen (Pharma, Finanz, Industrie) wird in der IT als "Domainwissen" gezielt eingesetzt und erhöht das Gehalt.',
    },
  ],

  // ── FAQ ───────────────────────────────────────────────────────────────────
  faq: [
    {
      _key: 'faq1',
      frage:   'Welches IT-Zertifikat ist der beste Einstieg für Quereinsteiger in der Schweiz?',
      antwort: 'Für IT-Support: CompTIA A+ (international anerkannt, CHF 300–500, 3 Mo.). Für Cloud: AWS Certified Cloud Practitioner oder Microsoft AZ-900 (je CHF 150–300, 2–3 Mo.). Für Daten: Google Data Analytics Certificate auf Coursera (CHF 50/Mo., 6 Mo.). Für Web: freeCodeCamp (kostenlos) + eigenes Portfolio.',
    },
    {
      _key: 'faq2',
      frage:   'Wie lange dauert ein Quereinstieg in die IT?',
      antwort: 'Realistische Zeitrahmen: IT-Support 3–6 Monate bis zur ersten Stelle. Frontend-Webentwicklung 6–12 Monate (berufsbegleitend). Data Analytics 6–9 Monate. Cloud-Administration 3–6 Monate. Vollzeit-Bootcamps (SchweizerischeBW, ZuriHac) können auf 3 Monate komprimieren.',
    },
    {
      _key: 'faq3',
      frage:   'Was verdient ein IT-Quereinsteiger in der Schweiz am Anfang?',
      antwort: 'IT-Support Einstieg: CHF 55–65k. Frontend Junior: CHF 65–75k. Data Analyst Junior: CHF 68–80k. Cloud Junior: CHF 70–82k. Nach 2 Jahren liegen fast alle IT-Quereinsteiger bei CHF 80–95k — damit deutlich über dem Schweizer Medianlohn von CHF 78k.',
    },
    {
      _key: 'faq4',
      frage:   'Gibt es staatliche Förderung für IT-Umschulungen in der Schweiz?',
      antwort: 'Ja. Das SECO-Programm "Digitale Grundkompetenzen" fördert Erwachsene beim Erwerb digitaler Basisskills. Kantone Zürich, Bern und Basel bieten Bildungsgutscheine bis CHF 7\'500 für anerkannte IT-Kurse. RAV übernimmt bei Stellensuchenden teils komplette Bootcamp-Kosten.',
    },
    {
      _key: 'faq5',
      frage:   'Muss ich programmieren können für einen IT-Quereinstieg?',
      antwort: 'Nein — je nach Richtung. IT-Support, Cloud-Administration, Softwaretesting und IT-Projektmanagement erfordern kein Programmieren im eigentlichen Sinne. Nur Webentwicklung und Data Analytics bauen auf Code auf — und auch da reichen grundlegende Kenntnisse für den Einstieg.',
    },
  ],

  // ── SEO ───────────────────────────────────────────────────────────────────
  seoTitle:       'Quereinstieg IT Schweiz 2026 | IT-Jobs ohne Informatikstudium | derquereinstieg.ch',
  seoDescription: 'In die IT ohne Studium? In der Schweiz möglich. 46+ offene IT-Jobs für Quereinsteiger, konkrete Zertifikatswege (CompTIA, AWS, Google), Lohndaten und Einstiegsguide für IT-Support, Web, Data & Cloud.',
}

async function main() {
  console.log(`Verbinde mit Sanity (Projekt: ${projectId}, Dataset: ${dataset}) ...`)
  try {
    const result = await client.createOrReplace(document)
    console.log(`\nDraft erstellt: ${result._id}`)
    console.log(`Typ: ${result._type}`)
    console.log(`\nIm Studio sichtbar unter: localhost:3004/studio`)
    console.log(`Slug: quereinstieg-it`)
    console.log(`\nHinweis: Draft (nicht published). Erst nach "Publish" im Studio live.`)
  } catch (err) {
    console.error('Fehler:', err.message)
    process.exit(1)
  }
}

main()
