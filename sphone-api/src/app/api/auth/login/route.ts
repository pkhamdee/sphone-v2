import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { loginCustomer } from '@/infrastructure/container'

const schema = z.object({
  nationalId: z.string().regex(/^\d{13}$/),
  phoneNumber: z.string().regex(/^0[689]\d{8}$/),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const input = schema.parse(body)
    const result = await loginCustomer.execute(input)
    return NextResponse.json(result)
  } catch (err: any) {
    if (err?.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation error' }, { status: 400 })
    }
    if (err.message === 'Invalid credentials') {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
