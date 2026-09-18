import crypto from 'crypto'

/**
 * Demo-grade session signing.
 *
 * The session cookie carries `<userId>.<roleCodes>.<hmac>` where the HMAC
 * is computed over `userId.roleCodes.expiry` using the session secret. This
 * is stateless (no session table) and survives process restarts, which fits
 * the sandbox deployment model.
 *
 * Production would use a server-side session store + rotated secret; this
 * is documented as a demo limitation in the README.
 */

const SESSION_SECRET =
  process.env.SESSION_SECRET ||
  'yemen-legislation-demo-session-secret-do-not-use-in-production'

const COOKIE_NAME = 'yl_session'
const MAX_AGE_SECONDS = 7 * 24 * 60 * 60 // 7 days

export interface SessionPayload {
  userId: string
  username: string
  roleCodes: string[]
  expiry: number // epoch ms
}

export function getSessionCookieName() {
  return COOKIE_NAME
}

export function getSessionMaxAge() {
  return MAX_AGE_SECONDS
}

function sign(message: string): string {
  return crypto.createHmac('sha256', SESSION_SECRET).update(message).digest('hex')
}

/**
 * Create a signed session cookie value for the given payload.
 */
export function createSessionCookieValue(payload: SessionPayload): string {
  const roleStr = payload.roleCodes.join(',')
  const message = `${payload.userId}.${payload.username}.${roleStr}.${payload.expiry}`
  const mac = sign(message)
  return `${message}.${mac}`
}

/**
 * Verify a cookie value and return the payload, or null if invalid/expired.
 */
export function verifySessionCookieValue(value: string | undefined | null): SessionPayload | null {
  if (!value) return null
  const parts = value.split('.')
  // Expected: userId.username.roles.expiry.mac
  // roles is comma-joined, so reconstruct carefully: everything between
  // the 3rd dot and the last dot is "roles.expiry" but roles has no dots,
  // so we can split on dots and expect exactly 5 segments.
  if (parts.length !== 5) return null
  const [userId, username, roleStr, expiryStr, mac] = parts
  if (!userId || !username || !roleStr || !expiryStr || !mac) return null

  const message = `${userId}.${username}.${roleStr}.${expiryStr}`
  const expectedMac = sign(message)
  // Constant-time comparison.
  if (mac.length !== expectedMac.length) return null
  if (!crypto.timingSafeEqual(Buffer.from(mac, 'hex'), Buffer.from(expectedMac, 'hex'))) {
    return null
  }

  const expiry = parseInt(expiryStr, 10)
  if (!Number.isFinite(expiry)) return null
  if (Date.now() > expiry) return null

  return {
    userId,
    username,
    roleCodes: roleStr.split(',').filter(Boolean),
    expiry,
  }
}

/**
 * Build the Set-Cookie header string for a session.
 */
export function buildSessionCookieHeader(payload: SessionPayload): string {
  const value = createSessionCookieValue(payload)
  const flags = [
    `${COOKIE_NAME}=${value}`,
    'Path=/',
    `Max-Age=${MAX_AGE_SECONDS}`,
    'HttpOnly',
    'SameSite=Lax',
  ]
  // In production behind HTTPS, add Secure.
  if (process.env.NODE_ENV === 'production') flags.push('Secure')
  return flags.join('; ')
}

/**
 * Build the Set-Cookie header string that clears the session.
 */
export function buildClearSessionCookieHeader(): string {
  const flags = [
    `${COOKIE_NAME}=`,
    'Path=/',
    'Max-Age=0',
    'HttpOnly',
    'SameSite=Lax',
  ]
  return flags.join('; ')
}
