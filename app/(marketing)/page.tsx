import type { Metadata } from 'next'
import { PortableText, type PortableTextBlock } from 'next-sanity'
import { client } from '@/lib/sanity/client'

// --- Typen ---
type TextSection = {
  _type: 'textSection'
  _key: string
  title: string
  content?: PortableTextBlock[]
}
type BulletSection = {
  _type: 'bulletSection'
  _key: string
  title: string
  items?: string[]
}
type CtaSection = {
  _type: 'ctaSection'
  _key: string
  title: string
  subtitle?: string
  ctaText?: string
  ctaUrl?: string
}
type Section = TextSection | BulletSection | CtaSection

interface HomepageData {
  heroTitle?: string
  heroSubtitle?: string
  heroCtaText?: string
  heroCtaUrl?: string
  sections?: Section[]
  seoTitle?: string
  seoDescription?: string
}

// --- Sanity Query ---
async function getHomepage(): Promise<HomepageData | null> {
  return client.fetch(
    `*[_type == "homepage" && _id == "homepage"][0]{
      heroTitle, heroSubtitle, heroCtaText, heroCtaUrl,
      sections[]{
        _type, _key,
        title,
        content,
        items,
        subtitle, ctaText, ctaUrl
      },
      seoTitle, seoDescription
    }`,
    {},
    { next: { revalidate: 60 } }
  )
}

// --- Metadata ---
export async function generateMetadata(): Promise<Metadata> {
  const data = await getHomepage()
  return {
    title: data?.seoTitle ?? 'Quereinsteiger Jobs Schweiz | derquereinstieg.ch',
    description: data?.seoDescription ?? 'Die Plattform für Quereinsteiger in der Schweiz. Ehrliche Jobs, echte Stories, konkrete Hilfe.',
    alternates: { canonical: 'https://derquereinstieg.ch/' },
  }
}

// --- Sektionen rendern ---
function RenderSection({ section }: { section: Section }) {
  if (section._type === 'textSection') {
    return (
      <section>
        <h2 className="text-xl font-bold text-dark mb-3">{section.title}</h2>
        {section.content && (
          <div className="prose prose-sm max-w-none">
            <PortableText value={section.content} />
          </div>
        )}
      </section>
    )
  }

  if (section._type === 'bulletSection') {
    return (
      <section>
        <h2 className="text-xl font-bold text-dark mb-3">{section.title}</h2>
        {section.items && section.items.length > 0 && (
          <ul className="list-disc pl-5 space-y-1">
            {section.items.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        )}
      </section>
    )
  }

  if (section._type === 'ctaSection') {
    return (
      <div className="bg-dark text-white rounded-xl p-8 text-center">
        <h2 className="text-xl font-bold mb-2">{section.title}</h2>
        {section.subtitle && (
          <p className="text-white/60 text-sm mb-6">{section.subtitle}</p>
        )}
        {section.ctaText && section.ctaUrl && (
          <a
            href={section.ctaUrl}
            className="inline-block bg-orange hover:bg-orange-dark text-white font-semibold px-6 py-3 rounded-md transition-colors"
          >
            {section.ctaText}
          </a>
        )}
      </div>
    )
  }

  return null
}

// --- Fallback-Sektionen (wenn Sanity leer) ---
const FALLBACK_SECTIONS: Section[] = [
  {
    _type: 'textSection',
    _key: 'fallback-1',
    title: 'Was ist ein Quereinsteiger?',
    content: [
      {
        _type: 'block',
        _key: 'b1',
        style: 'normal',
        children: [{ _type: 'span', _key: 's1', text: 'Als Quereinsteiger oder Quereinstiegerin wechselst du in einen Beruf, für den du keine klassische Ausbildung mitbringst – stattdessen zählen deine Erfahrungen, deine Motivation und der Mut, Neues zu wagen.' }],
      },
      {
        _type: 'block',
        _key: 'b2',
        style: 'normal',
        children: [{ _type: 'span', _key: 's2', text: 'In der Schweiz suchen immer mehr Arbeitgeber genau solche Profile, besonders in Pflege, IT, Pädagogik, Handwerk und Sozialbereich.' }],
      },
    ],
  },
  {
    _type: 'textSection',
    _key: 'fallback-2',
    title: 'Job als Quereinsteiger finden',
    content: [
      {
        _type: 'block',
        _key: 'b3',
        style: 'normal',
        children: [{ _type: 'span', _key: 's3', text: 'Nicht jeder Job verlangt ein passendes Diplom. Wer als Quereinsteiger eine Stelle sucht, braucht vor allem die richtigen Informationen, realistische Erwartungen – und die passende Plattform.' }],
      },
    ],
  },
  {
    _type: 'bulletSection',
    _key: 'fallback-3',
    title: 'Was dich hier erwartet',
    items: [
      'Stellenanzeigen gezielt für Quereinsteiger – nach Kanton, Bereich und Erfahrung',
      'Echte Stories von Menschen, die erfolgreich gewechselt haben',
      'Konkrete Tipps für Bewerbung, Umschulung und Einstieg',
      'Übersichtlich, kostenlos und ohne Ablenkung',
    ],
  },
  {
    _type: 'ctaSection',
    _key: 'fallback-4',
    title: 'Sei dabei, wenn wir starten',
    subtitle: 'Trag dich ein – du bekommst eine kurze Mail, sobald die Plattform live ist.',
  },
]

// --- Page ---
export default async function HomePage() {
  const data = await getHomepage()

  const heroTitle = data?.heroTitle ?? 'Quereinsteiger Jobs in der Schweiz'
  const heroSubtitle = data?.heroSubtitle ?? 'Die Plattform für Menschen, die neu anfangen. Ehrliche Jobs, echte Stories, konkrete Hilfe.'
  const heroCtaText = data?.heroCtaText
  const heroCtaUrl = data?.heroCtaUrl
  const sections = data?.sections?.length ? data.sections : FALLBACK_SECTIONS

  return (
    <>
      {/* Hero */}
      <section className="bg-dark text-white pt-20 pb-16 border-b-4 border-orange">
        <div className="max-w-content mx-auto px-6">
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight tracking-tight mb-4">
            {heroTitle}
          </h1>
          {heroSubtitle && (
            <p className="text-lg text-white/70 max-w-xl mb-8">
              {heroSubtitle}
            </p>
          )}
          {heroCtaText && heroCtaUrl && (
            <a
              href={heroCtaUrl}
              className="inline-block bg-orange hover:bg-orange-dark text-white font-semibold px-6 py-3 rounded-md transition-colors mb-8"
            >
              {heroCtaText}
            </a>
          )}
          <div className="flex flex-wrap gap-4 text-sm text-white/50">
            {['Für Quereinsteiger', 'Fokus Schweiz', 'Kostenlos'].map((item) => (
              <span key={item}>
                <span className="text-orange">✓ </span>{item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Sektionen */}
      <div className="max-w-content mx-auto px-6 py-14 space-y-10">
        {sections.map((section) => (
          <RenderSection key={section._key} section={section} />
        ))}
      </div>
    </>
  )
}
