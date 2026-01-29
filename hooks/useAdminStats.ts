import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAdminAuth } from '@/context/admin-auth-context'

export interface AdminStats {
  totalSignups: number
  totalProfiles: number
  newUsersToday: number
  activeChats: number
  totalCalls: number
  reportedProfiles: number
  bannedUsers: number
  incompleteProfiles: number
}

export function useAdminStats() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { isAdminAuthenticated } = useAdminAuth()

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Check if admin is authenticated via admin auth context
      if (!isAdminAuthenticated) {
        throw new Error('Not authenticated')
      }

      // Try to get Supabase session, but it's optional for admin-only access
      const { data: { session } } = await supabase.auth.getSession()

      const response = await fetch('/api/admin/stats', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token || 'admin'}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch stats: ${response.statusText}`)
      }

      const data = await response.json()
      setStats(data)
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to fetch admin stats'
      setError(errorMessage)
      console.error('Error fetching admin stats:', errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
  }, [fetchStats])

  return { stats, loading, error, refetchStats: fetchStats }
}
