import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createOrder } from '@/infrastructure/container'
import { extractCustomerId } from '@/app/api/_middleware/auth'

const schema = z.object({
  productId: z.string().uuid(),
  downPayment: z.number().positive(),
  totalMonths: z.number().refine(v => [3, 6, 12, 18, 24].includes(v), 'Must be 3, 6, 12, 18, or 24'),
})

export async function POST(req: NextRequest) {
  try {
    const customerId = extractCustomerId(req)
    const body = await req.json()
    const input = schema.parse(body)
    const result = await createOrder.execute({ customerId, ...input })
    return NextResponse.json(result, { status: 201 })
  } catch (err: any) {
    if (err.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (err?.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation error', details: err.errors }, { status: 400 })
    }
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
