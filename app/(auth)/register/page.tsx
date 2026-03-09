'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const supabase = createClient()
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name } },
      })
      if (signUpError) {
        setError(signUpError.message)
        return
      }
      // Falls E-Mail-Bestätigung deaktiviert → sofort einloggt
      if (data.session) {
        // full_name im Profil speichern
        await supabase
          .from('profiles')
          .update({ full_name: name })
          .eq('id', data.user!.id)
        router.push('/dashboard')
        router.refresh()
      } else {
        // E-Mail-Bestätigung nötig
        setSuccess(true)
      }
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div style={{
        background: '#fff',
        borderRadius: 16,
        boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
        padding: '40px 36px',
        width: '100%',
        maxWidth: 400,
        textAlign: 'center',
      }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>✉️</div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1A2332', marginBottom: 8 }}>
          E-Mail bestätigen
        </h2>
        <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.6 }}>
          Wir haben eine Bestätigungs-E-Mail an <strong>{email}</strong> gesendet.
          Bitte klicke auf den Link darin, um dein Konto zu aktivieren.
        </p>
        <Link href="/login" style={{ display: 'inline-block', marginTop: 20, color: '#E67E22', fontSize: 13, textDecoration: 'none' }}>
          Zurück zum Login
        </Link>
      </div>
    )
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
      <div style={{ marginBottom: 28, textAlign: 'center' }}>
        <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 4 }}>derquereinstieg.ch</div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1A2332', margin: 0 }}>Konto erstellen</h1>
        <p style={{ fontSize: 13, color: '#6B7280', marginTop: 6, marginBottom: 0 }}>
          Kostenlos starten – kein Abo nötig
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
            Vorname
          </label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            autoComplete="given-name"
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

        <div style={{ marginBottom: 14 }}>
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
            minLength={8}
            autoComplete="new-password"
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
          <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 4 }}>Mindestens 8 Zeichen</div>
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
          }}
        >
          {loading ? 'Konto erstellen…' : 'Kostenlos registrieren'}
        </button>
      </form>

      <div style={{ marginTop: 20, textAlign: 'center', fontSize: 13, color: '#6B7280' }}>
        Bereits ein Konto?{' '}
        <Link href="/login" style={{ color: '#E67E22', fontWeight: 600, textDecoration: 'none' }}>
          Anmelden
        </Link>
      </div>
    </div>
  )
}
