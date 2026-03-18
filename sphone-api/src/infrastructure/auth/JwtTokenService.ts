import jwt from 'jsonwebtoken'
import { IJwtService, JwtPayload } from '../../application/ports/IJwtService'

export class JwtTokenService implements IJwtService {
  private readonly secret: string
  private readonly expiryHours: number

  constructor() {
    this.secret = process.env.JWT_SECRET ?? 'sphone-super-secret-key-minimum-32-characters!!'
    this.expiryHours = parseInt(process.env.JWT_EXPIRY_HOURS ?? '24', 10)
  }

  generateToken(payload: JwtPayload): string {
    return jwt.sign(payload, this.secret, {
      expiresIn: `${this.expiryHours}h`,
      issuer: 'sphone-api',
      audience: 'sphone-app',
      jwtid: crypto.randomUUID(),
    })
  }

  verifyToken(token: string): JwtPayload {
    const decoded = jwt.verify(token, this.secret, {
      issuer: 'sphone-api',
      audience: 'sphone-app',
    }) as JwtPayload & jwt.JwtPayload
    return {
      customerId: decoded.customerId,
      nationalId: decoded.nationalId,
      name: decoded.name,
    }
  }
}
