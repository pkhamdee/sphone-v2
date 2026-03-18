import { NextRequest } from 'next/server'
import { jwtService } from '@/infrastructure/container'

export function extractCustomerId(req: NextRequest): string {
  const authHeader = req.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error('Unauthorized')
  }
  const token = authHeader.slice(7)
  try {
    const payload = jwtService.verifyToken(token)
    return payload.customerId
  } catch {
    throw new Error('Unauthorized')
  }
}
