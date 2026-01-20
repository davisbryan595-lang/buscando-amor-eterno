import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/auth-context'

export interface Report {
  id: string
  reported_user_id: string
  reported_by_user_id: string
  reason: string
  description: string | null
  status: 'pending' | 'reviewed' | 'dismissed' | 'action_taken'
  action_taken: string | null
  reported_at: string
  reviewed_at: string | null
  reviewed_by_admin_id: string | null
  created_at: string
  updated_at: string
  reported_user?: {
    id: string
    full_name: string
    photos: string[]
  }
  reported_by?: {
    id: string
    full_name: string
  }
}

export function useAdminReports() {
  const { user } = useAuth()
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: err } = await supabase
        .from('reports')
        .select(
          `
          *,
          reported_user:reported_user_id(id, full_name, photos),
          reported_by:reported_by_user_id(id, full_name)
          `
        )
        .order('created_at', { ascending: false })

      if (err) throw err

      setReports(data as Report[])
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to fetch reports'
      setError(errorMessage)
      console.error('Error fetching reports:', errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchReports()
  }, [fetchReports])

  const dismissReport = useCallback(
    async (reportId: string) => {
      if (!user) throw new Error('Not authenticated')

      try {
        const { error: err } = await supabase
          .from('reports')
          .update({
            status: 'dismissed',
            reviewed_at: new Date().toISOString(),
            reviewed_by_admin_id: user.id,
          })
          .eq('id', reportId)

        if (err) throw err

        // Log admin activity
        await supabase.from('admin_activity_logs').insert({
          admin_id: user.id,
          action_type: 'dismiss_report',
          details: { report_id: reportId },
        })

        await fetchReports()
      } catch (err: any) {
        console.error('Error dismissing report:', err)
        throw err
      }
    },
    [user, fetchReports]
  )

  const markReportAsReviewed = useCallback(
    async (reportId: string, actionTaken: string) => {
      if (!user) throw new Error('Not authenticated')

      try {
        const { error: err } = await supabase
          .from('reports')
          .update({
            status: 'action_taken',
            action_taken: actionTaken,
            reviewed_at: new Date().toISOString(),
            reviewed_by_admin_id: user.id,
          })
          .eq('id', reportId)

        if (err) throw err

        await fetchReports()
      } catch (err: any) {
        console.error('Error updating report:', err)
        throw err
      }
    },
    [user, fetchReports]
  )

  return {
    reports,
    loading,
    error,
    fetchReports,
    dismissReport,
    markReportAsReviewed,
  }
}
