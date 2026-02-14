import type { Metadata } from 'next'
import Link from 'next/link'
import { client } from '@/lib/sanity/client'
import SwissMapPlaceholder from '@/components/ui/SwissMapPlaceholder'

// ─── SEO via Sanity (nur Metadaten) ───────────────────────────────────────────
async function getSeoData() {
  try {
    return await client.fetch<{ seoTitle?: string; seoDescription?: string }>(
      `*[_type == "homepage" && _id == "homepage"][0]{ seoTitle, seoDescription }`,
      {},
      { next: { revalidate: 3600 } }
    )
  } catch {
    return null
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const data = await getSeoData()
  return {
    title:
      data?.seoTitle ??
      'Quereinsteiger Jobs Schweiz 2026 | derquereinstieg.ch',
    description:
      data?.seoDescription ??
      '425 Stellen in der Schweiz, alle mit explizitem Quereinstieg-Willkommen. Ehrliche Einstiegswege, kein Bullshit.',
    alternates: { canonical: 'https://derquereinstieg.ch/' },
  }
}

// ─── Daten ─────────────────────────────────────────────────────────────────────
const JOBS_10 = [
  { num: 1,  title: 'Pflegehelfer/in SRK & FaGe',    salary: 'CHF 52–68k',   barrier: 'Niedrig',       demand: 'high'   },
  { num: 2,  title: 'Elektriker/in',                  salary: 'CHF 62–75k',   barrier: 'Mittel',        demand: 'high'   },
  { num: 3,  title: 'Bautechniker/in HF',             salary: 'CHF 70–88k',   barrier: 'Mittel',        demand: 'high'   },
  { num: 4,  title: 'IT-Support / Helpdesk',          salary: 'CHF 55–70k',   barrier: 'Niedrig',       demand: 'high'   },
  { num: 5,  title: 'Sales B2B / Account Manager',    salary: 'CHF 70–100k+', barrier: 'Niedrig',       demand: 'medium' },
  { num: 6,  title: 'Lehrperson / Fachlehrkraft',     salary: 'CHF 65–85k',   barrier: 'Mittel',        demand: 'medium' },
  { num: 7,  title: 'Soziale Arbeit',                 salary: 'CHF 58–74k',   barrier: 'Mittel',        demand: 'high'   },
  { num: 8,  title: 'Performance Marketer / SEO',     salary: 'CHF 58–78k',   barrier: 'Niedrig',       demand: 'medium' },
  { num: 9,  title: 'Data Analyst',                   salary: 'CHF 72–108k',  barrier: 'Mittel',        demand: 'medium' },
  { num: 10, title: 'Projektkoordinator/in',          salary: 'CHF 68–88k',   barrier: 'Niedrig–Mittel',demand: 'medium' },
] as const

const STEPS = [
  {
    num: '01',
    title: 'Berufsfeld wählen',
    desc: 'Entdecke 10 Berufsfelder mit echtem Fachkräftemangel. Gefiltert nach Einstiegsbarriere, Lohn und Kanton.',
  },
  {
    num: '02',
    title: 'Einstiegsweg verstehen',
    desc: 'Jedes Feld hat einen konkreten, validierten Weg rein — Kurs, Zertifikat oder Direkteinstieg. Keine leeren Versprechen.',
  },
  {
    num: '03',
    title: 'Stelle finden',
    desc: '425+ Stellen, alle mit explizitem Quereinstieg-Willkommen. Täglich aktualisiert, nach Kanton filterbar.',
  },
]

const BLOG_ARTICLES = [
  {
    tag: 'Überblick',
    title: 'Die 10 besten Quereinsteiger Jobs in der Schweiz 2026',
    desc: 'Welche Berufsfelder suchen wirklich Quereinsteiger? Konkrete Einstiegswege, echte Lohnzahlen, verifizierte Quellen.',
    readTime: '8 Min.',
  },
  {
    tag: 'Strategie',
    title: 'Berufswechsel mit 35, 40 oder 50 — so gelingt er wirklich',
    desc: 'Du hast Erfahrung und Soft Skills. Du weisst nur noch nicht, wie du sie für einen neuen Beruf nutzt. Das ändert sich.',
    readTime: '5 Min.',
  },
]

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function HomePage() {
  return (
    <>
      {/* ① HERO ─────────────────────────────────────────────────────────────── */}
      <section className="bg-dark text-white pt-20 pb-16">
        <div className="max-w-wide mx-auto px-6">
          <div className="max-w-2xl">
            <p className="text-orange text-xs font-bold uppercase tracking-widest mb-5">
              Die Plattform für Quereinsteiger in der Schweiz
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight mb-5">
              Quereinsteiger Jobs Schweiz
            </h1>
            <p className="text-lg md:text-xl text-white/65 leading-relaxed mb-2">
              425 Stellen. Alle mit explizitem Quereinstieg-Willkommen.
            </p>
            <p className="text-base text-white/45 leading-relaxed mb-10">
              Ehrliche Einstiegswege, validierte Daten, kein Bullshit.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/jobs"
                className="inline-flex items-center gap-2 bg-orange hover:bg-orange-dark text-white font-semibold px-6 py-3 rounded-md transition-colors"
              >
                Jobs entdecken
                <span aria-hidden="true">→</span>
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 border border-white/20 hover:border-white/45 text-white/75 hover:text-white font-semibold px-6 py-3 rounded-md transition-colors"
              >
                Welcher Job passt zu mir?
                <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full">
                  kostenlos
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ② STATS STRIP ───────────────────────────────────────────────────────── */}
      <div className="border-b border-border bg-white">
        <div className="max-w-wide mx-auto px-6 py-5">
          <dl className="flex flex-wrap justify-center gap-x-12 gap-y-4 text-center">
            {[
              { value: '12.100',  label: 'Suchen pro Monat nach Quereinsteiger Jobs' },
              { value: '4 von 32', label: 'Berufsgruppen mit echtem Fachkräftemangel' },
              { value: '10',      label: 'validierte Einstiegswege mit konkreten Schritten' },
            ].map(({ value, label }) => (
              <div key={label}>
                <dd className="text-2xl md:text-3xl font-extrabold text-dark tabular-nums">{value}</dd>
                <dt className="text-xs text-muted mt-1 max-w-[160px] mx-auto leading-snug">{label}</dt>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* ③ SCHWEIZER KARTE ───────────────────────────────────────────────────── */}
      <section className="py-16 px-6 bg-cream">
        <div className="max-w-wide mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-extrabold text-dark mb-2">
              Quereinsteiger Stellen in deinem Kanton
            </h2>
            <p className="text-muted text-sm max-w-lg mx-auto leading-relaxed">
              425+ aktuelle Stellen mit explizitem Quereinstieg-Willkommen —
              visualisiert nach Kanton. Klick auf deine Region.
            </p>
          </div>
          <SwissMapPlaceholder />
          <p className="text-center text-[11px] text-muted/50 mt-4">
            Quelle: Öffentliche Schweizer Jobportale · Adecco Fachkräftemangel-Index 2025
          </p>
        </div>
      </section>

      {/* ④ DIE 10 WEGE ───────────────────────────────────────────────────────── */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-wide mx-auto">
          <div className="max-w-xl mb-10">
            <h2 className="text-2xl md:text-3xl font-extrabold text-dark mb-3">
              Die 10 besten Quereinsteiger Jobs in der Schweiz 2026
            </h2>
            <p className="text-muted text-sm leading-relaxed">
              Nur Berufsfelder mit echtem Fachkräftemangel und validiertem Einstiegsweg.
              Jede Angabe ist belegt — BFS, Adecco, ZHAW, SECO.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {JOBS_10.map((job) => (
              <Link
                key={job.num}
                href="/jobs"
                className="group bg-cream rounded-xl p-4 border border-border hover:border-orange/40 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-[11px] font-bold text-orange/60 tabular-nums">#{job.num}</span>
                  <span
                    className={`w-2 h-2 rounded-full mt-0.5 flex-shrink-0 ${
                      job.demand === 'high' ? 'bg-red-500' : 'bg-yellow-400'
                    }`}
                    title={job.demand === 'high' ? 'Hoher Mangel' : 'Stabiler Bedarf'}
                    aria-label={job.demand === 'high' ? 'Hoher Mangel' : 'Stabiler Bedarf'}
                  />
                </div>
                <p className="font-semibold text-dark text-sm leading-snug mb-3 group-hover:text-blue transition-colors">
                  {job.title}
                </p>
                <p className="text-xs text-muted mb-2 tabular-nums">{job.salary}</p>
                <span
                  className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    job.barrier === 'Niedrig'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}
                >
                  {job.barrier}
                </span>
              </Link>
            ))}
          </div>
          <div className="mt-8">
            <Link
              href="/blog"
              className="text-sm font-semibold text-blue hover:text-blue-dark underline underline-offset-4"
            >
              Alle 10 Wege mit Einstiegsanleitung lesen →
            </Link>
          </div>
        </div>
      </section>

      {/* ⑤ WIE ES FUNKTIONIERT ───────────────────────────────────────────────── */}
      <section className="py-16 px-6 bg-cream">
        <div className="max-w-wide mx-auto">
          <h2 className="text-xl font-extrabold text-dark mb-10">
            So gelingt dein Berufswechsel
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl">
            {STEPS.map(({ num, title, desc }) => (
              <div key={num} className="relative pl-5 border-l-2 border-orange/30">
                <span className="block text-[10px] font-bold text-orange/55 tracking-widest uppercase mb-1">
                  Schritt {num}
                </span>
                <h3 className="font-bold text-dark mb-2">{title}</h3>
                <p className="text-sm text-muted leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ⑥ LEAD MAGNET ───────────────────────────────────────────────────────── */}
      <section className="py-16 px-6 bg-blue text-white">
        <div className="max-w-content mx-auto text-center">
          <p className="text-orange text-[11px] font-bold uppercase tracking-widest mb-4">
            Kostenlos
          </p>
          <h2 className="text-2xl md:text-3xl font-extrabold mb-3">
            Welcher Quereinstieg passt zu dir?
          </h2>
          <p className="text-white/60 text-sm mb-8 max-w-sm mx-auto leading-relaxed">
            5 Fragen, 2 Minuten. Du bekommst einen personalisierten Überblick
            welche der 10 Berufsfelder zu deinem Profil passen.
          </p>
          <form
            className="flex flex-col sm:flex-row gap-3 max-w-sm mx-auto"
            action="#"
          >
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

      {/* ⑦ BLOG PREVIEW ─────────────────────────────────────────────────────── */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-wide mx-auto">
          <div className="flex items-baseline justify-between mb-8">
            <h2 className="text-xl font-extrabold text-dark">Wissen für deinen Berufswechsel</h2>
            <Link href="/blog" className="text-sm font-semibold text-blue hover:underline underline-offset-4">
              Alle Artikel →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl">
            {BLOG_ARTICLES.map((article) => (
              <Link
                key={article.title}
                href="/blog"
                className="group bg-cream rounded-xl p-6 border border-border hover:border-orange/30 hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold text-orange uppercase tracking-wider">
                    {article.tag}
                  </span>
                  <span className="text-xs text-muted">{article.readTime}</span>
                </div>
                <h3 className="font-bold text-dark mb-2 group-hover:text-blue transition-colors leading-snug">
                  {article.title}
                </h3>
                <p className="text-sm text-muted leading-relaxed">{article.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
