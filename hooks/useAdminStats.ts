import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

export interface AdminStats {
  totalUsers: number
  newUsersToday: number
  activeChats: number
  totalCalls: number
  reportedProfiles: number
  bannedUsers: number
}

export function useAdminStats() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const today = new Date()
      today.setHours(0, 0, 0, 0)

      // Get total users count
      const { count: totalUsersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })

      // Get new users today
      const { count: newUsersTodayCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today.toISOString())

      // Get active chats (messages sent/received today)
      const { count: activeChatsCount } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today.toISOString())

      // Get total calls
      const { count: totalCallsCount } = await supabase
        .from('call_logs')
        .select('*', { count: 'exact', head: true })

      // Get reported profiles count
      const { count: reportedCount } = await supabase
        .from('reports')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')

      // Get banned users count
      const { count: bannedCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('banned', true)

      setStats({
        totalUsers: totalUsersCount || 0,
        newUsersToday: newUsersTodayCount || 0,
        activeChats: activeChatsCount || 0,
        totalCalls: totalCallsCount || 0,
        reportedProfiles: reportedCount || 0,
        bannedUsers: bannedCount || 0,
      })
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
