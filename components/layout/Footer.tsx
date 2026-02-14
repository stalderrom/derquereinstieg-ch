import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-dark text-white/35 text-sm py-6 border-t border-white/10">
      <div className="max-w-wide mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-3">
        <p>&copy; {new Date().getFullYear()} derquereinstieg.ch</p>
        <nav className="flex gap-4">
          <Link href="/impressum" className="hover:text-white/70 transition-colors">Impressum</Link>
          <Link href="/datenschutz" className="hover:text-white/70 transition-colors">Datenschutz</Link>
        </nav>
      </div>
    </footer>
  )
}
