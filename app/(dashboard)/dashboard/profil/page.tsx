'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { FIELD_LABELS, type EntryField } from '@/lib/dashboard/entry-paths'
import RegionPicker from '@/components/dashboard/RegionPicker'
import type { ApplicationProfile } from '@/types/database'

const FIELDS = Object.entries(FIELD_LABELS) as [EntryField, string][]

const TIER_LABELS: Record<number, { label: string; color: string; bg: string }> = {
  1: { label: 'Free', color: '#6B7280', bg: '#F3F4F6' },
  2: { label: 'Pro', color: '#B45309', bg: '#FEF3C7' },
  3: { label: 'AI', color: '#4F46E5', bg: '#EEF2FF' },
}

function regionsEqual(a: string[], b: string[]) {
  return JSON.stringify([...a].sort()) === JSON.stringify([...b].sort())
}

export default function ProfilPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [saved, setSaved] = useState(false)

  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [targetField, setTargetField] = useState('')
  const [regions, setRegions] = useState<string[]>([])
  const [birthYear, setBirthYear] = useState('')
  const [tier, setTier] = useState(1)

  // Ursprungswerte zum Dirty-Vergleich
  const [orig, setOrig] = useState({ fullName: '', targetField: '', regions: [] as string[], birthYear: '' })

  // Bewerbungsprofil state
  const [apCurrentJob, setApCurrentJob] = useState('')
  const [apCurrentJobDesc, setApCurrentJobDesc] = useState('')
  const [apPrevJob, setApPrevJob] = useState('')
  const [apEducation, setApEducation] = useState('')
  const [apSkills, setApSkills] = useState('')
  const [apMotivation, setApMotivation] = useState('')
  const [apTone, setApTone] = useState<'formal' | 'du'>('formal')
  const [apOrig, setApOrig] = useState({ currentJob: '', currentJobDesc: '', prevJob: '', education: '', skills: '', motivation: '', tone: 'formal' as 'formal' | 'du' })
  const [apSaving, setApSaving] = useState(false)
  const [apSaved, setApSaved] = useState(false)
  const [apSaveError, setApSaveError] = useState('')

  // Import state
  const [importUrl, setImportUrl] = useState('')
  const [importText, setImportText] = useState('')
  const [importing, setImporting] = useState(false)
  const [importError, setImportError] = useState('')
  const [importSuccess, setImportSuccess] = useState(false)
  const [showTextFallback, setShowTextFallback] = useState(false)

  const [pwNew, setPwNew] = useState('')
  const [pwSaving, setPwSaving] = useState(false)
  const [pwError, setPwError] = useState('')
  const [pwSuccess, setPwSuccess] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setEmail(user.email ?? '')
    })
    fetch('/api/user/profile').then(r => r.json()).then(data => {
      const name = data.full_name ?? ''
      const field = data.target_field ?? ''
      const savedRegions: string[] = Array.isArray(data.regions) && data.regions.length > 0
        ? data.regions
        : data.region ? [data.region] : []
      const savedBirthYear = data.birthdate ? data.birthdate.substring(0, 4) : ''
      setFullName(name)
      setTargetField(field)
      setRegions(savedRegions)
      setBirthYear(savedBirthYear)
      setTier(data.tier ?? 1)
      setOrig({ fullName: name, targetField: field, regions: savedRegions, birthYear: savedBirthYear })
      // Bewerbungsprofil (only if column exists — SQL migration may be pending)
      const ap = data.application_profile as ApplicationProfile | null | undefined
      if (ap && typeof ap === 'object') {
        setApCurrentJob(ap.currentJob ?? '')
        setApCurrentJobDesc(ap.currentJobDesc ?? '')
        setApPrevJob(ap.prevJob ?? '')
        setApEducation(ap.education ?? '')
        setApSkills(ap.skills ?? '')
        setApMotivation(ap.motivation ?? '')
        setApTone(ap.tone ?? 'formal')
        setApOrig({ currentJob: ap.currentJob ?? '', currentJobDesc: ap.currentJobDesc ?? '', prevJob: ap.prevJob ?? '', education: ap.education ?? '', skills: ap.skills ?? '', motivation: ap.motivation ?? '', tone: ap.tone ?? 'formal' })
      }
      setLoading(false)
    })
  }, [])

  const isDirty = fullName !== orig.fullName ||
    targetField !== orig.targetField ||
    !regionsEqual(regions, orig.regions) ||
    birthYear !== orig.birthYear

  const isApDirty = apCurrentJob !== apOrig.currentJob ||
    apCurrentJobDesc !== apOrig.currentJobDesc ||
    apPrevJob !== apOrig.prevJob ||
    apEducation !== apOrig.education ||
    apSkills !== apOrig.skills ||
    apMotivation !== apOrig.motivation ||
    apTone !== apOrig.tone

  const apProgress = [apCurrentJob, apCurrentJobDesc, apPrevJob, apEducation, apSkills, apMotivation].filter(v => v.trim().length > 0).length

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setSaved(false)
    setSaveError('')
    const res = await fetch('/api/user/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        full_name: fullName,
        target_field: targetField || null,
        regions,
        birthdate: birthYear ? `${birthYear}-06-15` : null,
      }),
    })
    if (res.ok) {
      setOrig({ fullName, targetField, regions, birthYear })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } else {
      const err = await res.json().catch(() => ({}))
      setSaveError(err.error ?? 'Fehler beim Speichern. Bitte nochmals versuchen.')
    }
    setSaving(false)
  }

  async function importProfile(mode: 'url' | 'text') {
    setImporting(true)
    setImportError('')
    setImportSuccess(false)
    const body = mode === 'url' ? { url: importUrl } : { text: importText }
    const res = await fetch('/api/user/import-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = await res.json().catch(() => ({}))
    if (res.ok && data.profile) {
      const p = data.profile
      if (p.currentJob) setApCurrentJob(p.currentJob)
      if (p.currentJobDesc) setApCurrentJobDesc(p.currentJobDesc)
      if (p.prevJob) setApPrevJob(p.prevJob)
      if (p.education) setApEducation(p.education)
      if (p.skills) setApSkills(p.skills)
      setImportSuccess(true)
    } else {
      setImportError(data.error ?? 'Import fehlgeschlagen.')
      if (data.fallback) setShowTextFallback(true)
    }
    setImporting(false)
  }

  async function saveApplicationProfile(e: React.FormEvent) {
    e.preventDefault()
    setApSaving(true)
    setApSaved(false)
    setApSaveError('')
    const res = await fetch('/api/user/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        application_profile: {
          currentJob: apCurrentJob,
          currentJobDesc: apCurrentJobDesc,
          prevJob: apPrevJob,
          education: apEducation,
          skills: apSkills,
          motivation: apMotivation,
          tone: apTone,
        },
      }),
    })
    if (res.ok) {
      setApOrig({ currentJob: apCurrentJob, currentJobDesc: apCurrentJobDesc, prevJob: apPrevJob, education: apEducation, skills: apSkills, motivation: apMotivation, tone: apTone })
      setApSaved(true)
      setTimeout(() => setApSaved(false), 3000)
    } else {
      const err = await res.json().catch(() => ({}))
      setApSaveError(err.error ?? 'Fehler beim Speichern.')
    }
    setApSaving(false)
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault()
    setPwError('')
    setPwSuccess(false)
    if (pwNew.length < 8) { setPwError('Mindestens 8 Zeichen'); return }
    setPwSaving(true)
    const { error } = await supabase.auth.updateUser({ password: pwNew })
    if (error) {
      setPwError(error.message)
    } else {
      setPwSuccess(true)
      setPwNew('')
    }
    setPwSaving(false)
  }

  async function deleteAccount() {
    if (!confirm('Konto wirklich löschen? Diese Aktion ist nicht rückgängig zu machen.')) return
    if (!confirm('LETZTER CHECK: Alle Daten (Bookmarks, Bewerbungen, Profil) werden gelöscht.')) return
    alert('Bitte schreibe an hello@derquereinstieg.ch mit dem Betreff "Account löschen" von deiner registrierten E-Mail-Adresse.')
  }

  const tierInfo = TIER_LABELS[tier] ?? TIER_LABELS[1]

  if (loading) return <div style={{ padding: 40, color: '#9CA3AF' }}>Lädt…</div>

  return (
    <div style={{ padding: '32px 40px', maxWidth: 680, margin: '0 auto' }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1A2332', marginBottom: 24 }}>Profil</h1>

      {/* Tier-Anzeige */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: '16px 20px',
        background: tierInfo.bg,
        borderRadius: 10,
        marginBottom: 28,
        border: '1px solid',
        borderColor: tier === 1 ? '#E5E7EB' : tier === 2 ? '#FCD34D' : '#C7D2FE',
      }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>Dein Plan</div>
          <span style={{
            display: 'inline-block',
            padding: '3px 12px',
            background: tierInfo.color,
            color: '#fff',
            borderRadius: 20,
            fontSize: 13,
            fontWeight: 700,
          }}>
            {tierInfo.label}
          </span>
        </div>
        {tier === 1 && (
          <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
            <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 4 }}>Upgrade für mehr Features</div>
            <button style={{
              padding: '7px 16px', background: '#E67E22', color: '#fff',
              border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer',
            }}>
              Zu Pro – CHF 29/Monat
            </button>
          </div>
        )}
        {tier === 2 && (
          <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
            <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 4 }}>Mit AI-Paket: KI-Bewerbungen</div>
            <button style={{
              padding: '7px 16px', background: 'linear-gradient(90deg, #6366F1, #8B5CF6)',
              color: '#fff', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer',
            }}>
              Zu AI – CHF 79/Monat
            </button>
          </div>
        )}
      </div>

      {/* Profil-Formular */}
      <form onSubmit={saveProfile} style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E0D8', padding: '24px 28px', marginBottom: 24 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#1A2332', marginBottom: 20 }}>Persönliche Angaben</div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>E-Mail</label>
          <input
            type="email"
            value={email}
            disabled
            style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #E5E0D8', borderRadius: 8, fontSize: 13, background: '#F9FAFB', color: '#9CA3AF', cursor: 'not-allowed' }}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Vorname</label>
          <input
            type="text"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #E5E0D8', borderRadius: 8, fontSize: 13, outline: 'none' }}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Zielberuf / Berufsfeld</label>
          <select
            value={targetField}
            onChange={e => setTargetField(e.target.value)}
            style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #E5E0D8', borderRadius: 8, fontSize: 13, background: '#fff', color: '#374151' }}
          >
            <option value="">Noch unsicher / offen</option>
            {FIELDS.map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 10 }}>
            Regionen
            <span style={{ fontWeight: 400, color: '#9CA3AF', marginLeft: 6 }}>
              (mehrere möglich — wo bist du bereit zu arbeiten?)
            </span>
          </label>
          <RegionPicker selected={regions} onChange={setRegions} />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
            Geburtsjahr
            <span style={{ fontWeight: 400, color: '#9CA3AF', marginLeft: 6 }}>
              (für altersgerechte Karrieretipps)
            </span>
          </label>
          <select
            value={birthYear}
            onChange={e => setBirthYear(e.target.value)}
            style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #E5E0D8', borderRadius: 8, fontSize: 13, background: '#fff', color: '#374151' }}
          >
            <option value="">Keine Angabe</option>
            {Array.from({ length: 56 }, (_, i) => new Date().getFullYear() - 18 - i).map(year => (
              <option key={year} value={String(year)}>{year}</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            type="submit"
            disabled={saving || !isDirty}
            style={{
              padding: '9px 24px',
              background: saving ? '#9CA3AF' : isDirty ? '#E67E22' : '#E5E0D8',
              color: isDirty ? '#fff' : '#9CA3AF',
              border: 'none',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              cursor: saving || !isDirty ? 'default' : 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {saving ? 'Speichern…' : 'Speichern'}
          </button>
          {saved && <span style={{ fontSize: 13, color: '#10B981', fontWeight: 600 }}>✓ Gespeichert</span>}
          {saveError && <span style={{ fontSize: 13, color: '#DC2626' }}>{saveError}</span>}
        </div>
      </form>

      {/* Bewerbungsprofil */}
      <form onSubmit={saveApplicationProfile} style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E0D8', padding: '24px 28px', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#1A2332' }}>Bewerbungsprofil</div>
          <div style={{ fontSize: 12, color: apProgress >= 5 ? '#059669' : '#9CA3AF', fontWeight: 600 }}>
            {apProgress}/6 Felder ausgefüllt
          </div>
        </div>
        <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 16, lineHeight: 1.5 }}>
          Einmalig ausfüllen — Claude nutzt diese Angaben automatisch für alle Bewerbungsschreiben.{' '}
          <a href="/dashboard/ai" style={{ color: '#6366F1', textDecoration: 'none', fontWeight: 600 }}>KI-Assistent →</a>
        </div>

        {/* Schnellimport */}
        <div style={{ background: '#F8F6F2', borderRadius: 10, border: '1px solid #E5E0D8', padding: '16px 18px', marginBottom: 22 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#1A2332', marginBottom: 12 }}>
            ⚡ Schnellimport von LinkedIn / Xing
          </div>

          <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
            <input
              type="url"
              value={importUrl}
              onChange={e => { setImportUrl(e.target.value); setImportError(''); setImportSuccess(false) }}
              placeholder="https://linkedin.com/in/dein-name"
              style={{ flex: 1, padding: '8px 12px', border: '1.5px solid #E5E0D8', borderRadius: 8, fontSize: 13, outline: 'none', background: '#fff' }}
            />
            <button
              type="button"
              disabled={importing || !importUrl.trim()}
              onClick={() => importProfile('url')}
              style={{
                padding: '8px 16px',
                background: importing ? '#9CA3AF' : importUrl.trim() ? '#6366F1' : '#E5E0D8',
                color: importUrl.trim() ? '#fff' : '#9CA3AF',
                border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600,
                cursor: importing || !importUrl.trim() ? 'default' : 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {importing && !showTextFallback ? 'Lädt…' : 'Importieren'}
            </button>
          </div>

          <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: importError || importSuccess ? 10 : 0 }}>
            linkedin.com/in/* oder xing.com/profile/* · Profil muss öffentlich sein
          </div>

          {importSuccess && (
            <div style={{ fontSize: 12, color: '#059669', fontWeight: 600, marginTop: 8 }}>
              ✓ Felder vorgefüllt — bitte prüfen und Motivation noch selbst ergänzen.
            </div>
          )}
          {importError && (
            <div style={{ fontSize: 12, color: '#DC2626', marginTop: 8 }}>{importError}</div>
          )}

          {/* Text-Fallback */}
          <button
            type="button"
            onClick={() => setShowTextFallback(v => !v)}
            style={{ marginTop: 10, fontSize: 12, color: '#6366F1', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontWeight: 600 }}
          >
            {showTextFallback ? '▲' : '▼'} Profil-Text manuell einfügen
          </button>

          {showTextFallback && (
            <div style={{ marginTop: 10 }}>
              <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 6 }}>
                Auf dem Profil Ctrl+A → Ctrl+C → hier einfügen
              </div>
              <textarea
                value={importText}
                onChange={e => { setImportText(e.target.value); setImportError(''); setImportSuccess(false) }}
                rows={5}
                placeholder="Profil-Text hier einfügen…"
                style={{ width: '100%', padding: '8px 12px', border: '1.5px solid #E5E0D8', borderRadius: 8, fontSize: 12, resize: 'vertical', outline: 'none', fontFamily: 'inherit', background: '#fff' }}
              />
              <button
                type="button"
                disabled={importing || !importText.trim()}
                onClick={() => importProfile('text')}
                style={{
                  marginTop: 8,
                  padding: '8px 16px',
                  background: importing ? '#9CA3AF' : importText.trim() ? '#6366F1' : '#E5E0D8',
                  color: importText.trim() ? '#fff' : '#9CA3AF',
                  border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600,
                  cursor: importing || !importText.trim() ? 'default' : 'pointer',
                }}
              >
                {importing ? 'Lädt…' : 'Aus Text importieren'}
              </button>
            </div>
          )}
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
            Aktuelle / letzte Stelle
          </label>
          <input
            type="text"
            value={apCurrentJob}
            onChange={e => setApCurrentJob(e.target.value)}
            placeholder='z.B. "Projektmanager bei Migros, 8 Jahre"'
            style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #E5E0D8', borderRadius: 8, fontSize: 13, outline: 'none' }}
          />
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
            Was hast du dort genau gemacht?
          </label>
          <textarea
            value={apCurrentJobDesc}
            onChange={e => setApCurrentJobDesc(e.target.value)}
            rows={3}
            placeholder="2–3 Sätze: Verantwortlichkeiten, Teamgrösse, Projekte, Erfolge…"
            style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #E5E0D8', borderRadius: 8, fontSize: 13, resize: 'vertical', outline: 'none', fontFamily: 'inherit' }}
          />
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 4 }}>
            Frühere Stelle <span style={{ fontWeight: 400, color: '#9CA3AF' }}>(optional)</span>
          </label>
          <textarea
            value={apPrevJob}
            onChange={e => setApPrevJob(e.target.value)}
            rows={2}
            placeholder='z.B. "3 Jahre Verkäufer bei Coop, Kundenkontakt und Warenbewirtschaftung"'
            style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #E5E0D8', borderRadius: 8, fontSize: 13, resize: 'vertical', outline: 'none', fontFamily: 'inherit' }}
          />
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
            Ausbildung / Abschlüsse
          </label>
          <input
            type="text"
            value={apEducation}
            onChange={e => setApEducation(e.target.value)}
            placeholder='z.B. "KV-Abschluss, CAS Projektmanagement HSG"'
            style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #E5E0D8', borderRadius: 8, fontSize: 13, outline: 'none' }}
          />
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
            Relevante Fähigkeiten & Kenntnisse
          </label>
          <textarea
            value={apSkills}
            onChange={e => setApSkills(e.target.value)}
            rows={2}
            placeholder="z.B. Kundenberatung, Teamführung, Excel, Budgetverantwortung, Sprachkenntnisse…"
            style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #E5E0D8', borderRadius: 8, fontSize: 13, resize: 'vertical', outline: 'none', fontFamily: 'inherit' }}
          />
        </div>

        <div style={{ marginBottom: 18 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
            Warum Quereinstieg?
          </label>
          <textarea
            value={apMotivation}
            onChange={e => setApMotivation(e.target.value)}
            rows={3}
            placeholder="2–3 Sätze: Was treibt dich an? Was begeistert dich am neuen Berufsfeld?"
            style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #E5E0D8', borderRadius: 8, fontSize: 13, resize: 'vertical', outline: 'none', fontFamily: 'inherit' }}
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
            Schreibstil der Bewerbung
          </label>
          <div style={{ display: 'flex', gap: 16 }}>
            {([['formal', 'Sie-Form (formell)'], ['du', 'Du-Form (modern)']] as const).map(([val, label]) => (
              <label key={val} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: '#374151' }}>
                <input
                  type="radio"
                  name="apTone"
                  value={val}
                  checked={apTone === val}
                  onChange={() => setApTone(val)}
                  style={{ accentColor: '#6366F1' }}
                />
                {label}
              </label>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            type="submit"
            disabled={apSaving || !isApDirty}
            style={{
              padding: '9px 24px',
              background: apSaving ? '#9CA3AF' : isApDirty ? '#6366F1' : '#E5E0D8',
              color: isApDirty ? '#fff' : '#9CA3AF',
              border: 'none',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              cursor: apSaving || !isApDirty ? 'default' : 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {apSaving ? 'Speichern…' : 'Bewerbungsprofil speichern'}
          </button>
          {apSaved && <span style={{ fontSize: 13, color: '#10B981', fontWeight: 600 }}>✓ Gespeichert</span>}
          {apSaveError && <span style={{ fontSize: 13, color: '#DC2626' }}>{apSaveError}</span>}
        </div>
      </form>

      {/* Passwort ändern */}
      <form onSubmit={changePassword} style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E0D8', padding: '24px 28px', marginBottom: 24 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#1A2332', marginBottom: 20 }}>Passwort ändern</div>

        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Neues Passwort</label>
          <input
            type="password"
            value={pwNew}
            onChange={e => setPwNew(e.target.value)}
            minLength={8}
            placeholder="Mindestens 8 Zeichen"
            style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #E5E0D8', borderRadius: 8, fontSize: 13, outline: 'none' }}
          />
        </div>

        {pwError && <div style={{ fontSize: 13, color: '#DC2626', marginBottom: 12 }}>{pwError}</div>}
        {pwSuccess && <div style={{ fontSize: 13, color: '#10B981', marginBottom: 12 }}>✓ Passwort geändert</div>}

        <button
          type="submit"
          disabled={pwSaving}
          style={{ padding: '9px 24px', background: pwSaving ? '#9CA3AF' : '#1A2332', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: pwSaving ? 'not-allowed' : 'pointer' }}
        >
          {pwSaving ? 'Ändern…' : 'Passwort ändern'}
        </button>
      </form>

      {/* Danger Zone */}
      <div style={{ background: '#FEF2F2', borderRadius: 12, border: '1px solid #FECACA', padding: '20px 24px' }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#991B1B', marginBottom: 8 }}>Danger Zone</div>
        <div style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 14 }}>
          Account löscht alle deine Daten (Bookmarks, Bewerbungen, Profil) dauerhaft.
        </div>
        <button
          onClick={deleteAccount}
          style={{ padding: '8px 20px', background: 'transparent', color: '#DC2626', border: '1.5px solid #FECACA', borderRadius: 8, fontSize: 13, cursor: 'pointer', fontWeight: 600 }}
        >
          Account löschen
        </button>
      </div>
    </div>
  )
}
