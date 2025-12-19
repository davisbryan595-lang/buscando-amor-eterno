import { useCallback, useState, useEffect, useRef } from 'react'
import { useAuth } from '@/context/auth-context'
import { supabase } from '@/lib/supabase'

export interface LoungeMessage {
  id: string
  user_id: string
  message: string
  message_type: 'text' | 'system'
  reported_count: number
  created_at: string
  user?: {
    full_name?: string
    photos?: string[]
    main_photo_index?: number
  }
  sender_name?: string
  sender_image?: string
}

export interface LoungeUser {
  user_id: string
  full_name: string
  main_photo?: string
  last_seen: string
}

const KEYWORD_FILTER_PATTERNS = [
  /badword1/gi,
  /inappropriate/gi,
  /offensive/gi,
]

export function useLounge() {
  const { user } = useAuth()
  const [messages, setMessages] = useState<LoungeMessage[]>([])
  const [onlineUsers, setOnlineUsers] = useState<LoungeUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const subscriptionRef = useRef<any>(null)
  const presenceRef = useRef<any>(null)

  // Fetch initial messages
  const fetchMessages = useCallback(async () => {
    if (!user) return

    try {
      setLoading(true)
      const { data, error: err } = await supabase
        .from('lounge_messages')
        .select(
          `
          id,
          user_id,
          message,
          message_type,
          reported_count,
          created_at
        `
        )
        .order('created_at', { ascending: true })
        .limit(200)

      if (err) throw err

      // Fetch user profiles for messages
      if (data && data.length > 0) {
        const userIds = Array.from(new Set(data.map((m: any) => m.user_id)))
        const { data: profiles, error: profileErr } = await supabase
          .from('profiles')
          .select('user_id, full_name, photos, main_photo_index')
          .in('user_id', userIds)

        if (!profileErr && profiles) {
          const profileMap = new Map(profiles.map((p: any) => [p.user_id, p]))
          const enrichedMessages = data.map((msg: any) => {
            const profile = profileMap.get(msg.user_id)
            return {
              ...msg,
              sender_name: profile?.full_name || 'Anonymous',
              sender_image: profile?.photos?.[profile?.main_photo_index || 0] || null,
            }
          })
          setMessages(enrichedMessages)
        }
      }

      setError(null)
    } catch (err: any) {
      console.error('Error fetching lounge messages:', err)
      setError(err.message || 'Failed to load lounge messages')
    } finally {
      setLoading(false)
    }
  }, [user])

  // Subscribe to real-time message updates
  const subscribeToMessages = useCallback(() => {
    if (!user) return

    let isMounted = true
    let retryCount = 0
    const maxRetries = 5
    let retryTimeout: NodeJS.Timeout | null = null

    const setupSubscription = () => {
      if (!isMounted) return

      try {
        const channelName = 'global_singles_lounge'

        // Remove old subscription if it exists
        if (subscriptionRef.current) {
          supabase.removeChannel(subscriptionRef.current)
        }

        subscriptionRef.current = supabase
          .channel(channelName)
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'lounge_messages',
            },
            async (payload: any) => {
              if (!isMounted) return

              const newMessage = payload.new
              // Fetch user profile for new message
              const { data: profile } = await supabase
                .from('profiles')
                .select('full_name, photos, main_photo_index')
                .eq('user_id', newMessage.user_id)
                .single()

              const enrichedMessage = {
                ...newMessage,
                sender_name: profile?.full_name || 'Anonymous',
                sender_image: profile?.photos?.[profile?.main_photo_index || 0] || null,
              }
              setMessages((prev) => [...prev, enrichedMessage])
            }
          )
          .subscribe((status, err) => {
            console.log('[Lounge] Subscription status:', status, err)

            if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
              console.log('[Lounge] Subscription closed/error - attempting retry...')
              if (isMounted && retryCount < maxRetries) {
                retryCount += 1
                const delay = Math.min(1000 * Math.pow(2, retryCount - 1), 10000)
                console.log(`[Lounge] Retry ${retryCount}/${maxRetries} in ${delay}ms`)
                retryTimeout = setTimeout(() => {
                  if (isMounted) {
                    setupSubscription()
                  }
                }, delay)
              }
            } else if (status === 'SUBSCRIBED') {
              retryCount = 0
              console.log('[Lounge] Messages subscription active')
            }
          })
      } catch (err) {
        console.error('Error subscribing to lounge messages:', err)
        if (isMounted && retryCount < maxRetries) {
          retryCount += 1
          const delay = Math.min(1000 * Math.pow(2, retryCount - 1), 10000)
          retryTimeout = setTimeout(() => {
            if (isMounted) {
              setupSubscription()
            }
          }, delay)
        }
      }
    }

    setupSubscription()

    return () => {
      isMounted = false
      if (retryTimeout) {
        clearTimeout(retryTimeout)
      }
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current)
      }
    }
  }, [user])

  // Track user presence
  const updatePresence = useCallback(async () => {
    if (!user) return

    let isMounted = true
    let retryCount = 0
    const maxRetries = 5
    let retryTimeout: NodeJS.Timeout | null = null

    const setupPresence = async () => {
      if (!isMounted) return

      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, photos, main_photo_index')
          .eq('user_id', user.id)
          .single()

        const channelName = 'global_singles_lounge_presence'

        // Remove old presence if it exists
        if (presenceRef.current) {
          presenceRef.current.untrack()
          supabase.removeChannel(presenceRef.current)
        }

        presenceRef.current = supabase
          .channel(channelName)
          .on('presence', { event: 'sync' }, () => {
            if (!isMounted) return

            const presenceState = presenceRef.current?.presenceState()
            const users: LoungeUser[] = []

            Object.keys(presenceState || {}).forEach((userId) => {
              const userPresence = presenceState[userId][0]
              users.push({
                user_id: userId,
                full_name: userPresence?.full_name || 'Anonymous',
                main_photo: userPresence?.main_photo || null,
                last_seen: new Date().toISOString(),
              })
            })

            setOnlineUsers(users)
          })
          .subscribe(async (status, err) => {
            if (!isMounted) return

            console.log('[Lounge] Presence status:', status, err)

            if (status === 'SUBSCRIBED') {
              retryCount = 0
              presenceRef.current.track({
                user_id: user.id,
                full_name: profile?.full_name || 'User',
                main_photo: profile?.photos?.[profile?.main_photo_index || 0] || null,
              })
            } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
              console.log('[Lounge] Presence subscription closed/error - retrying...')
              if (isMounted && retryCount < maxRetries) {
                retryCount += 1
                const delay = Math.min(1000 * Math.pow(2, retryCount - 1), 10000)
                retryTimeout = setTimeout(() => {
                  if (isMounted) {
                    setupPresence()
                  }
                }, delay)
              }
            }
          })
      } catch (err) {
        console.error('Error updating presence:', err)
        if (isMounted && retryCount < maxRetries) {
          retryCount += 1
          const delay = Math.min(1000 * Math.pow(2, retryCount - 1), 10000)
          retryTimeout = setTimeout(() => {
            if (isMounted) {
              setupPresence()
            }
          }, delay)
        }
      }
    }

    setupPresence()

    return () => {
      isMounted = false
      if (retryTimeout) {
        clearTimeout(retryTimeout)
      }
      if (presenceRef.current) {
        presenceRef.current.untrack()
        supabase.removeChannel(presenceRef.current)
      }
    }
  }, [user])

  // Send a message with keyword filtering
  const sendMessage = useCallback(
    async (content: string) => {
      if (!user || !content.trim()) return

      try {
        // Apply keyword filtering
        let filteredContent = content
        KEYWORD_FILTER_PATTERNS.forEach((pattern) => {
          filteredContent = filteredContent.replace(pattern, '***')
        })

        const { error: err } = await supabase.from('lounge_messages').insert({
          user_id: user.id,
          message: filteredContent,
          message_type: 'text',
        })

        if (err) throw err
      } catch (err: any) {
        console.error('Error sending message:', err)
        setError(err.message || 'Failed to send message')
      }
    },
    [user]
  )

  // Report a message
  const reportMessage = useCallback(
    async (messageId: string, reason: string) => {
      if (!user) return

      try {
        const { error: err } = await supabase.from('lounge_reports').insert({
          message_id: messageId,
          reported_by: user.id,
          reason,
        })

        if (err) throw err

        // Increment reported count
        await supabase
          .from('lounge_messages')
          .update({ reported_count: supabase.raw('reported_count + 1') })
          .eq('id', messageId)

        setError(null)
      } catch (err: any) {
        console.error('Error reporting message:', err)
        setError(err.message || 'Failed to report message')
      }
    },
    [user]
  )

  // Handle visibility changes to resubscribe if needed
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('[Lounge] Page became visible - checking subscriptions')
        // Subscriptions will maintain themselves, but this ensures we're aware
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  // Initialize lounge
  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    fetchMessages()
    const unsubscribe = subscribeToMessages()
    const untrackPresence = updatePresence()

    return () => {
      unsubscribe?.()
      untrackPresence?.()
    }
  }, [user, fetchMessages, subscribeToMessages, updatePresence])

  return {
    messages,
    onlineUsers,
    loading,
    error,
    sendMessage,
    reportMessage,
  }
}
