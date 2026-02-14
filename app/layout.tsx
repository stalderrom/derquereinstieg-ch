import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://derquereinstieg.ch'),
  title: {
    default: 'Quereinsteiger Jobs Schweiz | derquereinstieg.ch',
    template: '%s | derquereinstieg.ch',
  },
  description: 'Die Plattform für Quereinsteiger in der Schweiz. Ehrliche Jobs, echte Stories, konkrete Hilfe.',
  openGraph: {
    type: 'website',
    locale: 'de_CH',
    url: 'https://derquereinstieg.ch',
    siteName: 'derquereinstieg.ch',
  },
  twitter: {
    card: 'summary_large_image',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="de">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
