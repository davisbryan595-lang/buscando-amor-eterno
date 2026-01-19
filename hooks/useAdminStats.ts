import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

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

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const today = new Date()
      today.setHours(0, 0, 0, 0)

      // Initialize default values
      let totalSignupsCount = 0
      let totalProfilesCount = 0
      let newUsersTodayCount = 0
      let incompleteCount = 0
      let activeChatsCount = 0
      let totalCallsCount = 0
      let reportedCount = 0
      let bannedCount = 0

      // Get total signups (from users table)
      try {
        const { count, error: err } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true })
        if (err) throw err
        totalSignupsCount = count || 0
      } catch (err: any) {
        console.warn('Failed to fetch total signups:', err?.message)
      }

      // Get total profiles (completed onboarding)
      try {
        const { count, error: err } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
        if (err) throw err
        totalProfilesCount = count || 0
      } catch (err: any) {
        console.warn('Failed to fetch total profiles:', err?.message)
      }

      // Get new users today
      try {
        const { count, error: err } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', today.toISOString())
        if (err) throw err
        newUsersTodayCount = count || 0
      } catch (err: any) {
        console.warn('Failed to fetch new users today:', err?.message)
      }

      // Get incomplete profiles
      try {
        const { count, error: err } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('profile_complete', false)
        if (err) throw err
        incompleteCount = count || 0
      } catch (err: any) {
        console.warn('Failed to fetch incomplete profiles:', err?.message)
      }

      // Get active chats (messages sent/received today)
      try {
        const { count, error: err } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', today.toISOString())
        if (err) throw err
        activeChatsCount = count || 0
      } catch (err: any) {
        console.warn('Failed to fetch active chats:', err?.message)
      }

      // Get total calls
      try {
        const { count, error: err } = await supabase
          .from('call_logs')
          .select('*', { count: 'exact', head: true })
        if (err) throw err
        totalCallsCount = count || 0
      } catch (err: any) {
        console.warn('Failed to fetch total calls:', err?.message)
      }

      // Get reported profiles count
      try {
        const { count, error: err } = await supabase
          .from('reports')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending')
        if (err) throw err
        reportedCount = count || 0
      } catch (err: any) {
        console.warn('Failed to fetch reported profiles:', err?.message)
      }

      // Get banned users count
      try {
        const { count, error: err } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('banned', true)
        if (err) throw err
        bannedCount = count || 0
      } catch (err: any) {
        console.warn('Failed to fetch banned users:', err?.message)
      }

      setStats({
        totalSignups: totalSignupsCount,
        totalProfiles: totalProfilesCount,
        newUsersToday: newUsersTodayCount,
        activeChats: activeChatsCount,
        totalCalls: totalCallsCount,
        reportedProfiles: reportedCount,
        bannedUsers: bannedCount,
        incompleteProfiles: incompleteCount,
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
