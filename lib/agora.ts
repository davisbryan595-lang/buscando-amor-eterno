import crypto from 'crypto'

const appCertificate = process.env.AGORA_APP_CERTIFICATE || ''

export interface AgoraTokenResponse {
  token: string
  uid: number
  channelName: string
}

/**
 * Generates a private channel name from two user IDs
 * Uses sorted IDs to ensure consistent naming regardless of call direction
 */
export function generateChannelName(userId1: string, userId2: string): string {
  const sorted = [userId1, userId2].sort()
  return `match-${sorted[0]}-${sorted[1]}`
}

/**
 * Generates an Agora RTC token using the Agora token algorithm
 * Reference: https://docs.agora.io/en/video-calling/develop/authentication-workflow
 */
export function generateAgoraToken(
  appId: string,
  channelName: string,
  uid: number,
  expirationTimeInSeconds: number = 3600
): string {
  const VERSION = '007'
  const currentTimestamp = Math.floor(Date.now() / 1000)
  const expireTimestamp = currentTimestamp + expirationTimeInSeconds

  // Create the message to sign
  const msg = Buffer.concat([
    Buffer.from(appId, 'utf-8'),
    Buffer.from(channelName, 'utf-8'),
    Buffer.alloc(4), // reserved (4 bytes of 0)
    Buffer.alloc(4), // reserved (4 bytes of 0)
  ])

  // Sign with HMAC-SHA256
  let hmac = crypto.createHmac('sha256', appCertificate)
  hmac.update(msg)
  const signature = hmac.digest()

  // Create final message buffer
  const finalMsg = Buffer.concat([msg, signature])
  const token = VERSION + appId + ':' + finalMsg.toString('hex')

  return token
}

/**
 * Validates that the user IDs are valid UUID v4 format
 */
export function isValidUserId(id: string): boolean {
  const uuidv4Regex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidv4Regex.test(id)
}

/**
 * Converts a user ID to a numeric UID for Agora
 * Agora requires numeric UIDs (0-4294967295)
 */
export function userIdToAgoraUid(userId: string): number {
  // Use the first 8 chars of the user ID to generate a consistent numeric UID
  const hex = userId.replace(/-/g, '').slice(0, 8)
  const uid = parseInt(hex, 16) % 4294967295
  return uid || 1 // Ensure we never return 0 (reserved for anonymous)
}
