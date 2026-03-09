'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import type { Profile } from '@/types/database'
import {
  ENTRY_PATHS, FIELD_LABELS, SKILLS, SKILL_CATEGORIES, QUIZ_QUESTIONS,
  FIELD_FILTER_DATA, SELBSTAENDIGKEIT_PFADE, matchFieldsBySkills, calcQuizScores,
  type EntryField, type SelbstaendigkeitPfad,
} from '@/lib/dashboard/entry-paths'

type Mode = 'picker' | 'zielberuf' | 'skills' | 'filter' | 'quiz'

const STORAGE_KEY = 'dqe_einstiegspfad'

const WORK_STYLE_OPTIONS = [
  { id: 'buero',    label: 'Büro / Remote', icon: '🖥️' },
  { id: 'menschen', label: 'Mit Menschen',  icon: '🤝' },
  { id: 'physisch', label: 'Körperlich',    icon: '💪' },
  { id: 'outdoor',  label: 'Draussen',      icon: '🌿' },
]

// ─── Hilfsfunktionen ──────────────────────────────────────────────────────────

function MatchBar({ percent }: { percent: number }) {
  const color = percent >= 70 ? '#10B981' : percent >= 45 ? '#E67E22' : '#9CA3AF'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ flex: 1, height: 8, background: '#F3F4F6', borderRadius: 4 }}>
        <div style={{ height: '100%', width: `${percent}%`, background: color, borderRadius: 4, transition: 'width 0.3s' }} />
      </div>
      <span style={{ fontSize: 12, fontWeight: 700, color, width: 36, textAlign: 'right' }}>{percent}%</span>
    </div>
  )
}

function Btn({ children, onClick, variant = 'primary', disabled = false }: {
  children: React.ReactNode; onClick?: () => void; variant?: 'primary' | 'ghost' | 'outline'; disabled?: boolean
}) {
  const styles: Record<string, React.CSSProperties> = {
    primary: { background: '#E67E22', color: '#fff', border: 'none' },
    ghost:   { background: 'transparent', color: '#6B7280', border: '1px solid #E5E0D8' },
    outline: { background: '#fff', color: '#E67E22', border: '1.5px solid #E67E22' },
  }
  return (
    <button onClick={onClick} disabled={disabled} style={{
      padding: '9px 20px', borderRadius: 8, fontSize: 13, fontWeight: 600,
      cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1,
      ...styles[variant],
    }}>{children}</button>
  )
}

// ─── Selbständigkeit Path View ────────────────────────────────────────────────

function SelbstaendigkeitPathView({ isPro, onBack }: { isPro: boolean; onBack: () => void }) {
  const [activePfad, setActivePfad] = useState<SelbstaendigkeitPfad | null>(null)

  if (activePfad) {
    return (
      <div style={{ padding: '28px 40px', maxWidth: 1000, margin: '0 auto' }}>
        <button onClick={() => setActivePfad(null)} style={{ background: 'none', border: 'none', color: '#9CA3AF', fontSize: 13, cursor: 'pointer', marginBottom: 16, padding: 0 }}>
          ← Zurück zur Übersicht
        </button>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1A2332', marginBottom: 4 }}>Einstiegspfad</h1>
        <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 24 }}>Dein personalisierter Fahrplan für die Selbständigkeit.</p>

        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #065F46, #059669)', borderRadius: '12px 12px 0 0', padding: '24px 28px', color: '#fff' }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>{activePfad.icon}</div>
          <h2 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 4px' }}>{activePfad.label}</h2>
          <p style={{ fontSize: 14, opacity: 0.85, margin: '0 0 12px', lineHeight: 1.6 }}>{activePfad.desc}</p>
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            <div><div style={{ fontSize: 11, opacity: 0.7, marginBottom: 2 }}>Einkommenspotenzial</div><div style={{ fontSize: 15, fontWeight: 700 }}>{activePfad.revenueRange}</div></div>
            <div><div style={{ fontSize: 11, opacity: 0.7, marginBottom: 2 }}>Bis zum ersten Kunden</div><div style={{ fontSize: 15, fontWeight: 700 }}>{activePfad.timeToFirst}</div></div>
          </div>
        </div>

        {/* Schritte */}
        <div style={{ background: '#fff', border: '1px solid #E5E0D8', borderTop: 'none', borderRadius: '0 0 12px 12px', padding: '24px 28px', marginBottom: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#1A2332', marginBottom: 20 }}>Dein 5-Schritte-Plan</div>
          {activePfad.steps.map((step, i) => (
            <div key={step.nr} style={{ display: 'flex', gap: 16, paddingBottom: i < activePfad.steps.length - 1 ? 20 : 0 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#059669', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14 }}>{step.nr}</div>
                {i < activePfad.steps.length - 1 && <div style={{ width: 2, flex: 1, background: '#E5E0D8', marginTop: 4 }} />}
              </div>
              <div style={{ paddingTop: 4, paddingBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: '#1A2332' }}>{step.title}</span>
                  <span style={{ fontSize: 11, color: '#9CA3AF', background: '#F3F4F6', padding: '2px 8px', borderRadius: 10 }}>{step.duration}</span>
                </div>
                <div style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.6 }}>{step.description}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Swiss Tip */}
        <div style={{ background: '#FFFBEB', border: '1.5px solid #FCD34D', borderRadius: 12, padding: '18px 24px', marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#B45309', textTransform: 'uppercase' as const, letterSpacing: '0.05em', marginBottom: 8 }}>🇨🇭 Schweizer Rechts-Tipp</div>
          <div style={{ fontSize: 13, color: '#374151', lineHeight: 1.6 }}>{activePfad.swissTip}</div>
        </div>

        {/* Kurse */}
        {isPro ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[['Empfohlene Kurse', ENTRY_PATHS.selbstaendigkeit.courses, '#059669', '→'], ['Formalitäten & Abschlüsse', ENTRY_PATHS.selbstaendigkeit.certificates, '#065F46', '✓']].map(([title, items, color, mark]) => (
              <div key={title as string} style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E0D8', padding: '20px 24px' }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#1A2332', marginBottom: 14 }}>{title as string}</div>
                {(items as string[]).map(c => (
                  <div key={c} style={{ fontSize: 13, color: '#374151', paddingBottom: 8, borderBottom: '1px solid #F3F4F6', marginBottom: 8, display: 'flex', gap: 8 }}>
                    <span style={{ color: color as string }}>{mark as string}</span>{c}
                  </div>
                ))}
              </div>
            ))}
          </div>
        ) : (
          <div style={{ background: '#F9FAFB', border: '2px dashed #E5E7EB', borderRadius: 12, padding: '32px', textAlign: 'center' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🔒</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#374151', marginBottom: 8 }}>Pro-Inhalte gesperrt</div>
            <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 16 }}>Kurs-Empfehlungen · Formalitäten · Gehalts-Benchmarks</div>
            <button style={{ padding: '10px 24px', background: '#059669', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
              Zu Pro upgraden — CHF 29/Monat
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div style={{ padding: '28px 40px', maxWidth: 1000, margin: '0 auto' }}>
      <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#9CA3AF', fontSize: 13, cursor: 'pointer', marginBottom: 16, padding: 0 }}>
        ← Anderen Weg finden
      </button>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1A2332', marginBottom: 4 }}>Selbständigkeit</h1>
      <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 8 }}>Kein Bewerbungsgespräch, kein Arbeitgeber der dich einstellen muss. Du brauchst nur einen ersten Kunden.</p>
      <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 28 }}>Wähle dein Arbeitsmodell:</p>

      {/* Sub-Pfad-Picker */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16, marginBottom: 32 }}>
        {SELBSTAENDIGKEIT_PFADE.map(pfad => (
          <button key={pfad.key} onClick={() => setActivePfad(pfad)} style={{
            padding: '24px 20px', background: '#fff', border: '1.5px solid #E5E0D8', borderRadius: 14,
            cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
          }} className="selbst-card">
            <div style={{ fontSize: 28, marginBottom: 10 }}>{pfad.icon}</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#1A2332', marginBottom: 6 }}>{pfad.label}</div>
            <div style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.5, marginBottom: 10 }}>{pfad.desc}</div>
            <div style={{ fontSize: 12, color: '#059669', fontWeight: 600 }}>{pfad.revenueRange}</div>
          </button>
        ))}
      </div>

      <style>{`.selbst-card:hover { border-color: #059669 !important; box-shadow: 0 4px 12px rgba(5,150,105,0.12); }`}</style>
    </div>
  )
}

// ─── Path View ────────────────────────────────────────────────────────────────

function PathView({ field, isPro, onBack }: { field: EntryField; isPro: boolean; onBack: () => void }) {
  if (field === 'selbstaendigkeit') {
    return <SelbstaendigkeitPathView isPro={isPro} onBack={onBack} />
  }
  const [activeField, setActiveField] = useState<EntryField>(field)
  const path = ENTRY_PATHS[activeField]
  const allFields = Object.keys(ENTRY_PATHS) as EntryField[]

  return (
    <div style={{ padding: '28px 40px', maxWidth: 1000, margin: '0 auto' }}>
      <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#9CA3AF', fontSize: 13, cursor: 'pointer', marginBottom: 16, padding: 0 }}>
        ← Anderen Weg finden
      </button>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1A2332', marginBottom: 4 }}>Einstiegspfad</h1>
      <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 24 }}>Dein personalisierter Fahrplan für den Quereinstieg.</p>

      {/* Field Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 28, flexWrap: 'wrap' }}>
        {allFields.map(f => {
          const locked = !isPro && f !== activeField
          if (locked) return (
            <div key={f} title="Pro erforderlich" style={{
              padding: '7px 14px', borderRadius: 8, border: '1px solid #E5E0D8',
              fontSize: 13, color: '#D1D5DB', cursor: 'not-allowed', display: 'flex', alignItems: 'center', gap: 4,
            }}>
              {ENTRY_PATHS[f].icon} {FIELD_LABELS[f]} 🔒
            </div>
          )
          const active = f === activeField
          const isSelbst = f === 'selbstaendigkeit'
          const accentColor = isSelbst ? '#059669' : '#E67E22'
          const accentBg = isSelbst ? '#ECFDF5' : '#FFF7ED'
          return (
            <button key={f} onClick={() => setActiveField(f)} style={{
              padding: '7px 14px', borderRadius: 8, cursor: 'pointer',
              border: `1.5px solid ${active ? accentColor : '#E5E0D8'}`,
              background: active ? accentBg : '#fff',
              fontSize: 13, fontWeight: active ? 700 : 500,
              color: active ? accentColor : '#374151',
            }}>
              {ENTRY_PATHS[f].icon} {FIELD_LABELS[f]}
            </button>
          )
        })}
      </div>

      {/* Path Header */}
      <div style={{ background: 'linear-gradient(135deg, #1A2332, #2E5C8A)', borderRadius: '12px 12px 0 0', padding: '24px 28px', color: '#fff' }}>
        <div style={{ fontSize: 28, marginBottom: 8 }}>{path.icon}</div>
        <h2 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 8px' }}>{path.label}</h2>
        <p style={{ fontSize: 14, opacity: 0.85, margin: 0, lineHeight: 1.6 }}>{path.intro}</p>
      </div>

      {/* Gehalt */}
      <div style={{ padding: '20px 28px', background: '#FAFAF9', borderLeft: '1px solid #E5E0D8', borderRight: '1px solid #E5E0D8', borderBottom: '1px solid #E5E0D8' }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Gehalt</div>
        {isPro ? (
          <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap' }}>
            {[['Einstieg', path.salary.einstieg], ['Nach 2 Jahren', path.salary.nach2Jahren], ['Nach 5 Jahren', path.salary.nach5Jahren]].map(([l, v]) => (
              <div key={l}><div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 2 }}>{l}</div><div style={{ fontSize: 16, fontWeight: 700, color: '#1A2332' }}>{v}</div></div>
            ))}
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#1A2332' }}>{path.salaryRange}</div>
            <div style={{ fontSize: 12, color: '#9CA3AF' }}>Details mit <span style={{ color: '#E67E22', fontWeight: 600 }}>Pro</span></div>
          </div>
        )}
      </div>

      {/* 5-Schritte */}
      <div style={{ background: '#fff', border: '1px solid #E5E0D8', borderTop: 'none', borderRadius: '0 0 12px 12px', padding: '24px 28px', marginBottom: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#1A2332', marginBottom: 20 }}>Dein 5-Schritte-Plan</div>
        {path.steps.map((step, i) => (
          <div key={step.nr} style={{ display: 'flex', gap: 16, paddingBottom: i < path.steps.length - 1 ? 20 : 0 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#E67E22', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14 }}>{step.nr}</div>
              {i < path.steps.length - 1 && <div style={{ width: 2, flex: 1, background: '#E5E0D8', marginTop: 4 }} />}
            </div>
            <div style={{ paddingTop: 4, paddingBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: '#1A2332' }}>{step.title}</span>
                <span style={{ fontSize: 11, color: '#9CA3AF', background: '#F3F4F6', padding: '2px 8px', borderRadius: 10 }}>{step.duration}</span>
              </div>
              <div style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.6 }}>{step.description}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Pro: Kurse + Zertifikate */}
      {isPro ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {[['Empfohlene Kurse', path.courses, '#E67E22', '→'], ['Zertifikate & Abschlüsse', path.certificates, '#2E5C8A', '✓']].map(([title, items, color, mark]) => (
            <div key={title as string} style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E0D8', padding: '20px 24px' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#1A2332', marginBottom: 14 }}>{title as string}</div>
              {(items as string[]).map(c => (
                <div key={c} style={{ fontSize: 13, color: '#374151', paddingBottom: 8, borderBottom: '1px solid #F3F4F6', marginBottom: 8, display: 'flex', gap: 8 }}>
                  <span style={{ color: color as string }}>{mark as string}</span>{c}
                </div>
              ))}
            </div>
          ))}
        </div>
      ) : (
        <div style={{ background: '#F9FAFB', border: '2px dashed #E5E7EB', borderRadius: 12, padding: '32px', textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🔒</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#374151', marginBottom: 8 }}>Pro-Inhalte gesperrt</div>
          <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 16 }}>Alle 10 Felder · Kurs-Empfehlungen · Zertifikate · Gehalts-Benchmarks</div>
          <button style={{ padding: '10px 24px', background: '#E67E22', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
            Zu Pro upgraden — CHF 29/Monat
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Mode: Zielberuf ──────────────────────────────────────────────────────────

function ZielberufMode({ onSelect, onBack }: { onSelect: (f: EntryField) => void; onBack: () => void }) {
  const regularFields = (Object.keys(ENTRY_PATHS) as EntryField[]).filter(f => f !== 'selbstaendigkeit')
  return (
    <div>
      <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#9CA3AF', fontSize: 13, cursor: 'pointer', marginBottom: 20, padding: 0 }}>← Zurück</button>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1A2332', marginBottom: 6 }}>Welches Berufsfeld interessiert dich?</h2>
      <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 24 }}>Wähle das Feld, in das du einsteigen möchtest.</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12, marginBottom: 16 }}>
        {regularFields.map(f => {
          const p = ENTRY_PATHS[f]
          return (
            <button key={f} onClick={() => onSelect(f)} style={{
              padding: '20px 16px', background: '#fff', border: '1.5px solid #E5E0D8', borderRadius: 12,
              cursor: 'pointer', textAlign: 'left', transition: 'border-color 0.15s',
            }} className="field-card">
              <div style={{ fontSize: 28, marginBottom: 10 }}>{p.icon}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#1A2332', marginBottom: 4 }}>{p.label}</div>
              <div style={{ fontSize: 12, color: '#9CA3AF' }}>{p.salaryRange.split('/')[0].trim()}</div>
            </button>
          )
        })}
      </div>

      {/* Selbständigkeit Banner */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 20, padding: '20px 24px',
        background: '#F0FDF4', border: '1.5px solid #6EE7B7', borderRadius: 12,
        cursor: 'pointer',
      }} onClick={() => onSelect('selbstaendigkeit')} role="button">
        <div style={{ fontSize: 36, flexShrink: 0 }}>🚀</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#065F46', marginBottom: 4 }}>Selbständigkeit — dein eigenes Business</div>
          <div style={{ fontSize: 13, color: '#047857', marginBottom: 2 }}>Freelancer · Einzelfirma · Nebengewerbe · Franchise</div>
          <div style={{ fontSize: 13, color: '#374151', lineHeight: 1.5 }}>Oft der direktere Weg: du brauchst nur einen ersten Kunden.</div>
        </div>
        <div style={{ fontSize: 13, color: '#059669', fontWeight: 600, flexShrink: 0 }}>Ansehen →</div>
      </div>

      <style>{`.field-card:hover { border-color: #E67E22 !important; }`}</style>
    </div>
  )
}

// ─── Skills: Hilfsfunktionen ──────────────────────────────────────────────────

// Felder wo 1 fehlende Fähigkeit den Match stark steigern würde
function findNearMisses(selectedIds: string[]) {
  const results: { field: EntryField; skill: typeof SKILLS[0]; currentPercent: number; potentialPercent: number; boost: number }[] = []
  const currentMatches = matchFieldsBySkills(selectedIds)
  const currentMap = Object.fromEntries(currentMatches.map(m => [m.field, m.percent]))

  for (const field of Object.keys(ENTRY_PATHS) as EntryField[]) {
    const best = SKILLS
      .filter(s => !selectedIds.includes(s.id) && (s.affinities[field] ?? 0) >= 2)
      .sort((a, b) => (b.affinities[field] ?? 0) - (a.affinities[field] ?? 0))[0]
    if (!best) continue
    const potential = matchFieldsBySkills([...selectedIds, best.id])
    const potentialPercent = potential.find(m => m.field === field)?.percent ?? 0
    const currentPercent = currentMap[field] ?? 0
    const boost = potentialPercent - currentPercent
    if (boost >= 10 && potentialPercent >= 20) {
      results.push({ field, skill: best, currentPercent, potentialPercent, boost })
    }
  }
  // Nicht im Top-Match duplizieren: nur Felder die NICHT bereits top sind
  const topField = currentMatches[0]?.field
  return results
    .filter(r => r.field !== topField)
    .sort((a, b) => b.potentialPercent - a.potentialPercent)
    .slice(0, 2)
}

// Welche noch nicht gewählte Fähigkeit bringt am meisten neue Möglichkeiten
function bestNextSkill(selectedIds: string[]) {
  return SKILLS
    .filter(s => !selectedIds.includes(s.id))
    .map(s => ({
      skill: s,
      score: (Object.values(s.affinities) as number[]).reduce((a, b) => a + b, 0) *
             Object.keys(s.affinities).length,
    }))
    .sort((a, b) => b.score - a.score)[0]?.skill ?? null
}

// ─── Mode: Fähigkeiten ────────────────────────────────────────────────────────

function SkillsMode({ onSelect, onBack, selected, onToggle }: {
  onSelect: (f: EntryField) => void
  onBack: () => void
  selected: Set<string>
  onToggle: (id: string) => void
}) {
  function toggle(id: string) { onToggle(id) }

  const selectedArr = [...selected]
  const matches = selected.size > 0 ? matchFieldsBySkills(selectedArr) : []
  const topMatch = matches[0]
  const nearMisses = selected.size >= 3 ? findNearMisses(selectedArr) : []
  const nextSkill = selected.size >= 2 ? bestNextSkill(selectedArr) : null
  const categories = [...new Set(SKILLS.map(s => s.category))]

  return (
    <div>
      <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#9CA3AF', fontSize: 13, cursor: 'pointer', marginBottom: 20, padding: 0 }}>← Zurück</button>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1A2332', marginBottom: 6 }}>Was kannst du gut?</h2>
      <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 24 }}>Wähle alle Fähigkeiten die auf dich zutreffen — wir zeigen dir passende Berufsfelder.</p>

      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        {/* Skill-Chips */}
        <div style={{ flex: 2, minWidth: 320 }}>
          {categories.map(cat => (
            <div key={cat} style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#6B7280', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {SKILL_CATEGORIES[cat]}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {SKILLS.filter(s => s.category === cat).map(skill => {
                  const active = selected.has(skill.id)
                  return (
                    <button key={skill.id} onClick={() => toggle(skill.id)} style={{
                      padding: '7px 14px', borderRadius: 20, fontSize: 13, cursor: 'pointer', transition: 'all 0.15s',
                      border: `1.5px solid ${active ? '#E67E22' : '#E5E0D8'}`,
                      background: active ? '#FFF7ED' : '#fff',
                      color: active ? '#E67E22' : '#374151',
                      fontWeight: active ? 600 : 400,
                    }}>
                      {skill.icon} {skill.label}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Ergebnis-Panel */}
        <div style={{ flex: 1, minWidth: 260, position: 'sticky', top: 24 }}>

          {/* Leer */}
          {selected.size === 0 && (
            <div style={{ background: '#F9F8F6', border: '1px dashed #D1D5DB', borderRadius: 12, padding: '28px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>👈</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Wähle deine Fähigkeiten</div>
              <div style={{ fontSize: 13, color: '#9CA3AF', lineHeight: 1.5 }}>Hak alles an, was du kannst oder schon gemacht hast — auch privat zählt.</div>
            </div>
          )}

          {/* Wenige gewählt */}
          {selected.size > 0 && selected.size < 3 && (
            <div style={{ background: '#fff', border: '1px solid #E5E0D8', borderRadius: 12, padding: '20px' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#1A2332', marginBottom: 8 }}>
                {selected.size} von mindestens 5 Fähigkeiten
              </div>
              <div style={{ height: 6, background: '#F3F4F6', borderRadius: 3, marginBottom: 12 }}>
                <div style={{ height: '100%', width: `${(selected.size / 5) * 100}%`, background: '#E67E22', borderRadius: 3 }} />
              </div>
              <div style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.6 }}>
                Wähle noch <strong>{5 - selected.size} weitere</strong> für eine genaue Auswertung. Auch alltägliche Dinge zählen — Kochen, Autofahren, Kinder betreut haben.
              </div>
            </div>
          )}

          {/* Vollständige Auswertung */}
          {selected.size >= 3 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

              {/* Sektion 1: Direkt einsteigen */}
              {topMatch && topMatch.percent >= 15 && (
                <div style={{ background: '#F0FDF4', border: '1.5px solid #6EE7B7', borderRadius: 12, padding: '18px 20px' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
                    ✅ Passt jetzt schon zu dir
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <span style={{ fontSize: 22 }}>{ENTRY_PATHS[topMatch.field].icon}</span>
                    <span style={{ fontSize: 15, fontWeight: 700, color: '#1A2332' }}>{FIELD_LABELS[topMatch.field]}</span>
                  </div>
                  <div style={{ fontSize: 13, color: '#374151', lineHeight: 1.5, marginBottom: 12 }}>
                    Du bringst bereits <strong>{topMatch.percent}%</strong> der typischen Fähigkeiten für dieses Feld mit. Ein guter Ausgangspunkt für den Einstieg.
                  </div>
                  <MatchBar percent={topMatch.percent} />
                  <button onClick={() => onSelect(topMatch.field)} style={{
                    marginTop: 12, width: '100%', padding: '9px 16px',
                    background: '#059669', color: '#fff', border: 'none',
                    borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  }}>
                    Einstiegspfad ansehen →
                  </button>
                </div>
              )}

              {/* Sektion 2: Mit 1 Schritt weiter */}
              {nearMisses.length > 0 && (
                <div style={{ background: '#EFF6FF', border: '1.5px solid #93C5FD', borderRadius: 12, padding: '18px 20px' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#2563EB', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
                    📈 Mit 1 Schritt weiter
                  </div>
                  {nearMisses.map(nm => (
                    <div key={nm.field} style={{ marginBottom: nearMisses.indexOf(nm) < nearMisses.length - 1 ? 16 : 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <span style={{ fontSize: 18 }}>{ENTRY_PATHS[nm.field].icon}</span>
                        <span style={{ fontSize: 14, fontWeight: 700, color: '#1A2332' }}>{FIELD_LABELS[nm.field]}</span>
                      </div>
                      <div style={{ fontSize: 13, color: '#374151', lineHeight: 1.5, marginBottom: 8 }}>
                        Wenn du noch <strong>„{nm.skill.label}"</strong> {nm.skill.icon} lernst, steigt dein Match von {nm.currentPercent}% auf <strong>{nm.potentialPercent}%</strong> (+{nm.boost}%).
                      </div>
                      <button onClick={() => onSelect(nm.field)} style={{
                        fontSize: 12, color: '#2563EB', background: 'none', border: 'none',
                        cursor: 'pointer', padding: 0, fontWeight: 600,
                      }}>
                        Was brauche ich dafür? →
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Sektion 3: Skill-Tipp */}
              {nextSkill && (
                <div style={{ background: '#FFFBEB', border: '1.5px solid #FCD34D', borderRadius: 12, padding: '18px 20px' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#B45309', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
                    💡 Skill-Tipp
                  </div>
                  <div style={{ fontSize: 13, color: '#374151', lineHeight: 1.5, marginBottom: 10 }}>
                    Diese Fähigkeit würde dir am meisten neue Türen öffnen:
                  </div>
                  <button onClick={() => toggle(nextSkill.id)} style={{
                    padding: '8px 14px', borderRadius: 20, fontSize: 13, cursor: 'pointer',
                    border: '1.5px solid #E67E22', background: '#FFF7ED',
                    color: '#E67E22', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6,
                  }}>
                    <span>+</span> {nextSkill.icon} {nextSkill.label}
                  </button>
                </div>
              )}

              {/* Zähler */}
              <div style={{ fontSize: 11, color: '#9CA3AF', textAlign: 'center' }}>
                {selected.size} Fähigkeit{selected.size !== 1 ? 'en' : ''} ausgewählt · {matches.filter(m => m.percent > 0).length} Felder analysiert
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Mode: Filter ─────────────────────────────────────────────────────────────

function FilterMode({ onSelect, onBack }: { onSelect: (f: EntryField) => void; onBack: () => void }) {
  const [minSalary, setMinSalary] = useState(40)         // in k CHF
  const [maxMonths, setMaxMonths] = useState(48)
  const [workStyles, setWorkStyles] = useState<string[]>([])

  function toggleStyle(id: string) {
    setWorkStyles(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id])
  }

  const fields = (Object.keys(ENTRY_PATHS) as EntryField[]).filter(f => {
    const d = FIELD_FILTER_DATA[f]
    if (d.salaryMax < minSalary * 1000) return false
    if (d.trainingMonthsMin > maxMonths) return false
    if (workStyles.length > 0 && !workStyles.some(s => d.workStyle.includes(s as 'buero'))) return false
    return true
  })

  return (
    <div>
      <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#9CA3AF', fontSize: 13, cursor: 'pointer', marginBottom: 20, padding: 0 }}>← Zurück</button>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1A2332', marginBottom: 6 }}>Filtere nach deinen Bedingungen</h2>
      <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 28 }}>Was ist dir wichtig? Wir zeigen nur Felder die passen.</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 28 }}>
        {/* Gehalts-Slider */}
        <div style={{ background: '#fff', border: '1px solid #E5E0D8', borderRadius: 12, padding: '20px 24px' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#1A2332', marginBottom: 4 }}>Mindestgehalt</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#E67E22', marginBottom: 12 }}>CHF {minSalary}.000 / Jahr</div>
          <input type="range" min={40} max={100} step={5} value={minSalary} onChange={e => setMinSalary(+e.target.value)}
            style={{ width: '100%', accentColor: '#E67E22' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#9CA3AF', marginTop: 4 }}>
            <span>CHF 40k</span><span>CHF 100k+</span>
          </div>
        </div>

        {/* Ausbildungszeit-Slider */}
        <div style={{ background: '#fff', border: '1px solid #E5E0D8', borderRadius: 12, padding: '20px 24px' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#1A2332', marginBottom: 4 }}>Maximale Ausbildungszeit</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#2E5C8A', marginBottom: 12 }}>
            {maxMonths < 12 ? `${maxMonths} Monate` : maxMonths === 48 ? 'Egal' : `${Math.round(maxMonths / 12)} Jahre`}
          </div>
          <input type="range" min={1} max={48} step={1} value={maxMonths} onChange={e => setMaxMonths(+e.target.value)}
            style={{ width: '100%', accentColor: '#2E5C8A' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#9CA3AF', marginTop: 4 }}>
            <span>1 Monat</span><span>4 Jahre+</span>
          </div>
        </div>
      </div>

      {/* Arbeitsstil */}
      <div style={{ background: '#fff', border: '1px solid #E5E0D8', borderRadius: 12, padding: '20px 24px', marginBottom: 28 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#1A2332', marginBottom: 14 }}>Arbeitsstil (mehrere möglich)</div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {WORK_STYLE_OPTIONS.map(s => {
            const active = workStyles.includes(s.id)
            return (
              <button key={s.id} onClick={() => toggleStyle(s.id)} style={{
                padding: '10px 18px', borderRadius: 10, cursor: 'pointer',
                border: `1.5px solid ${active ? '#2E5C8A' : '#E5E0D8'}`,
                background: active ? '#EFF6FF' : '#fff',
                fontSize: 13, fontWeight: active ? 700 : 400, color: active ? '#2E5C8A' : '#374151',
              }}>
                {s.icon} {s.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Ergebnis */}
      <div>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#1A2332', marginBottom: 14 }}>
          {fields.length} passende Berufsfelder
        </div>
        {fields.length === 0 ? (
          <div style={{ padding: '24px', background: '#FEF2F2', borderRadius: 10, fontSize: 14, color: '#9CA3AF', textAlign: 'center' }}>
            Keine Felder gefunden — Filter etwas lockern?
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
            {fields.map(f => {
              const p = ENTRY_PATHS[f]
              const d = FIELD_FILTER_DATA[f]
              return (
                <button key={f} onClick={() => onSelect(f)} style={{
                  padding: '18px 16px', background: '#fff', border: '1.5px solid #E5E0D8', borderRadius: 12,
                  cursor: 'pointer', textAlign: 'left',
                }} className="field-card">
                  <div style={{ fontSize: 24, marginBottom: 8 }}>{p.icon}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#1A2332', marginBottom: 6 }}>{p.label}</div>
                  <div style={{ fontSize: 11, color: '#10B981', fontWeight: 600, marginBottom: 2 }}>
                    bis CHF {Math.round(d.salaryMax / 1000)}k / Jahr
                  </div>
                  <div style={{ fontSize: 11, color: '#6B7280' }}>
                    {d.trainingMonthsMin === 0 ? 'Sofortiger Einstieg möglich' : `Ab ${d.trainingMonthsMin} Monate Ausbildung`}
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
      <style>{`.field-card:hover { border-color: #E67E22 !important; }`}</style>
    </div>
  )
}

// ─── Mode: Quiz ───────────────────────────────────────────────────────────────

function QuizMode({ onSelect, onBack }: { onSelect: (f: EntryField) => void; onBack: () => void }) {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const total = QUIZ_QUESTIONS.length
  const done = step >= total

  function answer(optionIdx: number) {
    const q = QUIZ_QUESTIONS[step]
    setAnswers(prev => ({ ...prev, [q.id]: optionIdx }))
    setStep(s => s + 1)
  }

  const results = done ? calcQuizScores(answers).filter(r => r.score > 0).slice(0, 4) : []
  const maxScore = results[0]?.score ?? 1

  if (done) {
    return (
      <div>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#9CA3AF', fontSize: 13, cursor: 'pointer', marginBottom: 20, padding: 0 }}>← Zurück</button>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1A2332', marginBottom: 6 }}>Deine Empfehlungen</h2>
        <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 28 }}>Basierend auf deinen Antworten — klicke auf ein Feld um den Einstiegspfad zu sehen.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 28 }}>
          {results.map(({ field, score }, i) => {
            const p = ENTRY_PATHS[field]
            const pct = Math.round((score / (maxScore * 1.1)) * 100)
            const isTop = i === 0
            return (
              <button key={field} onClick={() => onSelect(field)} style={{
                display: 'flex', alignItems: 'center', gap: 20, padding: '20px 24px',
                background: isTop ? '#FFF7ED' : '#fff',
                border: `1.5px solid ${isTop ? '#E67E22' : '#E5E0D8'}`,
                borderRadius: 12, cursor: 'pointer', textAlign: 'left', width: '100%',
              }}>
                <div style={{ fontSize: 32, flexShrink: 0 }}>{p.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: '#1A2332' }}>{p.label}</span>
                    {isTop && <span style={{ fontSize: 11, background: '#E67E22', color: '#fff', padding: '2px 8px', borderRadius: 10, fontWeight: 700 }}>Beste Match</span>}
                  </div>
                  <MatchBar percent={pct} />
                </div>
                <div style={{ fontSize: 13, color: '#E67E22', fontWeight: 600, flexShrink: 0 }}>Ansehen →</div>
              </button>
            )
          })}
        </div>
        <button onClick={() => { setStep(0); setAnswers({}) }} style={{
          background: 'none', border: '1px solid #E5E0D8', borderRadius: 8, padding: '8px 18px',
          fontSize: 13, color: '#6B7280', cursor: 'pointer',
        }}>
          Quiz wiederholen
        </button>
      </div>
    )
  }

  const q = QUIZ_QUESTIONS[step]
  const progress = Math.round((step / total) * 100)

  return (
    <div style={{ maxWidth: 600 }}>
      <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#9CA3AF', fontSize: 13, cursor: 'pointer', marginBottom: 20, padding: 0 }}>← Zurück</button>

      {/* Progress */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
        <div style={{ flex: 1, height: 6, background: '#F3F4F6', borderRadius: 3 }}>
          <div style={{ height: '100%', width: `${progress}%`, background: '#E67E22', borderRadius: 3, transition: 'width 0.3s' }} />
        </div>
        <span style={{ fontSize: 12, color: '#9CA3AF', flexShrink: 0 }}>{step} / {total}</span>
      </div>

      {/* Question */}
      <div style={{ background: '#fff', border: '1px solid #E5E0D8', borderRadius: 16, padding: '32px 32px 28px', marginBottom: 8 }}>
        <div style={{ fontSize: 36, marginBottom: 16 }}>{q.emoji}</div>
        <div style={{ fontSize: 20, fontWeight: 700, color: '#1A2332', marginBottom: 28, lineHeight: 1.4 }}>{q.question}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {q.options.map((opt, i) => (
            <button key={i} onClick={() => answer(i)} style={{
              padding: '14px 20px', background: '#F9F8F6', border: '1.5px solid #E5E0D8',
              borderRadius: 10, cursor: 'pointer', textAlign: 'left', fontSize: 14, color: '#374151',
              fontWeight: 500, transition: 'all 0.15s',
            }} className="quiz-opt">
              <span style={{ color: '#9CA3AF', marginRight: 10, fontSize: 13 }}>{String.fromCharCode(65 + i)}.</span>
              {opt.label}
            </button>
          ))}
        </div>
      </div>
      <style>{`.quiz-opt:hover { background: #FFF7ED !important; border-color: #E67E22 !important; color: #1A2332 !important; }`}</style>
    </div>
  )
}

// ─── Mode Picker ──────────────────────────────────────────────────────────────

const MODES = [
  { key: 'zielberuf', icon: '🎯', title: 'Ich weiss mein Ziel', desc: 'Wähle direkt ein Berufsfeld und sieh deinen Schritt-für-Schritt-Plan.' },
  { key: 'skills',   icon: '✅', title: 'Ich kenne meine Fähigkeiten', desc: 'Wähle was du kannst — wir berechnen welche Felder am besten passen.' },
  { key: 'filter',   icon: '🎚️', title: 'Ich habe Bedingungen', desc: 'Filtere nach Gehalt, Ausbildungszeit und Arbeitsstil.' },
  { key: 'quiz',     icon: '🧭', title: 'Ich weiss es noch nicht', desc: '5 Fragen, 2 Minuten — wir finden gemeinsam dein Feld.' },
]

// ─── Main Component ───────────────────────────────────────────────────────────

export default function EinstiegspfadClient({ profile }: { profile: Profile }) {
  const [mode, setMode] = useState<Mode>('picker')
  const [selectedSkills, setSelectedSkills] = useState<Set<string>>(new Set())
  const [selectedField, setSelectedField] = useState<EntryField | null>(
    profile.target_field as EntryField | null
  )
  const isPro = profile.tier >= 2

  // Wiederherstellen aus localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const data = JSON.parse(saved)
        if (data.mode && data.mode !== 'picker') setMode(data.mode as Mode)
        if (Array.isArray(data.skills) && data.skills.length > 0) {
          setSelectedSkills(new Set(data.skills))
        }
      }
    } catch { /* ignore */ }
  }, [])

  // Persistieren bei Änderungen
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        mode,
        skills: [...selectedSkills],
      }))
    } catch { /* ignore */ }
  }, [mode, selectedSkills])

  function toggleSkill(id: string) {
    setSelectedSkills(prev => {
      const n = new Set(prev)
      n.has(id) ? n.delete(id) : n.add(id)
      return n
    })
  }

  if (selectedField) {
    return <PathView field={selectedField} isPro={isPro} onBack={() => setSelectedField(null)} />
  }

  return (
    <div style={{ padding: '28px 40px', maxWidth: 1000, margin: '0 auto' }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1A2332', marginBottom: 4 }}>Einstiegspfad finden</h1>
      <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 28 }}>Wie möchtest du deinen Quereinstieg-Weg finden?</p>

      {mode === 'picker' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
          {MODES.map(m => (
            <button key={m.key} onClick={() => setMode(m.key as Mode)} style={{
              padding: '24px 20px', background: '#fff', border: '1.5px solid #E5E0D8', borderRadius: 14,
              cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
            }} className="mode-card">
              <div style={{ fontSize: 32, marginBottom: 12 }}>{m.icon}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#1A2332', marginBottom: 6 }}>{m.title}</div>
              <div style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.5 }}>{m.desc}</div>
              {m.key === 'skills' && selectedSkills.size > 0 && (
                <div style={{ marginTop: 8, fontSize: 11, color: '#E67E22', fontWeight: 600 }}>
                  {selectedSkills.size} Fähigkeiten gespeichert ✓
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {mode === 'zielberuf' && <ZielberufMode onSelect={setSelectedField} onBack={() => setMode('picker')} />}
      {mode === 'skills'   && <SkillsMode    onSelect={setSelectedField} onBack={() => setMode('picker')} selected={selectedSkills} onToggle={toggleSkill} />}
      {mode === 'filter'   && <FilterMode    onSelect={setSelectedField} onBack={() => setMode('picker')} />}
      {mode === 'quiz'     && <QuizMode      onSelect={setSelectedField} onBack={() => setMode('picker')} />}

      <style>{`.mode-card:hover { border-color: #E67E22 !important; box-shadow: 0 4px 12px rgba(230,126,34,0.1); }`}</style>
    </div>
  )
}
