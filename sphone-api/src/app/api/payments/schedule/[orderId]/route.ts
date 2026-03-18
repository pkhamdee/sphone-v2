import { NextRequest, NextResponse } from 'next/server'
import { getPaymentSchedule } from '@/infrastructure/container'
import { extractCustomerId } from '@/app/api/_middleware/auth'

export async function GET(req: NextRequest, { params }: { params: Promise<{ orderId: string }> }) {
  try {
    extractCustomerId(req) // ensure authenticated
    const { orderId } = await params
    const result = await getPaymentSchedule.execute(orderId)
    return NextResponse.json(result)
  } catch (err: any) {
    if (err.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: err.message }, { status: 404 })
  }
}
