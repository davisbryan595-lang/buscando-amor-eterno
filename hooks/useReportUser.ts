import { useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/auth-context'
import { toast } from 'sonner'

export function useReportUser() {
  const { user } = useAuth()

  const reportUser = useCallback(
    async (reportedUserId: string, reason: string, description?: string) => {
      if (!user) {
        throw new Error('Not authenticated')
      }

      if (user.id === reportedUserId) {
        throw new Error('You cannot report yourself')
      }

      try {
        const { error: err } = await supabase.from('reports').insert({
          reported_user_id: reportedUserId,
          reported_by_user_id: user.id,
          reason,
          description: description || null,
        })

        if (err) throw err

        toast.success('Report submitted to moderators')
        return true
      } catch (err: any) {
        const errorMessage = err?.message || 'Failed to submit report'
        console.error('Error submitting report:', errorMessage, err)
        toast.error(errorMessage)
        throw err
      }
    },
    [user]
  )

  return { reportUser }
}
