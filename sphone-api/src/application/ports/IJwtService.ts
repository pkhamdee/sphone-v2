export interface JwtPayload {
  customerId: string
  nationalId: string
  name: string
}

export interface IJwtService {
  generateToken(payload: JwtPayload): string
  verifyToken(token: string): JwtPayload
}
