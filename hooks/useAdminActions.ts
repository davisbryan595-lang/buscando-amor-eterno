import { useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/auth-context'

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

  const banUser = useCallback(
    async (options: BanUserOptions) => {
      if (!user) throw new Error('Not authenticated')

      try {
        const now = new Date().toISOString()

        const { error: err } = await supabase
          .from('profiles')
          .update({
            banned: true,
            ban_reason: options.reason,
            ban_duration: options.duration || 'permanent',
            ban_date: now,
          })
          .eq('user_id', options.userId)

        if (err) throw err

        // Log admin activity
        await supabase.from('admin_activity_logs').insert({
          admin_id: user.id,
          action_type: 'ban_user',
          target_user_id: options.userId,
          details: {
            reason: options.reason,
            duration: options.duration || 'permanent',
          },
        })

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
      if (!user) throw new Error('Not authenticated')

      try {
        const { error: err } = await supabase
          .from('profiles')
          .update({
            banned: false,
            ban_reason: null,
            ban_duration: null,
            ban_date: null,
          })
          .eq('user_id', userId)

        if (err) throw err

        // Log admin activity
        await supabase.from('admin_activity_logs').insert({
          admin_id: user.id,
          action_type: 'unban_user',
          target_user_id: userId,
        })

        return true
      } catch (err: any) {
        console.error('Error unbanning user:', err)
        throw err
      }
    },
    [user]
  )

  const verifyUser = useCallback(
    async (userId: string) => {
      if (!user) throw new Error('Not authenticated')

      try {
        const { error: err } = await supabase
          .from('profiles')
          .update({
            verified: true,
          })
          .eq('user_id', userId)

        if (err) throw err

        // Log admin activity
        await supabase.from('admin_activity_logs').insert({
          admin_id: user.id,
          action_type: 'verify_user',
          target_user_id: userId,
        })

        return true
      } catch (err: any) {
        console.error('Error verifying user:', err)
        throw err
      }
    },
    [user]
  )

  return {
    banUser,
    unbanUser,
    verifyUser,
  }
}
