import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Registrieren',
  robots: { index: false },
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="bg-white rounded-xl shadow-md p-8 w-full max-w-sm">
        <h1 className="text-2xl font-bold text-dark mb-6">Konto erstellen</h1>
        {/* TODO: Register-Formular mit Supabase */}
        <p className="text-gray-400 text-sm text-center">Registrierung kommt nach Supabase-Setup</p>
      </div>
    </div>
  )
}
