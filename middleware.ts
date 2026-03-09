import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Auth-Routen in Production sperren (nur auf localhost zugänglich)
  if (process.env.NODE_ENV === 'production') {
    if (path === '/login' || path === '/register') {
      return NextResponse.rewrite(new URL('/not-found', request.url), { status: 404 })
    }
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // getUser() validiert das JWT gegen Supabase (sicherer als getSession())
  const { data: { user } } = await supabase.auth.getUser()

  // ── Geschützte Admin-Routen ──
  if (path.startsWith('/admin')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    if (!profile || profile.role !== 'superuser') {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // ── Geschützte Dashboard-Routen ──
  if (path.startsWith('/dashboard')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // ── Auth-Seiten: weiterleiten wenn bereits eingeloggt ──
  if (path === '/login' || path === '/register') {
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
      const dest = profile?.role === 'superuser' ? '/admin/dashboard' : '/dashboard'
      return NextResponse.redirect(new URL(dest, request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*', '/login', '/register'],
}
