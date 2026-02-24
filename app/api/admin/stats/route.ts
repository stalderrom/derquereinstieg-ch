import { NextResponse } from 'next/server'
import { getStats, getApiFetchLogs } from '@/lib/jobs/storage'

export async function GET() {
  try {
    const [stats, logs] = await Promise.all([
      getStats(),
      getApiFetchLogs(10),
    ])
    return NextResponse.json({ stats, recentLogs: logs })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
