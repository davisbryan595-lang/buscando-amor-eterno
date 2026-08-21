import { createHmac, timingSafeEqual } from 'crypto'

const SESSION_TTL_SECONDS = 60 * 60 * 12

function getAdminEmails() {
  return (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)
}

function getAccessCode() {
  return process.env.ADMIN_ACCESS_CODE || ''
}

function getSessionSecret() {
  return process.env.ADMIN_SESSION_SECRET || getAccessCode()
}

function sign(value: string) {
  return createHmac('sha256', getSessionSecret()).update(value).digest('base64url')
}

export function verifyAdminCredentials(email: string, accessCode: string) {
  const normalizedEmail = email.trim().toLowerCase()
  const configuredCode = getAccessCode()
  return Boolean(configuredCode) && getAdminEmails().includes(normalizedEmail) && accessCode === configuredCode
}

export function createAdminToken(email: string) {
  const payload = Buffer.from(
    JSON.stringify({ email: email.trim().toLowerCase(), expiresAt: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS })
  ).toString('base64url')
  return `${payload}.${sign(payload)}`
}

export function getAdminEmailFromRequest(request: Request) {
  const authorization = request.headers.get('authorization')
  if (!authorization?.startsWith('Bearer ')) return null

  const token = authorization.slice(7)
  const [payload, signature] = token.split('.')
  if (!payload || !signature || !getSessionSecret()) return null

  const expectedSignature = sign(payload)
  const signaturesMatch = signature.length === expectedSignature.length && timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  )
  if (!signaturesMatch) return null

  try {
    const session = JSON.parse(Buffer.from(payload, 'base64url').toString()) as {
      email?: string
      expiresAt?: number
    }
    if (!session.email || !session.expiresAt || session.expiresAt < Math.floor(Date.now() / 1000)) return null
    if (!getAdminEmails().includes(session.email)) return null
    return session.email
  } catch {
    return null
  }
}
