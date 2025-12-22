import { useCallback, useState, useEffect, useRef } from 'react'
import { useAuth } from '@/context/auth-context'
import { supabase } from '@/lib/supabase'

export interface LoungeMessage {
  id: string
  sender_id: string
  sender_name: string
  sender_image: string | null
  content: string
  created_at: string
}

export function useLounge() {
  const { user } = useAuth()
  const [messages, setMessages] = useState<LoungeMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    let isMounted = true

    const initialize = async () => {
      if (isMounted) {
        await fetchMessages()
      }
    }

    initialize()
    const unsubscribe = subscribeToLounge()

    return () => {
      isMounted = false
      if (unsubscribe) {
        unsubscribe()
      }
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [user?.id])

  const fetchMessages = async () => {
    if (!user) return

    try {
      setLoading(true)

      // Add timeout for fetch
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Lounge messages fetch timed out')), 60000)
      )

      // Fetch lounge messages with sender profile details
      const queryPromise = supabase
        .from('lounge_messages')
        .select(`
          id,
          sender_id,
          content,
          created_at,
          profiles!lounge_messages_sender_id_fkey(full_name, photos, main_photo_index)
        `)
        .order('created_at', { ascending: true })
        .limit(100)

      const result = await Promise.race([queryPromise, timeoutPromise])
      const { data, error: err } = result as any

      if (err) throw err

      // Transform data to include sender info
      const transformedMessages = (data || []).map((msg: any) => ({
        id: msg.id,
        sender_id: msg.sender_id,
        sender_name: msg.profiles?.full_name || 'Anonymous',
        sender_image: msg.profiles?.photos?.[msg.profiles?.main_photo_index || 0] || null,
        content: msg.content,
        created_at: msg.created_at,
      }))

      setMessages(transformedMessages)
      setError(null)
    } catch (err: any) {
      const errorMessage = err?.message || (typeof err === 'string' ? err : 'Failed to fetch lounge messages')
      setError(errorMessage)
      console.error('Error fetching lounge messages:', errorMessage, err)
    } finally {
      setLoading(false)
    }
  }

  const subscribeToLounge = () => {
    if (!user) return

    let pollInterval: ReturnType<typeof setInterval> | null = null
    let isMounted = true
    let lastFetch = 0
    const MIN_FETCH_INTERVAL = 3000

    const throttledFetch = () => {
      const now = Date.now()
      if (now - lastFetch >= MIN_FETCH_INTERVAL) {
        lastFetch = now
        fetchMessages()
      }
    }

    const stopPolling = () => {
      if (pollInterval) {
        clearInterval(pollInterval)
        pollInterval = null
      }
    }

    try {
      const subscription = supabase
        .channel('lounge_messages')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'lounge_messages',
          },
          (payload) => {
            if (isMounted) {
              throttledFetch()
            }
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.log('[Lounge] Real-time subscription active')
            stopPolling()
          } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            console.warn('[Lounge] Subscription error:', status)
            if (!pollInterval && isMounted) {
              pollInterval = setInterval(() => {
                if (isMounted) {
                  throttledFetch()
                }
              }, 10000)
            }
          }
        })

      return () => {
        isMounted = false
        subscription.unsubscribe()
        stopPolling()
      }
    } catch (err) {
      console.warn('Failed to setup lounge subscription:', err)
      if (!pollInterval) {
        pollInterval = setInterval(() => {
          if (isMounted) {
            throttledFetch()
          }
        }, 10000)
      }

      return () => {
        isMounted = false
        stopPolling()
      }
    }
  }

  const sendMessage = useCallback(
    async (content: string) => {
      if (!user) throw new Error('No user logged in')

      try {
        const { data, error: err } = await supabase
          .from('lounge_messages')
          .insert({
            sender_id: user.id,
            content,
          })
          .select()
          .single()

        if (err) throw err

        return data as LoungeMessage
      } catch (err: any) {
        const errorMessage = err?.message || (typeof err === 'string' ? err : 'Failed to send message')
        setError(errorMessage)
        throw err
      }
    },
    [user]
  )

  return {
    messages,
    loading,
    error,
    sendMessage,
    fetchMessages,
  }
}
