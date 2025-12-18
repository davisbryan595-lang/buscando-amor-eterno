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

    let isMounted = true

    const initialize = async () => {
      if (isMounted) {
        await fetchConversations()
      }
    }

    initialize()
    const unsubscribe = subscribeToMessages()

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

  const fetchConversations = async () => {
    if (!user) return

    try {
      setLoading(true)

      // Add a timeout for messages fetch (60 seconds)
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Conversations fetch timed out')), 60000)
      )

      // Fetch messages more efficiently with smaller limit
      const queryPromise = supabase
        .from('messages')
        .select('sender_id, recipient_id, content, created_at, read')
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order('created_at', { ascending: false })
        .limit(150)

      const result = await Promise.race([queryPromise, timeoutPromise])
      const { data, error: err } = result as any

      if (err) throw err

      const conversationMap = new Map<string, any>()
      const userIds = new Set<string>()

      // Process messages to build unique conversations
      data?.forEach((msg: any) => {
        const otherUserId = msg.sender_id === user.id ? msg.recipient_id : msg.sender_id
        userIds.add(otherUserId)
        if (!conversationMap.has(otherUserId)) {
          const isUnread = msg.recipient_id === user.id && !msg.read
          conversationMap.set(otherUserId, {
            id: otherUserId,
            user_id: user.id,
            other_user_id: otherUserId,
            other_user_name: null,
            other_user_image: null,
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
      lastFetchRef.current = Date.now()
      pollAttemptsRef.current = 0
    } catch (err: any) {
      const errorMessage = err?.message || (typeof err === 'string' ? err : 'Failed to fetch conversations')
      const errorDetails = err?.code ? ` (Code: ${err.code})` : err?.status ? ` (Status: ${err.status})` : ''
      setError(errorMessage)
      console.error('Error fetching conversations:', errorMessage + errorDetails, err)
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
  }, [])

  const subscribeToMessages = () => {
    if (!user) return

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
              const newMessage = payload.new as Message
              setMessages((prev) => {
                const isDuplicate = prev.some(m => m.id === newMessage.id)
                return isDuplicate ? prev : [...prev, newMessage]
              })

              // Update conversations list with new message
              setConversations((prev) => {
                const otherUserId = newMessage.sender_id === user.id ? newMessage.recipient_id : newMessage.sender_id
                const updated = prev.map((conv) => {
                  if (conv.other_user_id === otherUserId) {
                    return {
                      ...conv,
                      last_message: newMessage.content,
                      last_message_time: newMessage.created_at,
                      unread_count: newMessage.recipient_id === user.id && !newMessage.read
                        ? conv.unread_count + 1
                        : conv.unread_count,
                    }
                  }
                  return conv
                })

                // If conversation doesn't exist, fetch it once to get full details
                if (!updated.some((c) => c.other_user_id === otherUserId)) {
                  fetchConversations()
                }

                return updated
              })
            }
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.log('[Messages] Real-time subscription active')
          } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            console.warn('[Messages] Subscription error:', status, '- Check RLS policies on messages table')
          }
        })

      return () => {
        isMounted = false
        subscription.unsubscribe()
      }
    } catch (err) {
      console.warn('Failed to setup message subscription:', err)
      return
    }
  }

  const subscribeToConversation = useCallback(
    (otherUserId: string) => {
      if (!user) return

      let isMounted = true

      try {
        const subscription = supabase
          .channel(`conversation:${user.id}:${otherUserId}`)
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'messages',
              filter: `or(and(sender_id.eq.${user.id},recipient_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},recipient_id.eq.${user.id}))`,
            },
            (payload) => {
              if (isMounted) {
                const newMessage = payload.new as Message
                setMessages((prev) => {
                  const isDuplicate = prev.some(m => m.id === newMessage.id)
                  return isDuplicate ? prev : [...prev, newMessage]
                })
              }
            }
          )
          .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              console.log(`[Conversation] Real-time updates active for ${otherUserId}`)
            }
          })

        return () => {
          isMounted = false
          subscription.unsubscribe()
        }
      } catch (err) {
        console.warn('Failed to setup conversation subscription:', err)
        return
      }
    },
    [user]
  )

  const fetchMessages = useCallback(
    async (otherUserId: string) => {
      if (!user?.id) return

      try {
        // Add timeout for individual message fetch (30 seconds)
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Message fetch timed out')), 30000)
        )

        const queryPromise = supabase
          .from('messages')
          .select('id,sender_id,recipient_id,content,read,created_at')
          .or(
            `and(sender_id.eq.${user.id},recipient_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},recipient_id.eq.${user.id})`
          )
          .order('created_at', { ascending: true })

        const result = await Promise.race([queryPromise, timeoutPromise])
        const { data, error: err } = result as any

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
        // Optimistic update: add message to state immediately
        const tempMessage: Message = {
          id: `temp-${Date.now()}`,
          sender_id: user.id,
          recipient_id: recipientId,
          content,
          read: false,
          created_at: new Date().toISOString(),
        }

        setMessages((prev) => [...prev, tempMessage])

        // Insert into database - postgres_changes subscription will sync this
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

        // Replace temp message with real message from DB
        const realMessage = data as Message
        setMessages((prev) =>
          prev.map((msg) => msg.id === tempMessage.id ? realMessage : msg)
        )

        return realMessage
      } catch (err: any) {
        // Remove optimistic message on error
        setMessages((prev) => prev.filter((msg) => !msg.id.startsWith('temp-')))
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
        // Optimistic update: mark as read in state immediately
        setMessages((prev) =>
          prev.map((msg) => msg.id === messageId ? { ...msg, read: true } : msg)
        )
        setConversations((prev) =>
          prev.map((conv) => ({
            ...conv,
            unread_count: Math.max(0, conv.unread_count - 1),
          }))
        )

        // Update in database
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
    subscribeToConversation,
  }
}
