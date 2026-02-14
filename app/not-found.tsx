import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4 text-center">
      <div>
        <p className="text-orange font-bold text-lg mb-2">404</p>
        <h1 className="text-3xl font-extrabold text-dark mb-3">Seite nicht gefunden</h1>
        <p className="text-gray-500 mb-6">Diese Seite existiert nicht oder wurde verschoben.</p>
        <Link
          href="/"
          className="bg-blue text-white font-semibold px-5 py-2.5 rounded-md text-sm hover:bg-blue-dark transition-colors"
        >
          Zurück zur Startseite
        </Link>
      </div>
    </div>
  )
}
