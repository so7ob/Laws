/**
 * Demo-grade session signing (runtime-agnostic).
 *
 * The session cookie carries
 * `<userId>.<username>.<roles>.<expiry>.<mac>` where the HMAC is computed
 * over `userId.username.roles.expiry` using the session secret.
 *
 * Uses the Web Crypto API (SubtleCrypto) exclusively, which is available
 * in both the Node.js and Edge runtimes (Node 18+ exposes it globally).
 * All signing functions are therefore async.
 *
 * This is stateless (no session table) and survives process restarts,
 * which fits the sandbox deployment model. Production would use a
 * server-side session store + rotated secret; this is documented as a
 * demo limitation in the README.
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

// Cache the imported HMAC key so we don't re-import on every request.
let cachedKey: CryptoKey | null = null

async function getKey(): Promise<CryptoKey> {
  if (cachedKey) return cachedKey
  const enc = new TextEncoder()
  cachedKey = await crypto.subtle.importKey(
    'raw',
    enc.encode(SESSION_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  )
  return cachedKey
}

async function hmacHex(message: string): Promise<string> {
  const key = await getKey()
  const enc = new TextEncoder()
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(message))
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

/**
 * Create a signed session cookie value for the given payload.
 * Async — uses Web Crypto (Edge + Node compatible).
 */
export async function createSessionCookieValue(
  payload: SessionPayload
): Promise<string> {
  const roleStr = payload.roleCodes.join(',')
  const message = `${payload.userId}.${payload.username}.${roleStr}.${payload.expiry}`
  const mac = await hmacHex(message)
  return `${message}.${mac}`
}

/**
 * Verify a cookie value and return the payload, or null if invalid/expired.
 * Async — uses Web Crypto (Edge + Node compatible).
 */
export async function verifySessionCookieValue(
  value: string | undefined | null
): Promise<SessionPayload | null> {
  if (!value) return null
  const parts = value.split('.')
  // Expected: userId.username.roles.expiry.mac — 5 segments.
  if (parts.length !== 5) return null
  const [userId, username, roleStr, expiryStr, mac] = parts
  if (!userId || !username || !roleStr || !expiryStr || !mac) return null

  const message = `${userId}.${username}.${roleStr}.${expiryStr}`
  const expectedMac = await hmacHex(message)
  if (mac.length !== expectedMac.length) return null
  if (mac !== expectedMac) return null

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
export async function buildSessionCookieHeader(
  payload: SessionPayload
): Promise<string> {
  const value = await createSessionCookieValue(payload)
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
