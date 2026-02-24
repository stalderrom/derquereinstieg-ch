import { NextRequest, NextResponse } from 'next/server'
import { getJobs, createJob } from '@/lib/jobs/storage'
import { detectCanton, cantonToRegion } from '@/lib/jobs/geo'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const filters = {
      canton: searchParams.get('canton') ?? undefined,
      region: searchParams.get('region') ?? undefined,
      source_name: searchParams.get('source_name') ?? undefined,
      is_active: searchParams.has('is_active')
        ? searchParams.get('is_active') === 'true'
        : undefined,
    }
    const jobs = await getJobs(filters)
    return NextResponse.json({ jobs })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { title, company, location, description, source_url, source_name } = body

    if (!title || !company || !source_url || !source_name) {
      return NextResponse.json(
        { error: 'title, company, source_url, source_name sind Pflichtfelder' },
        { status: 400 }
      )
    }

    const canton = detectCanton(location)
    const region = cantonToRegion(canton)

    const job = await createJob({
      title,
      company,
      location: location ?? '',
      canton,
      region,
      description: description ?? '',
      source_url,
      source_name,
      source_id: body.source_id ?? null,
      keywords: body.keywords ?? [],
      is_active: true,
      posted_at: body.posted_at ?? null,
      removed_at: null,
    })

    if (!job) {
      return NextResponse.json({ error: 'Stelle existiert bereits (duplicate URL)' }, { status: 409 })
    }

    return NextResponse.json({ job }, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
