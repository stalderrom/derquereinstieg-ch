'use client'

import type { Metadata } from 'next'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const supabase = createClient()
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
      if (authError) {
        setError(authError.message === 'Invalid login credentials'
          ? 'E-Mail oder Passwort falsch.'
          : authError.message)
        return
      }
      // Rolle prüfen für Redirect
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .single()
      if (profile?.role === 'superuser') {
        router.push('/admin/dashboard')
      } else {
        router.push('/dashboard')
      }
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      background: '#fff',
      borderRadius: 16,
      boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
      padding: '40px 36px',
      width: '100%',
      maxWidth: 400,
    }}>
      {/* Logo */}
      <div style={{ marginBottom: 28, textAlign: 'center' }}>
        <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 4 }}>derquereinstieg.ch</div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1A2332', margin: 0 }}>Anmelden</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
            E-Mail
          </label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoComplete="email"
            style={{
              width: '100%',
              padding: '10px 14px',
              border: '1.5px solid #E5E0D8',
              borderRadius: 8,
              fontSize: 14,
              outline: 'none',
              background: '#FAFAFA',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
            Passwort
          </label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            style={{
              width: '100%',
              padding: '10px 14px',
              border: '1.5px solid #E5E0D8',
              borderRadius: 8,
              fontSize: 14,
              outline: 'none',
              background: '#FAFAFA',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {error && (
          <div style={{
            background: '#FEF2F2',
            border: '1px solid #FECACA',
            borderRadius: 8,
            padding: '10px 14px',
            fontSize: 13,
            color: '#DC2626',
            marginBottom: 16,
          }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            background: loading ? '#9CA3AF' : '#E67E22',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            fontSize: 15,
            fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'background 0.15s',
          }}
        >
          {loading ? 'Anmelden…' : 'Anmelden'}
        </button>
      </form>

      <div style={{ marginTop: 20, textAlign: 'center', fontSize: 13, color: '#6B7280' }}>
        Noch kein Konto?{' '}
        <Link href="/register" style={{ color: '#E67E22', fontWeight: 600, textDecoration: 'none' }}>
          Jetzt registrieren
        </Link>
      </div>

      <div style={{ marginTop: 12, textAlign: 'center' }}>
        <Link href="/" style={{ fontSize: 12, color: '#9CA3AF', textDecoration: 'none' }}>
          ← Zur Website
        </Link>
      </div>
    </div>
  )
}
