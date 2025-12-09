import { useCallback, useState, useEffect, useRef } from 'react'
import { useAuth } from '@/context/auth-context'
import { supabase } from '@/lib/supabase'
import { useSubscription } from './useSubscription'

export interface Message {
  id: string
  sender_id: string
  recipient_id: string
  content: string
  read: boolean
  created_at: string
}

export interface Conversation {
  id: string
  user_id: string
  other_user_id: string
  other_user_name: string | null
  other_user_image: string | null
  last_message: string
  last_message_time: string
  is_online: boolean
  unread_count: number
}

export function useMessages() {
  const { user } = useAuth()
  const { isPremium } = useSubscription()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pollAttemptsRef = useRef(0)
  const lastFetchRef = useRef(0)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    fetchConversations()
    const unsubscribe = subscribeToMessages()

    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [user])

  const fetchConversations = async () => {
    if (!user) return

    try {
      setLoading(true)

      const { data, error: err } = await supabase
        .from('messages')
        .select('sender_id, recipient_id, content, created_at, read')
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order('created_at', { ascending: false })
        .limit(100)

      if (err) throw err

      const conversationMap = new Map<string, any>()
      const userIds = new Set<string>()

      data?.forEach((msg: any) => {
        const otherUserId = msg.sender_id === user.id ? msg.recipient_id : msg.sender_id
        userIds.add(otherUserId)
        if (!conversationMap.has(otherUserId)) {
          conversationMap.set(otherUserId, {
            id: otherUserId,
            user_id: user.id,
            other_user_id: otherUserId,
            other_user_name: null,
            other_user_image: null,
            last_message: msg.content,
            last_message_time: msg.created_at,
            unread_count: msg.recipient_id === user.id && !msg.read ? 1 : 0,
          })
        }
      })

      // Fetch user profiles for all conversation partners
      if (userIds.size > 0) {
        const { data: profiles, error: profileErr } = await supabase
          .from('profiles')
          .select('user_id, full_name, photos, main_photo_index')
          .in('user_id', Array.from(userIds))

        if (!profileErr && profiles) {
          profiles.forEach((profile: any) => {
            const conv = conversationMap.get(profile.user_id)
            if (conv) {
              conv.other_user_name = profile.full_name
              conv.other_user_image = profile.photos?.[profile.main_photo_index || 0] || null
            }
          })
        }
      }

      setConversations(Array.from(conversationMap.values()))
      setError(null)
      lastFetchRef.current = Date.now()
      pollAttemptsRef.current = 0
    } catch (err: any) {
      const errorMessage = err?.message || (typeof err === 'string' ? err : 'Failed to fetch conversations')
      setError(errorMessage)
      console.error('Error fetching conversations:', errorMessage, err)
    } finally {
      setLoading(false)
    }
  }

  const debouncedFetchConversations = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }
    debounceTimerRef.current = setTimeout(() => {
      fetchConversations()
    }, 500)
  }, [user])

  const subscribeToMessages = () => {
    if (!user) return

    let pollInterval: ReturnType<typeof setInterval> | null = null
    let isMounted = true
    let reconnectAttempts = 0
    const maxReconnectAttempts = 5
    const timeoutsRef = new Set<ReturnType<typeof setTimeout>>()

    const clearAllTimeouts = () => {
      timeoutsRef.forEach(timeout => clearTimeout(timeout))
      timeoutsRef.clear()
    }

    const setupSubscription = () => {
      try {
        const subscription = supabase
          .channel(`messages:${user.id}`, {
            config: {
              broadcast: { self: true },
            },
          })
          .on(
            'broadcast',
            {
              event: 'message-sent',
            },
            (payload) => {
              if (isMounted && payload.payload) {
                const message = payload.payload as Message
                setMessages((prev) => {
                  const exists = prev.some((m) => m.id === message.id)
                  return exists ? prev : [message, ...prev]
                })
                debouncedFetchConversations()
                reconnectAttempts = 0
              }
            }
          )
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'messages',
              filter: `or(sender_id.eq.${user.id},recipient_id.eq.${user.id})`,
            },
            (payload) => {
              if (isMounted) {
                const message = payload.new as Message
                setMessages((prev) => {
                  const exists = prev.some((m) => m.id === message.id)
                  return exists ? prev : [message, ...prev]
                })
                debouncedFetchConversations()
              }
            }
          )
          .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              console.log('[Messages] Subscription active')
              reconnectAttempts = 0
              if (pollInterval) {
                clearInterval(pollInterval)
                pollInterval = null
              }
            } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
              console.warn('[Messages] Subscription error:', status)
              if (isMounted && reconnectAttempts < maxReconnectAttempts) {
                reconnectAttempts++
                const delay = Math.min(1000 * Math.pow(2, reconnectAttempts - 1), 30000)
                console.log(`[Messages] Attempting reconnect in ${delay}ms (attempt ${reconnectAttempts}/${maxReconnectAttempts})`)
                const timeout = setTimeout(() => {
                  if (isMounted) {
                    subscription.unsubscribe()
                    setupSubscription()
                  }
                }, delay)
                timeoutsRef.add(timeout)
              } else if (!pollInterval && isMounted) {
                startPolling()
              }
            }
          })

        return () => {
          isMounted = false
          subscription.unsubscribe()
          clearAllTimeouts()
          if (pollInterval) {
            clearInterval(pollInterval)
            pollInterval = null
          }
        }
      } catch (err) {
        console.warn('[Messages] Failed to setup subscription:', err)
        if (isMounted && reconnectAttempts < maxReconnectAttempts) {
          reconnectAttempts++
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts - 1), 30000)
          console.log(`[Messages] Retrying setup in ${delay}ms`)
          const timeout = setTimeout(() => {
            if (isMounted) {
              setupSubscription()
            }
          }, delay)
          timeoutsRef.add(timeout)
        } else if (!pollInterval && isMounted) {
          startPolling()
        }

        return () => {
          isMounted = false
          clearAllTimeouts()
          if (pollInterval) {
            clearInterval(pollInterval)
            pollInterval = null
          }
        }
      }
    }

    const startPolling = () => {
      if (isMounted && !pollInterval) {
        console.log('[Messages] Starting fallback polling')
        pollInterval = setInterval(() => {
          if (isMounted) {
            const timeSinceLastFetch = Date.now() - lastFetchRef.current
            if (timeSinceLastFetch > 10000) {
              fetchConversations()
            }
          }
        }, 10000)
      }
    }

    return setupSubscription()
  }

  const fetchMessages = useCallback(
    async (otherUserId: string) => {
      if (!user) return

      try {
        const { data, error: err } = await supabase
          .from('messages')
          .select('id,sender_id,recipient_id,content,read,created_at')
          .or(
            `and(sender_id.eq.${user.id},recipient_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},recipient_id.eq.${user.id})`
          )
          .order('created_at', { ascending: true })

        if (err) throw err
        setMessages((data as Message[]) || [])
        setError(null)
      } catch (err: any) {
        const errorMessage = err?.message || (typeof err === 'string' ? err : 'Failed to fetch messages')
        setError(errorMessage)
        console.error('Error fetching messages:', errorMessage, err)
      }
    },
    [user]
  )

  const sendMessage = useCallback(
    async (recipientId: string, content: string) => {
      if (!user) throw new Error('No user logged in')

      try {
        const { data, error: err } = await supabase
          .from('messages')
          .insert({
            sender_id: user.id,
            recipient_id: recipientId,
            content,
            read: false,
          })
          .select()
          .single()

        if (err) throw err

        const message = data as Message
        setMessages((prev) => [...prev, message])

        // Broadcast message for instant delivery via Broadcast (low-latency)
        const broadcastChannel = supabase.channel(`messages:${recipientId}`)
        await broadcastChannel.subscribe()
        await broadcastChannel.send('broadcast', {
          event: 'message-sent',
          payload: message,
        })
        await broadcastChannel.unsubscribe()

        return message
      } catch (err: any) {
        const errorMessage = err?.message || (typeof err === 'string' ? err : 'Failed to send message')
        setError(errorMessage)
        throw err
      }
    },
    [user]
  )

  const markAsRead = useCallback(
    async (messageId: string) => {
      try {
        const { error: err } = await supabase
          .from('messages')
          .update({ read: true })
          .eq('id', messageId)

        if (err) throw err
      } catch (err: any) {
        const errorMessage = err?.message || (typeof err === 'string' ? err : 'Failed to mark message as read')
        setError(errorMessage)
        console.error('Error marking message as read:', errorMessage, err)
      }
    },
    []
  )

  const initiateConversation = useCallback(
    async (otherUserId: string) => {
      if (!user) throw new Error('No user logged in')

      try {
        const existingConv = conversations.find((c) => c.other_user_id === otherUserId)
        if (existingConv) {
          return existingConv
        }

        const { error: msgErr } = await supabase
          .from('messages')
          .insert({
            sender_id: user.id,
            recipient_id: otherUserId,
            content: '👋 Conversation started',
            read: false,
          })

        if (msgErr) throw msgErr

        await fetchConversations()

        return {
          id: otherUserId,
          user_id: user.id,
          other_user_id: otherUserId,
          other_user_name: null,
          other_user_image: null,
          last_message: '👋 Conversation started',
          last_message_time: new Date().toISOString(),
          is_online: false,
          unread_count: 0,
        }
      } catch (err: any) {
        const errorMessage = err?.message || (typeof err === 'string' ? err : 'Failed to initiate conversation')
        setError(errorMessage)
        console.error('Error initiating conversation:', errorMessage, err)
        throw err
      }
    },
    [user, conversations]
  )

  return {
    conversations,
    messages,
    loading,
    error,
    fetchConversations,
    fetchMessages,
    sendMessage,
    markAsRead,
    initiateConversation,
  }
}
