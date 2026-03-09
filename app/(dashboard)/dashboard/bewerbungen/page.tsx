'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

type BewerbungStatus = 'gespeichert' | 'beworben' | 'interview' | 'zusage' | 'absage'

interface Bewerbung {
  id: string
  firma: string
  stelle: string
  status: BewerbungStatus
  notiz: string | null
  datum: string | null
  created_at: string
}

const STATUS_COLS: { key: BewerbungStatus; label: string; color: string; bg: string }[] = [
  { key: 'gespeichert', label: 'Gespeichert', color: '#6B7280', bg: '#F9FAFB' },
  { key: 'beworben', label: 'Beworben', color: '#2E5C8A', bg: '#EFF6FF' },
  { key: 'interview', label: 'Interview', color: '#D97706', bg: '#FFFBEB' },
  { key: 'zusage', label: 'Zusage ✓', color: '#059669', bg: '#F0FDF4' },
]

export default function BewerbungenPage() {
  const [tier, setTier] = useState<number | null>(null)
  const [bewerbungen, setBewerbungen] = useState<Bewerbung[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ firma: '', stelle: '', notiz: '', datum: '' })
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    supabase.from('profiles').select('tier').single().then(({ data }) => {
      setTier(data?.tier ?? 1)
      if (data?.tier >= 2) {
        fetch('/api/user/bewerbungen').then(r => r.json()).then(d => {
          setBewerbungen(d.bewerbungen ?? [])
          setLoading(false)
        })
      } else {
        setLoading(false)
      }
    })
  }, [])

  async function addBewerbung() {
    if (!form.firma || !form.stelle) return
    setSaving(true)
    const res = await fetch('/api/user/bewerbungen', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      const data = await res.json()
      setBewerbungen(prev => [data, ...prev])
      setForm({ firma: '', stelle: '', notiz: '', datum: '' })
      setShowForm(false)
    }
    setSaving(false)
  }

  async function updateStatus(id: string, status: BewerbungStatus) {
    const res = await fetch(`/api/user/bewerbungen?id=${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    if (res.ok) {
      setBewerbungen(prev => prev.map(b => b.id === id ? { ...b, status } : b))
    }
  }

  async function deleteBewerbung(id: string) {
    if (!confirm('Eintrag löschen?')) return
    const res = await fetch(`/api/user/bewerbungen?id=${id}`, { method: 'DELETE' })
    if (res.ok) setBewerbungen(prev => prev.filter(b => b.id !== id))
  }

  if (tier === null || loading) {
    return <div style={{ padding: 40, color: '#9CA3AF' }}>Lädt…</div>
  }

  // Paywall für Tier 1
  if (tier < 2) {
    return (
      <div style={{ padding: '32px 40px', maxWidth: 720, margin: '0 auto' }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1A2332', marginBottom: 24 }}>Bewerbungs-Tracker</h1>
        <div style={{ background: '#fff', border: '1px solid #E5E0D8', borderRadius: 16, padding: '40px 36px', textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1A2332', marginBottom: 12 }}>
            Bewerbungen übersichtlich verwalten
          </h2>
          <div style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.7, marginBottom: 24, maxWidth: 380, margin: '0 auto 24px' }}>
            Mit dem Pro-Tracker siehst du alle Bewerbungen auf einen Blick – von "Gespeichert" bis "Zusage".
            Notizen, Datum, Status per Klick ändern.
          </div>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 28 }}>
            {['Kanban-Übersicht', 'Status per Klick', 'Notizen & Datum', 'KI-Bewerbungen (Tier 3)'].map(f => (
              <div key={f} style={{ padding: '8px 14px', background: '#F3F4F6', borderRadius: 8, fontSize: 13, color: '#374151' }}>
                ✓ {f}
              </div>
            ))}
          </div>
          <button style={{
            padding: '12px 32px',
            background: '#E67E22',
            color: '#fff',
            border: 'none',
            borderRadius: 10,
            fontSize: 15,
            fontWeight: 600,
            cursor: 'pointer',
          }}>
            Zu Pro upgraden – CHF 29/Monat
          </button>
        </div>
      </div>
    )
  }

  const grouped = STATUS_COLS.reduce((acc, col) => {
    acc[col.key] = bewerbungen.filter(b => b.status === col.key)
    return acc
  }, {} as Record<BewerbungStatus, Bewerbung[]>)

  const absagen = bewerbungen.filter(b => b.status === 'absage')

  return (
    <div style={{ padding: '32px 40px', maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1A2332', marginBottom: 4 }}>Bewerbungs-Tracker</h1>
          <div style={{ fontSize: 13, color: '#6B7280' }}>{bewerbungen.length} Einträge total</div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {tier >= 3 && (
            <a href="/dashboard/ai" style={{
              padding: '9px 18px',
              background: 'linear-gradient(90deg, #6366F1, #8B5CF6)',
              color: '#fff',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              textDecoration: 'none',
            }}>
              🤖 Mit KI bewerben
            </a>
          )}
          <button
            onClick={() => setShowForm(true)}
            style={{ padding: '9px 18px', background: '#E67E22', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
          >
            + Neue Bewerbung
          </button>
        </div>
      </div>

      {/* Formular */}
      {showForm && (
        <div style={{
          background: '#fff',
          border: '1px solid #E5E0D8',
          borderRadius: 12,
          padding: '20px 24px',
          marginBottom: 24,
        }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#1A2332', marginBottom: 16 }}>Neue Bewerbung</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6B7280', marginBottom: 4 }}>Firma *</label>
              <input
                value={form.firma}
                onChange={e => setForm(f => ({ ...f, firma: e.target.value }))}
                style={{ width: '100%', padding: '8px 12px', border: '1.5px solid #E5E0D8', borderRadius: 8, fontSize: 13 }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6B7280', marginBottom: 4 }}>Stelle *</label>
              <input
                value={form.stelle}
                onChange={e => setForm(f => ({ ...f, stelle: e.target.value }))}
                style={{ width: '100%', padding: '8px 12px', border: '1.5px solid #E5E0D8', borderRadius: 8, fontSize: 13 }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6B7280', marginBottom: 4 }}>Datum</label>
              <input
                type="date"
                value={form.datum}
                onChange={e => setForm(f => ({ ...f, datum: e.target.value }))}
                style={{ width: '100%', padding: '8px 12px', border: '1.5px solid #E5E0D8', borderRadius: 8, fontSize: 13 }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#6B7280', marginBottom: 4 }}>Notiz</label>
              <input
                value={form.notiz}
                onChange={e => setForm(f => ({ ...f, notiz: e.target.value }))}
                style={{ width: '100%', padding: '8px 12px', border: '1.5px solid #E5E0D8', borderRadius: 8, fontSize: 13 }}
              />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={addBewerbung} disabled={saving} style={{ padding: '8px 20px', background: '#E67E22', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              {saving ? 'Speichern…' : 'Speichern'}
            </button>
            <button onClick={() => setShowForm(false)} style={{ padding: '8px 20px', background: '#fff', color: '#6B7280', border: '1px solid #E5E0D8', borderRadius: 8, fontSize: 13, cursor: 'pointer' }}>
              Abbrechen
            </button>
          </div>
        </div>
      )}

      {/* Kanban-Columns */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {STATUS_COLS.map(col => (
          <div key={col.key} style={{ background: col.bg, borderRadius: 12, padding: '16px 14px', minHeight: 120 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: col.color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {col.label}
              </div>
              <span style={{ fontSize: 12, color: col.color, background: '#fff', padding: '2px 8px', borderRadius: 10, fontWeight: 600 }}>
                {grouped[col.key].length}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {grouped[col.key].map(b => (
                <div key={b.id} style={{ background: '#fff', borderRadius: 8, padding: '12px', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#1A2332', marginBottom: 2 }}>{b.stelle}</div>
                  <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 8 }}>{b.firma}</div>
                  {b.datum && <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 6 }}>{new Date(b.datum).toLocaleDateString('de-CH')}</div>}
                  {b.notiz && <div style={{ fontSize: 11, color: '#6B7280', fontStyle: 'italic', marginBottom: 8 }}>{b.notiz}</div>}
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {STATUS_COLS.filter(s => s.key !== col.key).map(s => (
                      <button
                        key={s.key}
                        onClick={() => updateStatus(b.id, s.key)}
                        style={{ padding: '3px 8px', border: '1px solid #E5E0D8', borderRadius: 6, fontSize: 10, cursor: 'pointer', background: '#fff', color: '#6B7280' }}
                      >
                        → {s.label}
                      </button>
                    ))}
                    <button
                      onClick={() => updateStatus(b.id, 'absage')}
                      style={{ padding: '3px 8px', border: '1px solid #FECACA', borderRadius: 6, fontSize: 10, cursor: 'pointer', background: '#FEF2F2', color: '#DC2626' }}
                    >
                      Absage
                    </button>
                    <button
                      onClick={() => deleteBewerbung(b.id)}
                      style={{ padding: '3px 8px', border: 'none', borderRadius: 6, fontSize: 10, cursor: 'pointer', background: 'transparent', color: '#D1D5DB' }}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Absagen */}
      {absagen.length > 0 && (
        <details style={{ marginTop: 8 }}>
          <summary style={{ fontSize: 13, color: '#9CA3AF', cursor: 'pointer', marginBottom: 12 }}>
            {absagen.length} Absagen anzeigen
          </summary>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {absagen.map(b => (
              <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '10px 16px', background: '#FEF2F2', borderRadius: 8, opacity: 0.7 }}>
                <div style={{ flex: 1, fontSize: 13, color: '#374151' }}>{b.stelle} — {b.firma}</div>
                <button onClick={() => deleteBewerbung(b.id)} style={{ border: 'none', background: 'transparent', color: '#D1D5DB', cursor: 'pointer', fontSize: 14 }}>✕</button>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  )
}
