'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import RegionPicker from '@/components/dashboard/RegionPicker'
import JobDetailDrawer, { type DrawerJob, type CareerGoalInput } from '@/components/dashboard/JobDetailDrawer'

const CATEGORIES = [
  { value: '', label: 'Alle Berufsfelder' },
  { value: 'it', label: 'IT & Technik' },
  { value: 'pflege', label: 'Pflege & Gesundheit' },
  { value: 'handwerk', label: 'Handwerk & Bau' },
  { value: 'verkauf', label: 'Verkauf' },
  { value: 'logistik', label: 'Logistik' },
  { value: 'gastronomie', label: 'Gastronomie' },
  { value: 'paedagogik', label: 'Pädagogik' },
  { value: 'soziales', label: 'Soziales' },
  { value: 'buero', label: 'Büro & Verwaltung' },
]

interface Job {
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

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [category, setCategory] = useState('')
  const [regions, setRegions] = useState<string[]>([])
  const [showRegionPicker, setShowRegionPicker] = useState(false)
  const [q, setQ] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set())
  const [bookmarkLoading, setBookmarkLoading] = useState<string | null>(null)
  const [tier, setTier] = useState(1)
  const [bookmarkCount, setBookmarkCount] = useState(0)
  const [regionCounts, setRegionCounts] = useState<Record<string, number>>({})
  const [selectedJob, setSelectedJob] = useState<DrawerJob | null>(null)
  const [userSkillIds, setUserSkillIds] = useState<string[]>([])
  const [goalJobSourceUrl, setGoalJobSourceUrl] = useState<string | null>(null)
  const [userAge, setUserAge] = useState<number | undefined>(undefined)

  const supabase = createClient()

  // Profil + Init
  useEffect(() => {
    supabase.from('profiles').select('tier, target_field, regions, birthdate').single().then(({ data }) => {
      if (data) {
        setTier(data.tier)
        if (data.target_field && !category) setCategory(data.target_field)
        if (Array.isArray(data.regions) && data.regions.length > 0) {
          setRegions(data.regions)
        }
        if (data.birthdate) {
          const birthYear = parseInt(data.birthdate.substring(0, 4), 10)
          const age = new Date().getFullYear() - birthYear
          setUserAge(age)
        }
      }
    })
    // Job-Anzahl pro Region
    fetch('/api/user/jobs?counts=true').then(r => r.json()).then(d => {
      setRegionCounts(d.counts ?? {})
    })
    // Bookmarks
    fetch('/api/user/bookmarks').then(r => r.json()).then(d => {
      const ids = new Set<string>((d.bookmarks ?? []).map((b: { stellenanzeige_id: string }) => b.stellenanzeige_id))
      setBookmarkedIds(ids)
      setBookmarkCount(d.bookmarks?.length ?? 0)
    })
    // Skills aus localStorage (gespeichert in Einstiegspfad)
    try {
      const raw = localStorage.getItem('dqe_einstiegspfad')
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed.skills)) setUserSkillIds(parsed.skills)
      }
    } catch {}
    // Aktuelles Ziel laden (um "Als Ziel setzen" Status zu kennen)
    fetch('/api/user/goals').then(r => r.json()).then(d => {
      setGoalJobSourceUrl(d.goal?.job_source_url ?? null)
    })
  }, [])

  const loadJobs = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page) })
    if (category) params.set('category', category)
    if (regions.length > 0) params.set('regions', regions.join(','))
    if (q) params.set('q', q)
    const res = await fetch(`/api/user/jobs?${params}`)
    const data = await res.json()
    setJobs(data.jobs ?? [])
    setTotal(data.total ?? 0)
    setLoading(false)
  }, [page, category, regions, q])

  useEffect(() => { loadJobs() }, [loadJobs])

  async function toggleBookmark(jobId: string) {
    if (tier === 1 && bookmarkCount >= 20 && !bookmarkedIds.has(jobId)) {
      alert('Free-Tier: max 20 Bookmarks. Upgrade zu Pro für unbegrenzte Merkliste.')
      return
    }
    setBookmarkLoading(jobId)
    try {
      if (bookmarkedIds.has(jobId)) {
        const res = await fetch('/api/user/bookmarks')
        const data = await res.json()
        const bookmark = data.bookmarks?.find((b: { stellenanzeige_id: string; id: string }) => b.stellenanzeige_id === jobId)
        if (bookmark) {
          await fetch(`/api/user/bookmarks?id=${bookmark.id}`, { method: 'DELETE' })
          setBookmarkedIds(prev => { const n = new Set(prev); n.delete(jobId); return n })
          setBookmarkCount(c => c - 1)
        }
      } else {
        const res = await fetch('/api/user/bookmarks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ stellenanzeige_id: jobId }),
        })
        if (res.ok) {
          setBookmarkedIds(prev => new Set(prev).add(jobId))
          setBookmarkCount(c => c + 1)
        }
      }
    } finally {
      setBookmarkLoading(null)
    }
  }

  async function setGoal(snapshot: CareerGoalInput) {
    const res = await fetch('/api/user/goals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(snapshot),
    })
    if (res.ok) setGoalJobSourceUrl(snapshot.job_source_url)
  }

  async function removeGoal() {
    await fetch('/api/user/goals', { method: 'DELETE' })
    setGoalJobSourceUrl(null)
  }

  const totalPages = Math.ceil(total / 20)

  return (
    <div style={{ padding: '32px 40px', maxWidth: 1000, margin: '0 auto' }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1A2332', marginBottom: 8 }}>Jobs suchen</h1>
      <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 24 }}>
        {total.toLocaleString('de-CH')} Stellen gefunden
        {tier === 1 && <span style={{ marginLeft: 12, color: '#E67E22' }}>· {bookmarkCount}/20 Bookmarks genutzt</span>}
        {userSkillIds.length > 0 && (
          <span style={{ marginLeft: 12, color: '#6B7280' }}>
            · <span style={{ color: '#059669', fontWeight: 600 }}>✓ {userSkillIds.length} Skills</span> gespeichert — Klicke auf eine Stelle für den Quereinsteiger-Check
          </span>
        )}
        {userSkillIds.length === 0 && (
          <span style={{ marginLeft: 12 }}>
            ·{' '}
            <a href="/dashboard/einstiegspfad" style={{ color: '#E67E22', textDecoration: 'none', fontWeight: 600 }}>
              Skills eintragen
            </a>{' '}
            für Quereinsteiger-Check
          </span>
        )}
      </div>

      {/* Filter */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', marginBottom: 10 }}>
          <select
            value={category}
            onChange={e => { setCategory(e.target.value); setPage(1) }}
            style={{ padding: '8px 12px', borderRadius: 8, border: '1.5px solid #E5E0D8', fontSize: 13, background: '#fff', color: '#374151' }}
          >
            {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>

          <div style={{ display: 'flex', gap: 8, flex: 1, minWidth: 200 }}>
            <input
              type="text"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { setQ(searchInput); setPage(1) } }}
              placeholder="Suchbegriff…"
              style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1.5px solid #E5E0D8', fontSize: 13, outline: 'none' }}
            />
            <button
              onClick={() => { setQ(searchInput); setPage(1) }}
              style={{ padding: '8px 16px', background: '#E67E22', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, cursor: 'pointer' }}
            >
              Suchen
            </button>
          </div>
        </div>

        {/* Region-Chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: '#9CA3AF', fontWeight: 600, flexShrink: 0 }}>Region:</span>
          {regions.length === 0 ? (
            <span style={{ fontSize: 12, color: '#9CA3AF', fontStyle: 'italic' }}>Alle</span>
          ) : (
            regions.map(r => (
              <span key={r} style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                padding: '4px 10px',
                background: '#FFF7ED',
                border: '1.5px solid #FDBA74',
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 600,
                color: '#C2410C',
              }}>
                {r}
                <button
                  onClick={() => { setRegions(prev => { const n = prev.filter(x => x !== r); setPage(1); return n }) }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, lineHeight: 1, color: '#FB923C', fontSize: 13, fontWeight: 700 }}
                  title={`${r} entfernen`}
                >
                  ×
                </button>
              </span>
            ))
          )}
          <button
            onClick={() => setShowRegionPicker(v => !v)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              padding: '4px 10px',
              background: showRegionPicker ? '#FFF7ED' : '#F9FAFB',
              border: `1.5px solid ${showRegionPicker ? '#E67E22' : '#E5E0D8'}`,
              borderRadius: 20,
              fontSize: 12,
              color: showRegionPicker ? '#E67E22' : '#6B7280',
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            {showRegionPicker ? '▲ Schliessen' : '+ Region'}
          </button>
        </div>

        {/* Collapsible region picker */}
        {showRegionPicker && (
          <div style={{
            background: '#fff',
            border: '1.5px solid #E67E22',
            borderRadius: 10,
            padding: '16px 18px',
            marginTop: 8,
          }}>
            <RegionPicker
              selected={regions}
              onChange={(r) => { setRegions(r); setPage(1) }}
              compact
              jobCounts={regionCounts}
            />
          </div>
        )}
      </div>

      {/* Job-Liste */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E0D8' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#9CA3AF' }}>Lädt…</div>
        ) : jobs.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#9CA3AF', fontSize: 14 }}>
            Keine Stellen gefunden. Filter anpassen?
          </div>
        ) : (
          jobs.map((job, i) => (
            <div key={job.id} style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              padding: '14px 20px',
              borderBottom: i < jobs.length - 1 ? '1px solid #F3F4F6' : 'none',
              transition: 'background 0.1s',
            }}
              onMouseEnter={e => (e.currentTarget.style.background = '#FAFAF9')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                {/* Title — opens drawer */}
                <button
                  onClick={() => setSelectedJob(job)}
                  style={{
                    background: 'none', border: 'none', padding: 0,
                    fontSize: 14, fontWeight: 600, color: '#1A2332',
                    cursor: 'pointer', textAlign: 'left',
                    textDecoration: 'none',
                    display: 'block',
                    width: '100%',
                  }}
                >
                  {job.title}
                </button>
                <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>
                  {job.company}
                  {job.location && ` · ${job.location}`}
                  {!job.location && job.region && ` · ${job.region}`}
                  {job.category && (
                    <span style={{
                      marginLeft: 8,
                      fontSize: 10, fontWeight: 600,
                      background: '#F3F4F6', color: '#9CA3AF',
                      padding: '1px 6px', borderRadius: 20,
                    }}>
                      {job.category}
                    </span>
                  )}
                </div>
              </div>
              <div style={{ fontSize: 11, color: '#9CA3AF', flexShrink: 0 }}>
                {job.posted_at
                  ? new Date(job.posted_at).toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit' })
                  : new Date(job.first_seen_at).toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit' })}
              </div>
              <button
                onClick={() => toggleBookmark(job.id)}
                disabled={bookmarkLoading === job.id}
                title={bookmarkedIds.has(job.id) ? 'Aus Merkliste entfernen' : 'Zur Merkliste hinzufügen'}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  border: '1.5px solid #E5E0D8',
                  background: bookmarkedIds.has(job.id) ? '#FFF7ED' : '#fff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 16,
                  flexShrink: 0,
                  transition: 'all 0.15s',
                }}
              >
                {bookmarkedIds.has(job.id) ? '❤️' : '🤍'}
              </button>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 24 }}>
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            style={{ padding: '8px 16px', border: '1px solid #E5E0D8', borderRadius: 8, background: '#fff', cursor: page === 1 ? 'default' : 'pointer', color: page === 1 ? '#9CA3AF' : '#374151', fontSize: 13 }}
          >
            ← Zurück
          </button>
          <span style={{ padding: '8px 16px', fontSize: 13, color: '#6B7280' }}>
            Seite {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            style={{ padding: '8px 16px', border: '1px solid #E5E0D8', borderRadius: 8, background: '#fff', cursor: page === totalPages ? 'default' : 'pointer', color: page === totalPages ? '#9CA3AF' : '#374151', fontSize: 13 }}
          >
            Weiter →
          </button>
        </div>
      )}

      {/* Job Detail Drawer */}
      <JobDetailDrawer
        job={selectedJob}
        onClose={() => setSelectedJob(null)}
        userSkillIds={userSkillIds}
        isBookmarked={selectedJob ? bookmarkedIds.has(selectedJob.id) : false}
        onToggleBookmark={toggleBookmark}
        bookmarkLoading={bookmarkLoading === selectedJob?.id}
        tier={tier}
        isGoal={!!selectedJob && selectedJob.source_url === goalJobSourceUrl}
        onSetGoal={setGoal}
        onRemoveGoal={removeGoal}
        userAge={userAge}
      />
    </div>
  )
}
