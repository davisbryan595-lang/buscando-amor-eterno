import { useEffect } from 'react'
import { useAuth } from '@/context/auth-context'
import { supabase } from '@/lib/supabase'

const INACTIVITY_TIMEOUT = 30 * 60 * 1000 // 30 minutes in milliseconds

/**
 * Hook to automatically logout user after 30 minutes of inactivity
 * Tracks: mouse movement, keyboard input, and scrolling
 * Resets inactivity timer on any activity
 */
export function useInactivityLogout() {
  const { user } = useAuth()

  useEffect(() => {
    // Only set up inactivity logout if user is authenticated
    if (!user) return

    let inactivityTimeout: NodeJS.Timeout

    const resetInactivityTimer = () => {
      // Clear existing timeout
      if (inactivityTimeout) {
        clearTimeout(inactivityTimeout)
      }

      // Set new timeout for inactivity logout
      inactivityTimeout = setTimeout(async () => {
        console.log('[Inactivity] User inactive for 30 minutes - logging out')
        try {
          await supabase.auth.signOut()
          console.log('[Inactivity] User logged out successfully')
        } catch (error) {
          console.error('[Inactivity] Error during logout:', error)
        }
      }, INACTIVITY_TIMEOUT)
    }

    // Initialize timer
    resetInactivityTimer()

    // Activity listeners - reset timer on any activity
    const activityEvents = ['mousemove', 'keydown', 'scroll', 'click', 'touchstart']

    const handleActivity = () => {
      resetInactivityTimer()
    }

    // Attach activity listeners
    activityEvents.forEach((event) => {
      window.addEventListener(event, handleActivity)
    })

    // Cleanup
    return () => {
      if (inactivityTimeout) {
        clearTimeout(inactivityTimeout)
      }
      activityEvents.forEach((event) => {
        window.removeEventListener(event, handleActivity)
      })
    }
  }, [user])
}
