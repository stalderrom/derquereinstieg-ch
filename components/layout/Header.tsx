import Link from 'next/link'

export default function Header() {
  return (
    <header className="bg-dark sticky top-0 z-50">
      <div className="max-w-wide mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/" className="font-bold text-white text-[1.05rem] tracking-tight">
          Der Quereinstieg
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm text-white/70">
          <Link href="/jobs" className="hover:text-white transition-colors">Jobs</Link>
          <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
        </nav>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm text-white/70 hover:text-white transition-colors hidden md:block"
          >
            Anmelden
          </Link>
          <Link
            href="/register"
            className="bg-orange hover:bg-orange-dark text-white text-sm font-semibold px-4 py-1.5 rounded-md transition-colors"
          >
            Job inserieren
          </Link>
        </div>
      </div>
    </header>
  )
}
