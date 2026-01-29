import { useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/auth-context'
import { useAdminAuth } from '@/context/admin-auth-context'

export interface BanUserOptions {
  userId: string
  reason: string
  duration?: 'permanent' | '7d' | '30d'
}

export interface VerifyUserOptions {
  userId: string
}

export function useAdminActions() {
  const { user } = useAuth()
  const { isAdminAuthenticated } = useAdminAuth()

  const banUser = useCallback(
    async (options: BanUserOptions) => {
      if (!user && !isAdminAuthenticated) throw new Error('Not authenticated')

      try {
        const { data: { session } } = await supabase.auth.getSession()

        const response = await fetch('/api/admin/actions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token || 'admin'}`,
          },
          body: JSON.stringify({
            action: 'ban_user',
            userId: options.userId,
            adminId: user?.id || 'admin',
            reason: options.reason,
            duration: options.duration || 'permanent',
          }),
        })

        if (!response.ok) {
          throw new Error(`Failed to ban user: ${response.statusText}`)
        }

        return true
      } catch (err: any) {
        console.error('Error banning user:', err)
        throw err
      }
    },
    [user]
  )

  const unbanUser = useCallback(
    async (userId: string) => {
      if (!user && !isAdminAuthenticated) throw new Error('Not authenticated')

      try {
        const { data: { session } } = await supabase.auth.getSession()

        const response = await fetch('/api/admin/actions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token || 'admin'}`,
          },
          body: JSON.stringify({
            action: 'unban_user',
            userId,
            adminId: user?.id || 'admin',
          }),
        })

        if (!response.ok) {
          throw new Error(`Failed to unban user: ${response.statusText}`)
        }

        return true
      } catch (err: any) {
        console.error('Error unbanning user:', err)
        throw err
      }
    },
    [user, isAdminAuthenticated]
  )

  const verifyUser = useCallback(
    async (userId: string) => {
      if (!user && !isAdminAuthenticated) throw new Error('Not authenticated')

      try {
        const { data: { session } } = await supabase.auth.getSession()

        const response = await fetch('/api/admin/actions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token || 'admin'}`,
          },
          body: JSON.stringify({
            action: 'verify_user',
            userId,
            adminId: user?.id || 'admin',
          }),
        })

        if (!response.ok) {
          throw new Error(`Failed to verify user: ${response.statusText}`)
        }

        return true
      } catch (err: any) {
        console.error('Error verifying user:', err)
        throw err
      }
    },
    [user, isAdminAuthenticated]
  )

  return {
    banUser,
    unbanUser,
    verifyUser,
  }
}
