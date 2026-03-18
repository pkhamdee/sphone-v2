import { NextRequest, NextResponse } from 'next/server'
import { getProductById } from '@/infrastructure/container'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const result = await getProductById.execute(id)
    return NextResponse.json(result)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 404 })
  }
}
