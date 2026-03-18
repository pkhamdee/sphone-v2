import { NextRequest, NextResponse } from 'next/server'
import { getCustomerProfile } from '@/infrastructure/container'
import { extractCustomerId } from '@/app/api/_middleware/auth'

export async function GET(req: NextRequest) {
  try {
    const customerId = extractCustomerId(req)
    const result = await getCustomerProfile.execute(customerId)
    return NextResponse.json(result)
  } catch (err: any) {
    if (err.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json({ error: err.message }, { status: 404 })
  }
}
