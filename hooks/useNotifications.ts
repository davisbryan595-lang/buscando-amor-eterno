import { useCallback, useState, useEffect, useRef } from 'react'
import { useAuth } from '@/context/auth-context'
import { supabase } from '@/lib/supabase'

export interface Notification {
  id: string
  recipient_id: string
  liker_id: string
  liker_name: string | null
  liker_image: string | null
  liked_profile_id: string
  read: boolean
  created_at: string
}

export function useNotifications() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const lastFetchRef = useRef(0)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    fetchNotifications()
    let pollInterval: ReturnType<typeof setInterval> | null = null
    let subscription: ReturnType<typeof supabase.channel> | null = null
    let isMounted = true

    try {
      subscription = supabase
        .channel(`notifications:${user.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `recipient_id.eq.${user.id}`,
          },
          (payload) => {
            if (isMounted) {
              lastFetchRef.current = Date.now()
              fetchNotifications()
            }
          }
        )
        .subscribe((status) => {
          if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            console.warn('Notification subscription error:', status)
            if (!pollInterval && isMounted) {
              pollInterval = setInterval(() => {
                if (isMounted) {
                  const timeSinceLastFetch = Date.now() - lastFetchRef.current
                  if (timeSinceLastFetch > 10000) {
                    fetchNotifications()
                  }
                }
              }, 10000)
            }
          }
        })
    } catch (err) {
      console.warn('Failed to setup realtime subscription:', err)
      if (!pollInterval && isMounted) {
        pollInterval = setInterval(() => {
          if (isMounted) {
            const timeSinceLastFetch = Date.now() - lastFetchRef.current
            if (timeSinceLastFetch > 10000) {
              fetchNotifications()
            }
          }
        }, 10000)
      }
    }

    return () => {
      isMounted = false
      if (subscription) {
        subscription.unsubscribe()
      }
      if (pollInterval) {
        clearInterval(pollInterval)
      }
    }
  }, [user])

  const fetchNotifications = async () => {
    if (!user) return

    try {
      setLoading(true)
      const { data, error: err } = await supabase
        .from('notifications')
        .select('id, recipient_id, liker_id, liked_profile_id, read, created_at')
        .eq('recipient_id', user.id)
        .eq('read', false)
        .order('created_at', { ascending: false })

      if (err) throw err

      if (!data || data.length === 0) {
        setNotifications([])
        setError(null)
        return
      }

      // Extract unique liker IDs
      const uniqueLikerIds = Array.from(new Set(data.map((n: any) => n.liker_id)))

      // Batch fetch all liker profiles with a single query
      const { data: likerProfiles, error: profileErr } = await supabase
        .from('profiles')
        .select('user_id, full_name, photos, main_photo_index')
        .in('user_id', uniqueLikerIds)

      if (profileErr) {
        console.warn('Error fetching liker profiles:', profileErr)
      }

      // Create a map for quick lookup
      const profileMap = new Map(
        (likerProfiles || []).map((p: any) => [p.user_id, p])
      )

      // Map notifications with their profiles
      const notificationsWithProfiles = data.map((notif: any) => {
        const likerProfile = profileMap.get(notif.liker_id)
        return {
          id: notif.id,
          recipient_id: notif.recipient_id,
          liker_id: notif.liker_id,
          liker_name: likerProfile?.full_name || null,
          liker_image: likerProfile?.photos?.[likerProfile?.main_photo_index || 0] || null,
          liked_profile_id: notif.liked_profile_id,
          read: notif.read,
          created_at: notif.created_at,
        }
      })

      setNotifications(notificationsWithProfiles)
      setError(null)
    } catch (err: any) {
      const errorMessage = err?.message || (typeof err === 'string' ? err : 'Failed to fetch notifications')
      setError(errorMessage)
      console.error('Error fetching notifications:', errorMessage, err)
      setNotifications([])
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = useCallback(
    async (notificationId: string) => {
      try {
        const { error: err } = await supabase
          .from('notifications')
          .update({ read: true })
          .eq('id', notificationId)

        if (err) throw err
        setNotifications((prev) => prev.filter((n) => n.id !== notificationId))
      } catch (err: any) {
        const errorMessage = err?.message || (typeof err === 'string' ? err : 'Failed to mark notification as read')
        setError(errorMessage)
        console.error('Error marking notification as read:', errorMessage, err)
      }
    },
    []
  )

  const dismissNotification = useCallback(
    async (notificationId: string) => {
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId))
      await markAsRead(notificationId)
    },
    [markAsRead]
  )

  return {
    notifications,
    loading,
    error,
    markAsRead,
    dismissNotification,
  }
}
