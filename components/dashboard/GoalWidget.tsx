'use client'

import { useState, useEffect } from 'react'
import { SKILLS } from '@/lib/dashboard/entry-paths'
import type { EntryField } from '@/lib/dashboard/entry-paths'

interface CareerGoal {
  id: string
  job_title: string
  job_company: string | null
  job_category: string
  job_field: EntryField | null
  job_region: string | null
  job_source_url: string | null
  skill_gaps: string[]
  skills_at_save: string[]
  created_at: string
}

export default function GoalWidget() {
  const [goal, setGoal] = useState<CareerGoal | null | undefined>(undefined) // undefined = loading
  const [currentSkillIds, setCurrentSkillIds] = useState<string[]>([])
  const [removing, setRemoving] = useState(false)

  useEffect(() => {
    fetch('/api/user/goals').then(r => r.json()).then(d => setGoal(d.goal ?? null))
    try {
      const raw = localStorage.getItem('dqe_einstiegspfad')
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed.skills)) setCurrentSkillIds(parsed.skills)
      }
    } catch {}
  }, [])

  async function removeGoal() {
    setRemoving(true)
    await fetch('/api/user/goals', { method: 'DELETE' })
    setGoal(null)
    setRemoving(false)
  }

  // Loading
  if (goal === undefined) {
    return (
      <div style={{
        background: '#fff', borderRadius: 12, border: '1px solid #E5E0D8',
        padding: '20px 24px', gridColumn: '1 / -1',
      }}>
        <div style={{ fontSize: 13, color: '#9CA3AF' }}>Lädt Ziel…</div>
      </div>
    )
  }

  // No goal yet
  if (!goal) {
    return (
      <div style={{
        background: 'linear-gradient(135deg, #F9F8F6, #FFF7ED)',
        borderRadius: 12,
        border: '1.5px dashed #FCD34D',
        padding: '20px 24px',
        gridColumn: '1 / -1',
        display: 'flex',
        alignItems: 'center',
        gap: 20,
        flexWrap: 'wrap',
      }}>
        <div style={{ fontSize: 28 }}>🎯</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#1A2332', marginBottom: 4 }}>
            Noch kein Ziel gesetzt
          </div>
          <div style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.5 }}>
            Sieh dir Jobs an, klicke auf eine Stelle die dich anspricht — auch wenn du noch nicht bereit bist. Setze sie als Ziel und wir begleiten dich Schritt für Schritt dahin.
          </div>
        </div>
        <a
          href="/dashboard/jobs"
          style={{
            padding: '9px 20px',
            background: '#E67E22', color: '#fff',
            borderRadius: 8, fontSize: 13, fontWeight: 600,
            textDecoration: 'none', flexShrink: 0,
          }}
        >
          Jobs entdecken →
        </a>
      </div>
    )
  }

  // Goal exists — compute progress
  const skillGaps = goal.skill_gaps ?? []
  const completedGaps = skillGaps.filter(id => currentSkillIds.includes(id))
  const remainingGaps = skillGaps.filter(id => !currentSkillIds.includes(id))
  const progressPct = skillGaps.length > 0
    ? Math.round((completedGaps.length / skillGaps.length) * 100)
    : 100

  const goalDate = new Date(goal.created_at).toLocaleDateString('de-CH', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  })

  const progressColor = progressPct >= 80 ? '#059669' : progressPct >= 40 ? '#D97706' : '#E67E22'

  // Get skill labels for display
  const skillById = Object.fromEntries(SKILLS.map(s => [s.id, s]))

  const getMotivation = () => {
    if (progressPct === 100) return '🎉 Du bist bereit! Zeit, dich zu bewerben.'
    if (progressPct >= 60) return `Noch ${remainingGaps.length} Schritt${remainingGaps.length !== 1 ? 'e' : ''} — du bist fast da!`
    if (progressPct >= 30) return `Guter Fortschritt! ${completedGaps.length} von ${skillGaps.length} Voraussetzungen erfüllt.`
    return `Jeder Schritt zählt. Du schaffst das!`
  }

  return (
    <div style={{
      background: '#fff',
      borderRadius: 12,
      border: '1.5px solid #E67E22',
      padding: '20px 24px',
      gridColumn: '1 / -1',
      position: 'relative',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 22 }}>🎯</span>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Dein Ziel
            </div>
            <div style={{ fontSize: 17, fontWeight: 700, color: '#1A2332', lineHeight: 1.2 }}>
              {goal.job_title}
            </div>
            <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>
              {goal.job_company && `${goal.job_company} · `}
              {goal.job_category}
              {goal.job_region && ` · ${goal.job_region}`}
              <span style={{ marginLeft: 8, color: '#D1D5DB' }}>Gespeichert {goalDate}</span>
            </div>
          </div>
        </div>
        <button
          onClick={removeGoal}
          disabled={removing}
          title="Ziel entfernen"
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 11, color: '#9CA3AF', padding: '4px 8px',
            borderRadius: 6, flexShrink: 0,
          }}
        >
          {removing ? '…' : '× entfernen'}
        </button>
      </div>

      {/* Progress */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <span style={{ fontSize: 12, color: '#6B7280', fontWeight: 600 }}>{getMotivation()}</span>
          <span style={{ fontSize: 14, fontWeight: 700, color: progressColor }}>
            {progressPct === 100 ? '✓ Bereit' : `${progressPct}%`}
          </span>
        </div>
        <div style={{ height: 8, background: '#F3F4F6', borderRadius: 4, overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${progressPct}%`,
            background: progressPct >= 80
              ? 'linear-gradient(90deg, #059669, #34D399)'
              : 'linear-gradient(90deg, #E67E22, #F59E0B)',
            borderRadius: 4,
            transition: 'width 0.5s ease',
          }} />
        </div>
      </div>

      {/* Skills */}
      {skillGaps.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
          {completedGaps.map(id => {
            const s = skillById[id]
            if (!s) return null
            return (
              <span key={id} style={{
                fontSize: 11, padding: '3px 9px',
                background: '#ECFDF5', color: '#065F46',
                border: '1px solid #A7F3D0', borderRadius: 20,
                display: 'inline-flex', alignItems: 'center', gap: 4,
              }}>
                ✓ {s.icon} {s.label}
              </span>
            )
          })}
          {remainingGaps.map(id => {
            const s = skillById[id]
            if (!s) return null
            return (
              <span key={id} style={{
                fontSize: 11, padding: '3px 9px',
                background: '#F9FAFB', color: '#9CA3AF',
                border: '1px solid #E5E7EB', borderRadius: 20,
                display: 'inline-flex', alignItems: 'center', gap: 4,
              }}>
                ○ {s.icon} {s.label}
              </span>
            )
          })}
        </div>
      )}

      {/* CTAs */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        {skillGaps.length > 0 && remainingGaps.length > 0 && (
          <a
            href="/dashboard/einstiegspfad"
            style={{
              fontSize: 12, fontWeight: 600, color: '#E67E22',
              textDecoration: 'none',
              padding: '6px 14px',
              background: '#FFF7ED',
              border: '1.5px solid #FCD34D',
              borderRadius: 8,
            }}
          >
            Fähigkeiten erweitern →
          </a>
        )}
        {progressPct === 100 && goal.job_field && (
          <a
            href={`/dashboard/jobs?category=${goal.job_field}`}
            style={{
              fontSize: 12, fontWeight: 600, color: '#fff',
              textDecoration: 'none',
              padding: '6px 14px',
              background: '#059669',
              borderRadius: 8,
            }}
          >
            Ähnliche Stellen ansehen →
          </a>
        )}
        {progressPct < 100 && goal.job_field && (
          <a
            href={`/dashboard/jobs?category=${goal.job_field}`}
            style={{
              fontSize: 12, color: '#6B7280',
              textDecoration: 'none',
            }}
          >
            Ähnliche Stellen ansehen →
          </a>
        )}
        {skillGaps.length === 0 && (
          <div style={{ fontSize: 12, color: '#9CA3AF' }}>
            Trage deine Fähigkeiten im{' '}
            <a href="/dashboard/einstiegspfad" style={{ color: '#E67E22', textDecoration: 'none', fontWeight: 600 }}>
              Einstiegspfad
            </a>{' '}
            ein, um deinen Fortschritt zu sehen.
          </div>
        )}
      </div>
    </div>
  )
}
