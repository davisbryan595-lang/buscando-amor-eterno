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

      data?.forEach((msg: any) => {
        const otherUserId = msg.sender_id === user.id ? msg.recipient_id : msg.sender_id
        if (!conversationMap.has(otherUserId)) {
          conversationMap.set(otherUserId, {
            id: otherUserId,
            user_id: user.id,
            other_user_id: otherUserId,
            last_message: msg.content,
            last_message_time: msg.created_at,
            unread_count: msg.recipient_id === user.id && !msg.read ? 1 : 0,
          })
        }
      })

      setConversations(Array.from(conversationMap.values()))
      setError(null)
      lastFetchRef.current = Date.now()
      pollAttemptsRef.current = 0
    } catch (err: any) {
      setError(err.message)
      console.error('Error fetching conversations:', err)
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

    try {
      const subscription = supabase
        .channel(`messages:${user.id}`)
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
              setMessages((prev) => [payload.new as Message, ...prev])
              debouncedFetchConversations()
            }
          }
        )
        .subscribe((status) => {
          if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            console.warn('Message subscription error:', status)
            if (!pollInterval && isMounted) {
              pollAttemptsRef.current = 0
              const startPolling = () => {
                if (isMounted) {
                  pollInterval = setInterval(() => {
                    if (isMounted) {
                      const timeSinceLastFetch = Date.now() - lastFetchRef.current
                      if (timeSinceLastFetch > 15000) {
                        fetchConversations()
                      }
                    }
                  }, 15000)
                }
              }
              startPolling()
            }
          }
        })

      return () => {
        isMounted = false
        subscription.unsubscribe()
        if (pollInterval) {
          clearInterval(pollInterval)
        }
      }
    } catch (err) {
      console.warn('Failed to setup message subscription:', err)
      if (!pollInterval && isMounted) {
        pollAttemptsRef.current = 0
        const startPolling = () => {
          if (isMounted) {
            pollInterval = setInterval(() => {
              if (isMounted) {
                const timeSinceLastFetch = Date.now() - lastFetchRef.current
                if (timeSinceLastFetch > 15000) {
                  fetchConversations()
                }
              }
            }, 15000)
          }
        }
        startPolling()
      }

      return () => {
        isMounted = false
        if (pollInterval) {
          clearInterval(pollInterval)
        }
      }
    }
  }

  const fetchMessages = useCallback(
    async (otherUserId: string) => {
      if (!user) return

      try {
        const { data, error: err } = await supabase
          .from('messages')
          .select('*')
          .or(
            `and(sender_id.eq.${user.id},recipient_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},recipient_id.eq.${user.id})`
          )
          .order('created_at', { ascending: true })

        if (err) throw err
        setMessages((data as Message[]) || [])
        setError(null)
      } catch (err: any) {
        setError(err.message)
        console.error('Error fetching messages:', err)
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
        setMessages((prev) => [...prev, data as Message])
        return data as Message
      } catch (err: any) {
        setError(err.message)
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
        setError(err.message)
        console.error('Error marking message as read:', err)
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
        setError(err.message)
        console.error('Error initiating conversation:', err)
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
