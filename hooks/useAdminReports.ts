import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/auth-context'
import { useAdminAuth } from '@/context/admin-auth-context'

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
    user_id: string
    full_name: string
    photos: string[]
  }
  reported_by?: {
    user_id: string
    full_name: string
  }
}

export function useAdminReports() {
  const { user } = useAuth()
  const { isAdminAuthenticated } = useAdminAuth()
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Check if authenticated (either regular user or admin)
      if (!user && !isAdminAuthenticated) {
        throw new Error('Not authenticated')
      }

      // Get auth session if available, fallback to admin access
      const { data: { session } } = await supabase.auth.getSession()

      const response = await fetch('/api/admin/reports', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token || 'admin'}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch reports: ${response.statusText}`)
      }

      const data = await response.json()
      setReports(data.reports || [])
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
        const { data: { session } } = await supabase.auth.getSession()

        if (!session?.access_token) {
          throw new Error('Not authenticated')
        }

        const response = await fetch('/api/admin/reports', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            reportId,
            status: 'dismissed',
            reviewedByAdminId: user.id,
          }),
        })

        if (!response.ok) {
          throw new Error(`Failed to dismiss report: ${response.statusText}`)
        }

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
        const { data: { session } } = await supabase.auth.getSession()

        if (!session?.access_token) {
          throw new Error('Not authenticated')
        }

        const response = await fetch('/api/admin/reports', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            reportId,
            status: 'action_taken',
            actionTaken,
            reviewedByAdminId: user.id,
          }),
        })

        if (!response.ok) {
          throw new Error(`Failed to update report: ${response.statusText}`)
        }

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
