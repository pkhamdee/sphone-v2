/**
 * Server-side proxy: sphone-app → sphone-api
 *
 * All browser API calls go through here so the Next.js Node.js runtime
 * makes the outbound HTTP request. The OTel HTTP instrumentation captures
 * this as a CLIENT span, creating the sphone-app → sphone-api edge in
 * the Tempo service graph.
 */
import { type NextRequest, NextResponse } from 'next/server'

const UPSTREAM = (process.env.INTERNAL_API_URL ?? 'http://sphone-api:8080') + '/api'

async function proxy(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params
  const upstream = new URL(`${UPSTREAM}/${path.join('/')}`)
  upstream.search = req.nextUrl.search

  const headers = new Headers()
  // Forward auth and content-type headers
  const auth = req.headers.get('authorization')
  const ct = req.headers.get('content-type')
  if (auth) headers.set('authorization', auth)
  if (ct) headers.set('content-type', ct)

  const body = req.method !== 'GET' && req.method !== 'HEAD' ? await req.arrayBuffer() : undefined

  const res = await fetch(upstream.toString(), {
    method: req.method,
    headers,
    body: body ?? undefined,
  })

  const resBody = await res.arrayBuffer()
  return new NextResponse(resBody, {
    status: res.status,
    headers: { 'content-type': res.headers.get('content-type') ?? 'application/json' },
  })
}

export const GET = proxy
export const POST = proxy
export const PUT = proxy
export const PATCH = proxy
export const DELETE = proxy
