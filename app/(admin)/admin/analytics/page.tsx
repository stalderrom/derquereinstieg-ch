'use client'

import { useEffect, useState } from 'react'
import {
  AreaChart, Area, BarChart, Bar, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'

interface DayEntry { date: string; added: number; removed: number; total: number }
interface SourceEntry { name: string; count: number }
interface RegionEntry { region: string; count: number }
interface CategoryEntry { category: string; count: number }
interface Analytics {
  dailyTrend: DayEntry[]
  bySource: SourceEntry[]
  byRegion: RegionEntry[]
  byCategory: CategoryEntry[]
  summary: { addedLast7d: number; removedLast7d: number; addedToday: number; removedToday: number }
}

const C = {
  bg: '#0f1117', card: '#161b27', border: '#1e2a3a',
  text: '#f1f5f9', muted: '#64748b', sub: '#94a3b8',
  blue: '#3b82f6', green: '#22c55e', red: '#f43f5e',
  purple: '#a855f7', amber: '#f59e0b', teal: '#14b8a6',
}

function KPI({ label, value, sub, color = C.blue }: { label: string; value: number | string; sub?: string; color?: string }) {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: '20px 24px', flex: '1 1 160px', minWidth: 140 }}>
      <div style={{ fontSize: 12, color: C.muted, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
      <div style={{ fontSize: 34, fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: C.muted, marginTop: 6 }}>{sub}</div>}
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 style={{ fontSize: 15, fontWeight: 600, color: C.sub, margin: '0 0 16px', letterSpacing: '-0.2px' }}>{children}</h2>
}

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 24, ...style }}>
      {children}
    </div>
  )
}

// Formatiert Datum "2026-02-24" → "24.02."
function fmtDate(d: string) {
  const [, m, day] = d.split('-')
  return `${day}.${m}.`
}

// Custom Tooltip für Recharts
function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#1e2d40', border: `1px solid ${C.border}`, borderRadius: 8, padding: '10px 14px', fontSize: 13 }}>
      <div style={{ color: C.muted, marginBottom: 6 }}>{label}</div>
      {payload.map(p => (
        <div key={p.name} style={{ color: p.color, fontWeight: 600 }}>{p.name}: {p.value}</div>
      ))}
    </div>
  )
}

// Horizontale Bar-Zeile
function HBar({ label, value, max, color, total }: { label: string; value: number; max: number; color: string; total: number }) {
  const pct = max > 0 ? (value / max) * 100 : 0
  const share = total > 0 ? Math.round((value / total) * 100) : 0
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
        <span style={{ fontSize: 13, color: C.sub, maxWidth: '70%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{value} <span style={{ fontWeight: 400, color: C.muted, fontSize: 11 }}>({share}%)</span></span>
      </div>
      <div style={{ height: 6, background: C.border, borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 3, transition: 'width 0.6s ease' }} />
      </div>
    </div>
  )
}

const SOURCE_COLORS: Record<string, string> = {
  adzuna: C.blue, 'jobs.ch': C.purple, jobscout24: C.teal,
}

const CAT_COLORS = [C.blue, C.teal, C.green, C.purple, C.amber, '#ec4899', '#f97316', '#06b6d4', '#84cc16', '#a78bfa', C.red]

export default function AnalyticsPage() {
  const [data, setData] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<{ total: number; active: number } | null>(null)

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/analytics').then(r => r.json()),
      fetch('/api/admin/stats').then(r => r.json()),
    ]).then(([analytics, statsJson]) => {
      setData(analytics)
      setStats(statsJson.stats)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  if (loading) return (
    <div style={{ padding: 40, color: C.muted, fontSize: 14 }}>Lade Analytics...</div>
  )
  if (!data) return (
    <div style={{ padding: 40, color: '#f87171', fontSize: 14 }}>Fehler beim Laden.</div>
  )

  const totalActive = stats?.active ?? 0
  const totalAll = stats?.total ?? 0
  const maxRegion = Math.max(...data.byRegion.map(r => r.count), 1)
  const maxCat = Math.max(...data.byCategory.map(c => c.count), 1)
  const maxSource = Math.max(...data.bySource.map(s => s.count), 1)

  // Trendlinie: nur Tage mit Daten beschriften (jeden 5.)
  const trendWithLabel = data.dailyTrend.map((d, i) => ({
    ...d,
    label: i % 5 === 0 ? fmtDate(d.date) : '',
  }))

  return (
    <div style={{ padding: '32px 40px', maxWidth: 1200 }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: C.text, margin: 0 }}>Analytics</h1>
        <p style={{ fontSize: 14, color: C.muted, marginTop: 6 }}>
          Tägliche Entwicklung · Regionale Verteilung · Kategorien
        </p>
      </div>

      {/* KPI Row */}
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 28 }}>
        <KPI label="Aktive Inserate" value={totalActive} sub={`${totalAll - totalActive} inaktiv`} color={C.blue} />
        <KPI label="Neu heute" value={data.summary.addedToday} color={C.green} />
        <KPI label="Entfernt heute" value={data.summary.removedToday} color={C.red} />
        <KPI label="Neu (7 Tage)" value={data.summary.addedLast7d} color={C.teal} />
        <KPI label="Entfernt (7 Tage)" value={data.summary.removedLast7d} sub="bestätigt offline" color={C.amber} />
      </div>

      {/* Trend Chart */}
      <Card style={{ marginBottom: 24 }}>
        <SectionTitle>Tägliche Entwicklung — letzte 30 Tage</SectionTitle>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={trendWithLabel} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="gAdded" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={C.green} stopOpacity={0.25} />
                <stop offset="95%" stopColor={C.green} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gRemoved" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={C.red} stopOpacity={0.2} />
                <stop offset="95%" stopColor={C.red} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
            <XAxis dataKey="label" tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: 12, color: C.sub, paddingTop: 12 }}
              formatter={(value) => value === 'added' ? 'Neu' : 'Entfernt'}
            />
            <Area type="monotone" dataKey="added" name="added" stroke={C.green} strokeWidth={2} fill="url(#gAdded)" dot={false} />
            <Area type="monotone" dataKey="removed" name="removed" stroke={C.red} strokeWidth={2} fill="url(#gRemoved)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {/* Active Total Trend */}
      <Card style={{ marginBottom: 24 }}>
        <SectionTitle>Gesamtbestand aktiver Inserate — letzte 30 Tage</SectionTitle>
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart data={trendWithLabel} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="gTotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={C.blue} stopOpacity={0.3} />
                <stop offset="95%" stopColor={C.blue} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
            <XAxis dataKey="label" tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="total" name="total" stroke={C.blue} strokeWidth={2.5} fill="url(#gTotal)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {/* Region + Kategorie nebeneinander */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        {/* Region */}
        <Card>
          <SectionTitle>Stellen nach Region</SectionTitle>
          {data.byRegion.map((r, i) => (
            <HBar
              key={r.region}
              label={r.region}
              value={r.count}
              max={maxRegion}
              total={totalActive}
              color={[C.blue, C.teal, C.purple, C.green, C.amber, '#ec4899', '#f97316', '#06b6d4'][i % 8]}
            />
          ))}
        </Card>

        {/* Quelle */}
        <Card>
          <SectionTitle>Stellen nach Quelle</SectionTitle>
          {data.bySource.map(s => (
            <HBar
              key={s.name}
              label={s.name}
              value={s.count}
              max={maxSource}
              total={totalActive}
              color={SOURCE_COLORS[s.name] ?? C.blue}
            />
          ))}

          {/* Quelle als Bar-Chart */}
          <div style={{ marginTop: 28 }}>
            <SectionTitle>Quell-Vergleich</SectionTitle>
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={data.bySource} margin={{ top: 0, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
                <XAxis dataKey="name" tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Stellen" radius={[4, 4, 0, 0]}>
                  {data.bySource.map((s, i) => (
                    <Cell key={i} fill={SOURCE_COLORS[s.name] ?? C.blue} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Kategorien */}
      <Card style={{ marginBottom: 24 }}>
        <SectionTitle>Stellen nach Berufsfeld (automatische Erkennung aus Titeln)</SectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 40px' }}>
          {data.byCategory.map((c, i) => (
            <HBar
              key={c.category}
              label={c.category}
              value={c.count}
              max={maxCat}
              total={totalActive}
              color={CAT_COLORS[i % CAT_COLORS.length]}
            />
          ))}
        </div>

        {/* Kategorie-Bar-Chart */}
        <div style={{ marginTop: 24 }}>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={data.byCategory} margin={{ top: 0, right: 8, left: -20, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
              <XAxis
                dataKey="category"
                tick={{ fill: C.muted, fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                angle={-30}
                textAnchor="end"
                interval={0}
              />
              <YAxis tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Stellen" radius={[4, 4, 0, 0]}>
                {data.byCategory.map((_, i) => (
                  <Cell key={i} fill={CAT_COLORS[i % CAT_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div style={{ fontSize: 11, color: C.muted, textAlign: 'right' }}>
        Aktualisiert täglich automatisch via Cron · 07:00 MEZ
      </div>
    </div>
  )
}
