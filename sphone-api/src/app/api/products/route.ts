import { NextRequest, NextResponse } from 'next/server'
import { getProducts } from '@/infrastructure/container'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl
    const category = searchParams.get('category')
    const result = await getProducts.execute(category ? parseInt(category) : undefined)
    return NextResponse.json(result)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
