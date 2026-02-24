import type { Metadata } from 'next'
import type { Route } from 'next'
import Link from 'next/link'

// ─── SEO ──────────────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: 'Job als Quereinsteiger finden Schweiz 2026',
  description:
    '425 Jobs für Quereinsteiger in der Schweiz. Verkauf, Gastronomie, IT, Pflege – alle mit explizitem Quereinstieg-Willkommen. Täglich aktualisiert aus Schweizer Jobportalen.',
  alternates: { canonical: 'https://derquereinstieg.ch/jobs' },
}

// ─── Daten ────────────────────────────────────────────────────────────────────
const JOBS = [
  {
    num: 1,
    title: 'Verkauf & Detailhandel',
    sector: 'Verkauf',
    count: 121,
    salary: 'CHF 48–65k',
    barrier: 'Niedrig',
    demand: 'high',
    desc: 'Grösste Kategorie mit 121 offenen Stellen. Filialleitung, Beratung, Kassenarbeit – viele Stellen sind ohne Voraussetzung direkt zugänglich.',
    entry: 'Direkteinstieg / On-the-job',
  },
  {
    num: 2,
    title: 'Gastronomie & Lebensmittel',
    sector: 'Gastronomie',
    count: 60,
    salary: 'CHF 42–58k',
    barrier: 'Niedrig',
    demand: 'high',
    desc: '60 offene Stellen in Restaurants, Hotellerie und Lebensmittelhandel. Flexibler Einstieg, oft ohne spezifische Vorerfahrung möglich.',
    entry: 'Direkteinstieg möglich',
  },
  {
    num: 3,
    title: 'IT & Technik',
    sector: 'IT',
    count: 46,
    salary: 'CHF 55–75k',
    barrier: 'Niedrig',
    demand: 'high',
    desc: '46 offene Stellen. CompTIA A+ oder ITIL-Zertifikat (3 Monate) reichen für viele IT-Helpdesk-Positionen – kein Informatikstudium nötig.',
    entry: 'CompTIA A+ / ITIL (3 Monate)',
  },
  {
    num: 4,
    title: 'Bau & Handwerk',
    sector: 'Handwerk',
    count: 34,
    salary: 'CHF 55–80k',
    barrier: 'Mittel',
    demand: 'high',
    desc: 'Fachkräftemangel auf allen Ebenen. 34 offene Stellen – vom Hilfsmonteur bis zum Bautechniker mit strukturiertem Weiterbildungsplan zum EFZ.',
    entry: 'Einstieg + Weiterbildung EFZ',
  },
  {
    num: 5,
    title: 'Pflege & Gesundheit',
    sector: 'Gesundheit',
    count: 33,
    salary: 'CHF 52–68k',
    barrier: 'Niedrig',
    demand: 'high',
    desc: '33 offene Stellen in Spitälern, Pflegeheimen und ambulanter Pflege. Mit dem 3-monatigen SRK-Kurs steigst du direkt ein.',
    entry: 'SRK-Kurs (3 Monate)',
  },
  {
    num: 6,
    title: 'Transport & Logistik',
    sector: 'Logistik',
    count: 22,
    salary: 'CHF 50–68k',
    barrier: 'Niedrig',
    demand: 'medium',
    desc: '22 offene Stellen in Lagerhaltung, Paketzustellung und Fahrdienst. Viele Positionen ohne Berufsausbildung direkt zugänglich.',
    entry: 'Direkteinstieg / Fahrausweis Kat. C',
  },
  {
    num: 7,
    title: 'HR & Personalwesen',
    sector: 'HR',
    count: 18,
    salary: 'CHF 62–85k',
    barrier: 'Mittel',
    demand: 'medium',
    desc: '18 offene Stellen in Recruiting, Personaladministration und HR-Beratung. Quereinstieg mit organisatorischem Hintergrund und HRSE-Zertifikat möglich.',
    entry: 'HRSE-Zertifikat (6 Monate)',
  },
  {
    num: 8,
    title: 'Produktion & Industrie',
    sector: 'Produktion',
    count: 15,
    salary: 'CHF 52–68k',
    barrier: 'Niedrig',
    demand: 'medium',
    desc: '15 offene Stellen in Fertigung, Montage und Qualitätskontrolle. Viele Industrieunternehmen schulen Quereinsteiger direkt on-the-job ein.',
    entry: 'On-the-job Training',
  },
] as const

const SECTOR_COLORS: Record<string, string> = {
  Verkauf:    'bg-blue-100 text-blue-700',
  Gastronomie:'bg-amber-100 text-amber-700',
  IT:         'bg-sky-100 text-sky-700',
  Handwerk:   'bg-yellow-100 text-yellow-700',
  Gesundheit: 'bg-green-100 text-green-700',
  Logistik:   'bg-stone-100 text-stone-600',
  HR:         'bg-purple-100 text-purple-700',
  Produktion: 'bg-gray-100 text-gray-600',
}

const GEO = [
  { city: 'Zürich', count: '120+', href: null,                          angle: 'IT, Banking, Verwaltung' },
  { city: 'Bern',   count: '85+',  href: null,                          angle: 'Bundesverwaltung, Soziales' },
  { city: 'Basel',  count: '68+',  href: null,                          angle: 'Pharma, Life Sciences' },
  { city: 'Luzern', count: '58+',  href: '/quereinsteiger-jobs-luzern', angle: 'Tourismus, Verwaltung' },
]

const FAQ = [
  {
    q: 'Was ist ein Quereinsteiger?',
    a: 'Ein Quereinsteiger wechselt in eine Branche oder einen Beruf, für den er keine formale Ausbildung hat – aber relevante Erfahrungen, Soft Skills oder echtes Interesse mitbringt. In der Schweiz werden Quereinsteiger in vielen Berufsfeldern aktiv gesucht.',
  },
  {
    q: 'Welche Jobs gibt es für Quereinsteiger in der Schweiz?',
    a: 'Besonders gefragt sind Quereinsteiger in Verkauf & Detailhandel (121 Stellen), Gastronomie (60), IT & Technik (46), Bau & Handwerk (34) sowie Pflege & Gesundheit (33). Aktuell sind 425 Stellen explizit für Quereinsteiger ausgeschrieben.',
  },
  {
    q: 'Wie lange dauert ein Quereinstieg?',
    a: 'Das hängt vom Berufsfeld ab: Im IT-Support oder Vertrieb sind Direkteinstiege in 4–8 Wochen möglich. Mit Zertifikat oder Kurzausbildung (3–6 Monate) steigen Chancen und Lohn erheblich. Vollausbildungen (HF, FH) dauern 2–4 Jahre.',
  },
  {
    q: 'Wie viel verdiene ich als Quereinsteiger in der Schweiz?',
    a: 'Als Quereinsteiger verdienst du je nach Branche zwischen CHF 52.000 (Pflegehilfe) und CHF 100.000+ (B2B Sales, Data). Die meisten Einstiegsstellen liegen zwischen CHF 58.000 und CHF 78.000 pro Jahr.',
  },
  {
    q: 'Brauche ich eine neue Ausbildung für den Berufswechsel?',
    a: 'Nicht zwingend. Viele Arbeitgeber suchen explizit Quereinsteiger ohne formale Ausbildung. Oft reicht ein Zertifikatskurs von 3–6 Monaten, um die wichtigsten Einstiegsvoraussetzungen zu erfüllen.',
  },
]

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function JobsPage() {
  return (
    <>
      {/* JSON-LD: FAQPage */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: FAQ.map((item) => ({
              '@type': 'Question',
              name: item.q,
              acceptedAnswer: { '@type': 'Answer', text: item.a },
            })),
          }),
        }}
      />

      {/* ① HERO ───────────────────────────────────────────────────────────────── */}
      <section className="bg-dark text-white pt-16 pb-14">
        <div className="max-w-wide mx-auto px-6">
          <p className="text-orange text-xs font-bold uppercase tracking-widest mb-4">
            425 aktuelle Stellen · täglich aktualisiert
          </p>
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight tracking-tight mb-4 max-w-2xl">
            Job als Quereinsteiger finden in der Schweiz
          </h1>
          <p className="text-white/60 text-base md:text-lg max-w-xl leading-relaxed mb-8">
            Alle Stellen mit explizitem Quereinstieg-Willkommen — nach Kanton, Branche
            und Einstiegsbarriere.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href="#jobs"
              className="inline-flex items-center gap-2 bg-orange hover:bg-orange-dark text-white font-semibold px-6 py-3 rounded-md transition-colors"
            >
              Alle Stellen ansehen
              <span aria-hidden="true">↓</span>
            </a>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 border border-white/20 hover:border-white/45 text-white/75 hover:text-white font-semibold px-6 py-3 rounded-md transition-colors"
            >
              Welcher Job passt zu mir?
              <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full">kostenlos</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ② FILTER BAR ─────────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-border sticky top-14 z-40">
        <div className="max-w-wide mx-auto px-6 py-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-muted uppercase tracking-wider mr-1 hidden sm:block">
              Branche:
            </span>
            {['Alle', 'Verkauf', 'Gastronomie', 'IT', 'Handwerk', 'Gesundheit', 'Logistik', 'HR'].map(
              (label, i) => (
                <span
                  key={label}
                  className={`inline-flex items-center text-xs font-semibold px-3 py-1.5 rounded-full cursor-default select-none ${
                    i === 0
                      ? 'bg-dark text-white'
                      : 'bg-cream border border-border text-muted'
                  }`}
                >
                  {label}
                </span>
              )
            )}
            <span className="ml-auto text-[11px] text-muted/60 hidden md:block">
              Weitere Filter folgen
            </span>
          </div>
        </div>
      </div>

      {/* ③ JOB CARDS ──────────────────────────────────────────────────────────── */}
      <section id="jobs" className="py-14 px-6 bg-cream">
        <div className="max-w-wide mx-auto">
          <div className="max-w-xl mb-10">
            <h2 className="text-2xl md:text-3xl font-extrabold text-dark mb-3">
              Die 8 gefragtesten Branchen für Quereinsteiger in der Schweiz
            </h2>
            <p className="text-muted text-sm leading-relaxed">
              Basierend auf 425 aktuellen Stellenanzeigen mit explizitem Quereinstieg-Willkommen —
              täglich neu gescannt aus Schweizer Jobportalen.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {JOBS.map((job) => (
              <div
                key={job.num}
                className="bg-white rounded-xl p-5 border border-border hover:border-orange/30 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${SECTOR_COLORS[job.sector] ?? 'bg-gray-100 text-gray-600'}`}
                  >
                    {job.sector}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        job.demand === 'high' ? 'bg-red-500' : 'bg-yellow-400'
                      }`}
                      title={job.demand === 'high' ? 'Hoher Fachkräftemangel' : 'Stabiler Bedarf'}
                    />
                    <span className="text-[10px] text-muted">
                      {job.demand === 'high' ? 'Hoher Mangel' : 'Stabil'}
                    </span>
                  </div>
                </div>

                <h3 className="font-bold text-dark text-base leading-snug mb-2">
                  {job.title}
                </h3>

                <p className="text-xs text-muted leading-relaxed mb-4">{job.desc}</p>

                <div className="flex items-end justify-between pt-3 border-t border-border">
                  <div>
                    <p className="text-sm font-semibold text-dark tabular-nums">{job.salary}</p>
                    <span
                      className={`inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        job.barrier === 'Niedrig'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      Einstieg: {job.barrier}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-orange tabular-nums leading-tight">
                      {job.count} Stellen
                    </p>
                    <p className="text-[10px] font-semibold text-blue leading-tight max-w-[130px] text-right mt-0.5">
                      {job.entry}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <p className="text-xs text-muted/60 mt-6">
            Lohnangaben in CHF/Jahr brutto · Quelle: BFS Lohnstrukturerhebung 2024, Adecco Schweiz
          </p>
        </div>
      </section>

      {/* ④ GEO-SECTION ────────────────────────────────────────────────────────── */}
      <section className="py-14 px-6 bg-white">
        <div className="max-w-wide mx-auto">
          <div className="max-w-xl mb-8">
            <h2 className="text-2xl font-extrabold text-dark mb-2">
              Quereinsteiger Jobs nach Kanton
            </h2>
            <p className="text-muted text-sm leading-relaxed">
              Stellen nach Kanton gefiltert — wähle deine Region für einen direkten
              Überblick der verfügbaren Stellen vor Ort.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {GEO.map((g) =>
              g.href ? (
                <Link
                  key={g.city}
                  href={g.href as Route}
                  className="group bg-cream rounded-xl p-5 border border-border hover:border-orange/40 hover:shadow-md transition-all"
                >
                  <span className="text-2xl font-extrabold text-dark tabular-nums block mb-1">
                    {g.count}
                  </span>
                  <p className="font-bold text-dark group-hover:text-blue transition-colors mb-1">
                    {g.city}
                  </p>
                  <p className="text-xs text-muted mb-3">{g.angle}</p>
                  <p className="text-xs font-semibold text-orange">
                    Stellen in {g.city} →
                  </p>
                </Link>
              ) : (
                <div key={g.city} className="bg-cream rounded-xl p-5 border border-border opacity-60">
                  <span className="text-2xl font-extrabold text-dark tabular-nums block mb-1">
                    {g.count}
                  </span>
                  <p className="font-bold text-dark mb-1">{g.city}</p>
                  <p className="text-xs text-muted mb-3">{g.angle}</p>
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-muted bg-white border border-border px-2 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange animate-pulse" />
                    Seite folgt
                  </span>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* ⑤ FAQ ────────────────────────────────────────────────────────────────── */}
      <section className="py-14 px-6 bg-cream">
        <div className="max-w-content mx-auto">
          <h2 className="text-xl font-extrabold text-dark mb-8">
            Häufige Fragen zum Quereinstieg in der Schweiz
          </h2>
          <div className="flex flex-col gap-4">
            {FAQ.map((item) => (
              <div key={item.q} className="bg-white rounded-xl p-5 border border-border">
                <h3 className="font-bold text-dark mb-2 text-sm">{item.q}</h3>
                <p className="text-sm text-muted leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ⑥ LEAD MAGNET ───────────────────────────────────────────────────────── */}
      <section className="py-14 px-6 bg-blue text-white">
        <div className="max-w-content mx-auto text-center">
          <p className="text-orange text-[11px] font-bold uppercase tracking-widest mb-4">Kostenlos</p>
          <h2 className="text-2xl md:text-3xl font-extrabold mb-3">
            Welcher Quereinstieg passt zu dir?
          </h2>
          <p className="text-white/60 text-sm mb-8 max-w-sm mx-auto leading-relaxed">
            5 Fragen, 2 Minuten. Personalisierter Überblick welche der 10 Berufsfelder
            zu deinem Profil passen.
          </p>
          <form className="flex flex-col sm:flex-row gap-3 max-w-sm mx-auto" action="#">
            <input
              type="email"
              placeholder="deine@email.ch"
              className="flex-1 px-4 py-3 rounded-md text-dark text-sm bg-white outline-none focus:ring-2 focus:ring-orange"
              required
            />
            <button
              type="submit"
              className="bg-orange hover:bg-orange-dark text-white font-semibold px-5 py-3 rounded-md transition-colors whitespace-nowrap text-sm"
            >
              Cheatsheet holen →
            </button>
          </form>
          <p className="text-xs text-white/35 mt-4">Kein Spam. Einmalig, dann nichts mehr.</p>
        </div>
      </section>
    </>
  )
}
