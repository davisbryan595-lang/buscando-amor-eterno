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
  type?: 'text' | 'call_log'
  call_type?: 'audio' | 'video'
  call_status?: 'ongoing' | 'incoming' | 'missed' | 'ended' | 'rejected'
  call_duration?: number
  call_id?: string
}

export interface TypingStatus {
  user_id: string
  is_typing: boolean
  timestamp: number
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
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isTypingRef = useRef(false)
  const heartbeatIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const onlineTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Define broadcastOnlineStatus early so it can be used in setupHeartbeat
  const broadcastOnlineStatus = useCallback(
    async (isOnline: boolean) => {
      if (!user) return

      try {
        const onlineStatus = {
          user_id: user.id,
          is_online: isOnline,
          timestamp: new Date().toISOString(),
        }

        // Broadcast to all conversations
        const userChannel = supabase.channel(`user:${user.id}:online`)

        // Subscribe before sending to ensure channel is ready
        await new Promise<void>((resolve) => {
          userChannel.subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              resolve()
            }
          })
        })

        await userChannel.send({
          type: 'broadcast',
          event: 'user_status',
          payload: onlineStatus,
        })

        userChannel.unsubscribe()
      } catch (err: any) {
        console.warn('Failed to broadcast online status:', err)
      }
    },
    [user]
  )

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

    const setupHeartbeat = () => {
      // Broadcast online status immediately
      broadcastOnlineStatus(true)

      // Set up heartbeat to send online status every 30 seconds
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current)
      }

      heartbeatIntervalRef.current = setInterval(() => {
        broadcastOnlineStatus(true)
      }, 30000)

      // Handle page visibility changes
      const handleVisibilityChange = () => {
        if (document.hidden) {
          console.log('[Heartbeat] Page hidden')
          broadcastOnlineStatus(false)
        } else {
          console.log('[Heartbeat] Page visible')
          broadcastOnlineStatus(true)
        }
      }

      document.addEventListener('visibilitychange', handleVisibilityChange)

      // Handle page unload - avoid sending messages during unload as network may fail
      const handleBeforeUnload = () => {
        // Don't attempt to send messages during unload as the network connection
        // is already being torn down. The server will detect the disconnect automatically.
        if (heartbeatIntervalRef.current) {
          clearInterval(heartbeatIntervalRef.current)
        }
      }

      window.addEventListener('beforeunload', handleBeforeUnload)

      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange)
        window.removeEventListener('beforeunload', handleBeforeUnload)
        if (heartbeatIntervalRef.current) {
          clearInterval(heartbeatIntervalRef.current)
        }
      }
    }

    initialize()
    const unsubscribe = subscribeToMessages()
    const cleanupHeartbeat = setupHeartbeat()

    return () => {
      isMounted = false
      if (unsubscribe) {
        unsubscribe()
      }
      if (cleanupHeartbeat) {
        cleanupHeartbeat()
      }
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
      if (onlineTimeoutRef.current) {
        clearTimeout(onlineTimeoutRef.current)
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
        .select('sender_id, recipient_id, content, created_at, read, type, call_type, call_status, call_duration, call_id')
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
        .on('broadcast', { event: 'new_message' }, (payload) => {
          if (isMounted) {
            console.log('[Messages] New message via broadcast:', payload.payload)
            const newMessage = payload.payload as Message

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
        })
        .on('broadcast', { event: 'user_status' }, (payload) => {
          if (isMounted) {
            console.log('[Messages] User status update:', payload.payload)
            const userStatus = payload.payload

            // Update conversation online status
            setConversations((prev) =>
              prev.map((conv) =>
                conv.other_user_id === userStatus.user_id
                  ? { ...conv, is_online: userStatus.is_online }
                  : conv
              )
            )
          }
        })
        .subscribe((status) => {
          console.log('[Messages] Broadcast subscription status:', status)
          if (status === 'SUBSCRIBED') {
            console.log('[Messages] Real-time broadcast subscription active')
          }
        })

      return () => {
        isMounted = false
        subscription.unsubscribe()
        supabase.removeChannel(subscription)
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
        const channel = supabase
          .channel(`messages:${user.id}:${otherUserId}`)
          .on('broadcast', { event: 'new_message' }, (payload) => {
            console.log('[Conversation] New message via broadcast:', payload.payload)
            if (isMounted) {
              const newMessage = payload.payload as Message
              setMessages((prevMessages) => {
                if (prevMessages.some(msg => msg.id === newMessage.id)) {
                  console.log('[Conversation] Duplicate message prevented:', newMessage.id)
                  return prevMessages
                }
                console.log('[Conversation] Adding new message to state:', newMessage.id)
                return [...prevMessages, newMessage]
              })
            }
          })
          .on('broadcast', { event: 'user_status' }, (payload) => {
            if (isMounted) {
              console.log('[Conversation] User status update for conversation:', payload.payload)
              const userStatus = payload.payload

              // Update conversation online status
              setConversations((prev) =>
                prev.map((conv) =>
                  conv.other_user_id === userStatus.user_id
                    ? { ...conv, is_online: userStatus.is_online }
                    : conv
                )
              )
            }
          })
          .subscribe((status) => {
            console.log(`[Conversation] Broadcast subscription status for ${otherUserId}:`, status)
            if (status === 'SUBSCRIBED') {
              console.log(`[Conversation] Real-time broadcast updates active for ${otherUserId}`)
            }
          })

        return () => {
          isMounted = false
          channel.unsubscribe()
          supabase.removeChannel(channel)
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
          .select('id,sender_id,recipient_id,content,read,created_at,type,call_type,call_status,call_duration,call_id')
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

        // Insert into database
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

        const realMessage = data as Message

        // Replace temp message with real message from DB
        setMessages((prev) =>
          prev.map((msg) => msg.id === tempMessage.id ? realMessage : msg)
        )

        // Create notification for recipient (don't await to avoid blocking message send)
        try {
          supabase
            .from('notifications')
            .insert({
              recipient_id: recipientId,
              from_user_id: user.id,
              type: 'message',
              message_preview: content.substring(0, 50),
            })
            .then()
            .catch((err) => console.warn('Failed to create message notification:', err))
        } catch (notifErr) {
          console.warn('Error creating notification:', notifErr)
        }

        // Broadcast to all relevant channels so subscribers get instant update
        const conversationChannel = supabase.channel(`messages:${user.id}:${recipientId}`)
        await conversationChannel.send({
          type: 'broadcast',
          event: 'new_message',
          payload: realMessage,
        })

        const userChannel = supabase.channel(`messages:${user.id}`)
        await userChannel.send({
          type: 'broadcast',
          event: 'new_message',
          payload: realMessage,
        })

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
    async (messageId: string, recipientId?: string) => {
      try {
        // Find the message to get recipient info for broadcasting
        const message = messages.find((msg) => msg.id === messageId)
        const targetRecipientId = recipientId || message?.sender_id

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

        // Broadcast read receipt to sender
        if (user && targetRecipientId) {
          const readReceipt = {
            message_id: messageId,
            reader_id: user.id,
            timestamp: new Date().toISOString(),
          }

          try {
            const conversationChannel = supabase.channel(`messages:${user.id}:${targetRecipientId}`)
            await conversationChannel.send({
              type: 'broadcast',
              event: 'message_read',
              payload: readReceipt,
            })

            const userChannel = supabase.channel(`messages:${user.id}`)
            await userChannel.send({
              type: 'broadcast',
              event: 'message_read',
              payload: readReceipt,
            })
          } catch (broadcastErr) {
            console.warn('Failed to broadcast read receipt:', broadcastErr)
          }
        }
      } catch (err: any) {
        const errorMessage = err?.message || (typeof err === 'string' ? err : 'Failed to mark message as read')
        setError(errorMessage)
        console.error('Error marking message as read:', errorMessage, err)
      }
    },
    [user, messages]
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

  const broadcastTyping = useCallback(
    async (recipientId: string, isTyping: boolean) => {
      if (!user) return

      try {
        const typingStatus: TypingStatus = {
          user_id: user.id,
          is_typing: isTyping,
          timestamp: Date.now(),
        }

        const conversationChannel = supabase.channel(`messages:${user.id}:${recipientId}`)
        await conversationChannel.send({
          type: 'broadcast',
          event: 'typing_indicator',
          payload: typingStatus,
        })
      } catch (err: any) {
        console.warn('Failed to broadcast typing status:', err)
      }
    },
    [user]
  )

  const handleTyping = useCallback(
    (recipientId: string) => {
      if (!user) return

      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }

      // If not already typing, broadcast typing started
      if (!isTypingRef.current) {
        isTypingRef.current = true
        broadcastTyping(recipientId, true)
      }

      // Set timeout to stop typing after 3 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        isTypingRef.current = false
        broadcastTyping(recipientId, false)
      }, 3000)
    },
    [user, broadcastTyping]
  )

  const stopTyping = useCallback(
    (recipientId: string) => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
      if (isTypingRef.current) {
        isTypingRef.current = false
        broadcastTyping(recipientId, false)
      }
    },
    [broadcastTyping]
  )

  const logCallMessage = useCallback(
    async (
      recipientId: string,
      callType: 'audio' | 'video',
      callStatus: 'ongoing' | 'incoming' | 'missed' | 'ended' | 'rejected',
      callDuration?: number,
      callId?: string
    ) => {
      if (!user) throw new Error('No user logged in')

      try {
        if (callStatus === 'ongoing') {
          // For ongoing calls, generate a new call_id and insert a new record
          const newCallId = callId || crypto.randomUUID()

          const { data, error: err } = await supabase
            .from('messages')
            .insert({
              sender_id: user.id,
              recipient_id: recipientId,
              content: `Ongoing ${callType} call`,
              read: true,
              type: 'call_log',
              call_type: callType,
              call_status: 'ongoing',
              call_duration: null,
              call_id: newCallId,
            })
            .select()
            .single()

          if (err) throw err

          const callMessage = data as Message
          setMessages((prev) => [...prev, callMessage])

          // Store call timing info for later
          if (typeof window !== 'undefined') {
            localStorage.setItem(`call_${newCallId}_start`, Date.now().toString())
          }

          // Broadcast the call message
          const conversationChannel = supabase.channel(`messages:${user.id}:${recipientId}`)
          await conversationChannel.send({
            type: 'broadcast',
            event: 'new_message',
            payload: callMessage,
          })

          const userChannel = supabase.channel(`messages:${user.id}`)
          await userChannel.send({
            type: 'broadcast',
            event: 'new_message',
            payload: callMessage,
          })

          // Set up 30-second timeout for missed call
          const missedCallTimeout = setTimeout(async () => {
            if (typeof window !== 'undefined') {
              const callStillActive = localStorage.getItem(`call_${newCallId}_start`)
              if (callStillActive) {
                // Call wasn't explicitly ended, mark as missed
                await logCallMessage(recipientId, callType, 'missed', undefined, newCallId)
              }
            }
          }, 30000)

          // Store timeout reference for cleanup
          if (typeof window !== 'undefined') {
            localStorage.setItem(`call_${newCallId}_timeout`, missedCallTimeout.toString())
          }

          // Return the new call_id
          return newCallId
        } else if (callStatus === 'ended' && callId) {
          // For ended calls, update the existing record with duration
          const durationSeconds = callDuration || 0

          // Update the call log with final status and duration
          const { data, error: err } = await supabase
            .from('messages')
            .update({
              call_status: 'ended',
              call_duration: durationSeconds,
              content: `${callType} call · ${Math.floor(durationSeconds / 60)}:${String(durationSeconds % 60).padStart(2, '0')}`,
            })
            .eq('call_id', callId)
            .select()
            .single()

          if (err) throw err

          const callMessage = data as Message

          // Update in messages state
          setMessages((prev) =>
            prev.map((msg) => msg.call_id === callId ? callMessage : msg)
          )

          // Cleanup localStorage
          if (typeof window !== 'undefined') {
            localStorage.removeItem(`call_${callId}_start`)
            localStorage.removeItem(`call_${callId}_timeout`)
          }

          // Broadcast the updated call message to both users
          const conversationChannel = supabase.channel(`messages:${user.id}:${recipientId}`)
          await conversationChannel.send({
            type: 'broadcast',
            event: 'new_message',
            payload: callMessage,
          })

          const userChannel = supabase.channel(`messages:${user.id}`)
          await userChannel.send({
            type: 'broadcast',
            event: 'new_message',
            payload: callMessage,
          })

          // Broadcast call end signal so both sides end the call immediately
          await conversationChannel.send({
            type: 'broadcast',
            event: 'call_ended',
            payload: { callId, callType, duration: durationSeconds },
          })

          await userChannel.send({
            type: 'broadcast',
            event: 'call_ended',
            payload: { callId, callType, duration: durationSeconds },
          })
        } else if (callStatus === 'missed' && callId) {
          // For missed calls, update the existing record
          const { data, error: err } = await supabase
            .from('messages')
            .update({
              call_status: 'missed',
              content: `Missed ${callType} call`,
            })
            .eq('call_id', callId)
            .select()
            .single()

          if (err) throw err

          const callMessage = data as Message

          // Update in messages state
          setMessages((prev) =>
            prev.map((msg) => msg.call_id === callId ? callMessage : msg)
          )

          // Cleanup localStorage
          if (typeof window !== 'undefined') {
            localStorage.removeItem(`call_${callId}_start`)
            localStorage.removeItem(`call_${callId}_timeout`)
          }

          // Create notification for missed call (don't await to avoid blocking)
          try {
            supabase
              .from('notifications')
              .insert({
                recipient_id: recipientId,
                from_user_id: user.id,
                type: 'call_missed',
                call_type: callType,
                call_status: 'missed',
              })
              .then()
              .catch((err) => console.warn('Failed to create missed call notification:', err))
          } catch (notifErr) {
            console.warn('Error creating missed call notification:', notifErr)
          }

          // Broadcast the updated call message
          const conversationChannel = supabase.channel(`messages:${user.id}:${recipientId}`)
          await conversationChannel.send({
            type: 'broadcast',
            event: 'new_message',
            payload: callMessage,
          })

          const userChannel = supabase.channel(`messages:${user.id}`)
          await userChannel.send({
            type: 'broadcast',
            event: 'new_message',
            payload: callMessage,
          })

          // Broadcast missed call signal
          await conversationChannel.send({
            type: 'broadcast',
            event: 'call_missed',
            payload: { callId, callType },
          })

          await userChannel.send({
            type: 'broadcast',
            event: 'call_missed',
            payload: { callId, callType },
          })
        } else if (callStatus === 'rejected' && callId) {
          // For rejected calls, update the existing record
          const { data, error: err } = await supabase
            .from('messages')
            .update({
              call_status: 'rejected',
              content: `Declined ${callType} call`,
            })
            .eq('call_id', callId)
            .select()
            .single()

          if (err) throw err

          const callMessage = data as Message

          // Update in messages state
          setMessages((prev) =>
            prev.map((msg) => msg.call_id === callId ? callMessage : msg)
          )

          // Cleanup localStorage
          if (typeof window !== 'undefined') {
            localStorage.removeItem(`call_${callId}_start`)
            localStorage.removeItem(`call_${callId}_timeout`)
          }

          // Broadcast the updated call message
          const conversationChannel = supabase.channel(`messages:${user.id}:${recipientId}`)
          await conversationChannel.send({
            type: 'broadcast',
            event: 'new_message',
            payload: callMessage,
          })

          const userChannel = supabase.channel(`messages:${user.id}`)
          await userChannel.send({
            type: 'broadcast',
            event: 'new_message',
            payload: callMessage,
          })
        }
      } catch (err: any) {
        console.error('Error logging call message:', err)
        throw err
      }
    },
    [user]
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
    logCallMessage,
    handleTyping,
    stopTyping,
    broadcastTyping,
    broadcastOnlineStatus,
  }
}
