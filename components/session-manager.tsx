'use client'

import { useInactivityLogout } from '@/hooks/useInactivityLogout'

/**
 * SessionManager - Wraps inactivity logout hook
 * Add this component inside AuthProvider to enable 30-minute inactivity auto-logout
 */
export function SessionManager() {
  // Initialize inactivity logout hook
  useInactivityLogout()

  // This component doesn't render anything, just manages session state
  return null
}
