import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'

const GA_ID = 'G-9CWXYP0Z9C'

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
  verification: {
    google: 'FBrX2Y-h57IQY6FWOksLMQD9cY5tfBlbGplsjVG6vAE',
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

        {/* Google Analytics 4 */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="ga4-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}');
          `}
        </Script>
      </body>
    </html>
  )
}
