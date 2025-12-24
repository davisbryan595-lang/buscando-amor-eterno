import { useCallback, useState, useEffect, useRef } from 'react'
import { useAuth } from '@/context/auth-context'
import { supabase } from '@/lib/supabase'

export interface Notification {
  id: string
  recipient_id: string
  type: 'like' | 'message' | 'call' | 'match'
  from_user_id?: string
  from_user_name?: string
  from_user_image?: string | null
  liker_id?: string
  liker_name?: string | null
  liker_image?: string | null
  liked_profile_id?: string
  match_id?: string
  message_preview?: string
  call_type?: 'audio' | 'video'
  call_status?: 'incoming' | 'missed'
  read: boolean
  created_at: string
}

export function useNotifications() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const lastFetchRef = useRef(0)
  const pollAttemptsRef = useRef(0)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    fetchNotifications()
    const subscribeToNotifications = () => {
      let pollInterval: ReturnType<typeof setInterval> | null = null
      let subscription: ReturnType<typeof supabase.channel> | null = null
      let isMounted = true
      let subscriptionActive = false
      let reconnectAttempts = 0
      const maxReconnectAttempts = 5
      const timeoutsRef = new Set<ReturnType<typeof setTimeout>>()

      const clearAllTimeouts = () => {
        timeoutsRef.forEach(timeout => clearTimeout(timeout))
        timeoutsRef.clear()
      }

      const stopPolling = () => {
        if (pollInterval) {
          clearInterval(pollInterval)
          pollInterval = null
          console.log('[Notifications] Polling stopped')
        }
      }

      const startPolling = () => {
        if (isMounted && !pollInterval && !subscriptionActive) {
          console.log('[Notifications] Starting fallback polling')
          pollInterval = setInterval(() => {
            if (isMounted && !subscriptionActive) {
              const timeSinceLastFetch = Date.now() - lastFetchRef.current
              if (timeSinceLastFetch > 10000) {
                console.log('[Notifications] Polling: fetching notifications')
                fetchNotifications()
              }
            }
          }, 10000)
        }
      }

      const setupSubscription = () => {
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
                if (isMounted && subscriptionActive) {
                  lastFetchRef.current = Date.now()
                  fetchNotifications()
                }
              }
            )
            .subscribe((status) => {
              if (status === 'SUBSCRIBED') {
                console.log('[Notifications] Subscription active')
                subscriptionActive = true
                reconnectAttempts = 0
                stopPolling()
              } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
                console.warn('[Notifications] Subscription error:', status, '- Check RLS policies on notifications table in Supabase dashboard')
                subscriptionActive = false
                if (isMounted && reconnectAttempts < maxReconnectAttempts) {
                  reconnectAttempts++
                  const delay = Math.min(1000 * Math.pow(2, reconnectAttempts - 1), 30000)
                  console.log(`[Notifications] Attempting reconnect in ${delay}ms (attempt ${reconnectAttempts}/${maxReconnectAttempts})`)
                  const timeout = setTimeout(() => {
                    if (isMounted) {
                      if (subscription) {
                        subscription.unsubscribe()
                      }
                      setupSubscription()
                    }
                  }, delay)
                  timeoutsRef.add(timeout)
                } else if (isMounted) {
                  startPolling()
                }
              }
            })

          return () => {
            isMounted = false
            subscriptionActive = false
            if (subscription) {
              subscription.unsubscribe()
            }
            clearAllTimeouts()
            stopPolling()
          }
        } catch (err) {
          console.warn('[Notifications] Failed to setup subscription:', err)
          subscriptionActive = false
          if (isMounted && reconnectAttempts < maxReconnectAttempts) {
            reconnectAttempts++
            const delay = Math.min(1000 * Math.pow(2, reconnectAttempts - 1), 30000)
            console.log(`[Notifications] Retrying setup in ${delay}ms`)
            const timeout = setTimeout(() => {
              if (isMounted) {
                setupSubscription()
              }
            }, delay)
            timeoutsRef.add(timeout)
          } else if (isMounted) {
            startPolling()
          }

          return () => {
            isMounted = false
            subscriptionActive = false
            clearAllTimeouts()
            stopPolling()
          }
        }
      }

      return setupSubscription()
    }

    const unsubscribe = subscribeToNotifications()

    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [user])

  const fetchNotifications = async () => {
    if (!user) return

    try {
      setLoading(true)
      const { data, error: err } = await supabase
        .from('notifications')
        .select('*')
        .eq('recipient_id', user.id)
        .eq('read', false)
        .order('created_at', { ascending: false })
        .limit(50)

      if (err) throw err

      if (!data || data.length === 0) {
        setNotifications([])
        setError(null)
        return
      }

      // Extract all unique user IDs (from liker_id, from_user_id, etc.)
      const userIds = Array.from(
        new Set(
          data
            .map((n: any) => [n.liker_id, n.from_user_id])
            .flat()
            .filter(Boolean)
        )
      )

      // Batch fetch all user profiles with a single query
      const { data: profiles, error: profileErr } = await supabase
        .from('profiles')
        .select('user_id, full_name, photos, main_photo_index')
        .in('user_id', userIds)

      if (profileErr) {
        console.warn('Error fetching user profiles:', profileErr)
      }

      // Create a map for quick lookup
      const profileMap = new Map(
        (profiles || []).map((p: any) => [p.user_id, p])
      )

      // Map notifications with their profiles
      const notificationsWithProfiles = data.map((notif: any) => {
        let fromUserId = notif.liker_id || notif.from_user_id
        const profile = profileMap.get(fromUserId)

        return {
          id: notif.id,
          recipient_id: notif.recipient_id,
          type: notif.type || 'like',
          from_user_id: fromUserId,
          from_user_name: profile?.full_name || null,
          from_user_image: profile?.photos?.[profile?.main_photo_index || 0] || null,
          // Keep legacy fields for backwards compatibility
          liker_id: notif.liker_id,
          liker_name: profile?.full_name || null,
          liker_image: profile?.photos?.[profile?.main_photo_index || 0] || null,
          liked_profile_id: notif.liked_profile_id,
          match_id: notif.match_id,
          message_preview: notif.message_preview,
          call_type: notif.call_type,
          call_status: notif.call_status,
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
