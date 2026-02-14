import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Quereinsteiger Jobs Schweiz | derquereinstieg.ch',
  description: 'Die Plattform für Quereinsteiger in der Schweiz. Ehrliche Jobs, echte Stories, konkrete Hilfe.',
  alternates: {
    canonical: 'https://derquereinstieg.ch/',
  },
}

const CATEGORIES = [
  'Pflege & Gesundheit',
  'IT & Tech',
  'Pädagogik',
  'Soziales',
  'Handwerk',
  'Verkauf',
]

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-dark text-white pt-20 pb-16 border-b-4 border-orange">
        <div className="max-w-content mx-auto px-6">
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight tracking-tight mb-4">
            Quereinsteiger Jobs<br />
            <em className="not-italic text-orange">in der Schweiz</em>
          </h1>
          <p className="text-lg text-white/70 max-w-xl mb-8">
            Die Plattform für Menschen, die neu anfangen. Ehrliche Jobs,
            echte Stories, konkrete Hilfe.
          </p>
          <div className="flex flex-wrap gap-4 text-sm text-white/50">
            {['Für Quereinsteiger', 'Fokus Schweiz', 'Kostenlos'].map((item) => (
              <span key={item}>
                <span className="text-orange">✓ </span>{item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="max-w-content mx-auto px-6 py-14 space-y-10">

        <section>
          <h2 className="text-xl font-bold text-dark mb-3">Was ist ein Quereinsteiger?</h2>
          <p className="mb-3">
            Als Quereinsteiger oder Quereinstiegerin wechselst du in einen Beruf,
            für den du keine klassische Ausbildung mitbringst – stattdessen zählen
            deine Erfahrungen, deine Motivation und der Mut, Neues zu wagen.
          </p>
          <p>
            In der Schweiz suchen immer mehr Arbeitgeber genau solche Profile,
            besonders in Pflege, IT, Pädagogik, Handwerk und Sozialbereich.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-dark mb-3">Job als Quereinsteiger finden</h2>
          <p className="mb-4">
            Nicht jeder Job verlangt ein passendes Diplom. Wer als Quereinsteiger
            eine Stelle sucht, braucht vor allem die richtigen Informationen,
            realistische Erwartungen – und die passende Plattform.
          </p>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <span
                key={cat}
                className="bg-blue text-white text-sm font-medium px-3 py-1 rounded-full"
              >
                {cat}
              </span>
            ))}
            <span className="bg-orange text-white text-sm font-medium px-3 py-1 rounded-full">
              Alle 26 Kantone
            </span>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-dark mb-3">Was dich hier erwartet</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Stellenanzeigen gezielt für Quereinsteiger – nach Kanton, Bereich und Erfahrung</li>
            <li>Echte Stories von Menschen, die erfolgreich gewechselt haben</li>
            <li>Konkrete Tipps für Bewerbung, Umschulung und Einstieg</li>
            <li>Übersichtlich, kostenlos und ohne Ablenkung</li>
          </ul>
        </section>

        {/* Newsletter CTA */}
        <div className="bg-dark text-white rounded-xl p-8 text-center">
          <h2 className="text-xl font-bold mb-2">Sei dabei, wenn wir starten</h2>
          <p className="text-white/60 text-sm mb-6">
            Trag dich ein – du bekommst eine kurze Mail, sobald die Plattform live ist.
          </p>
          <form className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
            <input
              type="email"
              name="email"
              placeholder="deine@email.ch"
              required
              autoComplete="email"
              aria-label="E-Mail Adresse"
              className="flex-1 px-4 py-2.5 rounded-md text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-orange"
            />
            <button
              type="submit"
              className="bg-orange hover:bg-orange-dark text-white font-semibold px-5 py-2.5 rounded-md text-sm whitespace-nowrap transition-colors"
            >
              Benachrichtigen
            </button>
          </form>
          <p className="text-white/35 text-xs mt-3">Kein Spam. Nur eine Mail bei Launch.</p>
        </div>

      </div>
    </>
  )
}
