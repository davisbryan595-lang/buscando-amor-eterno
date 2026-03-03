/**
 * Client-safe Agora utilities
 * These helpers do NOT import server-only dependencies like 'agora-access-token'
 */

export interface AgoraTokenResponse {
  token: string
  uid: number
  channelName: string
}

/**
 * Generates a private channel name from two user IDs
 * Uses sorted IDs to ensure consistent naming regardless of call direction
 * Keeps names under 64 bytes for Agora compatibility by using first 8 chars of each UUID
 */
export function generateChannelName(userId1: string, userId2: string): string {
  const sorted = [userId1, userId2].sort()
  const id1 = sorted[0].replace(/-/g, '').slice(0, 8)
  const id2 = sorted[1].replace(/-/g, '').slice(0, 8)
  return `match${id1}${id2}`
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
