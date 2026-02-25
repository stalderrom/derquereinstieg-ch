'use client'

import { useEffect, useState, useCallback } from 'react'
import type { Stellenanzeige } from '@/types/database'

const CANTONS = ['ZH','BE','LU','UR','SZ','OW','NW','GL','ZG','FR','SO','BS','BL','SH','AR','AI','SG','GR','AG','TG','TI','VD','VS','NE','GE','JU']
const REGIONS = ['Zürich','Ostschweiz','Nordwestschweiz','Bern/Mittelland','Zentralschweiz','Vaud/Waadt','Wallis','Tessin','unzuordnungsbar']
const BERUFSFELDER = ['Pflege & Gesundheit','IT & Tech','Ingenieurwesen & Produktion','Kundenservice','Marketing & Kommunikation','HR & Personal','Design & Medien','Wissenschaft & Labor','Verkauf & Detailhandel','Gastronomie & Tourismus','Handwerk & Bau','Transport & Logistik','Büro & Administration','Soziales & Bildung','Reinigung & Facility','Sicherheit','Finanz & Versicherung','Projektmanagement','Landwirtschaft & Natur','Management & Führung','Weitere']

const pill = (text: string, color: string) => ({
  display: 'inline-block',
  padding: '2px 8px',
  borderRadius: 4,
  fontSize: 11,
  fontWeight: 600,
  background: color,
  color: '#fff',
})

export default function JobsPage() {
  const [jobs, setJobs] = useState<Stellenanzeige[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterCanton, setFilterCanton] = useState('')
  const [filterRegion, setFilterRegion] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterActive, setFilterActive] = useState('true')
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (filterCanton) params.set('canton', filterCanton)
      if (filterRegion) params.set('region', filterRegion)
      if (filterCategory) params.set('category', filterCategory)
      params.set('is_active', filterActive)
      const res = await fetch(`/api/admin/jobs?${params}`)
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      setJobs(json.jobs)
    } catch (e) {
      setError(String(e))
    } finally {
      setLoading(false)
    }
  }, [filterCanton, filterRegion, filterCategory, filterActive])

  useEffect(() => { load() }, [load])

  async function handleDelete(id: string, soft: boolean) {
    setDeleteId(id)
    try {
      const res = await fetch(`/api/admin/jobs/${id}?soft=${soft}`, { method: 'DELETE' })
      if (!res.ok) {
        const j = await res.json()
        alert('Fehler: ' + j.error)
      } else {
        await load()
      }
    } finally {
      setDeleteId(null)
    }
  }

  const select: React.CSSProperties = {
    background: '#0f1117',
    border: '1px solid #1e2a3a',
    color: '#e2e8f0',
    borderRadius: 6,
    padding: '6px 10px',
    fontSize: 13,
  }

  return (
    <div style={{ padding: '32px 40px', maxWidth: 1200 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#f1f5f9', margin: 0 }}>Stellen</h1>
          <p style={{ fontSize: 14, color: '#64748b', marginTop: 6 }}>
            {jobs.length} Einträge
          </p>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <select value={filterActive} onChange={e => setFilterActive(e.target.value)} style={select}>
          <option value="true">Aktiv</option>
          <option value="false">Inaktiv</option>
        </select>
        <select value={filterCanton} onChange={e => setFilterCanton(e.target.value)} style={select}>
          <option value="">Alle Kantone</option>
          {CANTONS.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={filterRegion} onChange={e => setFilterRegion(e.target.value)} style={select}>
          <option value="">Alle Regionen</option>
          {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} style={select}>
          <option value="">Alle Berufsfelder</option>
          {BERUFSFELDER.map(b => <option key={b} value={b}>{b}</option>)}
        </select>
        <button
          onClick={load}
          style={{ background: '#1e40af', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 16px', fontSize: 13, cursor: 'pointer' }}
        >
          Aktualisieren
        </button>
      </div>

      {error && (
        <div style={{ color: '#f87171', background: '#1e1a1a', padding: 12, borderRadius: 8, fontSize: 14, marginBottom: 16 }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ color: '#64748b', fontSize: 14 }}>Lade...</div>
      ) : (
        <div style={{ background: '#161b27', border: '1px solid #1e2a3a', borderRadius: 12, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #1e2a3a' }}>
                {['Titel', 'Unternehmen', 'Standort', 'Kanton', 'Region', 'Quelle', 'Erstellt', ''].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '10px 16px', color: '#64748b', fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {jobs.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '32px 16px', color: '#475569', textAlign: 'center' }}>
                    Keine Stellen gefunden
                  </td>
                </tr>
              ) : jobs.map(job => (
                <tr key={job.id} style={{ borderBottom: '1px solid #0f1117' }}>
                  <td style={{ padding: '10px 16px', color: '#e2e8f0', maxWidth: 220 }}>
                    <a
                      href={job.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: '#60a5fa', textDecoration: 'none' }}
                    >
                      {job.title}
                    </a>
                  </td>
                  <td style={{ padding: '10px 16px', color: '#94a3b8' }}>{job.company}</td>
                  <td style={{ padding: '10px 16px', color: '#94a3b8' }}>{job.location || '—'}</td>
                  <td style={{ padding: '10px 16px' }}>
                    {job.canton
                      ? <span style={pill(job.canton, '#1d4ed8')}>{job.canton}</span>
                      : <span style={{ color: '#475569' }}>—</span>}
                  </td>
                  <td style={{ padding: '10px 16px', color: '#64748b', fontSize: 12 }}>
                    {job.region || 'unzuordnungsbar'}
                  </td>
                  <td style={{ padding: '10px 16px', color: '#64748b', fontSize: 12 }}>{job.source_name}</td>
                  <td style={{ padding: '10px 16px', color: '#475569', fontSize: 12 }}>
                    {new Date(job.first_seen_at).toLocaleDateString('de-CH')}
                  </td>
                  <td style={{ padding: '10px 16px' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        onClick={() => handleDelete(job.id, true)}
                        disabled={deleteId === job.id}
                        title="Deaktivieren"
                        style={{ background: '#374151', color: '#9ca3af', border: 'none', borderRadius: 4, padding: '4px 8px', cursor: 'pointer', fontSize: 11 }}
                      >
                        Deaktiv.
                      </button>
                      <button
                        onClick={() => handleDelete(job.id, false)}
                        disabled={deleteId === job.id}
                        title="Löschen"
                        style={{ background: '#7f1d1d', color: '#fca5a5', border: 'none', borderRadius: 4, padding: '4px 8px', cursor: 'pointer', fontSize: 11 }}
                      >
                        Löschen
                      </button>
                    </div>
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
