import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Impressum',
  robots: { index: false },
}

export default function ImpressumPage() {
  return (
    <div className="max-w-content mx-auto px-6 py-14">
      <h1 className="text-3xl font-extrabold text-dark mb-6">Impressum</h1>
      {/* TODO: Angaben gemäss OR Art. 69b einfügen */}
      <p className="text-gray-500">Angaben folgen.</p>
    </div>
  )
}
