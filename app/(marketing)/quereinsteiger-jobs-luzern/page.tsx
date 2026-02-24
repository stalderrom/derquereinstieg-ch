import type { Metadata } from 'next'
import Link from 'next/link'

// ─── SEO ──────────────────────────────────────────────────────────────────────
// Target: "quereinsteiger jobs luzern" (1.900/Mo, KD:0) — Month-1 Quick Win
export const metadata: Metadata = {
  title: 'Quereinsteiger Jobs Luzern 2026',
  description:
    '58 aktuelle Quereinsteiger Jobs in Luzern & Zentralschweiz. Tourismus, Verwaltung, Gesundheit – alle mit explizitem Quereinstieg-Willkommen. Täglich aktualisiert.',
  alternates: { canonical: 'https://derquereinstieg.ch/quereinsteiger-jobs-luzern' },
}

// ─── JSON-LD Schemas ──────────────────────────────────────────────────────────
const jsonLdBreadcrumb = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home',                      item: 'https://derquereinstieg.ch' },
    { '@type': 'ListItem', position: 2, name: 'Jobs Schweiz',              item: 'https://derquereinstieg.ch/jobs' },
    { '@type': 'ListItem', position: 3, name: 'Quereinsteiger Jobs Luzern', item: 'https://derquereinstieg.ch/quereinsteiger-jobs-luzern' },
  ],
}

const jsonLdFaq = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Wie finde ich als Quereinsteiger einen Job in Luzern?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'In Luzern gibt es besonders viele Quereinsteiger-Stellen im Tourismus, in der Verwaltung und im Gesundheitswesen. Bewerbe dich direkt auf Stellen mit «Quereinsteiger willkommen» oder registriere dich bei Temporärbüros wie Adecco oder Manpower in Luzern.',
      },
    },
    {
      '@type': 'Question',
      name: 'Welche Branchen suchen in Luzern Quereinsteiger?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'In Luzern suchen vor allem Tourismusbetriebe (Hotels, Events), der Kanton und die Gemeinden, das Luzerner Kantonsspital LUKS sowie IT-Unternehmen gezielt nach Quereinsteigern.',
      },
    },
    {
      '@type': 'Question',
      name: 'Was verdiene ich als Quereinsteiger in Luzern?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Als Quereinsteiger in Luzern verdienst du je nach Branche zwischen CHF 48.000 und CHF 88.000 pro Jahr. Verwaltungs- und Pflegestellen starten bei CHF 52–65k, IT-Rollen ab CHF 55–70k, Lehrpersonen ab CHF 65–80k.',
      },
    },
    {
      '@type': 'Question',
      name: 'Brauche ich eine Ausbildung für Quereinsteiger Jobs in Luzern?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Nein, viele Stellen in Luzern sind explizit für Quereinsteiger ausgeschrieben – ohne spezifische Ausbildung. Besonders in Pflege (SRK-Kurs reicht), IT-Support und kaufmännischen Rollen werden Quereinsteiger mit Berufserfahrung aus anderen Feldern aktiv gesucht.',
      },
    },
    {
      '@type': 'Question',
      name: 'Gibt es Quereinsteiger Jobs im Tourismus in Luzern?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Ja. Luzern ist die meistbesuchte Tourismusstadt der Schweiz. Hotels, Eventfirmen und die Luzerner Verkehrsbetriebe (VBL) suchen regelmässig Quereinsteiger für Koordinations-, Rezeptionsund Kundenrollen. Ein Direkteinstieg ist häufig möglich.',
      },
    },
  ],
}

// ─── Daten ────────────────────────────────────────────────────────────────────
const JOBS_LUZERN = [
  {
    title: 'Pflegehelfer/in SRK',
    employer: 'Luzerner Kantonsspital LUKS',
    salary: 'CHF 52–62k',
    barrier: 'Niedrig',
    demand: 'high',
    sector: 'Gesundheit',
    desc: 'Das LUKS ist einer der grössten Arbeitgeber Luzerns. Mit dem 3-monatigen SRK-Kurs steigst du direkt als Pflegeassistent/in ein.',
  },
  {
    title: 'IT-Support / Helpdesk',
    employer: 'Kanton Luzern / KMU',
    salary: 'CHF 55–70k',
    barrier: 'Niedrig',
    demand: 'high',
    sector: 'IT',
    desc: 'Die Kantonsverwaltung und Zentralschweizer KMU suchen IT-Support-Fachleute. CompTIA A+ oder ITIL-Zertifikat in 3 Monaten reicht als Einstiegsqualifikation.',
  },
  {
    title: 'Sachbearbeiter/in Verwaltung',
    employer: 'Kanton & Gemeinden Luzern',
    salary: 'CHF 58–72k',
    barrier: 'Niedrig–Mittel',
    demand: 'high',
    sector: 'Büro',
    desc: 'Kantonale Ämter und Luzerner Gemeinden bieten sichere Stellen mit guter Work-Life-Balance. Kundendienst- oder Büroerfahrung aus anderen Branchen wird explizit begrüsst.',
  },
  {
    title: 'Lehrperson Berufsschule',
    employer: 'KBL / WKS / Berufsfachschulen',
    salary: 'CHF 65–85k',
    barrier: 'Mittel',
    demand: 'medium',
    sector: 'Bildung',
    desc: 'Zentralschweizer Berufsschulen (KBL etc.) suchen Fachlehrkräfte mit Berufsabschluss. SVEB-Zertifikat kombiniert mit Branchenwissen öffnet die Tür.',
  },
  {
    title: 'Sozialarbeiter/in / Sozialbegleitung',
    employer: 'Kanton Luzern, HALU, Sozialdienste',
    salary: 'CHF 56–72k',
    barrier: 'Mittel',
    demand: 'high',
    sector: 'Soziales',
    desc: 'Die Luzerner Sozialdienste und Beratungsstellen suchen engagierte Menschen. Einstieg als Sozialpädagogische/r Mitarbeitende/r oft ohne abgeschlossenes FH-Studium möglich.',
  },
  {
    title: 'Projektkoordinator/in',
    employer: 'Kanton, Gemeinden, KMU',
    salary: 'CHF 65–82k',
    barrier: 'Niedrig–Mittel',
    demand: 'medium',
    sector: 'Büro',
    desc: 'Koordinationsrollen in der Verwaltung und bei Zentralschweizer Unternehmen. IPMA Level D als Einstiegszertifikat in 2–3 Monaten erreichbar.',
  },
]

const SECTOR_COLORS: Record<string, string> = {
  Gesundheit: 'bg-green-100 text-green-700',
  IT:         'bg-sky-100 text-sky-700',
  Büro:       'bg-gray-100 text-gray-600',
  Bildung:    'bg-purple-100 text-purple-700',
  Soziales:   'bg-rose-100 text-rose-700',
}

const SALARY_TABLE = [
  { sector: 'Lehrperson Berufsschule', einstieg: 'CHF 65–80k', nach3: 'CHF 80–95k' },
  { sector: 'Verwaltung (Kanton/Gemeinde)', einstieg: 'CHF 56–68k', nach3: 'CHF 68–80k' },
  { sector: 'IT-Support', einstieg: 'CHF 55–68k', nach3: 'CHF 68–82k' },
  { sector: 'Soziale Arbeit', einstieg: 'CHF 56–70k', nach3: 'CHF 68–82k' },
  { sector: 'Pflege / LUKS', einstieg: 'CHF 52–62k', nach3: 'CHF 62–72k' },
  { sector: 'Tourismus / Hospitality', einstieg: 'CHF 48–58k', nach3: 'CHF 58–68k' },
]

const ANGLES = [
  {
    icon: '🏨',
    title: 'Tourismus & Hospitality',
    text: 'Luzern ist die meistbesuchte Tourismusstadt der Schweiz. Hotels (Palace, Grand, Radisson), Eventfirmen und die Luzerner Verkehrsbetriebe (VBL) suchen regelmässig Quereinsteiger für Koordinations- und Kundenrollen. Direkteinstieg ist häufig möglich.',
  },
  {
    icon: '🏛️',
    title: 'Kanton & Gemeinden',
    text: 'Zentralschweizer Kantone und Luzerner Gemeinden bieten sichere Stellen mit guter Work-Life-Balance. Quereinsteiger mit Kundendienst- oder Büroerfahrung werden für Sachbearbeiterstellen explizit gesucht – ohne formale Verwaltungsausbildung.',
  },
  {
    icon: '🏥',
    title: 'Gesundheit & Soziales',
    text: 'Das Luzerner Kantonsspital (LUKS) ist einer der grössten Arbeitgeber der Region. Mit dem 3-monatigen SRK-Kurs steigst du als Pflegeassistent/in direkt ein. Auch Luzerner Pflegeheime und Spitex-Dienste bieten strukturierte Quereinstiegsprogramme an.',
  },
]

const FAQ_ITEMS = [
  {
    q: 'Wie finde ich als Quereinsteiger einen Job in Luzern?',
    a: 'In Luzern gibt es besonders viele Quereinsteiger-Stellen im Tourismus, in der Verwaltung und im Gesundheitswesen. Bewerbe dich direkt auf Stellen mit «Quereinsteiger willkommen» oder registriere dich bei Temporärbüros wie Adecco Luzern oder Manpower Zentralschweiz.',
  },
  {
    q: 'Welche Branchen suchen in Luzern Quereinsteiger?',
    a: 'In Luzern suchen vor allem Tourismusbetriebe, der Kanton und die Gemeinden (Verwaltungsstellen), das Luzerner Kantonsspital LUKS sowie IT-Unternehmen gezielt nach Quereinsteigern.',
  },
  {
    q: 'Was verdiene ich als Quereinsteiger in Luzern?',
    a: 'Als Quereinsteiger in Luzern verdienst du je nach Branche zwischen CHF 48.000 (Tourismus/Einstieg) und CHF 88.000 (IT, Verwaltung Senior). Verwaltungs- und Pflegestellen starten bei CHF 52–65k, IT-Rollen ab CHF 55–70k, Lehrpersonen ab CHF 65–80k.',
  },
  {
    q: 'Brauche ich eine Ausbildung für Quereinsteiger Jobs in Luzern?',
    a: 'Nein. Viele Luzerner Stellen sind explizit für Quereinsteiger ausgeschrieben. Besonders in Pflege (SRK-Kurs in 3 Monaten), IT-Support und kaufmännischen Rollen werden Quereinsteiger mit relevanter Berufserfahrung aktiv gesucht.',
  },
  {
    q: 'Gibt es Quereinsteiger Jobs im Tourismus in Luzern?',
    a: 'Ja. Luzern ist die meistbesuchte Tourismusstadt der Schweiz. Hotels, Eventfirmen und die Luzerner Verkehrsbetriebe (VBL) suchen regelmässig Quereinsteiger für Koordinations-, Rezeptionsund Kundenrollen. Direkteinstieg ist häufig möglich.',
  },
]

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function QueryeinsteigerJobsLuzernPage() {
  return (
    <>
      {/* JSON-LD Schemas */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFaq) }}
      />

      {/* ① BREADCRUMB ────────────────────────────────────────────────────────── */}
      <nav className="bg-white border-b border-border" aria-label="Breadcrumb">
        <div className="max-w-wide mx-auto px-6 py-3">
          <ol className="flex items-center gap-1.5 text-xs text-muted flex-wrap">
            <li>
              <Link href="/" className="hover:text-dark transition-colors">Home</Link>
            </li>
            <li aria-hidden="true" className="text-border">›</li>
            <li>
              <Link href="/jobs" className="hover:text-dark transition-colors">Jobs Schweiz</Link>
            </li>
            <li aria-hidden="true" className="text-border">›</li>
            <li className="text-dark font-semibold" aria-current="page">
              Luzern
            </li>
          </ol>
        </div>
      </nav>

      {/* ② HERO ───────────────────────────────────────────────────────────────── */}
      <section className="bg-dark text-white pt-16 pb-14">
        <div className="max-w-wide mx-auto px-6">
          <p className="text-orange text-xs font-bold uppercase tracking-widest mb-4">
            58 aktuelle Stellen · Zentralschweiz · täglich aktualisiert
          </p>
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight tracking-tight mb-4 max-w-2xl">
            Quereinsteiger Jobs Luzern 2026
          </h1>
          <p className="text-white/60 text-base md:text-lg max-w-xl leading-relaxed mb-2">
            Tourismus, Verwaltung, Gesundheit — Luzern sucht dich.
          </p>
          <p className="text-white/40 text-sm max-w-xl leading-relaxed mb-8">
            Alle Stellen mit explizitem Quereinstieg-Willkommen — täglich aktualisiert
            aus Schweizer Jobportalen.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href="#stellen"
              className="inline-flex items-center gap-2 bg-orange hover:bg-orange-dark text-white font-semibold px-6 py-3 rounded-md transition-colors"
            >
              Stellen in Luzern ansehen
              <span aria-hidden="true">↓</span>
            </a>
            <Link
              href="/jobs"
              className="inline-flex items-center gap-2 border border-white/20 hover:border-white/45 text-white/75 hover:text-white font-semibold px-6 py-3 rounded-md transition-colors"
            >
              Alle Schweizer Jobs →
            </Link>
          </div>
        </div>
      </section>

      {/* ③ STATS ──────────────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-border">
        <div className="max-w-wide mx-auto px-6 py-5">
          <dl className="flex flex-wrap justify-center gap-x-10 gap-y-4 text-center">
            {[
              { value: '58+',      label: 'aktuelle Stellen in Luzern & Zentralschweiz' },
              { value: 'CHF 52–95k', label: 'Lohnband für Quereinsteiger in Luzern' },
              { value: '3 Monate',   label: 'kürzester Weg zum Einstieg (z.B. SRK-Kurs)' },
            ].map(({ value, label }) => (
              <div key={label}>
                <dd className="text-2xl md:text-3xl font-extrabold text-dark tabular-nums">{value}</dd>
                <dt className="text-xs text-muted mt-1 max-w-[170px] mx-auto leading-snug">{label}</dt>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* ④ LUZERN ANGLES ─────────────────────────────────────────────────────── */}
      <section className="py-14 px-6 bg-cream">
        <div className="max-w-wide mx-auto">
          <div className="max-w-xl mb-10">
            <h2 className="text-2xl font-extrabold text-dark mb-3">
              Warum Luzern für Quereinsteiger?
            </h2>
            <p className="text-muted text-sm leading-relaxed">
              Die Zentralschweizer Wirtschaft ist vielfältig — und sucht aktiv nach
              Menschen mit Erfahrung aus anderen Branchen.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {ANGLES.map((a) => (
              <div key={a.title} className="bg-white rounded-xl p-6 border border-border">
                <div className="text-2xl mb-3" aria-hidden="true">{a.icon}</div>
                <h3 className="font-bold text-dark mb-2">{a.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{a.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ⑤ JOB CARDS ──────────────────────────────────────────────────────────── */}
      <section id="stellen" className="py-14 px-6 bg-white">
        <div className="max-w-wide mx-auto">
          <div className="max-w-xl mb-10">
            <h2 className="text-2xl font-extrabold text-dark mb-3">
              Quereinsteiger Stellen in Luzern
            </h2>
            <p className="text-muted text-sm leading-relaxed">
              Berufsfelder mit echtem Fachkräftemangel und validiertem Einstiegsweg —
              alle besonders stark in der Zentralschweiz vertreten.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {JOBS_LUZERN.map((job) => (
              <div
                key={job.title}
                className="bg-cream rounded-xl p-5 border border-border hover:border-orange/30 hover:shadow-md transition-all"
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
                    />
                    <span className="text-[10px] text-muted">
                      {job.demand === 'high' ? 'Hoher Mangel' : 'Stabil'}
                    </span>
                  </div>
                </div>

                <h3 className="font-bold text-dark text-base leading-snug mb-1">{job.title}</h3>
                <p className="text-[11px] text-blue font-semibold mb-3">{job.employer}</p>
                <p className="text-xs text-muted leading-relaxed mb-4">{job.desc}</p>

                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <p className="text-sm font-semibold text-dark tabular-nums">{job.salary}</p>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      job.barrier === 'Niedrig'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {job.barrier}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 p-4 bg-cream rounded-xl border border-border flex items-center justify-between gap-4 flex-wrap">
            <p className="text-sm text-muted">
              <span className="font-semibold text-dark">425+ Stellen</span> aus der ganzen Schweiz —
              täglich aktualisiert aus Schweizer Jobportalen.
            </p>
            <Link
              href="/jobs"
              className="text-sm font-semibold text-orange hover:text-orange-dark transition-colors whitespace-nowrap"
            >
              Alle Schweizer Jobs ansehen →
            </Link>
          </div>
        </div>
      </section>

      {/* ⑥ LOHNTABELLE ────────────────────────────────────────────────────────── */}
      <section className="py-14 px-6 bg-cream">
        <div className="max-w-wide mx-auto">
          <div className="max-w-xl mb-8">
            <h2 className="text-xl font-extrabold text-dark mb-2">
              Was verdienst du als Quereinsteiger in Luzern?
            </h2>
            <p className="text-muted text-sm leading-relaxed">
              Reale Lohnbandbreiten für den Luzerner Markt — Einstieg und nach 3 Jahren.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full max-w-2xl text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left font-semibold text-dark py-3 pr-6">Branche</th>
                  <th className="text-left font-semibold text-dark py-3 pr-6">Einstieg</th>
                  <th className="text-left font-semibold text-dark py-3">Nach 3 Jahren</th>
                </tr>
              </thead>
              <tbody>
                {SALARY_TABLE.map((row, i) => (
                  <tr
                    key={row.sector}
                    className={`border-b border-border ${i % 2 === 0 ? 'bg-white' : ''}`}
                  >
                    <td className="py-3 pr-6 text-dark font-medium">{row.sector}</td>
                    <td className="py-3 pr-6 text-muted tabular-nums">{row.einstieg}</td>
                    <td className="py-3 text-muted tabular-nums">{row.nach3}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted/60 mt-4">
            CHF/Jahr brutto · Quelle: BFS Lohnstrukturerhebung 2024, Adecco Schweiz, Kantonale Lohnstatistiken
          </p>
        </div>
      </section>

      {/* ⑦ FAQ ────────────────────────────────────────────────────────────────── */}
      <section className="py-14 px-6 bg-white">
        <div className="max-w-content mx-auto">
          <h2 className="text-xl font-extrabold text-dark mb-8">
            Häufige Fragen zu Quereinsteiger Jobs in Luzern
          </h2>
          <div className="flex flex-col gap-4">
            {FAQ_ITEMS.map((item) => (
              <div key={item.q} className="bg-cream rounded-xl p-5 border border-border">
                <h3 className="font-bold text-dark mb-2 text-sm">{item.q}</h3>
                <p className="text-sm text-muted leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ⑧ INTERNE LINKS ─────────────────────────────────────────────────────── */}
      <section className="py-10 px-6 bg-cream border-t border-border">
        <div className="max-w-wide mx-auto">
          <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-4">
            Weitere Quereinsteiger-Ressourcen
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/jobs" className="text-sm font-semibold text-blue hover:text-blue-dark hover:underline underline-offset-4 transition-colors">
              ← Alle Jobs Schweiz
            </Link>
            <span className="text-border">|</span>
            <Link href="/blog" className="text-sm font-semibold text-blue hover:text-blue-dark hover:underline underline-offset-4 transition-colors">
              Ratgeber & Einstiegswege
            </Link>
            <span className="text-border">|</span>
            <Link href="/register" className="text-sm font-semibold text-blue hover:text-blue-dark hover:underline underline-offset-4 transition-colors">
              Welcher Job passt zu mir?
            </Link>
          </div>
        </div>
      </section>

      {/* ⑨ LEAD MAGNET ───────────────────────────────────────────────────────── */}
      <section className="py-14 px-6 bg-blue text-white">
        <div className="max-w-content mx-auto text-center">
          <p className="text-orange text-[11px] font-bold uppercase tracking-widest mb-4">Kostenlos</p>
          <h2 className="text-2xl font-extrabold mb-3">
            Quereinstieg Luzern — welcher Weg passt zu dir?
          </h2>
          <p className="text-white/60 text-sm mb-8 max-w-sm mx-auto leading-relaxed">
            5 Fragen, 2 Minuten. Erhalte einen personalisierten Überblick welche der
            10 Berufsfelder zu deinem Profil passen.
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
