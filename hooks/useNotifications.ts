import { useCallback, useState, useEffect } from 'react'
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

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    fetchNotifications()

    const subscription = supabase
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
          fetchNotifications()
        }
      )
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.error('Notification subscription error:', status)
        }
      })

    return () => {
      subscription.unsubscribe()
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

      const notificationsWithProfiles = await Promise.all(
        data.map(async (notif: any) => {
          try {
            const { data: likerProfile } = await supabase
              .from('profiles')
              .select('full_name, photos, main_photo_index')
              .eq('user_id', notif.liker_id)
              .single()

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
          } catch (err: any) {
            console.error('Error fetching liker profile:', err)
            return {
              id: notif.id,
              recipient_id: notif.recipient_id,
              liker_id: notif.liker_id,
              liker_name: null,
              liker_image: null,
              liked_profile_id: notif.liked_profile_id,
              read: notif.read,
              created_at: notif.created_at,
            }
          }
        })
      )

      setNotifications(notificationsWithProfiles)
      setError(null)
    } catch (err: any) {
      setError(err.message)
      console.error('Error fetching notifications:', err)
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
        setError(err.message)
        console.error('Error marking notification as read:', err)
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
