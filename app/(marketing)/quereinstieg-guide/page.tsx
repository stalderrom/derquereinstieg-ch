import type { Metadata } from 'next'
import Link from 'next/link'

// ─── SEO ──────────────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: 'Was ist ein Quereinstieg? Dein Guide für den Berufswechsel 2026',
  description:
    'Was bedeutet Quereinsteiger? Schritt für Schritt zum neuen Job in der Schweiz. Welche Branchen, welche Qualifikationen, welche Gehälter. Der ehrliche Guide.',
  alternates: { canonical: 'https://derquereinstieg.ch/quereinstieg-guide' },
}

// ─── Daten ────────────────────────────────────────────────────────────────────

const STEPS = [
  {
    num: '01',
    title: 'Standortanalyse',
    desc: 'Was kannst du wirklich gut? Welche Erfahrungen und Soft Skills bringst du mit? Quereinsteiger unterschätzen oft, wie viel aus dem alten Beruf übertragbar ist.',
    tip: 'Schreib 10 Dinge auf, die du in deinem jetzigen Job täglich machst. Davon lassen sich meist 5–7 direkt übertragen.',
  },
  {
    num: '02',
    title: 'Branche sondieren',
    desc: 'Welche Branchen haben echten Fachkräftemangel und nehmen aktiv Quereinsteiger? In der Schweiz sind das aktuell vor allem Verkauf, IT, Pflege und Bau.',
    tip: 'Nicht alle Branchen sind gleich offen. Achte auf Stellenausschreibungen mit explizitem "Quereinsteiger willkommen".',
  },
  {
    num: '03',
    title: 'Lücken erkennen',
    desc: 'Was fehlt dir noch? Oft ist es nur ein Zertifikat oder ein Kurs von 3–6 Monaten — keine 4-jährige Ausbildung. Mach den Unterschied zwischen "nice to have" und "must have" klar.',
    tip: 'Sprich direkt mit HR-Verantwortlichen in deiner Zielbranchen. Frag, was sie wirklich benötigen.',
  },
  {
    num: '04',
    title: 'Einstiegsstrategie wählen',
    desc: 'Drei Wege: Direktbewerbung bei Quereinsteiger-freundlichen Firmen, Temporärbüro als Brücke, oder Kurzausbildung als Qualifikations-Boost.',
    tip: 'Temporärbüros (Adecco, Manpower, Randstad) sind oft der schnellste Weg — oft in 2–4 Wochen beschäftigt.',
  },
  {
    num: '05',
    title: 'Bewerben & Netzwerk',
    desc: 'Dein Motivationsschreiben erklärt den Wechsel — nicht entschuldigt. "Ich bringe X mit und will Y lernen" schlägt "ich habe keine Ausbildung in Y".',
    tip: 'LinkedIn-Profil aktualisieren, Branchenverbände und Alumni-Netzwerke nutzen. 60% der Stellen werden nicht ausgeschrieben.',
  },
]

const CONCERNS = [
  {
    fear: 'Ich bin zu alt für einen Berufswechsel.',
    answer:
      'Das Durchschnittsalter von Quereinsteigern in der Schweiz liegt zwischen 32 und 45 Jahren. Erfahrung, Verlässlichkeit und Lebenserfahrung sind in vielen Branchen gefragter als Jugend.',
  },
  {
    fear: 'Ich brauche eine komplett neue Ausbildung.',
    answer:
      'In den meisten Fällen nein. Viele Arbeitgeber akzeptieren Zertifikatskurse von 3–6 Monaten als Qualifikationsnachweis. Direkteinstieg ist bei Verkauf, Gastronomie, Transport und einigen IT-Rollen sofort möglich.',
  },
  {
    fear: 'Ich werde viel weniger verdienen.',
    answer:
      'Beim Einstieg manchmal. Aber nach 2–3 Jahren im neuen Beruf liegen die meisten Quereinsteiger wieder auf Vorniveau — oder darüber. Kalkulier den Wechsel mittel- bis langfristig.',
  },
  {
    fear: 'Mein Lebenslauf schaut komisch aus.',
    answer:
      'Ein nicht-linearer Lebenslauf signalisiert heute Mut und Lernbereitschaft, nicht Planlosigkeit. Erklär deinen Weg — wer die Erklärung versteht, ist genau die Firma, bei der du einsteigen willst.',
  },
]

const SALARY_TABLE = [
  { sector: 'Verkauf & Detailhandel',     einstieg: 'CHF 48–58k', nachZwei: 'CHF 55–68k' },
  { sector: 'Gastronomie & Lebensmittel', einstieg: 'CHF 42–52k', nachZwei: 'CHF 48–60k' },
  { sector: 'IT & Technik',               einstieg: 'CHF 58–68k', nachZwei: 'CHF 68–82k' },
  { sector: 'Bau & Handwerk',             einstieg: 'CHF 55–65k', nachZwei: 'CHF 62–80k' },
  { sector: 'Pflege & Gesundheit',        einstieg: 'CHF 52–62k', nachZwei: 'CHF 60–70k' },
  { sector: 'HR & Personalwesen',         einstieg: 'CHF 62–72k', nachZwei: 'CHF 70–85k' },
]

const FAQ = [
  {
    q: 'Was ist ein Quereinsteiger?',
    a: 'Ein Quereinsteiger wechselt in eine Branche oder einen Beruf, für den er keine formale Ausbildung hat — aber relevante Transferkompetenzen, Soft Skills oder echtes Interesse mitbringt. Das Schweizer Arbeitsrecht stellt keine formalen Hürden für Quereinsteiger auf.',
  },
  {
    q: 'Ab wann gilt man in der Schweiz als Quereinsteiger?',
    a: 'Es gibt keine offizielle Definition. Praktisch gilt: Wer in eine Branche wechselt, in der er keine abgeschlossene Grundausbildung (EFZ, EBA oder FH/Uni) hat, ist Quereinsteiger. Auch Wechsel innerhalb einer Branche in andere Funktionen zählen.',
  },
  {
    q: 'Wie lange dauert ein Quereinstieg in der Schweiz?',
    a: 'Je nach Branche sehr unterschiedlich: Direkteinstieg (Verkauf, Gastro, Logistik) in 2–4 Wochen möglich. Mit Kurzausbildung oder Zertifikat (IT, Pflege) in 3–6 Monaten. Berufsbegleitende HF oder FH dauern 2–4 Jahre.',
  },
  {
    q: 'Welche Branchen nehmen am meisten Quereinsteiger?',
    a: 'Aktuell am zugänglichsten sind Verkauf & Detailhandel (121 offene Stellen), Gastronomie (60), IT & Technik (46), Bau & Handwerk (34) und Pflege & Gesundheit (33). Alle Zahlen aus täglich aktualisierten Schweizer Jobportalen.',
  },
  {
    q: 'Brauche ich eine Bewilligung für den Berufswechsel?',
    a: 'In der Regel nein. Ausnahmen: Reglementierte Berufe wie Arzt, Rechtsanwalt, Apotheker oder bestimmte Treuhänder-Tätigkeiten erfordern staatlich anerkannte Abschlüsse. Für die meisten Berufe entscheidet allein der Arbeitgeber.',
  },
]

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function QuereinstiegGuidePage() {
  const jsonLdBreadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://derquereinstieg.ch' },
      { '@type': 'ListItem', position: 2, name: 'Quereinstieg Guide', item: 'https://derquereinstieg.ch/quereinstieg-guide' },
    ],
  }

  const jsonLdFaq = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFaq) }} />

      {/* ① BREADCRUMB ──────────────────────────────────────────────────────── */}
      <nav aria-label="Breadcrumb" className="bg-white border-b border-border">
        <div className="max-w-wide mx-auto px-6 py-2.5">
          <ol className="flex items-center gap-1.5 text-xs text-muted">
            <li><Link href="/" className="hover:text-dark transition-colors">Home</Link></li>
            <li aria-hidden="true" className="text-border">›</li>
            <li className="text-dark font-medium">Quereinstieg Guide</li>
          </ol>
        </div>
      </nav>

      {/* ② HERO ────────────────────────────────────────────────────────────── */}
      <section className="bg-dark text-white pt-16 pb-14">
        <div className="max-w-wide mx-auto px-6">
          <p className="text-orange text-xs font-bold uppercase tracking-widest mb-4">
            Dein Einstieg in den Einstieg
          </p>
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight tracking-tight mb-5 max-w-2xl">
            Was ist ein Quereinstieg? — Dein Guide für den Berufswechsel in der Schweiz
          </h1>
          <p className="text-white/60 text-base md:text-lg max-w-xl leading-relaxed mb-10">
            Ehrliche Antworten: Was bedeutet Quereinsteiger wirklich? Welche Branchen sind offen?
            Was brauchst du — und was brauchst du nicht?
          </p>

          {/* Stats */}
          <div className="flex flex-wrap gap-6">
            {[
              { value: '425', label: 'aktuelle Quereinstieg-Stellen in der Schweiz' },
              { value: '8', label: 'Branchen mit nachgewiesenem Fachkräftemangel' },
              { value: '3 Mo.', label: 'kürzester Weg zum ersten Tag im neuen Job' },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-3xl font-extrabold text-orange tabular-nums">{s.value}</p>
                <p className="text-white/50 text-xs mt-0.5 max-w-[140px] leading-snug">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ③ DEFINITION ──────────────────────────────────────────────────────── */}
      <section className="py-14 px-6 bg-cream">
        <div className="max-w-content mx-auto">
          <h2 className="text-2xl md:text-3xl font-extrabold text-dark mb-6">
            Was bedeutet «Quereinsteiger» genau?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                label: 'Quereinsteiger',
                color: 'border-orange/40 bg-orange/5',
                badge: 'Das bist du',
                badgeColor: 'bg-orange/15 text-orange',
                text: 'Du wechselst in eine Branche, in der du keine formale Ausbildung hast — aber Erfahrung, Skills oder echtes Interesse mitbringst.',
              },
              {
                label: 'Umschulung',
                color: 'border-border bg-white',
                badge: 'Alternative',
                badgeColor: 'bg-gray-100 text-gray-500',
                text: 'Formale Neuausbildung — oft gefördert durch RAV oder IV. Dauert 1–3 Jahre. Sinnvoll bei streng reglementierten Berufen.',
              },
              {
                label: 'Weiterbildung',
                color: 'border-border bg-white',
                badge: 'Ergänzung',
                badgeColor: 'bg-gray-100 text-gray-500',
                text: 'Du bleibst in derselben Branche, erweiterst aber deine Kompetenzen. Kein Branchenwechsel — eher Positionswechsel.',
              },
            ].map((item) => (
              <div key={item.label} className={`rounded-xl p-5 border ${item.color}`}>
                <div className="flex items-center justify-between mb-3">
                  <p className="font-bold text-dark text-base">{item.label}</p>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                </div>
                <p className="text-sm text-muted leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ④ WARUM JETZT ─────────────────────────────────────────────────────── */}
      <section className="py-14 px-6 bg-white">
        <div className="max-w-content mx-auto">
          <h2 className="text-2xl md:text-3xl font-extrabold text-dark mb-3">
            Warum ist jetzt der richtige Zeitpunkt?
          </h2>
          <p className="text-muted text-sm leading-relaxed mb-8 max-w-xl">
            Der Schweizer Arbeitsmarkt 2026 ist so offen für Quereinsteiger wie selten zuvor.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                icon: '📉',
                title: 'Fachkräftemangel auf Rekordniveau',
                text: 'Der Adecco Fachkräftemangel-Index 2025 zeigt: 8 von 10 Schweizer Branchen können offene Stellen nicht mit ausgebildeten Fachleuten besetzen. Quereinsteiger füllen diese Lücke.',
              },
              {
                icon: '🎓',
                title: 'Kurze Zertifikatswege sind etabliert',
                text: 'Branchenverbände und Bildungsinstitutionen haben die Ausbildungszeit für Quereinsteiger stark verkürzt. Viele Zertifikate in 3–6 Monaten, berufsbegleitend möglich.',
              },
              {
                icon: '🏢',
                title: 'Firmen passen ihre Anforderungen an',
                text: 'Immer mehr Stelleninserate schreiben explizit "Quereinsteiger willkommen" — oder streichen Ausbildungsanforderungen gänzlich. 425 solcher Stellen sind heute live.',
              },
              {
                icon: '🔄',
                title: 'Lebenslanges Lernen ist Standard',
                text: 'Was vor 20 Jahren als Makel galt (kein linearer Lebenslauf), ist heute ein Zeichen von Anpassungsfähigkeit. Arbeitgeber wissen: wer einmal wechselt, kann auch neue Challenges meistern.',
              },
            ].map((item) => (
              <div key={item.title} className="rounded-xl p-5 border border-border hover:border-orange/30 transition-colors">
                <p className="text-2xl mb-3" aria-hidden="true">{item.icon}</p>
                <h3 className="font-bold text-dark text-sm mb-2">{item.title}</h3>
                <p className="text-xs text-muted leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ⑤ 5 STEPS ─────────────────────────────────────────────────────────── */}
      <section className="py-14 px-6 bg-cream">
        <div className="max-w-content mx-auto">
          <h2 className="text-2xl md:text-3xl font-extrabold text-dark mb-3">
            In 5 Schritten zum neuen Job
          </h2>
          <p className="text-muted text-sm mb-10 max-w-xl leading-relaxed">
            Kein universeller Fahrplan — aber die fünf Schritte, die bei den meisten
            erfolgreichen Quereinsteigern in der Schweiz erkennbar waren.
          </p>
          <div className="flex flex-col gap-4">
            {STEPS.map((step) => (
              <div key={step.num} className="bg-white rounded-xl p-6 border border-border flex gap-5">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-orange/10 border border-orange/25 flex items-center justify-center">
                  <span className="text-[11px] font-extrabold text-orange">{step.num}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-dark text-sm mb-1.5">{step.title}</h3>
                  <p className="text-xs text-muted leading-relaxed mb-3">{step.desc}</p>
                  <div className="flex items-start gap-2 bg-cream rounded-lg px-3 py-2">
                    <span className="text-orange font-bold text-xs flex-shrink-0 mt-0.5">→</span>
                    <p className="text-[11px] text-dark/70 leading-relaxed">{step.tip}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ⑥ AKTUELLE BRANCHEN ───────────────────────────────────────────────── */}
      <section className="py-14 px-6 bg-white">
        <div className="max-w-content mx-auto">
          <h2 className="text-2xl md:text-3xl font-extrabold text-dark mb-3">
            Welche Branchen nehmen Quereinsteiger?
          </h2>
          <p className="text-muted text-sm mb-8 max-w-xl leading-relaxed">
            Diese Zahlen basieren auf täglich aktualisierten Schweizer Stellenanzeigen — nur Inserate mit
            explizitem Quereinstieg-Willkommen.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
            {[
              { sector: 'Verkauf & Detailhandel', count: 121, barrier: 'Direkteinstieg' },
              { sector: 'Gastronomie',            count: 60,  barrier: 'Direkteinstieg' },
              { sector: 'IT & Technik',           count: 46,  barrier: 'Zertifikat 3 Mo.' },
              { sector: 'Bau & Handwerk',         count: 34,  barrier: 'Einstieg + EFZ' },
              { sector: 'Pflege & Gesundheit',    count: 33,  barrier: 'SRK-Kurs 3 Mo.' },
              { sector: 'Transport & Logistik',   count: 22,  barrier: 'Direkteinstieg' },
              { sector: 'HR & Personal',          count: 18,  barrier: 'HRSE 6 Mo.' },
              { sector: 'Produktion & Industrie', count: 15,  barrier: 'On-the-job' },
            ].map((item) => (
              <div key={item.sector} className="rounded-xl p-4 border border-border bg-cream">
                <p className="text-2xl font-extrabold text-orange tabular-nums mb-1">{item.count}</p>
                <p className="font-semibold text-dark text-xs mb-0.5">{item.sector}</p>
                <p className="text-[10px] text-muted">{item.barrier}</p>
              </div>
            ))}
          </div>
          <Link
            href="/jobs"
            className="inline-flex items-center gap-2 bg-orange hover:bg-orange-dark text-white font-semibold px-5 py-2.5 rounded-md transition-colors text-sm"
          >
            Alle 425 Stellen ansehen →
          </Link>
        </div>
      </section>

      {/* ⑦ HÄUFIGE BEDENKEN ────────────────────────────────────────────────── */}
      <section className="py-14 px-6 bg-cream">
        <div className="max-w-content mx-auto">
          <h2 className="text-2xl md:text-3xl font-extrabold text-dark mb-3">
            Die häufigsten Bedenken — und was wirklich dahinter steckt
          </h2>
          <p className="text-muted text-sm mb-8 max-w-xl leading-relaxed">
            Fast alle dieser Sorgen sind berechtigt. Aber sie sind keine Stopper — nur Faktoren,
            die man einplanen muss.
          </p>
          <div className="flex flex-col gap-3">
            {CONCERNS.map((item) => (
              <div key={item.fear} className="bg-white rounded-xl p-5 border border-border">
                <p className="font-bold text-dark text-sm mb-2">«{item.fear}»</p>
                <p className="text-sm text-muted leading-relaxed">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ⑧ LOHN-TABELLE ────────────────────────────────────────────────────── */}
      <section className="py-14 px-6 bg-white">
        <div className="max-w-content mx-auto">
          <h2 className="text-2xl font-extrabold text-dark mb-3">
            Was verdienst du als Quereinsteiger?
          </h2>
          <p className="text-muted text-sm mb-8 max-w-xl leading-relaxed">
            Realistische Lohnbandbreiten — Einstieg vs. nach 2 Jahren Erfahrung im neuen Beruf.
          </p>
          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-cream">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-bold text-dark/60 uppercase tracking-wider">Branche</th>
                  <th className="text-right px-4 py-3 text-xs font-bold text-dark/60 uppercase tracking-wider">Einstieg</th>
                  <th className="text-right px-4 py-3 text-xs font-bold text-dark/60 uppercase tracking-wider">Nach 2 Jahren</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {SALARY_TABLE.map((row) => (
                  <tr key={row.sector} className="bg-white hover:bg-cream/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-dark text-xs">{row.sector}</td>
                    <td className="px-4 py-3 text-right text-muted tabular-nums text-xs">{row.einstieg}</td>
                    <td className="px-4 py-3 text-right font-semibold text-dark tabular-nums text-xs">{row.nachZwei}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted/60 mt-3">
            CHF/Jahr brutto · Quelle: BFS Lohnstrukturerhebung 2024, Adecco Schweiz 2025
          </p>
        </div>
      </section>

      {/* ⑨ FAQ ─────────────────────────────────────────────────────────────── */}
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

      {/* ⑩ INTERNE LINKS ───────────────────────────────────────────────────── */}
      <section className="py-10 px-6 bg-white border-t border-border">
        <div className="max-w-content mx-auto">
          <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-4">Nächste Schritte</p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/jobs"
              className="inline-flex items-center gap-2 bg-cream border border-border hover:border-orange/40 text-dark font-semibold text-sm px-4 py-2.5 rounded-lg transition-colors"
            >
              Alle Jobs ansehen →
            </Link>
            <Link
              href="/quereinsteiger-jobs-luzern"
              className="inline-flex items-center gap-2 bg-cream border border-border hover:border-orange/40 text-dark font-semibold text-sm px-4 py-2.5 rounded-lg transition-colors"
            >
              Jobs in Luzern →
            </Link>
            <Link
              href="/quereinstieg-buero"
              className="inline-flex items-center gap-2 bg-cream border border-border hover:border-orange/40 text-dark font-semibold text-sm px-4 py-2.5 rounded-lg transition-colors"
            >
              Quereinstieg Büro →
            </Link>
            <Link
              href="/quereinstieg-it"
              className="inline-flex items-center gap-2 bg-cream border border-border hover:border-orange/40 text-dark font-semibold text-sm px-4 py-2.5 rounded-lg transition-colors"
            >
              Quereinstieg IT →
            </Link>
          </div>
        </div>
      </section>

      {/* ⑪ LEAD MAGNET ─────────────────────────────────────────────────────── */}
      <section className="py-14 px-6 bg-blue text-white">
        <div className="max-w-content mx-auto text-center">
          <p className="text-orange text-[11px] font-bold uppercase tracking-widest mb-4">Kostenlos</p>
          <h2 className="text-2xl md:text-3xl font-extrabold mb-3">
            Welcher Quereinstieg passt zu dir?
          </h2>
          <p className="text-white/60 text-sm mb-8 max-w-sm mx-auto leading-relaxed">
            5 Fragen, 2 Minuten. Personalisierter Überblick, welche der 8 Branchen
            zu deinem Profil und deinen Stärken passen.
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
