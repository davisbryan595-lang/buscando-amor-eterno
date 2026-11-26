import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from '@/context/auth-context'
import { supabase } from '@/lib/supabase'

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

const MESSAGES_PAGE_SIZE = 50
const CACHE_TTL = 30_000

type MessageCache = { messages: Message[]; cursor: Message | null; hasMore: boolean; fetchedAt: number }
type UserCache = { conversations: Conversation[] | null; conversationsFetchedAt: number; messages: Map<string, MessageCache>; seenEvents: Set<string> }
const caches = new Map<string, UserCache>()
const getCache = (userId: string): UserCache => {
  let cache = caches.get(userId)
  if (!cache) {
    cache = { conversations: null, conversationsFetchedAt: 0, messages: new Map(), seenEvents: new Set() }
    caches.set(userId, cache)
  }
  return cache
}

// All hook consumers for an account share one receiving channel.
type RealtimeEvent = 'new_message' | 'typing_indicator' | 'message_read' | 'user_status'
type Listener = (event: RealtimeEvent, payload: any) => void
const receivers = new Map<string, { listeners: Set<Listener>; channel: ReturnType<typeof supabase.channel> }>()
function listen(userId: string, listener: Listener) {
  let receiver = receivers.get(userId)
  if (!receiver) {
    const listeners = new Set<Listener>()
    const channel = supabase.channel(`messages:${userId}`)
    for (const event of ['new_message', 'typing_indicator', 'message_read', 'user_status'] as const) {
      channel.on('broadcast', { event }, ({ payload }) => listeners.forEach(fn => fn(event, payload)))
    }
    channel.subscribe()
    receiver = { listeners, channel }
    receivers.set(userId, receiver)
  }
  receiver.listeners.add(listener)
  return () => {
    receiver!.listeners.delete(listener)
    if (receiver!.listeners.size === 0 && receivers.get(userId) === receiver) {
      receivers.delete(userId)
      void supabase.removeChannel(receiver!.channel)
    }
  }
}

// Send to the recipient's inbox, not to a sender-specific conversation topic.
async function broadcast(recipientId: string, event: string, payload: unknown) {
  const channel = supabase.channel(`messages:${recipientId}`)
  try {
    const result = await channel.send({ type: 'broadcast', event, payload })
    if (result !== 'ok') console.warn(`Failed to broadcast ${event}:`, result)
  } catch (err) {
    console.warn(`Failed to broadcast ${event}:`, err)
  } finally {
    await supabase.removeChannel(channel)
  }
}

function mergeMessages(...groups: Message[][]) {
  const byId = new Map<string, Message>()
  groups.flat().forEach(message => byId.set(message.id, message))
  return Array.from(byId.values()).sort((a, b) => a.created_at.localeCompare(b.created_at) || a.id.localeCompare(b.id))
}

export function useMessages() {
  const { user } = useAuth()
  const userId: string | undefined = user?.id
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [conversationError, setConversationError] = useState<string | null>(null)
  const [hasMoreMessages, setHasMoreMessages] = useState(true)
  const [typingStatus, setTypingStatus] = useState<TypingStatus | null>(null)
  const activeUserRef = useRef(userId)
  activeUserRef.current = userId
  const activeConversationRef = useRef<string | null>(null)
  const generationRef = useRef(0)
  const pageRequestRef = useRef(false)
  const conversationRequestRef = useRef(0)
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const typingRecipientRef = useRef<string | null>(null)
  const readInFlightRef = useRef(new Set<string>())
  const readFailedRef = useRef(new Set<string>())
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const updateMessages = useCallback((owner: string, other: string, update: (messages: Message[]) => Message[]) => {
    if (activeUserRef.current !== owner) return
    const cache = getCache(owner)
    const entry = cache.messages.get(other)
    // Do not turn an unsolicited message into a supposedly complete cached page.
    if (entry) entry.messages = update(entry.messages)
    if (activeConversationRef.current === other) setMessages(prev => update(prev))
  }, [])

  const fetchConversations = useCallback(async () => {
    if (!userId) return
    const request = ++conversationRequestRef.current
    const cache = getCache(userId)
    if (!cache.conversations) setLoading(true)
    try {
      const { data, error: err } = await supabase.from('messages')
        .select('sender_id, recipient_id, content, created_at, read, type, call_type, call_status, call_duration, call_id')
        .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
        .order('created_at', { ascending: false }).limit(100)
      if (err) throw err
      const map = new Map<string, Conversation>()
      data?.forEach((msg: any) => {
        const other = msg.sender_id === userId ? msg.recipient_id : msg.sender_id
        const existing = map.get(other)
        if (!existing) map.set(other, {
          id: other, user_id: userId, other_user_id: other, other_user_name: null,
          other_user_image: null, last_message: msg.content, last_message_time: msg.created_at,
          unread_count: msg.recipient_id === userId && !msg.read ? 1 : 0, is_online: false,
        })
        else if (msg.recipient_id === userId && !msg.read) existing.unread_count++
      })
      const result = Array.from(map.values())
      if (result.length) {
        const { data: profiles, error: profileError } = await supabase.from('profiles')
          .select('user_id, full_name, photos, main_photo_index').in('user_id', result.map(c => c.other_user_id))
        if (profileError) console.warn('Profile fetch error (non-blocking):', profileError)
        profiles?.forEach(profile => {
          const conv = map.get(profile.user_id)
          if (conv) {
            conv.other_user_name = profile.full_name
            conv.other_user_image = profile.photos?.[profile.main_photo_index || 0] || null
          }
        })
      }
      if (activeUserRef.current !== userId || request !== conversationRequestRef.current) return
      cache.conversations = result
      cache.conversationsFetchedAt = Date.now()
      setConversations(result)
      setConversationError(null)
    } catch (err: any) {
      if (activeUserRef.current !== userId || request !== conversationRequestRef.current) return
      setConversationError(err?.message || 'Failed to fetch conversations')
      console.error('Error fetching conversations:', err)
    } finally {
      if (activeUserRef.current === userId && request === conversationRequestRef.current) setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    activeUserRef.current = userId
    generationRef.current++
    activeConversationRef.current = null
    pageRequestRef.current = false
    setMessages([])
    setTypingStatus(null)
    setError(null)
    setConversationError(null)
    if (!userId) {
      setConversations([])
      setLoading(false)
      return
    }
    const cache = getCache(userId)
    setConversations(cache.conversations || [])
    setLoading(!cache.conversations)
    if (!cache.conversations || Date.now() - cache.conversationsFetchedAt > CACHE_TTL) void fetchConversations()
    const unsubscribe = listen(userId, (event, payload) => {
      if (activeUserRef.current !== userId) return
      if (event === 'typing_indicator') {
        if (payload?.user_id === activeConversationRef.current) setTypingStatus(payload)
      } else if (event === 'message_read') {
        if (payload?.reader_id && payload?.message_id) {
          updateMessages(userId, payload.reader_id, prev => prev.map(m => m.id === payload.message_id && m.sender_id === userId ? { ...m, read: true } : m))
        }
      } else if (event === 'user_status') {
        setConversations(prev => prev.map(c => c.other_user_id === payload?.user_id ? { ...c, is_online: !!payload.is_online } : c))
      } else if (event === 'new_message') {
        const message = payload as Message
        if (!message?.id || (message.sender_id !== userId && message.recipient_id !== userId)) return
        const other = message.sender_id === userId ? message.recipient_id : message.sender_id
        const entry = cache.messages.get(other)
        const alreadyKnown = cache.seenEvents.has(message.id) || entry?.messages.some(m => m.id === message.id) || false
        cache.seenEvents.add(message.id)
        if (cache.seenEvents.size > 1000) cache.seenEvents.delete(cache.seenEvents.values().next().value!)
        updateMessages(userId, other, prev => mergeMessages(prev, [message]))
        // A fetch may have raced this event; invalidate it before refreshing.
        conversationRequestRef.current++
        const current = cache.conversations
        if (!current?.some(c => c.other_user_id === other)) {
          void fetchConversations()
        } else {
          const updated = current.map(c => c.other_user_id === other ? {
            ...c,
            ...(message.created_at >= c.last_message_time ? { last_message: message.content, last_message_time: message.created_at } : {}),
            unread_count: c.unread_count + (!alreadyKnown && message.recipient_id === userId && !message.read ? 1 : 0),
          } : c).sort((a, b) => b.last_message_time.localeCompare(a.last_message_time))
          cache.conversations = updated
          setConversations(updated)
          setLoading(false)
        }
      }
    })
    return () => {
      generationRef.current++
      conversationRequestRef.current++
      activeUserRef.current = undefined
      unsubscribe()
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current)
    }
  }, [userId, fetchConversations, updateMessages])

  const fetchMessages = useCallback(async (other: string, offset = 0) => {
    if (!userId) return
    const cache = getCache(userId)
    let entry = cache.messages.get(other)
    const initial = offset === 0
    if (initial) {
      activeConversationRef.current = other
      generationRef.current++
      pageRequestRef.current = false
      setTypingStatus(null)
      setMessages(entry?.messages || [])
      setHasMoreMessages(entry?.hasMore ?? true)
      readFailedRef.current.clear()
      if (entry && entry.fetchedAt && Date.now() - entry.fetchedAt < CACHE_TTL) return
      if (!entry) {
        entry = { messages: [], cursor: null, hasMore: true, fetchedAt: 0 }
        cache.messages.set(other, entry)
      }
    } else if (activeConversationRef.current !== other || pageRequestRef.current || !entry?.hasMore || !entry.cursor) return
    const generation = generationRef.current
    const baseline = new Map(entry?.messages.map(message => [message.id, message]))
    pageRequestRef.current = true
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 30_000)
    try {
      let query = supabase.from('messages')
        .select('id,sender_id,recipient_id,content,read,created_at,type,call_type,call_status,call_duration,call_id')
        .or(`and(sender_id.eq.${userId},recipient_id.eq.${other}),and(sender_id.eq.${other},recipient_id.eq.${userId})`)
        .order('created_at', { ascending: false }).order('id', { ascending: false }).limit(MESSAGES_PAGE_SIZE).abortSignal(controller.signal)
      if (!initial && entry?.cursor) {
        query = query.or(`created_at.lt.${entry.cursor.created_at},and(created_at.eq.${entry.cursor.created_at},id.lt.${entry.cursor.id})`)
      }
      const { data, error: err } = await query
      if (err) throw err
      if (activeUserRef.current !== userId || generation !== generationRef.current || activeConversationRef.current !== other) return
      const page = (data || []) as Message[]
      const current = cache.messages.get(other)
      // Preserve locally received and optimistic messages while an initial refresh is in flight.
      const changedDuringFetch = (current?.messages || []).filter(message => baseline.get(message.id) !== message)
      const merged = mergeMessages(current?.messages || [], page, changedDuringFetch)
      const pageCursor = page[page.length - 1]
      const preserveCursor = !!(initial && current?.cursor && pageCursor && (current.cursor.created_at < pageCursor.created_at || (current.cursor.created_at === pageCursor.created_at && current.cursor.id < pageCursor.id)))
      entry = {
        messages: merged,
        cursor: preserveCursor ? current!.cursor : pageCursor || current?.cursor || null,
        hasMore: preserveCursor ? current!.hasMore : page.length === MESSAGES_PAGE_SIZE,
        fetchedAt: Date.now(),
      }
      cache.messages.set(other, entry)
      setMessages(merged)
      setHasMoreMessages(entry.hasMore)
      setError(null)
    } catch (err: any) {
      if (activeUserRef.current === userId && generation === generationRef.current) {
        setError(err?.message || 'Failed to fetch messages')
        console.error('Error fetching messages:', err)
      }
    } finally {
      clearTimeout(timeout)
      if (generation === generationRef.current) pageRequestRef.current = false
    }
  }, [userId])

  const loadMoreMessages = useCallback(async (other: string) => {
    await fetchMessages(other, 1)
  }, [fetchMessages])

  const sendMessage = useCallback(async (recipientId: string, content: string) => {
    if (!userId) throw new Error('No user logged in')
    const temp: Message = { id: `temp-${crypto.randomUUID()}`, sender_id: userId, recipient_id: recipientId, content, read: false, created_at: new Date().toISOString() }
    updateMessages(userId, recipientId, prev => mergeMessages(prev, [temp]))
    try {
      const { data, error: err } = await supabase.from('messages').insert({ sender_id: userId, recipient_id: recipientId, content, read: false }).select().single()
      if (err) throw err
      const message = data as Message
      updateMessages(userId, recipientId, prev => mergeMessages(prev.filter(m => m.id !== temp.id), [message]))
      void Promise.resolve(supabase.from('notifications').insert({ recipient_id: recipientId, from_user_id: userId, type: 'message', message_preview: content.substring(0, 50) })).then(({ error }) => { if (error) console.warn('Failed to create message notification:', error) }).catch(err => console.warn('Failed to create message notification:', err))
      void broadcast(recipientId, 'new_message', message)
      void fetchConversations()
      return message
    } catch (err: any) {
      updateMessages(userId, recipientId, prev => prev.filter(m => m.id !== temp.id))
      if (activeUserRef.current === userId) setError(err?.message || 'Failed to send message')
      throw err
    }
  }, [userId, updateMessages, fetchConversations])

  const markAsRead = useCallback(async (messageId: string, senderId?: string) => {
    if (!userId || !senderId || readInFlightRef.current.has(messageId) || readFailedRef.current.has(messageId)) return
    const entry = getCache(userId).messages.get(senderId)
    const message = entry?.messages.find(m => m.id === messageId)
    if (!message || message.read || message.recipient_id !== userId || message.sender_id !== senderId) return
    readInFlightRef.current.add(messageId)
    conversationRequestRef.current++
    setLoading(false)
    updateMessages(userId, senderId, prev => prev.map(m => m.id === messageId ? { ...m, read: true } : m))
    const cache = getCache(userId)
    if (cache.conversations) {
      cache.conversations = cache.conversations.map(c => c.other_user_id === senderId ? { ...c, unread_count: Math.max(0, c.unread_count - 1) } : c)
      setConversations(cache.conversations)
    }
    try {
      const { error: err } = await supabase.from('messages').update({ read: true }).eq('id', messageId).eq('recipient_id', userId)
      if (err) throw err
      void broadcast(senderId, 'message_read', { message_id: messageId, reader_id: userId, timestamp: Date.now() })
      if (activeUserRef.current === userId) {
        if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current)
        refreshTimerRef.current = setTimeout(() => { void fetchConversations() }, 500)
      }
    } catch (err: any) {
      readFailedRef.current.add(messageId)
      updateMessages(userId, senderId, prev => prev.map(m => m.id === messageId ? { ...m, read: false } : m))
      if (activeUserRef.current === userId) {
        setError(err?.message || 'Failed to mark message as read')
        void fetchConversations()
      }
    } finally {
      readInFlightRef.current.delete(messageId)
    }
  }, [userId, updateMessages, fetchConversations])

  const initiateConversation = useCallback(async (otherUserId: string) => {
    if (!userId) throw new Error('No user logged in')
    const existing = getCache(userId).conversations?.find(c => c.other_user_id === otherUserId)
    if (existing) return existing
    const { data, error: err } = await supabase.from('messages').insert({ sender_id: userId, recipient_id: otherUserId, content: '👋 Conversation started', read: false }).select().single()
    if (err) throw err
    void broadcast(otherUserId, 'new_message', data)
    await fetchConversations()
    return { id: otherUserId, user_id: userId, other_user_id: otherUserId, other_user_name: null, other_user_image: null, last_message: '👋 Conversation started', last_message_time: new Date().toISOString(), is_online: false, unread_count: 0 }
  }, [userId, fetchConversations])

  const broadcastTyping = useCallback(async (recipientId: string, isTyping: boolean) => {
    if (userId) await broadcast(recipientId, 'typing_indicator', { user_id: userId, is_typing: isTyping, timestamp: Date.now() })
  }, [userId])
  const stopTyping = useCallback((recipientId: string) => {
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    if (typingRecipientRef.current === recipientId) {
      typingRecipientRef.current = null
      void broadcastTyping(recipientId, false)
    }
  }, [broadcastTyping])
  const handleTyping = useCallback((recipientId: string) => {
    if (typingRecipientRef.current && typingRecipientRef.current !== recipientId) stopTyping(typingRecipientRef.current)
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    if (!typingRecipientRef.current) {
      typingRecipientRef.current = recipientId
      void broadcastTyping(recipientId, true)
    }
    typingTimeoutRef.current = setTimeout(() => stopTyping(recipientId), 3000)
  }, [broadcastTyping, stopTyping])
  const broadcastOnlineStatus = useCallback(async (_isOnline: boolean) => {}, [])
  // Conversation events are delivered by the shared user inbox subscription.
  const subscribeToConversation = useCallback((_otherUserId: string) => () => {}, [])

  const logCallMessage = useCallback(async (recipientId: string, callType: 'audio' | 'video', callStatus: 'ongoing' | 'incoming' | 'missed' | 'ended' | 'rejected', callDuration?: number, callId?: string) => {
    if (!userId) throw new Error('No user logged in')
    if (callStatus === 'ongoing') {
      const newCallId = callId || crypto.randomUUID()
      const { data, error: err } = await supabase.from('messages').insert({ sender_id: userId, recipient_id: recipientId, content: `Ongoing ${callType} call`, read: true, type: 'call_log', call_type: callType, call_status: 'ongoing', call_duration: null, call_id: newCallId }).select().single()
      if (err) throw err
      updateMessages(userId, recipientId, prev => mergeMessages(prev, [data as Message]))
      void broadcast(recipientId, 'new_message', data)
      if (typeof window !== 'undefined') {
        localStorage.setItem(`call_${newCallId}_start`, Date.now().toString())
        const timeout = setTimeout(() => {
          if (localStorage.getItem(`call_${newCallId}_start`)) void logCallMessage(recipientId, callType, 'missed', undefined, newCallId).catch(console.error)
        }, 30000)
        localStorage.setItem(`call_${newCallId}_timeout`, timeout.toString())
      }
      return newCallId
    }
    if (!callId || !['ended', 'missed', 'rejected'].includes(callStatus)) return
    const duration = callDuration || 0
    const content = callStatus === 'ended' ? `${callType} call · ${Math.floor(duration / 60)}:${String(duration % 60).padStart(2, '0')}` : callStatus === 'missed' ? `Missed ${callType} call` : `Declined ${callType} call`
    const { data, error: err } = await supabase.from('messages').update({ call_status: callStatus, ...(callStatus === 'ended' ? { call_duration: duration } : {}), content }).eq('call_id', callId).select().single()
    if (err) throw err
    updateMessages(userId, recipientId, prev => mergeMessages(prev.filter(m => m.call_id !== callId), [data as Message]))
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`call_${callId}_start`)
      localStorage.removeItem(`call_${callId}_timeout`)
    }
    if (callStatus === 'missed') {
      void Promise.resolve(supabase.from('notifications').insert({ recipient_id: recipientId, from_user_id: userId, type: 'call_missed', call_type: callType, call_status: 'missed' })).then(({ error }) => { if (error) console.warn('Failed to create missed call notification:', error) }).catch(console.warn)
    }
    void broadcast(recipientId, 'new_message', data)
    if (callStatus === 'ended' || callStatus === 'missed') void broadcast(recipientId, `call_${callStatus}`, { callId, callType, ...(callStatus === 'ended' ? { duration } : {}) })
  }, [userId, updateMessages])

  const scopedConversations = useMemo(() => conversations.filter(c => c.user_id === userId), [conversations, userId])
  const scopedMessages = useMemo(() => messages.filter(m => m.sender_id === userId || m.recipient_id === userId), [messages, userId])
  return { conversations: scopedConversations, messages: scopedMessages, loading, error, conversationError, hasMoreMessages, typingStatus, fetchConversations, fetchMessages, loadMoreMessages, sendMessage, markAsRead, initiateConversation, subscribeToConversation, logCallMessage, handleTyping, stopTyping, broadcastTyping, broadcastOnlineStatus }
}
