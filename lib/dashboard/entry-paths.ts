// Statische Einstiegspfad-Daten für alle 10 Berufsfelder

export type EntryField = 'it' | 'pflege' | 'handwerk' | 'verkauf' | 'logistik' | 'gastronomie' | 'paedagogik' | 'soziales' | 'buero' | 'selbstaendigkeit'

export interface EntryStep {
  nr: number
  title: string
  description: string
  duration: string  // z.B. "2–3 Monate"
  descriptionMature?: string  // für 40+ Quereinsteiger
}

export interface SalaryBenchmark {
  einstieg: string
  nach2Jahren: string
  nach5Jahren: string
}

export interface EntryPath {
  field: EntryField
  label: string
  icon: string
  intro: string
  salaryRange: string  // Free: simple Range
  salary: SalaryBenchmark  // Pro: Tabelle
  timeToFirstJob: string   // z.B. "3–6 Monate"
  steps: EntryStep[]
  courses: string[]     // Pro: Kurs-Empfehlungen
  certificates: string[] // Pro: Zertifikate
  checklistFile: string  // /public/checklists/...
}

export const ENTRY_PATHS: Record<EntryField, EntryPath> = {
  it: {
    field: 'it',
    label: 'IT & Technik',
    icon: '💻',
    intro: 'Der IT-Sektor sucht dringend Fachkräfte – Quereinsteiger sind willkommen, wenn sie die richtigen Kenntnisse mitbringen.',
    salaryRange: 'CHF 70.000–90.000 / Jahr (Einstieg)',
    salary: {
      einstieg: 'CHF 70.000–80.000',
      nach2Jahren: 'CHF 80.000–95.000',
      nach5Jahren: 'CHF 90.000–120.000+',
    },
    timeToFirstJob: '6–12 Monate',
    steps: [
      { nr: 1, title: 'Standbein bestimmen', description: 'Wähle eine Spezialisierung: Web-Entwicklung, Support, IT-Administration oder Daten. Fokus ist entscheidend.', duration: '1–2 Wochen' },
      { nr: 2, title: 'Grundlagen erlernen', description: 'Online-Kurse (ZHAW CAS, Coursera, freeCodeCamp). HTML/CSS/JS für Web, Linux-Basics für Sysadmin, SQL für Data.', duration: '3–6 Monate' },
      { nr: 3, title: 'Erstes Projekt bauen', description: 'Portfolio-Projekt auf GitHub. Zeigt Arbeitgebern, dass du liefern kannst – wichtiger als Zertifikate.', duration: '1–2 Monate' },
      { nr: 4, title: 'Netzwerken & Praktikum', description: 'SwissICT-Events, Meetups, LinkedIn. Viele Firmen bieten 3-monatige Praktika für Quereinsteiger an.', duration: '1–3 Monate' },
      { nr: 5, title: 'Erste Stelle antreten', description: 'Bewirb dich auf Junior-Stellen und Helpdesk-Positionen. Wichtig: Lernbereitschaft betonen.', duration: 'laufend', descriptionMature: 'Ziele auf IT-Support, Helpdesk und Admin-Rollen statt auf Junior-Entwicklerstellen. Deine Lebenserfahrung ist ein echter Pluspunkt in der Kommunikation mit Fachabteilungen und Kunden.' },
    ],
    courses: [
      'ZHAW CAS IT Management (berufsbegleitend)',
      'freeCodeCamp Web Development (kostenlos)',
      'Google IT Support Certificate (Coursera)',
      'CompTIA A+ Vorbereitung',
    ],
    certificates: ['CompTIA A+', 'Google IT Support', 'AWS Cloud Practitioner', 'ECDL Advanced'],
    checklistFile: '/checklists/it-quereinstieg.pdf',
  },
  pflege: {
    field: 'pflege',
    label: 'Pflege & Gesundheit',
    icon: '🏥',
    intro: 'Der Pflegebereich sucht händeringend Personal – mit einem strukturierten Umstieg hast du sehr gute Chancen auf eine Festanstellung.',
    salaryRange: 'CHF 55.000–75.000 / Jahr (nach Ausbildung)',
    salary: {
      einstieg: 'CHF 55.000–65.000',
      nach2Jahren: 'CHF 62.000–72.000',
      nach5Jahren: 'CHF 68.000–82.000',
    },
    timeToFirstJob: '3–6 Monate',
    steps: [
      { nr: 1, title: 'Informationsveranstaltung besuchen', description: 'Spitäler und Pflegeheime bieten regelmässig Schnuppereinsätze an. Praxis erleben vor der Entscheidung.', duration: '1–2 Wochen' },
      { nr: 2, title: 'Ausbildungsweg wählen', description: 'Pflegehelfer SRK (3 Monate) als Einstieg, oder direkt Ausbildung zur Fachperson Gesundheit (FaGe, 3 Jahre). Viele Kantone bieten Umschulungsfinanzierung.', duration: '2–4 Wochen' },
      { nr: 3, title: 'Kursanmeldung + Finanzierung klären', description: 'RAV, Berufsberatung, Stipendien. Viele Spitäler zahlen Ausbildung bei Anstellungszusage.', duration: '1–2 Monate' },
      { nr: 4, title: 'Ausbildung absolvieren', description: 'Pflegehelfer SRK: 3 Monate. FaGe: 3 Jahre berufsbegleitend. Praktika in Spital/Heim integriert.', duration: '3 Monate – 3 Jahre' },
      { nr: 5, title: 'Stelle finden', description: 'Grosse Spitäler haben eigene Jobportale. SBK Jobportal, Medi-Jobs.ch. Spezialisierung erhöht den Lohn.', duration: 'laufend', descriptionMature: 'Erfahrene Quereinsteiger sind in der Pflege besonders gefragt. Viele Spitäler und Heime bevorzugen reife Bewerber explizit — betone Lebenserfahrung, Empathie und Verlässlichkeit als Stärken.' },
    ],
    courses: [
      'Pflegehelfer SRK (Schweizerisches Rotes Kreuz)',
      'FaGe-Ausbildung (berufsbegleitend, 3 Jahre)',
      'Erste-Hilfe-Kurs Auffrischung',
      'Demenz-Sensibilisierungskurs',
    ],
    certificates: ['Pflegehelfer SRK', 'FaGe EFZ', 'Diplom Pflegefachfrau/-mann HF'],
    checklistFile: '/checklists/pflege-quereinstieg.pdf',
  },
  handwerk: {
    field: 'handwerk',
    label: 'Handwerk & Bau',
    icon: '🔨',
    intro: 'Schweizer Handwerksbetriebe suchen dringend Fachkräfte. Mit einer Anlehre oder Umschulung der Weg in ein krisensicheres Berufsfeld.',
    salaryRange: 'CHF 50.000–75.000 / Jahr',
    salary: {
      einstieg: 'CHF 50.000–60.000',
      nach2Jahren: 'CHF 58.000–68.000',
      nach5Jahren: 'CHF 65.000–80.000',
    },
    timeToFirstJob: '1–3 Monate',
    steps: [
      { nr: 1, title: 'Handwerk-Bereich wählen', description: 'Elektro, Sanitär, Schreiner, Maler, Gipser, Maurer? Jedes Gewerk hat andere Einstiegshürden. Elektro + Sanitär zahlen am besten.', duration: '1–2 Wochen' },
      { nr: 2, title: 'Schnupperlehre absolvieren', description: 'Direkt bei lokalen Betrieben anfragen. Die meisten freuen sich über Interessierte – oft führt das zur Anstellung.', duration: '1–5 Tage' },
      { nr: 3, title: 'Anlehre EBA oder Lehre EFZ', description: 'Anlehre (2 Jahre) für schnellen Einstieg. EFZ (3–4 Jahre) für bessere Perspektiven. Berufsbegleitend möglich.', duration: '2–4 Jahre' },
      { nr: 4, title: 'Kantonale Förderprogramme nutzen', description: 'Viele Kantone fördern Erwachsenenlehren. Lehrlingslohn kann durch Stipendien ergänzt werden.', duration: '1 Monat' },
      { nr: 5, title: 'Betrieb finden', description: 'Kleinstbetriebe sind oft flexibler. Suche und offene Bewerbungen per Post (wirkungsvoller als Online in diesem Sektor).', duration: 'laufend', descriptionMature: 'Familien- und Kleinbetriebe schätzen reife Quereinsteiger für Verlässlichkeit und handwerkliche Erfahrung aus Hobbys. Offene Bewerbungen persönlich vorbeibringen wirkt besser als Online-Formulare.' },
    ],
    courses: [
      'SUVA Kurse für Arbeitssicherheit',
      'SIU Handwerk-Kurse',
      'VSSM Schreiner-Grundkurse',
    ],
    certificates: ['EBA Anlehre', 'EFZ Fachausweis', 'Meisterprüfung (nach 5 Jahren)'],
    checklistFile: '/checklists/handwerk-quereinstieg.pdf',
  },
  verkauf: {
    field: 'verkauf',
    label: 'Verkauf & Detailhandel',
    icon: '🛍️',
    intro: 'Einstieg ohne grosse Hürden – mit Persönlichkeit und Kundenorientierung bist du schnell dabei.',
    salaryRange: 'CHF 42.000–62.000 / Jahr',
    salary: {
      einstieg: 'CHF 42.000–50.000',
      nach2Jahren: 'CHF 48.000–56.000',
      nach5Jahren: 'CHF 54.000–68.000',
    },
    timeToFirstJob: 'Sofort – 4 Wochen',
    steps: [
      { nr: 1, title: 'Bereich definieren', description: 'Detailhandel, Fachhandel, B2B-Verkauf oder Aussendienst? B2B und Aussendienst zahlen deutlich besser.', duration: '1 Woche' },
      { nr: 2, title: 'Aushilfe / Teilzeitstelle finden', description: 'Niederschwelliger Einstieg über Temporärstellen. Viele grosse Retailer suchen laufend Personal.', duration: '2–4 Wochen' },
      { nr: 3, title: 'Branchenzertifikat anstreben', description: 'Detailhandels-Fachausweis oder CAS Verkaufsleitung. Deutliche Lohnsteigerung durch Weiterbildung.', duration: '6–12 Monate' },
      { nr: 4, title: 'Spezialisierung aufbauen', description: 'IT-Verkauf, Pharma-Aussendienstmitarbeiter, Immobilien. Kombination Fachkenntnisse + Verkauf = hohe Nachfrage.', duration: '6–18 Monate' },
      { nr: 5, title: 'Karriere entwickeln', description: 'Teamleitung, Filialleitung, Key Account Management. Leistung wird im Verkauf direkt belohnt.', duration: 'laufend', descriptionMature: 'Branchenwissen und Lebenserfahrung sind im B2B-Verkauf und Fachhandel ein echter Vorteil. Ziele auf Beratungs- und Innendienstpositionen — dein Netzwerk und deine Branchenkenntnis sind mehr wert als Juniortitel.' },
    ],
    courses: [
      'Detailhandels-Fachausweis (Prüfung nach 2 Jahren)',
      'CAS Verkaufsleitung (HWZ / ZHAW)',
      'Salesforce CRM Grundkurs',
    ],
    certificates: ['Detailhandels-Fachausweis', 'Verkaufsfachfrau/-mann mit eidg. Fachausweis'],
    checklistFile: '/checklists/verkauf-quereinstieg.pdf',
  },
  logistik: {
    field: 'logistik',
    label: 'Logistik & Transport',
    icon: '🚛',
    intro: 'Logistik boomt – E-Commerce und Lieferketten benötigen mehr Fachkräfte als je zuvor.',
    salaryRange: 'CHF 48.000–72.000 / Jahr',
    salary: {
      einstieg: 'CHF 48.000–56.000',
      nach2Jahren: 'CHF 54.000–62.000',
      nach5Jahren: 'CHF 60.000–78.000',
    },
    timeToFirstJob: 'Sofort – 2 Monate',
    steps: [
      { nr: 1, title: 'Bereich wählen', description: 'Lager/Logistik, Spedition, Transportplanung oder Supply Chain Management? Letzteres ist am lukrativsten.', duration: '1 Woche' },
      { nr: 2, title: 'Logistikhelfer EBA oder direkt EFZ', description: 'EBA in 2 Jahren, EFZ Logistiker in 3 Jahren. Auch ohne Ausbildung: Staplerausweis + Berufserfahrung reicht für viele Stellen.', duration: '1–3 Jahre' },
      { nr: 3, title: 'Fahrausweise und Zertifikate', description: 'Staplerausweis, Führerschein Kat. C für LKW, ADR für Gefahrgut – jeder Ausweis erhöht den Lohn deutlich.', duration: '1–6 Monate' },
      { nr: 4, title: 'WMS-Software lernen', description: 'SAP, Oracle WMS oder branchenspezifische Systeme. Online-Kurse verfügbar, Arbeitgeber schulen oft intern.', duration: '1–3 Monate' },
      { nr: 5, title: 'Stelle in Logistikzentrum oder Spedition', description: 'Post, DHL, Coop, Migros haben grosse Logistikzentren und stellen regelmässig ein.', duration: 'laufend', descriptionMature: 'Zuverlässigkeit und Pünktlichkeit sind entscheidend — Logistik kennt keine Altersdiskriminierung in der Praxis. Disponenten- und Koordinationsstellen schätzen Erfahrung und ruhiges Auftreten explizit.' },
    ],
    courses: [
      'Staplerfahrausweis (SUVA-anerkannt)',
      'EFZ Logistiker-Ausbildung',
      'CAS Supply Chain Management (ZHAW)',
    ],
    certificates: ['EBA Logistikassistent', 'EFZ Logistiker', 'SVBL Logistikfachmann/-frau'],
    checklistFile: '/checklists/logistik-quereinstieg.pdf',
  },
  gastronomie: {
    field: 'gastronomie',
    label: 'Gastronomie & Hotellerie',
    icon: '🍽️',
    intro: 'Flexibler Einstieg, schnelle Festanstellung – Gastronomie sucht ständig motivierte Quereinsteiger.',
    salaryRange: 'CHF 42.000–65.000 / Jahr',
    salary: {
      einstieg: 'CHF 42.000–50.000',
      nach2Jahren: 'CHF 48.000–58.000',
      nach5Jahren: 'CHF 55.000–72.000',
    },
    timeToFirstJob: 'Sofort – 2 Wochen',
    steps: [
      { nr: 1, title: 'Einstiegsbereich wählen', description: 'Service, Küche, Bar, Eventgastronomie oder Hotelrezeption? Küche + Bar bieten die schnellsten Karrierewege.', duration: '1 Woche' },
      { nr: 2, title: 'Aushilfe / Teilzeitarbeit', description: 'Direktbewerbung in Restaurants, Hotels, Cateringunternehmen. Kein Lebenslauf nötig – oft reicht ein persönliches Gespräch.', duration: '1–2 Wochen' },
      { nr: 3, title: 'Hygieneausweis + Grundkurse', description: 'Lebensmittelhygienekurs (GastroSuisse), Barkurse, Sommelierekurs. Investition unter CHF 500.', duration: '1–4 Wochen' },
      { nr: 4, title: 'Weiterbildung Restaurantfachmann/-frau', description: 'Berufsbegleitende Ausbildung via GastroSuisse. EFZ möglich auch als Erwachsener.', duration: '2–3 Jahre' },
      { nr: 5, title: 'Führungsposition anstreben', description: 'Chef de Partie, Sous-Chef, F&B Manager. Management-Ausbildung an EHL oder SSTH für Top-Lohn.', duration: 'laufend', descriptionMature: 'Betriebsrestaurants, Schulkantinen und Spitalküchenteams bieten geregelte Arbeitszeiten und suchen reife, zuverlässige Personen. Weniger Nachtschichten, dafür gefragt für Verlässlichkeit.' },
    ],
    courses: [
      'GastroSuisse Lebensmittelhygiene',
      'Barista- und Barkeeper-Kurse',
      'EHL (Ecole hôtelière de Lausanne) Kursprogramme',
    ],
    certificates: ['Lebensmittelhygiene-Ausweis', 'EFZ Restaurantfachmann/-frau', 'Hotel Management Certificate EHL'],
    checklistFile: '/checklists/gastronomie-quereinstieg.pdf',
  },
  paedagogik: {
    field: 'paedagogik',
    label: 'Pädagogik & Bildung',
    icon: '📚',
    intro: 'Lehrermangel in der Schweiz – Quereinsteiger können in vielen Kantonen direkt unterrichten und berufsbegleitend ausgebildet werden.',
    salaryRange: 'CHF 72.000–110.000 / Jahr (nach Ausbildung)',
    salary: {
      einstieg: 'CHF 72.000–85.000',
      nach2Jahren: 'CHF 82.000–95.000',
      nach5Jahren: 'CHF 90.000–115.000',
    },
    timeToFirstJob: '2–6 Monate (berufsbegleitend an PH)',
    steps: [
      { nr: 1, title: 'Schulstufe und Fach wählen', description: 'Kindergarten, Primar, Sek I/II, Berufsschule oder Erwachsenenbildung? Je nach Vorbildung gibt es unterschiedliche Wege.', duration: '2–4 Wochen' },
      { nr: 2, title: 'Kantonale Ausnahmeregelung prüfen', description: 'Viele Kantone (LU, AG, ZH) lassen Quereinsteiger direkt unterrichten mit laufender Ausbildung. Kantonales Amt für Volksschulbildung kontaktieren.', duration: '1–2 Wochen' },
      { nr: 3, title: 'PH-Ausbildung anmelden', description: 'Pädagogische Hochschulen bieten berufsbegleitende Studiengänge. Zulassung oft mit Berufsmaturität oder gleichwertigem Abschluss.', duration: '1–2 Monate' },
      { nr: 4, title: 'Unterrichtspraxis aufbauen', description: 'Schulen bieten Einführungsprogramme. Mentoring durch erfahrene Lehrpersonen in der Regel inklusive.', duration: '1–2 Jahre' },
      { nr: 5, title: 'Diploma und Festanstellung', description: 'Lehrdiplom nach 3–4 Jahren. Danach beamtenähnliche Sicherheit und sehr gutes Gehalt im schweizweiten Vergleich.', duration: '3–4 Jahre', descriptionMature: 'Deine Lebenserfahrung ist besonders in der Erwachsenenbildung und Berufsschule wertvoll. Viele Kantone suchen explizit Quereinsteiger 40+ für diese Stufen — du bringst Authentizität und Glaubwürdigkeit mit.' },
    ],
    courses: [
      'PH Luzern/Zürich/Bern berufsbegleitend',
      'CAS Erwachsenenbildung (SVEB)',
      'MAS Bildungsmanagement',
    ],
    certificates: ['Lehrdiplom Primarstufe', 'Lehrdiplom Sekundarstufe I', 'SVEB Ausbilder FA'],
    checklistFile: '/checklists/paedagogik-quereinstieg.pdf',
  },
  soziales: {
    field: 'soziales',
    label: 'Soziales & Beratung',
    icon: '🤝',
    intro: 'Soziale Berufe bieten sinnvolle Arbeit und wachsenden Bedarf – besonders für Menschen mit Lebenserfahrung.',
    salaryRange: 'CHF 55.000–85.000 / Jahr',
    salary: {
      einstieg: 'CHF 55.000–65.000',
      nach2Jahren: 'CHF 62.000–72.000',
      nach5Jahren: 'CHF 70.000–88.000',
    },
    timeToFirstJob: '3–6 Monate (mit Praktikum)',
    steps: [
      { nr: 1, title: 'Bereich wählen', description: 'Sozialpädagogik, Sozialarbeit, Beratung, Begleitung oder Soziokultur? Sozialarbeit mit BSc ist am vielseitigsten.', duration: '2–4 Wochen' },
      { nr: 2, title: 'Praktische Erfahrung sammeln', description: 'Ehrenamt oder Praktikum in NGO, Beratungsstelle, Behinderteneinrichtung. Nachweis ist bei Bewerbungen für Ausbildung wichtig.', duration: '3–6 Monate' },
      { nr: 3, title: 'Ausbildung oder Studium starten', description: 'FH-Studium Soziale Arbeit (BSc, 3 Jahre berufsbegleitend). HF Sozialpädagogik als Alternative. Zulassung: Berufsmaturität oder Passerelle.', duration: '3 Jahre' },
      { nr: 4, title: 'Spezialisierung aufbauen', description: 'Suchtberatung, Schuldnerberatung, Jugendarbeit, Trauma. Weiterbildungen oft von Arbeitgebern finanziert.', duration: '1–2 Jahre' },
      { nr: 5, title: 'Stelle in NGO, Gemeinde oder Institution', description: 'Pro Infirmis, Caritas, Stadtmissionen, Sozialdienste. Gutes Netzwerk durch Praktika wichtiger als in anderen Branchen.', duration: 'laufend', descriptionMature: 'Lebenserfahrung ist in sozialen Berufen ein Vorteil, kein Hindernis. NGOs, Sozialdienste und Beratungsstellen schätzen reife Quereinsteiger sehr — deine Glaubwürdigkeit bei Klienten ist nicht erlernbar.' },
    ],
    courses: [
      'BSc Soziale Arbeit (HSLU, FHNW, BFH)',
      'CAS Case Management',
      'SVMB Berufs-, Studien- und Laufbahnberatung',
    ],
    certificates: ['BSc Soziale Arbeit', 'HF Sozialpädagogik', 'CAS Sozialmanagement'],
    checklistFile: '/checklists/soziales-quereinstieg.pdf',
  },
  buero: {
    field: 'buero',
    label: 'Büro & Verwaltung',
    icon: '🏢',
    intro: 'Administrative Berufe sind ein klassischer Quereinsteiger-Weg – Organisationstalent und PC-Kenntnisse zählen mehr als formale Ausbildungen.',
    salaryRange: 'CHF 50.000–70.000 / Jahr',
    salary: {
      einstieg: 'CHF 50.000–58.000',
      nach2Jahren: 'CHF 56.000–65.000',
      nach5Jahren: 'CHF 62.000–78.000',
    },
    timeToFirstJob: '2–6 Monate',
    steps: [
      { nr: 1, title: 'PC-Kenntnisse auffrischen', description: 'Word, Excel, E-Mail und Teams professionell nutzen. Viele Arbeitgeber testen Grundkenntnisse im Gespräch – kurzer Online-Kurs genügt.', duration: '1–4 Wochen' },
      { nr: 2, title: 'Übertragbare Erfahrungen identifizieren', description: 'Organisationsaufgaben, Protokolle, Bestellungen oder Koordinationsaufgaben aus bisherigen Jobs oder Vereinsarbeit aktiv in der Bewerbung benennen.', duration: '1 Woche' },
      { nr: 3, title: 'Sachbearbeitung-Kurs belegen', description: 'KV-Kurse (kaufmännische Grundlagen) an Klubschulen, vhs oder IBF. Auch Online-Kurs "Office-Sachbearbeitung" ist anerkannt.', duration: '1–3 Monate' },
      { nr: 4, title: 'Bewerbungsunterlagen optimieren', description: 'Klares Layout, fehlerfreier Text, konkreter Bezug zur Stelle. Sorgfalt bei Bewerbungsunterlagen signalisiert Bürokompetenz.', duration: '1–2 Wochen' },
      { nr: 5, title: 'Erste Stelle als Sachbearbeiter/in', description: 'Temporärstellen über Personalvermittlung als Sprungbrett nutzen. Viele KMU suchen zuverlässige Allrounder ohne strenge Ausbildungsanforderungen.', duration: 'laufend', descriptionMature: 'Sachbearbeiterstellen schätzen Erfahrung und Verlässlichkeit. Bewirb dich in Branchen, die du kennst — dein Fachwissen kombiniert mit Office-Kenntnissen ist ein klarer Mehrwert gegenüber jüngeren Mitbewerbern.' },
    ],
    courses: [
      'KV Sachbearbeitung (Migros Klubschule / vhs)',
      'ECDL / European Computer Driving Licence',
      'Büroorganisation & Korrespondenz (Klubschule)',
    ],
    certificates: ['ECDL', 'KV-Sachbearbeiterin mit Fachausweis', 'Büroassistentin EBA'],
    checklistFile: '/checklists/buero-quereinstieg.pdf',
  },
  selbstaendigkeit: {
    field: 'selbstaendigkeit',
    label: 'Selbständigkeit',
    icon: '🚀',
    intro: 'Kein Bewerbungsgespräch, kein Arbeitgeber der dich einstellen muss. Du brauchst nur einen ersten Kunden.',
    salaryRange: 'CHF 40.000–200.000+ / Jahr (je nach Modell)',
    salary: {
      einstieg: 'CHF 30.000–60.000',
      nach2Jahren: 'CHF 50.000–120.000',
      nach5Jahren: 'CHF 80.000–200.000+',
    },
    timeToFirstJob: 'sofort–3 Monate',
    steps: [],  // leer — SelbstaendigkeitPathView rendert Sub-Pfade
    courses: ['KMU-Beratung IHK/HWK', 'bexio.com Buchhaltung', 'Malt Freelancer Bootcamp', 'Unternehmerschule ubs.ch'],
    certificates: ['Einzelfirma Handelsregister (ab CHF 100k)', 'AHV Selbständige Nummer (SVA)', 'MwSt Anmeldung'],
    checklistFile: '/checklists/selbstaendigkeit.pdf',
  },
}

export const FIELD_LABELS: Record<EntryField, string> = {
  it: 'IT & Technik',
  pflege: 'Pflege & Gesundheit',
  handwerk: 'Handwerk & Bau',
  verkauf: 'Verkauf & Detailhandel',
  logistik: 'Logistik & Transport',
  gastronomie: 'Gastronomie & Hotellerie',
  paedagogik: 'Pädagogik & Bildung',
  soziales: 'Soziales & Beratung',
  buero: 'Büro & Verwaltung',
  selbstaendigkeit: 'Selbständigkeit',
}

// ─── Discovery: Skills ────────────────────────────────────────────────────────

export interface SkillLearnInfo {
  how: string       // 1 Satz: wie lernen
  where: string     // Plattform / Kurs / Ort
  duration: string  // Zeitrahmen
  url?: string      // optionaler Link
  costCHF?: number      // 0 = kostenlos
  durationWeeks?: number
}

export interface Skill {
  id: string
  label: string
  icon: string
  category: 'digital' | 'menschen' | 'organisatorisch' | 'handwerklich' | 'soziales' | 'physisch'
  affinities: Partial<Record<EntryField, number>>  // 1–3
  learnInfo?: SkillLearnInfo
}

export const SKILL_CATEGORIES: Record<string, string> = {
  digital:        '💻 Digital & IT',
  menschen:       '🤝 Menschen & Kommunikation',
  organisatorisch:'📋 Organisation & Planung',
  handwerklich:   '🔨 Handwerk & Technik',
  soziales:       '💙 Soziales & Betreuung',
  physisch:       '💪 Körperlich & Praktisch',
}

export const SKILLS: Skill[] = [
  // ─ Digital & IT ─────────────────────────────────────────────────────────────
  { id: 'excel', label: 'Excel, Word, PowerPoint', icon: '📊', category: 'digital', affinities: { it: 1, logistik: 1, verkauf: 1, buero: 3 },
    learnInfo: { how: 'Kostenlose Kurse auf Microsoft Learn oder YouTube', where: 'microsoft.com/learn', duration: '1–2 Wochen', url: 'https://learn.microsoft.com/de-de/training/', costCHF: 0, durationWeeks: 2 } },
  { id: 'datenanalyse', label: 'Zahlen & Daten auswerten', icon: '📈', category: 'digital', affinities: { it: 3, logistik: 1 },
    learnInfo: { how: 'Google Data Analytics Certificate auf Coursera', where: 'coursera.org/google-certificates', duration: '4–8 Wochen', url: 'https://www.coursera.org/google-certificates', costCHF: 200, durationWeeks: 6 } },
  { id: 'programmieren', label: 'Programmieren / Coden', icon: '💻', category: 'digital', affinities: { it: 3 },
    learnInfo: { how: 'freeCodeCamp (kostenlos, strukturiert, auf Deutsch verfügbar)', where: 'freecodecamp.org', duration: '3–6 Monate', url: 'https://www.freecodecamp.org', costCHF: 0, durationWeeks: 16 } },
  { id: 'social_media', label: 'Social Media betreiben / Inhalte erstellen', icon: '📱', category: 'digital', affinities: { verkauf: 2, it: 1 },
    learnInfo: { how: 'Meta Blueprint Kurse + eigene Seite als Übungsprojekt', where: 'facebook.com/business/learn', duration: '2–4 Wochen', url: 'https://www.facebook.com/business/learn', costCHF: 0, durationWeeks: 3 } },
  { id: 'it_support', label: 'Computer-Probleme lösen / IT-Support', icon: '🖥️', category: 'digital', affinities: { it: 3 },
    learnInfo: { how: 'Google IT Support Certificate (auf Deutsch verfügbar)', where: 'grow.google/certificates', duration: '3–5 Monate', url: 'https://grow.google/intl/de/certificates', costCHF: 200, durationWeeks: 18 } },
  { id: 'webdesign', label: 'Websites gestalten (WordPress, HTML…)', icon: '🌐', category: 'digital', affinities: { it: 2, verkauf: 1 },
    learnInfo: { how: 'HTML/CSS Grundlagen auf freeCodeCamp, dann WordPress-Kurs', where: 'freecodecamp.org / udemy.com', duration: '4–8 Wochen', url: 'https://www.freecodecamp.org', costCHF: 30, durationWeeks: 6 } },
  { id: 'grafik_design', label: 'Grafik & Design (Photoshop, Canva…)', icon: '🎨', category: 'digital', affinities: { it: 1, verkauf: 1 },
    learnInfo: { how: 'Canva sofort kostenlos starten, Photoshop via Udemy', where: 'canva.com / udemy.com', duration: '1–4 Wochen', url: 'https://www.canva.com', costCHF: 30, durationWeeks: 3 } },
  { id: 'cad', label: 'CAD-Software (AutoCAD, SolidWorks…)', icon: '📐', category: 'digital', affinities: { handwerk: 3, it: 1 },
    learnInfo: { how: 'AutoCAD Grundkurs auf Udemy oder Autodesk selbst', where: 'autodesk.com/education / udemy.com', duration: '4–8 Wochen', url: 'https://www.autodesk.com/education', costCHF: 30, durationWeeks: 6 } },
  { id: 'buchhaltungssoftware', label: 'Buchhaltungssoftware (ABACUS, SAP…)', icon: '🔢', category: 'digital', affinities: { it: 1, verkauf: 1, buero: 2 },
    learnInfo: { how: 'ABACUS Grundkurs bei authorized Schulungspartnern', where: 'abacus.ch / kv-bildung.ch', duration: '2–4 Wochen', url: 'https://www.abacus.ch', costCHF: 500, durationWeeks: 3 } },
  { id: 'crm', label: 'CRM / Kundendaten pflegen (Salesforce…)', icon: '📇', category: 'digital', affinities: { verkauf: 3, it: 1, buero: 2 },
    learnInfo: { how: 'Salesforce Trailhead – kostenlos, gamifiziert, auf Deutsch', where: 'trailhead.salesforce.com', duration: '2–4 Wochen', url: 'https://trailhead.salesforce.com', costCHF: 0, durationWeeks: 3 } },
  { id: 'video_foto', label: 'Fotos & Videos aufnehmen / schneiden', icon: '🎬', category: 'digital', affinities: { it: 1, verkauf: 1 },
    learnInfo: { how: 'YouTube-Tutorials + einfach mit dem Smartphone starten', where: 'youtube.com / capcut.com', duration: '1–3 Wochen', costCHF: 0, durationWeeks: 2 } },
  { id: 'technik', label: 'Technisches Grundverständnis (allgemein)', icon: '⚙️', category: 'digital', affinities: { it: 2, handwerk: 2, logistik: 1 },
    learnInfo: { how: 'Praktisch ausprobieren, YouTube-Tutorials zu konkreten Themen', where: 'YouTube / Baumarkt-Workshops', duration: 'Laufend', costCHF: 0, durationWeeks: 4 } },

  // ─ Menschen & Kommunikation ─────────────────────────────────────────────────
  { id: 'kundenkontakt', label: 'Kundenkontakt & Beratung', icon: '🤝', category: 'menschen', affinities: { verkauf: 3, gastronomie: 2, soziales: 1, selbstaendigkeit: 2 },
    learnInfo: { how: 'Aushilfsstelle im Detailhandel oder Gastgewerbe annehmen', where: 'Temporärbüros / Direktbewerbung', duration: 'Ab sofort möglich', costCHF: 0, durationWeeks: 4 } },
  { id: 'teamfuehrung', label: 'Ein Team führen oder koordinieren', icon: '👥', category: 'menschen', affinities: { it: 1, verkauf: 2, gastronomie: 2, paedagogik: 1, buero: 1 },
    learnInfo: { how: 'Vereinsamt oder Projektleitung ehrenamtlich übernehmen', where: 'Lokale Vereine / freiwilligenarbeit.ch', duration: 'Ab sofort', costCHF: 0, durationWeeks: 8 } },
  { id: 'praesentieren', label: 'Präsentieren & Leute überzeugen', icon: '🎤', category: 'menschen', affinities: { verkauf: 3, paedagogik: 2, it: 1, buero: 1, selbstaendigkeit: 2 },
    learnInfo: { how: 'Toastmasters Club beitreten – erste Sitzung kostenlos', where: 'toastmasters.org (Clubs schweizweit)', duration: '1–3 Monate', url: 'https://www.toastmasters.org', costCHF: 100, durationWeeks: 8 } },
  { id: 'sprachen', label: 'Fremdsprachen (Englisch oder weitere)', icon: '🌍', category: 'menschen', affinities: { verkauf: 2, gastronomie: 2, paedagogik: 1, soziales: 1 },
    learnInfo: { how: 'Sprachkurs + tägliches Üben mit App (mind. 20 Min/Tag)', where: 'migros-klubschule.ch / duolingo.com', duration: '3–12 Monate', url: 'https://www.migros-klubschule.ch', costCHF: 400, durationWeeks: 20 } },
  { id: 'geduld', label: 'Geduldig mit schwierigen Menschen', icon: '💛', category: 'menschen', affinities: { pflege: 3, paedagogik: 3, soziales: 2 },
    learnInfo: { how: 'Ehrenamtliche Arbeit mit Menschen in herausfordernden Situationen', where: 'caritas.ch / prosenectute.ch', duration: 'Ab sofort', url: 'https://www.caritas.ch', costCHF: 0, durationWeeks: 8 } },
  { id: 'verhandeln', label: 'Verhandeln & Abschlüsse erzielen', icon: '🤜', category: 'menschen', affinities: { verkauf: 3, it: 1, selbstaendigkeit: 2 },
    learnInfo: { how: 'Verhandlungstraining oder 1-Tages-Salesworkshop', where: 'migros-klubschule.ch / swisssales.ch', duration: '1–2 Tage', costCHF: 200, durationWeeks: 1 } },
  { id: 'moderieren', label: 'Gruppen moderieren / Workshops leiten', icon: '🎙️', category: 'menschen', affinities: { paedagogik: 3, soziales: 2, verkauf: 1 },
    learnInfo: { how: 'Moderationskurs (z.B. Migros Klubschule) oder Toastmasters', where: 'migros-klubschule.ch', duration: '1–2 Tage', costCHF: 200, durationWeeks: 1 } },
  { id: 'gastfreundlich', label: 'Gastfreundlich & serviceorientiert', icon: '🍽️', category: 'menschen', affinities: { gastronomie: 3, verkauf: 2, pflege: 1 },
    learnInfo: { how: 'Schnupperpraktikum in Restaurant oder Hotel', where: 'Direktkontakt mit lokalen Betrieben', duration: '1–2 Wochen', costCHF: 0, durationWeeks: 2 } },
  { id: 'schreiben', label: 'Klar & verständlich schreiben', icon: '✍️', category: 'menschen', affinities: { it: 1, paedagogik: 1, soziales: 1, verkauf: 1, buero: 3 },
    learnInfo: { how: 'Schreibkurs "Texten für alle" oder tägliches Schreiben üben', where: 'schreibzentrum.ch / migros-klubschule.ch', duration: '2–4 Wochen', costCHF: 150, durationWeeks: 3 } },
  { id: 'reklamation', label: 'Beschwerden ruhig & lösungsorientiert lösen', icon: '🛠️', category: 'menschen', affinities: { verkauf: 2, gastronomie: 2, pflege: 1, buero: 1 },
    learnInfo: { how: 'Kurs "Schwierige Gespräche führen" oder Online-Kommunikationskurs', where: 'migros-klubschule.ch / udemy.com', duration: '1 Tag – 1 Woche', costCHF: 200, durationWeeks: 1 } },
  { id: 'interkulturell', label: 'Mit Menschen aus anderen Kulturen arbeiten', icon: '🌏', category: 'menschen', affinities: { soziales: 2, pflege: 1, paedagogik: 1, gastronomie: 1 },
    learnInfo: { how: 'Freiwilligenarbeit bei NGO oder interkulturellem Verein', where: 'caritas.ch / heks.ch', duration: '1–4 Wochen', url: 'https://www.caritas.ch', costCHF: 0, durationWeeks: 4 } },

  // ─ Organisation & Planung ───────────────────────────────────────────────────
  { id: 'projektmgmt', label: 'Projekte planen & durchführen', icon: '📋', category: 'organisatorisch', affinities: { it: 2, logistik: 2, soziales: 1, buero: 2, selbstaendigkeit: 3 },
    learnInfo: { how: 'Google Project Management Certificate auf Coursera', where: 'grow.google/certificates', duration: '6 Monate', url: 'https://grow.google/intl/de/certificates', costCHF: 0, durationWeeks: 24 } },
  { id: 'planung', label: 'Gut organisieren & strukturieren', icon: '🗓️', category: 'organisatorisch', affinities: { logistik: 3, it: 1, soziales: 1, buero: 3, selbstaendigkeit: 3 },
    learnInfo: { how: 'Tools wie Trello oder Notion ausprobieren + YouTube-Tutorials', where: 'trello.com / notion.so', duration: 'Ab sofort (kostenlos)', costCHF: 0, durationWeeks: 2 } },
  { id: 'buchhaltung', label: 'Buchhaltung / Rechnungen & Zahlen prüfen', icon: '💰', category: 'organisatorisch', affinities: { it: 1, verkauf: 1, buero: 3, selbstaendigkeit: 2 },
    learnInfo: { how: 'Buchhaltungs-Grundkurs (z.B. KV Zürich oder vhs)', where: 'kv-zuerich.ch / migros-klubschule.ch', duration: '1–3 Monate', costCHF: 600, durationWeeks: 12 } },
  { id: 'logistikkoord', label: 'Lieferungen & Abläufe koordinieren', icon: '🚚', category: 'organisatorisch', affinities: { logistik: 3, it: 1 },
    learnInfo: { how: 'SVBL Logistikkurse (schweizweit anerkannt)', where: 'svbl.ch', duration: '1–3 Monate', url: 'https://www.svbl.ch', costCHF: 400, durationWeeks: 6 } },
  { id: 'qualitaet', label: 'Qualität prüfen & Fehler erkennen', icon: '🔍', category: 'organisatorisch', affinities: { handwerk: 2, logistik: 2, it: 1, buero: 1 },
    learnInfo: { how: 'Qualitätsmanagement-Grundkurs oder ISO-Einführung', where: 'sgq.ch / linkedin-learning.com', duration: '1–2 Monate', costCHF: 300, durationWeeks: 6 } },
  { id: 'warenwirtschaft', label: 'Lager führen / Bestände verwalten', icon: '📦', category: 'organisatorisch', affinities: { logistik: 3, verkauf: 1 },
    learnInfo: { how: 'SVBL Lagerkurs – praxisnah, schweizweit anerkannt', where: 'svbl.ch', duration: '1–2 Monate', url: 'https://www.svbl.ch', costCHF: 400, durationWeeks: 6 } },
  { id: 'tourenplanung', label: 'Touren & Routen disponieren', icon: '🗺️', category: 'organisatorisch', affinities: { logistik: 3 },
    learnInfo: { how: 'On-the-job lernbar, Software-Einweisung im Betrieb', where: 'Im neuen Betrieb', duration: 'Ab Jobeinstieg', costCHF: 0, durationWeeks: 2 } },
  { id: 'prozesse', label: 'Abläufe erkennen & verbessern', icon: '🔄', category: 'organisatorisch', affinities: { it: 2, logistik: 2, handwerk: 1, buero: 2 },
    learnInfo: { how: 'Lean Management Grundkurs oder kostenloser Online-Kurs', where: 'linkedin.com/learning / coursera.org', duration: '2–4 Wochen', costCHF: 200, durationWeeks: 3 } },
  { id: 'einkauf', label: 'Einkauf & Lieferantenverhandlungen', icon: '🛒', category: 'organisatorisch', affinities: { logistik: 2, verkauf: 1 },
    learnInfo: { how: 'Einkauf & Beschaffung Grundkurs bei SVL', where: 'svl.ch / migros-klubschule.ch', duration: '1–3 Monate', costCHF: 500, durationWeeks: 8 } },

  // ─ Handwerk & Technik ────────────────────────────────────────────────────────
  { id: 'handwerk', label: 'Handwerkliches Geschick (Heimwerken, Reparieren)', icon: '🔨', category: 'handwerklich', affinities: { handwerk: 3, gastronomie: 1 },
    learnInfo: { how: 'Selbst ausprobieren, YouTube-Tutorials, Baumarkt-Workshops', where: 'OBI/Bauhaus Kurse / YouTube', duration: 'Laufend', costCHF: 0, durationWeeks: 8 } },
  { id: 'maschinen', label: 'Maschinen & Geräte bedienen', icon: '🔧', category: 'handwerklich', affinities: { handwerk: 3, logistik: 2 },
    learnInfo: { how: 'Einweisung im Betrieb oder Maschinenkunde-Grundkurs', where: 'Im Betrieb / SVBL', duration: 'Ab Jobeinstieg', costCHF: 0, durationWeeks: 4 } },
  { id: 'raeumlich', label: 'Räumlich vorstellen / Baupläne lesen', icon: '🏗️', category: 'handwerklich', affinities: { handwerk: 3, it: 1 },
    learnInfo: { how: 'Baupläne lesen lernen via YouTube oder Grundkurs Bautechnik', where: 'YouTube / Baugewerbeschule', duration: '2–4 Wochen', costCHF: 100, durationWeeks: 3 } },
  { id: 'elektro', label: 'Elektrische Installationen (Leitungen, Sicherungen)', icon: '⚡', category: 'handwerklich', affinities: { handwerk: 3 },
    learnInfo: { how: 'Elektro-Grundkurs für Laien (Verständnis, nicht Lizenz)', where: 'Baugewerbeschule / electrosuisse.ch', duration: '1–2 Monate', url: 'https://www.electrosuisse.ch', costCHF: 500, durationWeeks: 6 } },
  { id: 'sanitaer', label: 'Sanitär- & Rohrarbeiten', icon: '🚿', category: 'handwerklich', affinities: { handwerk: 3 },
    learnInfo: { how: 'Sanitär-Schnupperpraktikum oder Grundkurs', where: 'Baugewerbeschule / lokaler Sanitärbetrieb', duration: '1–3 Monate', costCHF: 600, durationWeeks: 8 } },
  { id: 'malen_renovieren', label: 'Malen, Tapezieren, Verputzen, Renovieren', icon: '🖌️', category: 'handwerklich', affinities: { handwerk: 3 },
    learnInfo: { how: 'Kurs bei Schweizerischem Maler- und Gipserverband', where: 'smgv.ch / Baumarkt-Workshops', duration: '1–4 Wochen', url: 'https://www.smgv.ch', costCHF: 300, durationWeeks: 3 } },
  { id: 'holz', label: 'Holzbearbeitung / Schreinerarbeiten', icon: '🪵', category: 'handwerklich', affinities: { handwerk: 3 },
    learnInfo: { how: 'Holzkurs oder Praktikum bei lokaler Schreinerei', where: 'vssm.ch (Schreinerverband) / lokale Kurse', duration: '1–4 Wochen', url: 'https://www.vssm.ch', costCHF: 400, durationWeeks: 4 } },
  { id: 'schweissen', label: 'Schweissen / Metallbearbeitung', icon: '🔩', category: 'handwerklich', affinities: { handwerk: 3, logistik: 1 },
    learnInfo: { how: 'Schweisserkurs Basis (MIG/MAG) bei SVTI', where: 'svti.ch (staatlich anerkannte Prüfung)', duration: '1–4 Wochen', url: 'https://www.svti.ch', costCHF: 800, durationWeeks: 3 } },
  { id: 'kochen', label: 'Kochen & Backen (auch privat)', icon: '🍳', category: 'handwerklich', affinities: { gastronomie: 3 },
    learnInfo: { how: 'Kochkurs (z.B. Migros Klubschule) oder intensiv privat üben', where: 'migros-klubschule.ch / lokale Kochschulen', duration: '1–4 Wochen', url: 'https://www.migros-klubschule.ch', costCHF: 200, durationWeeks: 3 } },
  { id: 'fahrzeugwartung', label: 'Fahrzeuge warten / reparieren', icon: '🔩', category: 'handwerklich', affinities: { logistik: 2, handwerk: 2 },
    learnInfo: { how: 'TCS Fahrzeugtechnik-Grundkurs oder autodidaktisch', where: 'tcs.ch / YouTube', duration: '1–4 Wochen', url: 'https://www.tcs.ch', costCHF: 200, durationWeeks: 3 } },

  // ─ Soziales & Betreuung ─────────────────────────────────────────────────────
  { id: 'unterrichten', label: 'Anderen etwas erklären / beibringen', icon: '📚', category: 'soziales', affinities: { paedagogik: 3, soziales: 2 },
    learnInfo: { how: 'Nachhilfe geben (sofort) oder Verein / Jugendarbeit ehrenamtlich', where: 'nachhilfe.ch / lokale Schulen', duration: 'Ab sofort', costCHF: 0, durationWeeks: 4 } },
  { id: 'empathie', label: 'Gut zuhören & einfühlsam sein', icon: '💙', category: 'soziales', affinities: { pflege: 3, soziales: 3, paedagogik: 2 },
    learnInfo: { how: 'Freiwilligenarbeit bei Telefonseelsorge oder Besuchsdienst', where: 'dargebotenehand.ch / prosenectute.ch', duration: 'Ab sofort (Einführungskurs 1–2 Tage)', url: 'https://www.dargebotenehand.ch', costCHF: 0, durationWeeks: 2 } },
  { id: 'konflikt', label: 'Konflikte lösen & zwischen Menschen vermitteln', icon: '⚖️', category: 'soziales', affinities: { soziales: 3, paedagogik: 2, pflege: 1 },
    learnInfo: { how: 'Kurs Gewaltfreie Kommunikation (GFK) – praxisnah', where: 'gfk-schweiz.ch / migros-klubschule.ch', duration: '1–2 Tage', url: 'https://www.gfk-schweiz.ch', costCHF: 300, durationWeeks: 2 } },
  { id: 'beratung', label: 'Beraten & gemeinsam Lösungen erarbeiten', icon: '🎯', category: 'soziales', affinities: { soziales: 3, verkauf: 2, paedagogik: 1, selbstaendigkeit: 2 },
    learnInfo: { how: 'Beratungskompetenzen-Grundkurs oder Coaching-Einführung', where: 'sbap.ch / migros-klubschule.ch', duration: '1–4 Wochen', costCHF: 400, durationWeeks: 3 } },
  { id: 'kinderbetreuung', label: 'Kinder betreuen (eigene zählen auch!)', icon: '👶', category: 'soziales', affinities: { paedagogik: 3, soziales: 2 },
    learnInfo: { how: 'Kita-Praktikum oder Ferienbetreuung als Einstieg', where: 'Lokale Kitas / kibesuisse.ch', duration: 'Ab sofort', url: 'https://www.kibesuisse.ch', costCHF: 0, durationWeeks: 4 } },
  { id: 'pflege_angehoerige', label: 'Angehörige gepflegt oder betreut', icon: '👴', category: 'soziales', affinities: { pflege: 3, soziales: 2 },
    learnInfo: { how: 'Pflegehelferkurs SRK – der schnellste Einstieg in die Pflege', where: 'srk.ch (Kurse schweizweit)', duration: '3 Monate (~CHF 1.200)', url: 'https://www.srk.ch/de/angebote/kurs-pflegehelfer-srk', costCHF: 1200, durationWeeks: 12 } },
  { id: 'erstehilfe', label: 'Erste Hilfe / Notfallsituationen bewältigen', icon: '🩺', category: 'soziales', affinities: { pflege: 2, handwerk: 1 },
    learnInfo: { how: 'SRK Nothelferkurs – 1 Tag, staatlich anerkannt', where: 'srk.ch / TCS (Kurse schweizweit)', duration: '1 Tag (~CHF 90)', url: 'https://www.srk.ch/de/angebote/nothilfe', costCHF: 90, durationWeeks: 1 } },
  { id: 'krisenintervention', label: 'In Krisen Ruhe bewahren & handeln', icon: '🧯', category: 'soziales', affinities: { soziales: 3, pflege: 2, paedagogik: 1 },
    learnInfo: { how: 'Krisenintervention-Grundkurs bei VSKZ oder SRK', where: 'vskz.ch / srk.ch', duration: '1–3 Tage', url: 'https://www.vskz.ch', costCHF: 400, durationWeeks: 1 } },
  { id: 'gruppenarbeit', label: 'Mit Gruppen arbeiten (Jugend, Senioren…)', icon: '🫂', category: 'soziales', affinities: { paedagogik: 2, soziales: 3 },
    learnInfo: { how: 'Jugend- oder Seniorenarbeit ehrenamtlich übernehmen', where: 'Jungwacht/Pfadi / prosenectute.ch', duration: 'Ab sofort', costCHF: 0, durationWeeks: 4 } },

  // ─ Körperlich & Praktisch ───────────────────────────────────────────────────
  { id: 'koerperlich', label: 'Körperlich belastbar & ausdauernd', icon: '💪', category: 'physisch', affinities: { handwerk: 2, pflege: 2, gastronomie: 2, logistik: 2 },
    learnInfo: { how: 'Regelmässiges Training aufbauen, 3×/Woche reicht', where: 'Fitnesscenter / Eigentraining', duration: '4–8 Wochen Aufbau', costCHF: 0, durationWeeks: 8 } },
  { id: 'autofahren', label: 'Autofahren (Führerschein B)', icon: '🚗', category: 'physisch', affinities: { logistik: 3 },
    learnInfo: { how: 'Fahrschule besuchen und Führerausweis Kat. B erwerben', where: 'Lokale Fahrschule', duration: '1–3 Monate (~CHF 2.000–3.000)', costCHF: 2500, durationWeeks: 10 } },
  { id: 'schichtarbeit', label: 'Schichtarbeit & Wochenenden OK', icon: '🌙', category: 'physisch', affinities: { pflege: 2, gastronomie: 3, logistik: 2 },
    learnInfo: { how: 'Bereitschaft in der Bewerbung kommunizieren – kein Kurs nötig', where: 'In Bewerbungsunterlagen erwähnen', duration: 'Sofort', costCHF: 0, durationWeeks: 1 } },
  { id: 'staplerschein', label: 'Staplerschein vorhanden oder anstrebbar', icon: '🏭', category: 'physisch', affinities: { logistik: 3 },
    learnInfo: { how: 'Gabelstaplerkurs (EKAS-anerkannt, 1–2 Tage)', where: 'svbl.ch / lokale Fahrschulen', duration: '1–2 Tage (~CHF 300)', url: 'https://www.svbl.ch', costCHF: 300, durationWeeks: 1 } },
  { id: 'lkw', label: 'LKW fahren / Bereitschaft Kat. C', icon: '🚛', category: 'physisch', affinities: { logistik: 3 },
    learnInfo: { how: 'Führerausweis Kat. C + CPC-Weiterbildung (95h)', where: 'Lastwagenfahrschule / TCS', duration: '3–6 Monate (~CHF 3.000)', costCHF: 3000, durationWeeks: 16 } },
  { id: 'service_erfahrung', label: 'Service-Erfahrung (Gastronomie, Events)', icon: '🥂', category: 'physisch', affinities: { gastronomie: 3, verkauf: 1 },
    learnInfo: { how: 'Aushilfe bei Events oder Wochenendservice im Restaurant', where: 'Direktanfrage bei Gastrobetrieben', duration: '1–2 Wochen', costCHF: 0, durationWeeks: 2 } },
  { id: 'outdoor', label: 'Gerne draussen arbeiten / wetterresistent', icon: '🌿', category: 'physisch', affinities: { handwerk: 2, logistik: 1 },
    learnInfo: { how: 'In Bewerbung betonen – keine Ausbildung nötig', where: 'In Bewerbungsunterlagen erwähnen', duration: 'Sofort', costCHF: 0, durationWeeks: 1 } },
  { id: 'kreativitaet', label: 'Kreativ & gestalterisch veranlagt', icon: '✨', category: 'physisch', affinities: { gastronomie: 1, it: 1, verkauf: 1, soziales: 1, selbstaendigkeit: 1 },
    learnInfo: { how: 'Eigene kreative Projekte umsetzen + Kurs ausprobieren', where: 'migros-klubschule.ch / udemy.com', duration: '1–4 Wochen', costCHF: 100, durationWeeks: 3 } },
]

export function matchFieldsBySkills(selectedIds: string[]): { field: EntryField; percent: number }[] {
  const scores: Partial<Record<EntryField, number>> = {}
  const maxScores: Partial<Record<EntryField, number>> = {}
  for (const skill of SKILLS) {
    for (const [f, v] of Object.entries(skill.affinities) as [EntryField, number][]) {
      maxScores[f] = (maxScores[f] ?? 0) + v
      if (selectedIds.includes(skill.id)) scores[f] = (scores[f] ?? 0) + v
    }
  }
  return (Object.keys(ENTRY_PATHS) as EntryField[])
    .map(f => ({ field: f, percent: maxScores[f] ? Math.round(((scores[f] ?? 0) / maxScores[f]) * 100) : 0 }))
    .filter(r => r.percent > 0)
    .sort((a, b) => b.percent - a.percent)
}

// ─── Discovery: Quiz ──────────────────────────────────────────────────────────

export interface QuizOption {
  label: string
  scores: Partial<Record<EntryField, number>>
}
export interface QuizQuestion {
  id: string
  question: string
  emoji: string
  options: QuizOption[]
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q1', emoji: '🧭', question: 'Wo fühlst du dich bei der Arbeit am wohlsten?',
    options: [
      { label: 'Am Computer — Daten, Technologie, Systeme',         scores: { it: 3 } },
      { label: 'Mit Menschen — beratend, betreuend, unterstützend', scores: { pflege: 2, paedagogik: 2, soziales: 2, verkauf: 1 } },
      { label: 'Mit den Händen — praktisch, körperlich, anpacken',  scores: { handwerk: 3, logistik: 2 } },
      { label: 'Organisieren, koordinieren, den Überblick behalten',scores: { logistik: 2, it: 1, soziales: 1, verkauf: 1, buero: 2 } },
    ],
  },
  {
    id: 'q2', emoji: '🔥', question: 'Was motiviert dich am meisten?',
    options: [
      { label: 'Sinnvolle Arbeit — ich will wirklich helfen',       scores: { pflege: 3, soziales: 3, paedagogik: 2 } },
      { label: 'Gutes Gehalt & klare Karriereperspektive',          scores: { it: 2, paedagogik: 1, verkauf: 2 } },
      { label: 'Abwechslung, Bewegung, immer Neues',                scores: { gastronomie: 2, handwerk: 2, logistik: 2 } },
      { label: 'Stabilität, klare Aufgaben, Sicherheit',            scores: { logistik: 2, handwerk: 2, pflege: 1, buero: 2 } },
    ],
  },
  {
    id: 'q3', emoji: '⏱️', question: 'Wie viel Zeit kannst du in Ausbildung investieren?',
    options: [
      { label: 'Unter 6 Monate — ich will schnell starten',         scores: { verkauf: 3, gastronomie: 3, logistik: 2 } },
      { label: '6–12 Monate',                                       scores: { it: 3, verkauf: 2, logistik: 1 } },
      { label: '1–3 Jahre',                                         scores: { handwerk: 3, pflege: 2, logistik: 2 } },
      { label: '3+ Jahre — ich investiere nachhaltig in mich',      scores: { paedagogik: 3, soziales: 3, pflege: 2 } },
    ],
  },
  {
    id: 'q4', emoji: '💼', question: 'Wie arbeitest du am liebsten?',
    options: [
      { label: 'Selbständig, analytisch, konzentriert',             scores: { it: 3, logistik: 1, buero: 2 } },
      { label: 'Im Team, gemeinsam Dinge aufbauen',                 scores: { gastronomie: 2, handwerk: 2, paedagogik: 2 } },
      { label: 'Beratend — ich höre zu und gebe Orientierung',      scores: { soziales: 3, paedagogik: 2, verkauf: 2, pflege: 2 } },
      { label: 'Hands-on, direkt, anpacken und umsetzen',           scores: { handwerk: 3, pflege: 2, gastronomie: 2 } },
    ],
  },
  {
    id: 'q5', emoji: '⭐', question: 'Was schätzen andere an dir?',
    options: [
      { label: 'Ich löse technische Probleme & denke logisch',      scores: { it: 3, handwerk: 1 } },
      { label: 'Ich bin einfühlsam & gehe auf Menschen ein',        scores: { pflege: 3, soziales: 3, paedagogik: 2 } },
      { label: 'Ich bin organisiert & behalte den Überblick',       scores: { logistik: 3, it: 1, verkauf: 1, buero: 2 } },
      { label: 'Ich bin kommunikativ & überzeuge andere',           scores: { verkauf: 3, gastronomie: 2, paedagogik: 1 } },
    ],
  },
  {
    id: 'q6', emoji: '🔑', question: 'Angestellt oder lieber dein eigener Chef?',
    options: [
      { label: 'Angestellt — Sicherheit, fixes Gehalt, Team',          scores: {} },
      { label: 'Selbständig — mein eigenes Business, meine Kunden',    scores: { selbstaendigkeit: 8 } },
      { label: 'Erstmal angestellt, irgendwann selbständig',            scores: { selbstaendigkeit: 3 } },
      { label: 'Egal — Hauptsache die Arbeit passt',                   scores: {} },
    ],
  },
]

export function calcQuizScores(answers: Record<string, number>): { field: EntryField; score: number }[] {
  const scores: Partial<Record<EntryField, number>> = {}
  for (const [qid, idx] of Object.entries(answers)) {
    const q = QUIZ_QUESTIONS.find(q => q.id === qid)
    if (!q) continue
    for (const [f, v] of Object.entries(q.options[idx]?.scores ?? {}) as [EntryField, number][]) {
      scores[f] = (scores[f] ?? 0) + v
    }
  }
  return (Object.keys(ENTRY_PATHS) as EntryField[])
    .map(f => ({ field: f, score: scores[f] ?? 0 }))
    .sort((a, b) => b.score - a.score)
}

// ─── Discovery: Filter ────────────────────────────────────────────────────────

export interface FieldFilterData {
  salaryMin: number
  salaryMax: number
  trainingMonthsMin: number
  trainingMonthsMax: number
  workStyle: ('buero' | 'physisch' | 'menschen' | 'outdoor')[]
}

export const FIELD_FILTER_DATA: Record<EntryField, FieldFilterData> = {
  it:          { salaryMin: 70000, salaryMax: 120000, trainingMonthsMin: 1,  trainingMonthsMax: 18, workStyle: ['buero'] },
  pflege:      { salaryMin: 55000, salaryMax: 82000,  trainingMonthsMin: 3,  trainingMonthsMax: 48, workStyle: ['menschen', 'physisch'] },
  handwerk:    { salaryMin: 50000, salaryMax: 80000,  trainingMonthsMin: 0,  trainingMonthsMax: 48, workStyle: ['physisch', 'outdoor'] },
  verkauf:     { salaryMin: 42000, salaryMax: 68000,  trainingMonthsMin: 0,  trainingMonthsMax: 12, workStyle: ['menschen', 'buero'] },
  logistik:    { salaryMin: 48000, salaryMax: 78000,  trainingMonthsMin: 1,  trainingMonthsMax: 36, workStyle: ['physisch', 'outdoor'] },
  gastronomie: { salaryMin: 42000, salaryMax: 72000,  trainingMonthsMin: 0,  trainingMonthsMax: 36, workStyle: ['menschen', 'physisch'] },
  paedagogik:  { salaryMin: 72000, salaryMax: 115000, trainingMonthsMin: 36, trainingMonthsMax: 48, workStyle: ['buero', 'menschen'] },
  soziales:    { salaryMin: 55000, salaryMax: 88000,  trainingMonthsMin: 24, trainingMonthsMax: 36, workStyle: ['menschen', 'buero'] },
  buero:            { salaryMin: 50000, salaryMax: 78000,  trainingMonthsMin: 1,  trainingMonthsMax: 6,  workStyle: ['buero'] },
  selbstaendigkeit: { salaryMin: 40000, salaryMax: 200000, trainingMonthsMin: 0,  trainingMonthsMax: 12, workStyle: ['buero', 'menschen', 'physisch', 'outdoor'] },
}

// ─── Selbständigkeit: Sub-Pfade ───────────────────────────────────────────────

export interface SelbstaendigkeitPfad {
  key: 'freelancer' | 'einzelfirma' | 'nebengewerbe' | 'franchise'
  label: string
  icon: string
  desc: string
  revenueRange: string
  timeToFirst: string
  steps: EntryStep[]
  swissTip: string
}

export const SELBSTAENDIGKEIT_PFADE: SelbstaendigkeitPfad[] = [
  {
    key: 'freelancer',
    label: 'Freelancer',
    icon: '💻',
    desc: 'Dienstleistungen verkaufen — Design, Texte, IT, Beratung',
    revenueRange: 'CHF 50.000–150.000 / Jahr',
    timeToFirst: '1–4 Wochen',
    steps: [
      { nr: 1, title: 'Nische & Angebot definieren', description: 'Was bietest du an? Ein klares Angebot (z.B. "WordPress-Websites für KMU") ist wichtiger als ein breites Portfolio.', duration: '1–2 Wochen' },
      { nr: 2, title: 'Ersten Kunden gewinnen', description: 'Bekannte, LinkedIn, Malt.ch oder Upwork. Der erste Kunde kommt fast immer aus dem Netzwerk — erzähle allen davon.', duration: '1–4 Wochen' },
      { nr: 3, title: 'Vertrag & Rechnung aufsetzen', description: 'Einfacher Werkvertrag und Rechnungsvorlage (bexio.com kostenloser Plan reicht). Zahlung immer mit 30 Tagen Frist.', duration: '1–3 Tage' },
      { nr: 4, title: 'AHV als Selbständige anmelden', description: 'Bei der SVA deines Kantons anmelden. Kosten: 10% des Einkommens (erste CHF 9.600 vergünstigt). Pflicht ab erstem Auftrag.', duration: '2–4 Wochen' },
      { nr: 5, title: 'Referenzen & Auslastung aufbauen', description: '3 zufriedene Kunden = Mundpropaganda. Ziel: 80% Auslastung nach 12 Monaten. Preise jährlich erhöhen.', duration: 'laufend' },
    ],
    swissTip: 'Als Freelancer bist du ab dem ersten Franken AHV-pflichtig. Melde dich bei der SVA deines Kantons an — der Prozess dauert 2–4 Wochen. Tipp: separate Konten für Business und Privat von Anfang an.',
  },
  {
    key: 'einzelfirma',
    label: 'Einzelfirma',
    icon: '🏢',
    desc: 'Vollständiges Business mit eigenem Firmennamen',
    revenueRange: 'CHF 60.000–200.000+ / Jahr',
    timeToFirst: '2–6 Wochen',
    steps: [
      { nr: 1, title: 'Businessplan & Angebot definieren', description: 'Wer sind deine Kunden? Was bietest du an? Was kostet es? Ein 1-seitiger Businessplan reicht für den Start.', duration: '1–2 Wochen' },
      { nr: 2, title: 'Buchhaltung einrichten', description: 'bexio.com (CHF 29/Monat) oder Banana Buchhaltung. Belege von Anfang an digital ablegen — erleichtert die Steuererklärung massiv.', duration: '1–3 Tage' },
      { nr: 3, title: 'AHV & Versicherungen klären', description: 'SVA-Anmeldung (AHV Selbständige), Krankentaggeld-Versicherung empfohlen. BVG freiwillig möglich (3. Säule maximieren statt BVG).', duration: '2–4 Wochen' },
      { nr: 4, title: 'Handelsregistereintrag prüfen', description: 'Pflicht ab CHF 100.000 Jahresumsatz. Darunter freiwillig — erhöht aber Seriosität gegenüber Grosskunden. Kosten: ca. CHF 150–300.', duration: '1–2 Wochen' },
      { nr: 5, title: 'Kunden gewinnen & Betrieb aufbauen', description: 'Lokale Netzwerke, LinkedIn, Branchenverbände. Ziel: 3 Stammkunden nach 6 Monaten. Danach wächst es organisch.', duration: 'laufend' },
    ],
    swissTip: 'Die Einzelfirma ist die einfachste Rechtsform — keine Stammeinlage, keine Gründungsgebühren. Aber du haftest mit deinem Privatvermögen. Ab CHF 100.000 Umsatz Handelsregisterpflicht und MwSt-Pflicht prüfen.',
  },
  {
    key: 'nebengewerbe',
    label: 'Nebengewerbe',
    icon: '🌱',
    desc: 'Nebenbei starten, Risiko minimieren',
    revenueRange: 'CHF 5.000–40.000 / Jahr (nebenberuflich)',
    timeToFirst: 'Ab sofort',
    steps: [
      { nr: 1, title: 'Arbeitgeber informieren', description: 'Viele Arbeitsverträge erfordern Erlaubnis für Nebentätigkeit. Schriftliche Genehmigung einholen — schützt vor Konflikten.', duration: '1–2 Wochen' },
      { nr: 2, title: 'Nische & erste Leistung festlegen', description: 'Was kannst du nach Feierabend anbieten? Starte mit einer einzigen Dienstleistung. Tiefe Spezialisierung schlägt breites Angebot.', duration: '1 Woche' },
      { nr: 3, title: 'AHV-Pflicht klären', description: 'Ab CHF 2.300 Nebenerwerb/Jahr bist du AHV-pflichtig. Entweder über den Arbeitgeber abrechnen lassen oder selbst bei SVA anmelden.', duration: '1–2 Wochen' },
      { nr: 4, title: 'Erste Kunden gewinnen', description: 'Bekannte, lokale Facebook-Gruppen, Dienst-Leistungs-Plattformen (TaskRabbit, Smood, fiverr.com). Referenzen sammeln.', duration: '2–6 Wochen' },
      { nr: 5, title: 'Entscheidung: bleiben oder wechseln?', description: 'Nach 6–12 Monaten: genug Kunden für Vollzeit? Dann Anstellung kündigen. Sonst weiter als Nebengewerbe — Sicherheitsnetz bleibt.', duration: 'nach 6–12 Monaten' },
    ],
    swissTip: 'Perfekte Risikominimierung: du baust dein Business auf, ohne den festen Job aufzugeben. Steuerlich: Nebenerwerb ist als Einkommen zu deklarieren. Mit bexio oder einer einfachen Excel-Tabelle behältst du den Überblick.',
  },
  {
    key: 'franchise',
    label: 'Franchise',
    icon: '🏪',
    desc: 'Bewährtes System kaufen — mit Systemunterstützung',
    revenueRange: 'CHF 60.000–180.000 / Jahr',
    timeToFirst: '3–9 Monate',
    steps: [
      { nr: 1, title: 'Franchise-System wählen', description: 'franchiseinfo.ch listet Schweizer Franchisegeber. Branchen: Gastronomie, Reinigung, Fitness, Beratung. Einstiegskapital vergleichen.', duration: '2–4 Wochen' },
      { nr: 2, title: 'Businessplan & Finanzierung prüfen', description: 'Einstiegsgebühr (CHF 10.000–100.000+) + Betriebskapital. Bank, Migros Bank KMU-Kredit oder Bürgschaftsgenossenschaft BG Mitte.', duration: '4–8 Wochen' },
      { nr: 3, title: 'Gespräche mit Franchisegeber', description: 'Mindestens 2–3 bestehende Franchisenehmer befragen. Was läuft gut? Was nicht? Ehrliche Einblicke vor der Verpflichtung.', duration: '2–4 Wochen' },
      { nr: 4, title: 'Franchisevertrag prüfen', description: 'Immer einen Anwalt hinzuziehen! Royalties (5–15%), Laufzeit, Exklusivgebiet, Ausstiegsbedingungen — alles verhandeln.', duration: '2–4 Wochen' },
      { nr: 5, title: 'Standort eröffnen & Onboarding', description: 'Franchisegeber schult und unterstützt. Eröffnung mit Marketingunterstützung des Systems. Nach 3–6 Monaten Betrieb eingeschwungen.', duration: '2–4 Monate' },
    ],
    swissTip: 'Franchise gibt dir ein erprobtes System — du kaufst dir eine höhere Erfolgswahrscheinlichkeit. Achte auf Einstiegsgebühren, laufende Royalties (% vom Umsatz) und Mindestlaufzeiten. Viele Franchisegeber bieten Finanzierungshilfe an.',
  },
]
