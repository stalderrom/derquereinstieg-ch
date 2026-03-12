import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { categorize } from '@/lib/jobs/categories'

export async function GET() {
  try {
    const supabase = await createClient()

    // ── 1. Täglicher Trend (letzte 30 Tage) ────────────────────────────────────
    const since30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)

    const [verifyRes, newJobsRes] = await Promise.all([
      supabase
        .from('verification_log')
        .select('date, verified, removed, total_active_after')
        .gte('date', since30)
        .order('date'),
      // Alle neu gesehenen Jobs der letzten 30 Tage — erfasst ALLE Quellen
      // (Portale, APIs, Headless, Karriereseiten), nicht nur api_fetch_log
      supabase
        .from('stellenanzeigen')
        .select('first_seen_at')
        .gte('first_seen_at', since30 + 'T00:00:00Z'),
    ])

    // Neue Jobs pro Tag aggregieren (aus first_seen_at)
    const addedByDay: Record<string, number> = {}
    for (const row of newJobsRes.data ?? []) {
      const day = row.first_seen_at.slice(0, 10)
      addedByDay[day] = (addedByDay[day] ?? 0) + 1
    }

    // Letzten 30 Tage als Array aufbauen (auch Tage ohne Daten)
    const dailyTrend: { date: string; added: number; removed: number; total: number }[] = []
    for (let i = 29; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
      const verLog = verifyRes.data?.find(r => r.date === d)
      dailyTrend.push({
        date: d,
        added: addedByDay[d] ?? 0,
        removed: verLog?.removed ?? 0,
        total: verLog?.total_active_after ?? 0,
      })
    }

    // ── 2. Nach Quelle ──────────────────────────────────────────────────────────
    const { data: sourceData } = await supabase
      .from('stellenanzeigen')
      .select('source_name')
      .eq('is_active', true)

    const sourceCounts: Record<string, number> = {}
    for (const row of sourceData ?? []) {
      sourceCounts[row.source_name] = (sourceCounts[row.source_name] ?? 0) + 1
    }
    const bySource = Object.entries(sourceCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)

    // ── 3. Nach Region ──────────────────────────────────────────────────────────
    const ALL_REGIONS = ['Zürich', 'Zentralschweiz', 'Nordwestschweiz', 'Bern/Mittelland', 'Ostschweiz', 'Vaud/Waadt', 'Wallis', 'Tessin']
    const { data: regionData } = await supabase
      .from('stellenanzeigen')
      .select('region')
      .eq('is_active', true)

    const regionCounts: Record<string, number> = Object.fromEntries(ALL_REGIONS.map(r => [r, 0]))
    for (const row of regionData ?? []) {
      const r = row.region ?? 'unzuordnungsbar'
      if (r !== 'unzuordnungsbar') regionCounts[r] = (regionCounts[r] ?? 0) + 1
    }
    const byRegion = ALL_REGIONS.map(region => ({ region, count: regionCounts[region] ?? 0 }))
      .sort((a, b) => b.count - a.count)

    // ── 4. Nach Kategorie (Titel-Analyse) ──────────────────────────────────────
    const { data: titleData } = await supabase
      .from('stellenanzeigen')
      .select('title')
      .eq('is_active', true)

    const categoryCounts: Record<string, number> = {}
    for (const row of titleData ?? []) {
      const cat = categorize(row.title ?? '')
      categoryCounts[cat] = (categoryCounts[cat] ?? 0) + 1
    }
    const byCategory = Object.entries(categoryCounts)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)

    // ── 5. Summary ──────────────────────────────────────────────────────────────
    const last7 = dailyTrend.slice(-7)
    const summary = {
      addedLast7d: last7.reduce((s, d) => s + d.added, 0),
      removedLast7d: last7.reduce((s, d) => s + d.removed, 0),
      addedToday: dailyTrend.at(-1)?.added ?? 0,
      removedToday: dailyTrend.at(-1)?.removed ?? 0,
    }

    return NextResponse.json({ dailyTrend, bySource, byRegion, byCategory, summary })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
