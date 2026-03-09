'use client'

import { useEffect, useState } from 'react'
import { getJobEnrichment } from '@/lib/jobs/job-enrichment'

export interface CareerGoalInput {
  job_title: string
  job_company: string | null
  job_description: string | null
  job_category: string
  job_field: string | null
  job_region: string | null
  job_source_url: string
  skill_gaps: string[]
  skills_at_save: string[]
}

export interface DrawerJob {
  id: string
  title: string
  company: string
  location: string | null
  region: string | null
  canton: string | null
  source_url: string
  source_name?: string
  posted_at: string | null
  first_seen_at: string
  description: string | null
  keywords: string[] | null
  category: string
}

interface JobDetailDrawerProps {
  job: DrawerJob | null
  onClose: () => void
  userSkillIds: string[]
  isBookmarked: boolean
  onToggleBookmark: (jobId: string) => void
  bookmarkLoading: boolean
  tier: number
  isGoal: boolean
  onSetGoal: (snapshot: CareerGoalInput) => Promise<void>
  onRemoveGoal: () => Promise<void>
  userAge?: number
}

export default function JobDetailDrawer({
  job,
  onClose,
  userSkillIds,
  isBookmarked,
  onToggleBookmark,
  bookmarkLoading,
  tier,
  isGoal,
  onSetGoal,
  onRemoveGoal,
  userAge,
}: JobDetailDrawerProps) {
  const [goalSaving, setGoalSaving] = useState(false)
  const [goalJustSet, setGoalJustSet] = useState(false)
  // ESC to close
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  // Prevent body scroll when open
  useEffect(() => {
    if (job) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [job])

  if (!job) return null

  const enrichment = getJobEnrichment(job.category, userSkillIds)
  const hasSkillData = userSkillIds.length > 0
  const postedDate = job.posted_at
    ? new Date(job.posted_at).toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit', year: '2-digit' })
    : new Date(job.first_seen_at).toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit', year: '2-digit' })

  const matchColor = enrichment.matchPercent >= 60
    ? '#059669'
    : enrichment.matchPercent >= 30
    ? '#D97706'
    : '#9CA3AF'

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.35)',
          zIndex: 100,
          backdropFilter: 'blur(2px)',
        }}
      />

      {/* Drawer */}
      <div style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        width: 'min(480px, 100vw)',
        background: '#FAFAF9',
        zIndex: 101,
        overflowY: 'auto',
        boxShadow: '-4px 0 32px rgba(0,0,0,0.15)',
        display: 'flex',
        flexDirection: 'column',
      }}>

        {/* Header */}
        <div style={{
          position: 'sticky', top: 0,
          background: '#fff',
          borderBottom: '1px solid #E5E0D8',
          padding: '16px 20px 14px',
          zIndex: 1,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 17, fontWeight: 700, color: '#1A2332', lineHeight: 1.3, marginBottom: 4 }}>
                {job.title}
              </div>
              <div style={{ fontSize: 13, color: '#6B7280' }}>
                {job.company}
                {job.location && ` · ${job.location}`}
                {!job.location && job.region && ` · ${job.region}`}
                {job.canton && ` (${job.canton})`}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                <span style={{
                  fontSize: 11, fontWeight: 600,
                  background: '#F3F4F6', color: '#6B7280',
                  padding: '2px 8px', borderRadius: 20,
                }}>
                  {job.category}
                </span>
                <span style={{ fontSize: 11, color: '#9CA3AF' }}>{postedDate}</span>
                {job.source_name && (
                  <span style={{ fontSize: 11, color: '#9CA3AF' }}>via {job.source_name}</span>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                width: 32, height: 32, borderRadius: '50%',
                border: '1.5px solid #E5E0D8', background: '#fff',
                cursor: 'pointer', fontSize: 16, color: '#6B7280',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}
            >×</button>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Quereinsteiger-Check */}
          {enrichment.field ? (
            <div style={{
              background: '#fff',
              border: '1.5px solid #E5E0D8',
              borderRadius: 10,
              padding: '14px 16px',
            }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#1A2332', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                🎯 Quereinsteiger-Check
              </div>

              {hasSkillData ? (
                <>
                  {/* Match bar */}
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                      <span style={{ fontSize: 12, color: '#6B7280' }}>
                        {enrichment.matchingSkills.length} von {enrichment.matchingSkills.length + enrichment.missingSkills.length + Math.max(0, enrichment.matchPercent > 0 ? 0 : 0)} relevanten Skills
                      </span>
                      <span style={{ fontSize: 14, fontWeight: 700, color: matchColor }}>
                        {enrichment.matchPercent}% Match
                      </span>
                    </div>
                    <div style={{ height: 6, background: '#E5E7EB', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{
                        height: '100%',
                        width: `${enrichment.matchPercent}%`,
                        background: enrichment.matchPercent >= 60
                          ? 'linear-gradient(90deg, #059669, #34D399)'
                          : enrichment.matchPercent >= 30
                          ? 'linear-gradient(90deg, #D97706, #FBBF24)'
                          : 'linear-gradient(90deg, #9CA3AF, #D1D5DB)',
                        borderRadius: 3,
                        transition: 'width 0.4s ease',
                      }} />
                    </div>
                  </div>

                  {enrichment.matchingSkills.length > 0 && (
                    <div style={{ marginBottom: 10 }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: '#059669', marginBottom: 5 }}>
                        ✅ Das bringst du bereits mit
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                        {enrichment.matchingSkills.map(s => (
                          <span key={s.id} style={{
                            fontSize: 11, padding: '3px 8px',
                            background: '#ECFDF5', color: '#065F46',
                            border: '1px solid #A7F3D0',
                            borderRadius: 20,
                          }}>
                            {s.icon} {s.label}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {enrichment.missingSkills.length > 0 && (
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: '#6B7280', marginBottom: 8 }}>
                        📈 Diese Skills würden helfen
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {enrichment.missingSkills.map(s => (
                          <div key={s.id} style={{
                            background: '#F9FAFB',
                            border: '1px solid #E5E7EB',
                            borderRadius: 8,
                            padding: '8px 10px',
                          }}>
                            <div style={{ fontSize: 12, color: '#374151', fontWeight: 600, marginBottom: s.learnInfo ? 4 : 0 }}>
                              {s.icon} {s.label}
                            </div>
                            {s.learnInfo && (
                              <div style={{ fontSize: 11, color: '#6B7280', lineHeight: 1.5 }}>
                                {s.learnInfo.how}
                                <span style={{ color: '#9CA3AF' }}> · </span>
                                <span style={{ fontWeight: 600, color: '#D97706' }}>⏱ {s.learnInfo.duration}</span>
                                {s.learnInfo.url ? (
                                  <>
                                    <span style={{ color: '#9CA3AF' }}> · </span>
                                    <a href={s.learnInfo.url} target="_blank" rel="noopener noreferrer"
                                      style={{ color: '#2563EB', textDecoration: 'none', fontWeight: 600 }}>
                                      {s.learnInfo.where} ↗
                                    </a>
                                  </>
                                ) : (
                                  <>
                                    <span style={{ color: '#9CA3AF' }}> · </span>
                                    <span style={{ color: '#9CA3AF' }}>{s.learnInfo.where}</span>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      {/* Investment Total */}
                      {enrichment.totalInvestment && (enrichment.totalInvestment.costCHF > 0 || enrichment.totalInvestment.durationWeeks > 0) && (
                        <div style={{
                          marginTop: 8,
                          padding: '7px 10px',
                          background: '#FEF3C7',
                          borderRadius: 6,
                          fontSize: 11,
                          color: '#92400E',
                          display: 'flex',
                          gap: 12,
                        }}>
                          <span>💸 Gesamtinvestition für alle fehlenden Skills:</span>
                          {enrichment.totalInvestment.costCHF > 0 && (
                            <span style={{ fontWeight: 700 }}>~CHF {enrichment.totalInvestment.costCHF.toLocaleString('de-CH')}</span>
                          )}
                          {enrichment.totalInvestment.durationWeeks > 0 && (
                            <span style={{ fontWeight: 700 }}>~{enrichment.totalInvestment.durationWeeks} Wo.</span>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div style={{
                  fontSize: 12, color: '#9CA3AF',
                  padding: '10px 12px',
                  background: '#F9FAFB',
                  borderRadius: 8,
                  lineHeight: 1.5,
                }}>
                  💡 Trage im{' '}
                  <a href="/dashboard/einstiegspfad" style={{ color: '#E67E22', fontWeight: 600, textDecoration: 'none' }}>
                    Einstiegspfad
                  </a>{' '}
                  deine Fähigkeiten ein — dann siehst du hier wie gut du zu dieser Stelle passt.
                </div>
              )}
            </div>
          ) : (
            <div style={{
              background: '#F9FAFB',
              border: '1px solid #E5E7EB',
              borderRadius: 10,
              padding: '12px 14px',
              fontSize: 12,
              color: '#9CA3AF',
              lineHeight: 1.5,
            }}>
              Diese Kategorie ({job.category || 'unbekannt'}) hat noch keinen Einstiegspfad. Schau unter{' '}
              <a href="/dashboard/einstiegspfad" style={{ color: '#E67E22', textDecoration: 'none', fontWeight: 600 }}>
                Einstiegspfade
              </a>{' '}
              für passende Felder.
            </div>
          )}

          {/* Finanzieller & zeitlicher Horizont */}
          {enrichment.salary && (
            <div style={{
              background: '#fff',
              border: '1.5px solid #E5E0D8',
              borderRadius: 10,
              padding: '12px 14px',
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#1A2332', marginBottom: 10 }}>
                💰 Was erwartet dich finanziell?
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, marginBottom: 10 }}>
                {[
                  { label: 'Einstieg', value: enrichment.salary.einstieg },
                  { label: 'Nach 2 Jahren', value: enrichment.salary.nach2Jahren },
                  { label: 'Nach 5 Jahren', value: enrichment.salary.nach5Jahren },
                ].map(col => (
                  <div key={col.label} style={{
                    background: '#F9FAFB', borderRadius: 6,
                    padding: '8px 6px', textAlign: 'center',
                  }}>
                    <div style={{ fontSize: 9, color: '#9CA3AF', fontWeight: 600, marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {col.label}
                    </div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#1A2332', lineHeight: 1.3 }}>
                      {col.value.replace('CHF ', '')}
                    </div>
                  </div>
                ))}
              </div>
              {enrichment.timeToFirstJob && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '6px 8px',
                  background: '#EFF6FF', borderRadius: 6,
                  fontSize: 12,
                }}>
                  <span>⏱</span>
                  <span style={{ color: '#1E40AF' }}>
                    <strong>Erste Stelle realistisch in:</strong> {enrichment.timeToFirstJob}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Quereinsteiger-Tipp */}
          {enrichment.tip && (
            <div style={{
              background: '#FFFBEB',
              border: '1.5px solid #FDE68A',
              borderRadius: 10,
              padding: '12px 14px',
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#92400E', marginBottom: 5 }}>
                💡 Tipp für Quereinsteiger
              </div>
              <div style={{ fontSize: 12, color: '#78350F', lineHeight: 1.6 }}>
                {enrichment.tip}
              </div>
            </div>
          )}

          {/* Einstiegspfad-Kontext */}
          {enrichment.entryStep && enrichment.entryPathLabel && (
            <div style={{
              background: '#EFF6FF',
              border: '1.5px solid #BFDBFE',
              borderRadius: 10,
              padding: '12px 14px',
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#1E40AF', marginBottom: 5 }}>
                🗺️ Einstiegspfad: {enrichment.entryPathLabel}
              </div>
              <div style={{ fontSize: 12, color: '#1E3A5F', lineHeight: 1.5, marginBottom: 8 }}>
                <strong>Schritt {enrichment.entryStep.nr}: {enrichment.entryStep.title}</strong>
                <br />
                {userAge && userAge >= 40 && enrichment.entryStep.descriptionMature
                  ? enrichment.entryStep.descriptionMature
                  : enrichment.entryStep.description}
                {userAge && userAge >= 40 && enrichment.entryStep.descriptionMature && (
                  <span style={{
                    display: 'inline-block', marginLeft: 6,
                    fontSize: 10, background: '#E0F2FE', color: '#0369A1',
                    padding: '1px 6px', borderRadius: 10, fontWeight: 600,
                  }}>
                    40+
                  </span>
                )}
              </div>
              <a
                href={`/dashboard/einstiegspfad`}
                style={{
                  fontSize: 11, fontWeight: 600, color: '#2563EB',
                  textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 3,
                }}
              >
                Vollständigen Plan ansehen →
              </a>
            </div>
          )}

          {/* Keywords */}
          {job.keywords && job.keywords.length > 0 && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#9CA3AF', marginBottom: 6 }}>
                Schlagwörter
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {job.keywords.slice(0, 12).map(kw => (
                  <span key={kw} style={{
                    fontSize: 10, padding: '2px 7px',
                    background: '#F3F4F6', color: '#6B7280',
                    border: '1px solid #E5E7EB', borderRadius: 20,
                  }}>
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          {job.description && (
            <div style={{
              background: '#fff',
              border: '1px solid #E5E7EB',
              borderRadius: 10,
              padding: '12px 14px',
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#374151', marginBottom: 6 }}>
                Stellenbeschreibung
              </div>
              <div style={{
                fontSize: 12, color: '#4B5563', lineHeight: 1.7,
                maxHeight: 200, overflow: 'hidden',
                WebkitMaskImage: 'linear-gradient(to bottom, black 70%, transparent 100%)',
              }}>
                {job.description}
              </div>
            </div>
          )}

          {/* Spacer */}
          <div style={{ flex: 1 }} />
        </div>

        {/* Actions — sticky footer */}
        <div style={{
          position: 'sticky', bottom: 0,
          background: '#fff',
          borderTop: '1px solid #E5E0D8',
          padding: '14px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}>
          {/* PRIMARY: Ziel setzen / Ziel-Status */}
          {!isGoal ? (
            <button
              onClick={async () => {
                setGoalSaving(true)
                await onSetGoal({
                  job_title: job.title,
                  job_company: job.company,
                  job_description: job.description,
                  job_category: job.category,
                  job_field: enrichment.field,
                  job_region: job.region,
                  job_source_url: job.source_url,
                  skill_gaps: enrichment.allMissingSkillIds,
                  skills_at_save: userSkillIds,
                })
                setGoalSaving(false)
                setGoalJustSet(true)
                setTimeout(() => setGoalJustSet(false), 4000)
              }}
              disabled={goalSaving}
              style={{
                padding: '12px 16px',
                background: goalJustSet
                  ? 'linear-gradient(135deg, #059669, #10B981)'
                  : 'linear-gradient(135deg, #E67E22, #c96a12)',
                border: 'none',
                borderRadius: 8,
                fontSize: 14, fontWeight: 700,
                color: '#fff',
                cursor: goalSaving ? 'default' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                transition: 'all 0.2s',
                boxShadow: goalJustSet ? '0 2px 12px rgba(5,150,105,0.35)' : '0 2px 12px rgba(230,126,34,0.35)',
              }}
            >
              {goalSaving ? '…' : goalJustSet ? '🎯 Ziel gesetzt! Wir begleiten dich.' : '🎯 Als Ziel setzen — ich bin noch nicht bereit'}
            </button>
          ) : (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '11px 14px',
              background: 'linear-gradient(135deg, #FFF7ED, #FEF3C7)',
              border: '1.5px solid #FCD34D',
              borderRadius: 8,
            }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#92400E' }}>🎯 Das ist dein aktuelles Ziel</span>
              <button
                onClick={async () => { setGoalSaving(true); await onRemoveGoal(); setGoalSaving(false) }}
                disabled={goalSaving}
                style={{ background: 'none', border: 'none', fontSize: 11, color: '#9CA3AF', cursor: 'pointer', padding: '2px 6px' }}
              >
                {goalSaving ? '…' : '× entfernen'}
              </button>
            </div>
          )}

          {/* SECONDARY: Bookmark + Tracker + KI */}
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => onToggleBookmark(job.id)}
              disabled={bookmarkLoading}
              style={{
                flex: 1,
                padding: '9px 12px',
                background: isBookmarked ? '#FFF7ED' : '#F9FAFB',
                border: `1.5px solid ${isBookmarked ? '#FDBA74' : '#E5E0D8'}`,
                borderRadius: 8,
                fontSize: 12, fontWeight: 600,
                color: isBookmarked ? '#C2410C' : '#374151',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
              }}
            >
              {isBookmarked ? '❤️ Gemerkt' : '🤍 Merken'}
            </button>

            {tier >= 2 && (
              <a
                href="/dashboard/bewerbungen"
                style={{
                  flex: 1,
                  padding: '9px 12px',
                  background: '#F0FDF4',
                  border: '1.5px solid #BBF7D0',
                  borderRadius: 8,
                  fontSize: 12, fontWeight: 600,
                  color: '#166534',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                  textDecoration: 'none',
                }}
              >
                📋 Tracker
              </a>
            )}

            {tier >= 3 && (
              <a
                href={`/dashboard/ai?jobId=${job.id}`}
                style={{
                  flex: 1,
                  padding: '9px 12px',
                  background: 'linear-gradient(135deg, #EEF2FF, #F5F3FF)',
                  border: '1.5px solid #C7D2FE',
                  borderRadius: 8,
                  fontSize: 12, fontWeight: 600,
                  color: '#4338CA',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                  textDecoration: 'none',
                }}
              >
                🤖 KI-Bewerbung
              </a>
            )}
          </div>

          {/* TERTIARY: externer Link — bewusst klein und dezent */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, paddingTop: 2 }}>
            <a
              href={job.source_url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: 11,
                color: '#9CA3AF',
                textDecoration: 'none',
                display: 'inline-flex', alignItems: 'center', gap: 4,
              }}
            >
              ↗ Direkt zum Inserat beim Anbieter
            </a>
          </div>

          {tier === 1 && (
            <div style={{ textAlign: 'center', fontSize: 11, color: '#9CA3AF' }}>
              Pro: Tracker · AI: Bewerbung generieren —{' '}
              <a href="/dashboard/profil" style={{ color: '#E67E22', textDecoration: 'none', fontWeight: 600 }}>
                Upgrade
              </a>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
