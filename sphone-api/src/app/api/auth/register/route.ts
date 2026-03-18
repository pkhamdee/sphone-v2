import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { registerCustomer } from '@/infrastructure/container'

const schema = z.object({
  nationalId: z.string().regex(/^\d{13}$/, 'National ID must be 13 digits'),
  fullName: z.string().min(1),
  phoneNumber: z.string().regex(/^0[689]\d{8}$/, 'Invalid Thai mobile number'),
  dateOfBirth: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const input = schema.parse(body)
    const result = await registerCustomer.execute(input)
    return NextResponse.json(result, { status: 201 })
  } catch (err: any) {
    if (err?.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation error', details: err.errors }, { status: 400 })
    }
    return NextResponse.json({ error: err.message }, { status: err.message?.includes('already exists') ? 409 : 400 })
  }
}
