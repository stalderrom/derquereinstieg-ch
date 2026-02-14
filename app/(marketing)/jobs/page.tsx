import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Jobs für Quereinsteiger Schweiz',
  description: 'Alle offenen Stellen für Quereinsteiger in der Schweiz – nach Kanton, Bereich und Erfahrung filtern.',
  alternates: {
    canonical: 'https://derquereinstieg.ch/jobs',
  },
}

export default function JobsPage() {
  return (
    <section className="max-w-wide mx-auto px-6 py-14">
      <h1 className="text-3xl font-extrabold text-dark mb-2">Jobs für Quereinsteiger</h1>
      <p className="text-gray-500 mb-10">Alle offenen Stellen in der Schweiz – kommt bald.</p>
      {/* TODO: Job-Listing-Komponente einfügen sobald Supabase verbunden */}
      <div className="border border-dashed border-gray-300 rounded-xl p-12 text-center text-gray-400">
        Job-Listings erscheinen hier nach Supabase-Setup
      </div>
    </section>
  )
}
