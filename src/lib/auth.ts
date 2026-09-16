import bcrypt from 'bcryptjs'
import crypto from 'crypto'

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(12)
  return bcrypt.hash(password, salt)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export function generateToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

export function generateTrackingNumber(): string {
  const ts = Date.now().toString(36).toUpperCase()
  const rand = crypto.randomBytes(4).toString('hex').toUpperCase()
  return `YE-${ts}-${rand}`
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex')
}
