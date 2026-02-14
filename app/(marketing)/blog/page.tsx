import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Blog – Tipps für Quereinsteiger',
  description: 'Ehrliche Ratgeber-Artikel für Quereinsteiger in der Schweiz.',
  alternates: {
    canonical: 'https://derquereinstieg.ch/blog',
  },
}

export default function BlogPage() {
  return (
    <section className="max-w-content mx-auto px-6 py-14">
      <h1 className="text-3xl font-extrabold text-dark mb-2">Blog</h1>
      <p className="text-gray-500 mb-10">Tipps, Stories und Ratgeber für Quereinsteiger.</p>
      {/* TODO: Blog-Posts aus Sanity laden */}
      <div className="border border-dashed border-gray-300 rounded-xl p-12 text-center text-gray-400">
        Blog-Artikel erscheinen hier nach Sanity-Setup
      </div>
    </section>
  )
}
