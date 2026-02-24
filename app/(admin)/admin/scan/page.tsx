'use client'

import { useState } from 'react'

interface ApiDetail {
  term: string
  fetched: number
  added: number
  createdAfter: string | null
}

interface ScanResult {
  career?: { added: number; skipped: number; sources: number }
  portals?: { added: number; skipped: number; errors: string[] }
  apis?: { added: number; skipped: number; apiCallsUsed: number; details?: ApiDetail[] }
}

interface VerifyResult {
  verified: number
  removed: number
}

type ScanMode = 'all' | 'career' | 'portals' | 'apis'

const btnStyle = (color: string, disabled: boolean): React.CSSProperties => ({
  background: disabled ? '#1e2a3a' : color,
  color: disabled ? '#475569' : '#fff',
  border: 'none',
  borderRadius: 8,
  padding: '10px 24px',
  fontSize: 14,
  fontWeight: 600,
  cursor: disabled ? 'not-allowed' : 'pointer',
  transition: 'background 0.15s',
})

export default function ScanPage() {
  const [scanning, setScanning] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [scanResult, setScanResult] = useState<ScanResult | null>(null)
  const [verifyResult, setVerifyResult] = useState<VerifyResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [mode, setMode] = useState<ScanMode>('all')
  const [log, setLog] = useState<string[]>([])

  function addLog(msg: string) {
    setLog(prev => [...prev, `[${new Date().toLocaleTimeString('de-CH')}] ${msg}`])
  }

  async function handleScan() {
    setScanning(true)
    setError(null)
    setScanResult(null)
    addLog(`Starte Scan (Modus: ${mode})...`)

    try {
      const res = await fetch('/api/admin/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      setScanResult(json.results)
      addLog(`Scan abgeschlossen.`)
    } catch (e) {
      setError(String(e))
      addLog(`Fehler: ${String(e)}`)
    } finally {
      setScanning(false)
    }
  }

  async function handleVerify() {
    setVerifying(true)
    setError(null)
    setVerifyResult(null)
    addLog('Starte Verifizierung aller aktiven Stellen...')

    try {
      const res = await fetch('/api/admin/verify', { method: 'POST' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      setVerifyResult(json)
      addLog(`Verifizierung: ${json.verified} OK, ${json.removed} entfernt`)
    } catch (e) {
      setError(String(e))
      addLog(`Fehler: ${String(e)}`)
    } finally {
      setVerifying(false)
    }
  }

  const isRunning = scanning || verifying

  return (
    <div style={{ padding: '32px 40px', maxWidth: 800 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#f1f5f9', margin: 0 }}>Scan & Verifizierung</h1>
        <p style={{ fontSize: 14, color: '#64748b', marginTop: 6 }}>
          Stellen manuell scrapen oder bestehende Einträge verifizieren
        </p>
      </div>

      {/* Source overview */}
      <div style={{ background: '#161b27', border: '1px solid #1e2a3a', borderRadius: 12, padding: 24, marginBottom: 20 }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, color: '#cbd5e1', margin: '0 0 16px' }}>
          Gescrapte Quellen
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
          <SourceCard
            label="APIs"
            icon="🔌"
            sources={[
              { name: 'Adzuna', detail: 'quereinsteiger · quereinstieg · ohne erfahrung', url: 'https://www.adzuna.ch' },
            ]}
            note="Nur neue Stellen (created_after)"
          />
          <SourceCard
            label="Portale"
            icon="🌐"
            sources={[
              { name: 'jobs.ch', detail: 'quereinsteiger · quereinstieg (bis 10 Seiten)', url: 'https://www.jobs.ch' },
              { name: 'JobScout24', detail: 'quereinsteiger · quereinstieg', url: 'https://www.jobscout24.ch' },
            ]}
          />
          <SourceCard
            label="Karriereseiten"
            icon="🏢"
            sources={[]}
            note="Quellen aus der Datenbank (Sources-Tab)"
          />
        </div>
      </div>

      {/* Scan section */}
      <div style={{ background: '#161b27', border: '1px solid #1e2a3a', borderRadius: 12, padding: 24, marginBottom: 20 }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, color: '#cbd5e1', margin: '0 0 16px' }}>
          Neuer Scan
        </h2>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginBottom: 16 }}>
          <div>
            <label style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 4 }}>Modus</label>
            <select
              value={mode}
              onChange={e => setMode(e.target.value as ScanMode)}
              disabled={isRunning}
              style={{ background: '#0f1117', border: '1px solid #1e2a3a', color: '#e2e8f0', borderRadius: 6, padding: '8px 12px', fontSize: 13 }}
            >
              <option value="all">Alle Quellen</option>
              <option value="career">Nur Karriereseiten</option>
              <option value="portals">Nur Portale (JobScout24, jobs.ch)</option>
              <option value="apis">Nur APIs (Adzuna, JSearch)</option>
            </select>
          </div>
          <div style={{ paddingTop: 20 }}>
            <button
              onClick={handleScan}
              disabled={isRunning}
              style={btnStyle('#1e40af', isRunning)}
            >
              {scanning ? 'Scan läuft...' : 'Scan starten'}
            </button>
          </div>
        </div>

        {scanResult && (
          <div style={{ marginTop: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12, marginBottom: 16 }}>
              {scanResult.career && (
                <ResultCard
                  label="Karriereseiten"
                  added={scanResult.career.added}
                  skipped={scanResult.career.skipped}
                  extra={`${scanResult.career.sources} Quellen`}
                />
              )}
              {scanResult.portals && (
                <ResultCard
                  label="Portale"
                  added={scanResult.portals.added}
                  skipped={scanResult.portals.skipped}
                  extra={scanResult.portals.errors.length > 0 ? `${scanResult.portals.errors.length} Fehler` : undefined}
                />
              )}
              {scanResult.apis && (
                <ResultCard
                  label="APIs"
                  added={scanResult.apis.added}
                  skipped={scanResult.apis.skipped}
                  extra={`${scanResult.apis.apiCallsUsed} API-Calls`}
                />
              )}
            </div>

            {/* Per-term details for API scans */}
            {scanResult.apis?.details && (
              <div style={{ background: '#0f1117', border: '1px solid #1e2a3a', borderRadius: 8, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #1e2a3a' }}>
                      <th style={{ textAlign: 'left', padding: '8px 14px', color: '#475569', fontWeight: 500 }}>Suchbegriff</th>
                      <th style={{ textAlign: 'right', padding: '8px 14px', color: '#475569', fontWeight: 500 }}>Abgerufen</th>
                      <th style={{ textAlign: 'right', padding: '8px 14px', color: '#475569', fontWeight: 500 }}>Neu</th>
                      <th style={{ textAlign: 'left', padding: '8px 14px', color: '#475569', fontWeight: 500 }}>Nur ab</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scanResult.apis.details.map(d => (
                      <tr key={d.term} style={{ borderBottom: '1px solid #161b27' }}>
                        <td style={{ padding: '7px 14px', color: '#94a3b8', fontFamily: 'monospace' }}>{d.term}</td>
                        <td style={{ padding: '7px 14px', color: '#64748b', textAlign: 'right' }}>{d.fetched}</td>
                        <td style={{ padding: '7px 14px', textAlign: 'right' }}>
                          <span style={{ color: d.added > 0 ? '#86efac' : '#475569', fontWeight: d.added > 0 ? 700 : 400 }}>
                            {d.added}
                          </span>
                        </td>
                        <td style={{ padding: '7px 14px', color: '#475569', fontFamily: 'monospace', fontSize: 11 }}>
                          {d.createdAfter
                            ? new Date(d.createdAfter).toLocaleString('de-CH')
                            : <span style={{ color: '#ef4444' }}>Erster Scan</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Verify section */}
      <div style={{ background: '#161b27', border: '1px solid #1e2a3a', borderRadius: 12, padding: 24, marginBottom: 20 }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, color: '#cbd5e1', margin: '0 0 8px' }}>
          Stellen verifizieren
        </h2>
        <p style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>
          Prüft alle aktiven Stellen per HEAD-Request. Nicht mehr erreichbare Stellen werden deaktiviert.
        </p>
        <button
          onClick={handleVerify}
          disabled={isRunning}
          style={btnStyle('#065f46', isRunning)}
        >
          {verifying ? 'Verifiziere...' : 'Verifizierung starten'}
        </button>

        {verifyResult && (
          <div style={{ marginTop: 16, display: 'flex', gap: 12 }}>
            <ResultCard label="Verifiziert" added={verifyResult.verified} skipped={0} />
            <ResultCard label="Entfernt" added={verifyResult.removed} skipped={0} color="#7f1d1d" />
          </div>
        )}
      </div>

      {error && (
        <div style={{ color: '#f87171', background: '#1e1a1a', padding: 12, borderRadius: 8, fontSize: 14, marginBottom: 16 }}>
          {error}
        </div>
      )}

      {/* Log */}
      {log.length > 0 && (
        <div style={{ background: '#0f1117', border: '1px solid #1e2a3a', borderRadius: 8, padding: 16 }}>
          <div style={{ fontSize: 12, color: '#475569', marginBottom: 8 }}>Log</div>
          {log.map((line, i) => (
            <div key={i} style={{ fontSize: 12, color: '#64748b', fontFamily: 'monospace' }}>{line}</div>
          ))}
        </div>
      )}
    </div>
  )
}

function ResultCard({
  label, added, skipped, extra, color = '#1e3a5f',
}: {
  label: string
  added: number
  skipped: number
  extra?: string
  color?: string
}) {
  return (
    <div style={{ background: color, borderRadius: 8, padding: '12px 16px', border: '1px solid #1e2a3a' }}>
      <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 700, color: '#f1f5f9' }}>{added} neu</div>
      <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{skipped} übersprungen</div>
      {extra && <div style={{ fontSize: 11, color: '#475569', marginTop: 2 }}>{extra}</div>}
    </div>
  )
}

function SourceCard({
  label, icon, sources, note,
}: {
  label: string
  icon: string
  sources: { name: string; detail: string; url: string }[]
  note?: string
}) {
  return (
    <div style={{ background: '#0f1117', border: '1px solid #1e2a3a', borderRadius: 8, padding: '14px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
        <span style={{ fontSize: 14 }}>{icon}</span>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#cbd5e1' }}>{label}</span>
      </div>
      {sources.map(s => (
        <div key={s.name} style={{ marginBottom: 8 }}>
          <a
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: 13, fontWeight: 500, color: '#60a5fa', textDecoration: 'none' }}
          >
            {s.name}
          </a>
          <div style={{ fontSize: 11, color: '#475569', marginTop: 2 }}>{s.detail}</div>
        </div>
      ))}
      {sources.length === 0 && (
        <div style={{ fontSize: 12, color: '#374151', fontStyle: 'italic' }}>Keine fixen Quellen</div>
      )}
      {note && (
        <div style={{ fontSize: 11, color: '#374151', marginTop: 8, paddingTop: 8, borderTop: '1px solid #1e2a3a' }}>
          {note}
        </div>
      )}
    </div>
  )
}
