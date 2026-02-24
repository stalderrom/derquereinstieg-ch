import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { client } from '@/lib/sanity/client'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Stat { value: string; label: string }
interface Grund { titel: string; text: string }
interface Stelle { titel: string; gehalt: string; barrier: string; beschreibung: string }
interface Schritt { nummer: number; titel: string; text: string }
interface LohnZeile { position: string; einsteiger: string; erfahren: string; senior: string }
interface Bedenken { mythos: string; realitaet: string }
interface FaqItem { frage: string; antwort: string }

interface BranchenSeite {
  _id: string
  title: string
  slug: { current: string }
  brancheLabel?: string
  heroHeadline?: string
  heroSubline?: string
  heroStats?: Stat[]
  introText?: string
  warumHeadline?: string
  warumGruende?: Grund[]
  stellenHeadline?: string
  typischeStellen?: Stelle[]
  schritteHeadline?: string
  schritte?: Schritt[]
  lohnTabelle?: LohnZeile[]
  bedenken?: Bedenken[]
  faq?: FaqItem[]
  seoTitle?: string
  seoDescription?: string
}

// ─── GROQ + Data Fetching ──────────────────────────────────────────────────────

const QUERY = `*[_type == "branchenSeite" && slug.current == $slug][0] {
  _id, title, slug, brancheLabel,
  heroHeadline, heroSubline, heroStats,
  introText,
  warumHeadline, warumGruende,
  stellenHeadline, typischeStellen,
  schritteHeadline, schritte,
  lohnTabelle,
  bedenken,
  faq,
  seoTitle, seoDescription
}`

async function getBranchenSeite(slug: string): Promise<BranchenSeite | null> {
  return client.fetch(QUERY, { slug }, { next: { revalidate: 3600 } })
}

// For ISR: pre-build all published branchen pages
export async function generateStaticParams() {
  const slugs = await client.fetch<string[]>(
    `*[_type == "branchenSeite" && defined(slug.current)][].slug.current`,
    {},
    { next: { revalidate: 3600 } }
  )
  return (slugs ?? []).map((slug) => ({ slug }))
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const data = await getBranchenSeite(slug)
  if (!data) return {}

  const title = data.seoTitle || data.title
  const description = data.seoDescription || ''
  const canonical = `https://derquereinstieg.ch/${slug}`

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical, siteName: 'Der Quereinstieg' },
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function BranchenSeitePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const data = await getBranchenSeite(slug)
  if (!data) notFound()

  const canonical = `https://derquereinstieg.ch/${slug}`
  const branche = data.brancheLabel ?? data.title

  // ─── JSON-LD ───────────────────────────────────────────────────────────────
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://derquereinstieg.ch' },
      { '@type': 'ListItem', position: 2, name: 'Quereinstieg Guide', item: 'https://derquereinstieg.ch/quereinstieg-guide' },
      { '@type': 'ListItem', position: 3, name: branche, item: canonical },
    ],
  }

  const faqJsonLd = data.faq?.length
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: data.faq.map((item) => ({
          '@type': 'Question',
          name: item.frage,
          acceptedAnswer: { '@type': 'Answer', text: item.antwort },
        })),
      }
    : null

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}

      {/* ── Breadcrumb ── */}
      <nav className="bg-cream border-b border-border" aria-label="Breadcrumb">
        <div className="max-w-content mx-auto px-6 py-2 text-xs text-muted flex gap-1.5 flex-wrap">
          <Link href="/" className="hover:text-dark transition-colors">Home</Link>
          <span>›</span>
          <Link href="/quereinstieg-guide" className="hover:text-dark transition-colors">Guide</Link>
          <span>›</span>
          <span className="text-dark font-medium">{branche}</span>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="bg-dark text-white py-14 px-6">
        <div className="max-w-content mx-auto">
          <p className="text-sm font-semibold text-orange uppercase tracking-widest mb-3">
            Quereinstieg · {branche}
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">
            {data.heroHeadline ?? data.title}
          </h1>
          {data.heroSubline && (
            <p className="text-white/70 text-lg max-w-xl mb-8">{data.heroSubline}</p>
          )}
          {data.heroStats && data.heroStats.length > 0 && (
            <div className="flex flex-wrap gap-6">
              {data.heroStats.map((stat, i) => (
                <div key={i} className="text-center">
                  <p className="text-3xl font-bold text-orange tabular-nums">{stat.value}</p>
                  <p className="text-xs text-white/60 mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Einleitung ── */}
      {data.introText && (
        <section className="py-10 px-6 bg-cream">
          <div className="max-w-content mx-auto">
            <p className="text-muted text-base leading-relaxed">{data.introText}</p>
          </div>
        </section>
      )}

      {/* ── Warum diese Branche ── */}
      {data.warumGruende && data.warumGruende.length > 0 && (
        <section className="py-12 px-6 bg-white border-y border-border">
          <div className="max-w-content mx-auto">
            <h2 className="text-2xl font-bold text-dark mb-8">
              {data.warumHeadline ?? `Warum Quereinstieg in ${branche}?`}
            </h2>
            <div className="grid sm:grid-cols-2 gap-5">
              {data.warumGruende.map((grund, i) => (
                <div key={i} className="border border-border rounded-xl p-5 bg-cream">
                  <p className="font-semibold text-dark mb-1">{grund.titel}</p>
                  <p className="text-sm text-muted leading-relaxed">{grund.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Typische Stellen ── */}
      {data.typischeStellen && data.typischeStellen.length > 0 && (
        <section className="py-12 px-6 bg-cream">
          <div className="max-w-content mx-auto">
            <h2 className="text-2xl font-bold text-dark mb-2">
              {data.stellenHeadline ?? `Typische Stellen im Bereich ${branche}`}
            </h2>
            <p className="text-muted mb-8 text-sm">Positionen, in die Quereinsteiger direkt einsteigen können.</p>
            <div className="grid sm:grid-cols-2 gap-4">
              {data.typischeStellen.map((stelle, i) => (
                <div key={i} className="bg-white rounded-xl border border-border p-5 flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-dark">{stelle.titel}</h3>
                    {stelle.barrier && (
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${
                        stelle.barrier === 'Niedrig'
                          ? 'bg-green-100 text-green-700'
                          : stelle.barrier === 'Mittel'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {stelle.barrier}
                      </span>
                    )}
                  </div>
                  {stelle.beschreibung && (
                    <p className="text-sm text-muted leading-relaxed">{stelle.beschreibung}</p>
                  )}
                  {stelle.gehalt && (
                    <p className="text-xs font-bold text-orange">{stelle.gehalt}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Schritte ── */}
      {data.schritte && data.schritte.length > 0 && (
        <section className="py-12 px-6 bg-dark text-white">
          <div className="max-w-content mx-auto">
            <h2 className="text-2xl font-bold mb-8">
              {data.schritteHeadline ?? `So gelingt der Quereinstieg in ${branche}`}
            </h2>
            <div className="flex flex-col gap-6">
              {data.schritte.map((schritt, i) => (
                <div key={i} className="flex gap-5">
                  <div className="flex-shrink-0 w-9 h-9 rounded-full bg-orange flex items-center justify-center text-white font-bold text-sm">
                    {schritt.nummer ?? i + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-white mb-1">{schritt.titel}</p>
                    <p className="text-sm text-white/70 leading-relaxed">{schritt.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Lohntabelle ── */}
      {data.lohnTabelle && data.lohnTabelle.length > 0 && (
        <section className="py-12 px-6 bg-cream">
          <div className="max-w-content mx-auto">
            <h2 className="text-2xl font-bold text-dark mb-2">
              Lohntabelle {branche} (Jahresbrutto CHF)
            </h2>
            <p className="text-sm text-muted mb-6">Richtwerte für die Schweiz inkl. 13. Monatslohn.</p>
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-dark text-white">
                    <th className="text-left px-4 py-3 font-semibold">Position</th>
                    <th className="text-right px-4 py-3 font-semibold">Einsteiger</th>
                    <th className="text-right px-4 py-3 font-semibold">Erfahren</th>
                    <th className="text-right px-4 py-3 font-semibold">Senior</th>
                  </tr>
                </thead>
                <tbody>
                  {data.lohnTabelle.map((zeile, i) => (
                    <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-cream'}>
                      <td className="px-4 py-3 font-medium text-dark">{zeile.position}</td>
                      <td className="px-4 py-3 text-right text-muted tabular-nums">{zeile.einsteiger}</td>
                      <td className="px-4 py-3 text-right text-muted tabular-nums">{zeile.erfahren}</td>
                      <td className="px-4 py-3 text-right font-semibold text-dark tabular-nums">{zeile.senior}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* ── Bedenken / Mythen ── */}
      {data.bedenken && data.bedenken.length > 0 && (
        <section className="py-12 px-6 bg-white border-y border-border">
          <div className="max-w-content mx-auto">
            <h2 className="text-2xl font-bold text-dark mb-8">
              Häufige Bedenken — und was wirklich stimmt
            </h2>
            <div className="flex flex-col gap-5">
              {data.bedenken.map((b, i) => (
                <div key={i} className="border-l-4 border-orange pl-5">
                  <p className="font-semibold text-dark mb-1">„{b.mythos}"</p>
                  <p className="text-sm text-muted leading-relaxed">{b.realitaet}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── FAQ ── */}
      {data.faq && data.faq.length > 0 && (
        <section className="py-12 px-6 bg-cream">
          <div className="max-w-content mx-auto">
            <h2 className="text-2xl font-bold text-dark mb-8">
              Häufige Fragen zum Quereinstieg in {branche}
            </h2>
            <div className="flex flex-col gap-6">
              {data.faq.map((item, i) => (
                <div key={i}>
                  <h3 className="font-semibold text-dark mb-2">{item.frage}</h3>
                  <p className="text-sm text-muted leading-relaxed">{item.antwort}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA + Interne Links ── */}
      <section className="py-14 px-6 bg-dark text-white">
        <div className="max-w-content mx-auto text-center">
          <h2 className="text-2xl font-bold mb-3">Bereit für den Quereinstieg?</h2>
          <p className="text-white/70 mb-8 max-w-md mx-auto">
            Durchsuche jetzt offene Stellen im Bereich {branche} — ohne Umwege.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/jobs"
              className="bg-orange hover:bg-orange-dark text-white font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              Jetzt Jobs durchsuchen
            </Link>
            <Link
              href="/quereinstieg-guide"
              className="bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              Zum Quereinstieg Guide
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
