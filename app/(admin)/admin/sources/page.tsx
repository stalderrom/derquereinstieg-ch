'use client'

import { useEffect, useState, useCallback } from 'react'
import type { JobSource } from '@/types/database'

const inputStyle: React.CSSProperties = {
  background: '#0f1117',
  border: '1px solid #1e2a3a',
  color: '#e2e8f0',
  borderRadius: 6,
  padding: '8px 12px',
  fontSize: 13,
  width: '100%',
}

const sourceTypeLabel = (t: string) => {
  const map: Record<string, string> = { career: 'Karriereseite', portal: 'Portal', api: 'API' }
  return map[t] ?? t
}

export default function SourcesPage() {
  const [sources, setSources] = useState<JobSource[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', url: '', type: 'career' })
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/sources')
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      setSources(json.sources)
    } catch (e) {
      setError(String(e))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/admin/sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      setForm({ name: '', url: '', type: 'career' })
      await load()
    } catch (e) {
      alert('Fehler: ' + String(e))
    } finally {
      setSaving(false)
    }
  }

  async function handleToggle(source: JobSource) {
    try {
      await fetch(`/api/admin/sources/${source.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !source.is_active }),
      })
      await load()
    } catch (e) {
      alert('Fehler: ' + String(e))
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Quelle wirklich löschen?')) return
    setDeleteId(id)
    try {
      await fetch(`/api/admin/sources/${id}`, { method: 'DELETE' })
      await load()
    } finally {
      setDeleteId(null)
    }
  }

  const typeColors: Record<string, string> = { career: '#1d4ed8', portal: '#7c3aed', api: '#065f46' }

  return (
    <div style={{ padding: '32px 40px', maxWidth: 900 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#f1f5f9', margin: 0 }}>Quellen</h1>
        <p style={{ fontSize: 14, color: '#64748b', marginTop: 6 }}>Verwaltung der Scraping-Quellen</p>
      </div>

      {/* Add form */}
      <div style={{ background: '#161b27', border: '1px solid #1e2a3a', borderRadius: 12, padding: 24, marginBottom: 32 }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, color: '#cbd5e1', margin: '0 0 20px' }}>Neue Quelle hinzufügen</h2>
        <form onSubmit={handleAdd} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr auto auto', gap: 12, alignItems: 'end' }}>
          <div>
            <label style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 4 }}>Name</label>
            <input
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="z.B. Spital Luzern"
              required
              style={inputStyle}
            />
          </div>
          <div>
            <label style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 4 }}>URL</label>
            <input
              value={form.url}
              onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
              placeholder="https://..."
              type="url"
              required
              style={inputStyle}
            />
          </div>
          <div>
            <label style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 4 }}>Typ</label>
            <select
              value={form.type}
              onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
              style={{ ...inputStyle, width: 'auto' }}
            >
              <option value="career">Karriereseite</option>
              <option value="portal">Portal</option>
              <option value="api">API</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={saving}
            style={{ background: '#1e40af', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 20px', fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap' }}
          >
            {saving ? 'Speichern...' : 'Hinzufügen'}
          </button>
        </form>
      </div>

      {error && (
        <div style={{ color: '#f87171', background: '#1e1a1a', padding: 12, borderRadius: 8, fontSize: 14, marginBottom: 16 }}>
          {error}
        </div>
      )}

      {/* Sources list */}
      {loading ? (
        <div style={{ color: '#64748b', fontSize: 14 }}>Lade...</div>
      ) : (
        <div style={{ background: '#161b27', border: '1px solid #1e2a3a', borderRadius: 12, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #1e2a3a' }}>
                {['Name', 'URL', 'Typ', 'Aktiv', 'Letzter Scan', ''].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '10px 16px', color: '#64748b', fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sources.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '32px 16px', color: '#475569', textAlign: 'center' }}>
                    Noch keine Quellen vorhanden
                  </td>
                </tr>
              ) : sources.map(source => (
                <tr key={source.id} style={{ borderBottom: '1px solid #0f1117' }}>
                  <td style={{ padding: '10px 16px', color: '#e2e8f0', fontWeight: 500 }}>{source.name}</td>
                  <td style={{ padding: '10px 16px', maxWidth: 280 }}>
                    <a href={source.url} target="_blank" rel="noopener noreferrer" style={{ color: '#60a5fa', fontSize: 12, textDecoration: 'none' }}>
                      {source.url.length > 50 ? source.url.slice(0, 50) + '…' : source.url}
                    </a>
                  </td>
                  <td style={{ padding: '10px 16px' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '2px 8px',
                      borderRadius: 4,
                      fontSize: 11,
                      fontWeight: 600,
                      background: typeColors[source.type] ?? '#374151',
                      color: '#fff',
                    }}>
                      {sourceTypeLabel(source.type)}
                    </span>
                  </td>
                  <td style={{ padding: '10px 16px' }}>
                    <button
                      onClick={() => handleToggle(source)}
                      style={{
                        background: source.is_active ? '#14532d' : '#374151',
                        color: source.is_active ? '#86efac' : '#9ca3af',
                        border: 'none',
                        borderRadius: 4,
                        padding: '3px 10px',
                        fontSize: 11,
                        cursor: 'pointer',
                        fontWeight: 600,
                      }}
                    >
                      {source.is_active ? 'Aktiv' : 'Inaktiv'}
                    </button>
                  </td>
                  <td style={{ padding: '10px 16px', color: '#475569', fontSize: 12 }}>
                    {source.last_scanned_at
                      ? new Date(source.last_scanned_at).toLocaleDateString('de-CH')
                      : '—'}
                  </td>
                  <td style={{ padding: '10px 16px' }}>
                    <button
                      onClick={() => handleDelete(source.id)}
                      disabled={deleteId === source.id}
                      style={{ background: '#7f1d1d', color: '#fca5a5', border: 'none', borderRadius: 4, padding: '4px 10px', cursor: 'pointer', fontSize: 11 }}
                    >
                      Löschen
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
