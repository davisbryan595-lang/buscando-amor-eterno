import { useCallback, useState, useEffect } from 'react'
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
    }
  }, [user])

  const fetchConversations = async () => {
    if (!user) return

    try {
      setLoading(true)

      // Add a timeout for messages fetch (30 seconds)
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Conversations fetch timed out')), 30000)
      )

      // Limit to recent messages to prevent timeout - only fetch enough to build conversation list
      const queryPromise = supabase
        .from('messages')
        .select('sender_id, recipient_id, content, created_at, read')
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order('created_at', { ascending: false })
        .limit(500)

      const result = await Promise.race([queryPromise, timeoutPromise])
      const { data, error: err } = result as any

      if (err) throw err

      const conversationMap = new Map<string, any>()

      // Process messages to build unique conversations
      data?.forEach((msg: any) => {
        const otherUserId = msg.sender_id === user.id ? msg.recipient_id : msg.sender_id
        if (!conversationMap.has(otherUserId)) {
          const isUnread = msg.recipient_id === user.id && !msg.read
          conversationMap.set(otherUserId, {
            id: otherUserId,
            user_id: user.id,
            other_user_id: otherUserId,
            last_message: msg.content,
            last_message_time: msg.created_at,
            unread_count: isUnread ? 1 : 0,
            other_user_name: null,
            other_user_image: null,
            is_online: false,
          })
        } else {
          // Count additional unread messages
          const conv = conversationMap.get(otherUserId)
          if (msg.recipient_id === user.id && !msg.read) {
            conv.unread_count += 1
          }
        }
      })

      const convArray = Array.from(conversationMap.values())

      // Fetch profile details for conversation participants
      if (convArray.length > 0) {
        const userIds = convArray.map((c) => c.other_user_id)
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, full_name, photos, main_photo_index')
          .in('user_id', userIds)

        profiles?.forEach((profile) => {
          const conv = convArray.find((c) => c.other_user_id === profile.user_id)
          if (conv) {
            conv.other_user_name = profile.full_name
            conv.other_user_image = profile.photos?.[profile.main_photo_index || 0] || null
          }
        })
      }

      setConversations(convArray)
      setError(null)
    } catch (err: any) {
      setError(err.message)
      console.error('Error fetching conversations:', err)
    } finally {
      setLoading(false)
    }
  }

  const subscribeToMessages = () => {
    if (!user) return

    let pollInterval: ReturnType<typeof setInterval> | null = null
    let isMounted = true
    let lastFetch = 0
    const MIN_FETCH_INTERVAL = 3000

    const throttledFetch = () => {
      const now = Date.now()
      if (now - lastFetch >= MIN_FETCH_INTERVAL) {
        lastFetch = now
        fetchConversations()
      }
    }

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
              throttledFetch()
            }
          }
        )
        .subscribe((status) => {
          if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            console.warn('Message subscription error:', status)
            // Fall back to polling if realtime fails (less frequent)
            if (!pollInterval) {
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
        if (pollInterval) {
          clearInterval(pollInterval)
        }
      }
    } catch (err) {
      console.warn('Failed to setup message subscription:', err)
      // Fall back to polling (less frequent)
      if (!pollInterval) {
        pollInterval = setInterval(() => {
          if (isMounted) {
            throttledFetch()
          }
        }, 10000)
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
    [user, isPremium]
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
        // Check if conversation already exists
        const existingConv = conversations.find((c) => c.other_user_id === otherUserId)
        if (existingConv) {
          return existingConv
        }

        // Create a system message to establish the conversation
        const { error: msgErr } = await supabase
          .from('messages')
          .insert({
            sender_id: user.id,
            recipient_id: otherUserId,
            content: '👋 Conversation started',
            read: false,
          })

        if (msgErr) throw msgErr

        // Fetch updated conversations
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
    [user, conversations, fetchConversations]
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
