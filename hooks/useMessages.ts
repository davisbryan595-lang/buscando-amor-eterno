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
    subscribeToMessages()
  }, [user])

  const fetchConversations = async () => {
    if (!user) return

    try {
      setLoading(true)
      const { data, error: err } = await supabase
        .from('messages')
        .select('sender_id, recipient_id, content, created_at')
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order('created_at', { ascending: false })

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
    } catch (err: any) {
      setError(err.message)
      console.error('Error fetching conversations:', err)
    } finally {
      setLoading(false)
    }
  }

  const subscribeToMessages = () => {
    if (!user) return

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
          setMessages((prev) => [payload.new as Message, ...prev])
          fetchConversations()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
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

  return {
    conversations,
    messages,
    loading,
    error,
    fetchConversations,
    fetchMessages,
    sendMessage,
    markAsRead,
  }
}
