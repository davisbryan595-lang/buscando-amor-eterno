'use client'

import { useCallback, useEffect, useState } from 'react'
import { getAdminAuthHeaders, useAdminAuth } from '@/context/admin-auth-context'

export interface AdminStats {
  totalSignups: number
  totalProfiles: number
  newUsersToday: number
  activeChats: number
  totalCalls: number
  reportedProfiles: number
  bannedUsers: number
  incompleteProfiles: number
  freeAccessUsers: number
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

      if (!isAdminAuthenticated) {
        throw new Error('Not authenticated')
      }

      const response = await fetch('/api/admin/stats', {
        headers: {
          'Content-Type': 'application/json',
          ...getAdminAuthHeaders(),
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch stats: ${response.statusText}`)
      }

      setStats(await response.json())
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to fetch admin stats'
      setError(errorMessage)
      console.error('Error fetching admin stats:', errorMessage)
    } finally {
      setLoading(false)
    }
  }, [isAdminAuthenticated])

  useEffect(() => {
    fetchStats()
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
  }, [fetchStats])

  return { stats, loading, error, refetchStats: fetchStats }
}
