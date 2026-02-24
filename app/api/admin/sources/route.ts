import { NextRequest, NextResponse } from 'next/server'
import { getSources, createSource } from '@/lib/jobs/storage'

export async function GET() {
  try {
    const sources = await getSources()
    return NextResponse.json({ sources })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, url, type } = body

    if (!name || !url) {
      return NextResponse.json(
        { error: 'name und url sind Pflichtfelder' },
        { status: 400 }
      )
    }

    const source = await createSource({
      name,
      url,
      type: type ?? 'career',
      is_active: true,
    })

    return NextResponse.json({ source }, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
