import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Datenschutz',
  robots: { index: false },
}

export default function DatenschutzPage() {
  return (
    <div className="max-w-content mx-auto px-6 py-14">
      <h1 className="text-3xl font-extrabold text-dark mb-6">Datenschutzerklärung</h1>
      {/* TODO: Datenschutztext gemäss nDSG einfügen */}
      <p className="text-gray-500">Datenschutzerklärung folgt.</p>
    </div>
  )
}
