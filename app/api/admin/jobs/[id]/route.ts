import { NextRequest, NextResponse } from 'next/server'
import { deleteJob, deactivateJob } from '@/lib/jobs/storage'

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(req.url)
    const soft = searchParams.get('soft') === 'true'

    if (soft) {
      await deactivateJob(id)
    } else {
      await deleteJob(id)
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
