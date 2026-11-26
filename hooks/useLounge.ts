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

const KEYWORD_FILTER_PATTERNS = [/badword1/gi, /inappropriate/gi, /offensive/gi]
const PAGE_SIZE = 200
const CACHE_TTL = 5 * 60 * 1000
// Memory only: do not persist one account's lounge data on the device.
const messageCache = new Map<string, { messages: LoungeMessage[]; savedAt: number }>()

type MessageRow = { id: string; user_id: string; content: string; created_at: string }
type Cursor = { id: string; created_at: string }

function mergeMessages(...groups: LoungeMessage[][]): LoungeMessage[] {
  const byId = new Map<string, LoungeMessage>()
  groups.flat().forEach((message) => byId.set(message.id, message))
  return Array.from(byId.values()).sort((a, b) =>
    a.created_at < b.created_at ? -1 : a.created_at > b.created_at ? 1 : a.id < b.id ? -1 : a.id > b.id ? 1 : 0
  )
}

async function enrichMessages(rows: MessageRow[]): Promise<LoungeMessage[]> {
  if (!rows.length) return []
  const senderIds = Array.from(new Set(rows.map((row) => row.user_id)))
  let profiles: any[] = []
  try {
    const result = await supabase
      .from('profiles')
      .select('user_id, full_name, photos, main_photo_index')
      .in('user_id', senderIds)
    profiles = result.data || []
  } catch (err) {
    console.error('Error loading lounge profiles:', err)
  }
  const profileMap = new Map(profiles.map((profile: any) => [profile.user_id, profile]))
  return rows.map((row) => {
    const profile: any = profileMap.get(row.user_id)
    return {
      id: row.id,
      user_id: row.user_id,
      message: row.content,
      message_type: 'text',
      reported_count: 0,
      created_at: row.created_at,
      sender_name: profile?.full_name || 'Anonymous',
      sender_image: profile?.photos?.[profile?.main_photo_index || 0] || undefined,
    }
  })
}

function errorText(err: any, fallback: string) {
  return err?.message || err?.error_description || fallback
}

export function useLounge() {
  const { user } = useAuth()
  const userId: string | undefined = user?.id
  const currentUserRef = useRef(userId)
  currentUserRef.current = userId
  const [owner, setOwner] = useState<string | undefined>(userId)
  const [messages, setMessages] = useState<LoungeMessage[]>([])
  const [onlineUsers, setOnlineUsers] = useState<LoungeUser[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingOlder, setLoadingOlder] = useState(false)
  const [hasOlder, setHasOlder] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const activeRef = useRef(false)
  const sessionRef = useRef(0)
  const cursorRef = useRef<Cursor | null>(null)
  const pagingRef = useRef(false)
  const liveRef = useRef<LoungeMessage[]>([])
  const initialAppliedRef = useRef(false)
  const fetchVersionRef = useRef(0)

  const isCurrent = useCallback((id: string) => activeRef.current && currentUserRef.current === id, [])

  // Cache only the newest page, scoped by account and bounded in size and age.
  useEffect(() => {
    if (!userId || owner !== userId || !activeRef.current || !initialAppliedRef.current) return
    messageCache.set(userId, { messages: messages.slice(-PAGE_SIZE), savedAt: Date.now() })
    while (messageCache.size > 5) messageCache.delete(messageCache.keys().next().value as string)
  }, [messages, owner, userId])

  const fetchMessages = useCallback(async (id: string) => {
    const version = ++fetchVersionRef.current
    try {
      const { data, error: err } = await supabase
        .from('lounge_messages')
        .select('id, user_id, content, created_at')
        .order('created_at', { ascending: false })
        .order('id', { ascending: false })
        .limit(PAGE_SIZE)
      if (err) throw err
      const rows = (data || []) as MessageRow[]
      const enriched = await enrichMessages(rows)
      if (!isCurrent(id) || version !== fetchVersionRef.current) return
      if (!initialAppliedRef.current) {
        initialAppliedRef.current = true
        cursorRef.current = rows.length ? rows[rows.length - 1] : null
        setHasOlder(rows.length === PAGE_SIZE)
        // Replace the provisional cache, but preserve inserts observed during fetch.
        setMessages(mergeMessages(enriched, liveRef.current))
      } else {
        // Reconnect catch-up must not discard loaded history or concurrent inserts.
        setMessages((previous) => mergeMessages(previous, enriched, liveRef.current))
      }
      setError(null)
    } catch (err: any) {
      if (isCurrent(id) && version === fetchVersionRef.current) {
        console.error('Error fetching lounge messages:', err)
        setError(errorText(err, 'Failed to load lounge messages'))
      }
    } finally {
      if (isCurrent(id) && version === fetchVersionRef.current) setLoading(false)
    }
  }, [isCurrent])

  const loadOlder = useCallback(async (): Promise<boolean> => {
    const id = userId
    const cursor = cursorRef.current
    if (!id || !isCurrent(id) || !initialAppliedRef.current || !cursor || pagingRef.current || !hasOlder) return false
    const session = sessionRef.current
    pagingRef.current = true
    setLoadingOlder(true)
    try {
      // Composite keyset cursor avoids skipping rows with identical timestamps.
      const { data, error: err } = await supabase
        .from('lounge_messages')
        .select('id, user_id, content, created_at')
        .or(`created_at.lt.${cursor.created_at},and(created_at.eq.${cursor.created_at},id.lt.${cursor.id})`)
        .order('created_at', { ascending: false })
        .order('id', { ascending: false })
        .limit(PAGE_SIZE)
      if (err) throw err
      const rows = (data || []) as MessageRow[]
      const enriched = await enrichMessages(rows)
      if (!isCurrent(id) || session !== sessionRef.current) return false
      if (rows.length) cursorRef.current = rows[rows.length - 1]
      setHasOlder(rows.length === PAGE_SIZE)
      setMessages((previous) => mergeMessages(enriched, previous))
      setError(null)
      return rows.length > 0
    } catch (err: any) {
      if (isCurrent(id) && session === sessionRef.current) {
        console.error('Error loading older lounge messages:', err)
        setError(errorText(err, 'Failed to load older messages'))
      }
      return false
    } finally {
      if (isCurrent(id) && session === sessionRef.current) {
        pagingRef.current = false
        setLoadingOlder(false)
      }
    }
  }, [userId, hasOlder, isCurrent])

  const addLiveMessage = useCallback((message: LoungeMessage, id: string) => {
    if (!isCurrent(id)) return
    liveRef.current = mergeMessages(liveRef.current, [message])
    setMessages((previous) => mergeMessages(previous, [message]))
  }, [isCurrent])

  useEffect(() => {
    activeRef.current = true
    sessionRef.current += 1
    fetchVersionRef.current += 1
    cursorRef.current = null
    pagingRef.current = false
    liveRef.current = []
    initialAppliedRef.current = false
    setOwner(userId)
    setOnlineUsers([])
    setError(null)
    setLoadingOlder(false)
    setHasOlder(false)
    if (!userId) {
      setMessages([])
      setLoading(false)
      return () => { activeRef.current = false }
    }

    const cached = messageCache.get(userId)
    if (cached && Date.now() - cached.savedAt < CACHE_TTL) {
      setMessages(cached.messages)
      setLoading(false)
    } else {
      messageCache.delete(userId)
      setMessages([])
      setLoading(true)
    }

    let mounted = true
    let messageChannel: any
    let presenceChannel: any
    let messageRetry: ReturnType<typeof setTimeout> | undefined
    let presenceRetry: ReturnType<typeof setTimeout> | undefined
    let messageRetries = 0
    let presenceRetries = 0
    const maxRetries = 5
    const stillCurrent = () => mounted && isCurrent(userId)

    const scheduleMessageRetry = () => {
      if (!stillCurrent() || messageRetry || messageRetries >= maxRetries) return
      const delay = Math.min(1000 * Math.pow(2, messageRetries++), 10000)
      messageRetry = setTimeout(() => { messageRetry = undefined; setupMessages() }, delay)
    }
    const setupMessages = () => {
      if (!stillCurrent()) return
      try {
        if (messageChannel) supabase.removeChannel(messageChannel)
        const channel = supabase.channel('global_singles_lounge_db')
        messageChannel = channel
        channel.on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'lounge_messages' }, async (payload) => {
          const [message] = await enrichMessages([payload.new as MessageRow])
          if (stillCurrent() && message) addLiveMessage(message, userId)
        }).subscribe((status, err) => {
          if (!stillCurrent() || channel !== messageChannel) return
          if (err) console.log('[Lounge] Subscription error:', err.message)
          if (status === 'SUBSCRIBED') {
            if (messageRetry) clearTimeout(messageRetry)
            messageRetry = undefined
            messageRetries = 0
            // Close the gap between the first query and subscription/reconnection.
            fetchMessages(userId)
          } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            scheduleMessageRetry()
          }
        })
      } catch (err) {
        console.error('Error subscribing to lounge messages:', err)
        scheduleMessageRetry()
      }
    }

    const setupPresence = async () => {
      if (!stillCurrent()) return
      try {
        const { data: profile } = await supabase.from('profiles')
          .select('full_name, photos, main_photo_index').eq('user_id', userId).maybeSingle()
        if (!stillCurrent()) return
        if (presenceChannel) {
          presenceChannel.untrack()
          supabase.removeChannel(presenceChannel)
        }
        const channel = supabase.channel('global_singles_lounge_presence')
        presenceChannel = channel
        channel.on('presence', { event: 'sync' }, () => {
          if (!stillCurrent() || channel !== presenceChannel) return
          const state = channel.presenceState() as Record<string, any[]>
          const users = new Map<string, LoungeUser>()
          Object.values(state).flat().forEach((presence: any) => {
            // Presence keys identify connections, not necessarily users.
            if (typeof presence.user_id !== 'string' || !presence.user_id) return
            users.set(presence.user_id, {
              user_id: presence.user_id,
              full_name: presence.full_name || 'Anonymous',
              main_photo: presence.main_photo || undefined,
              last_seen: presence.last_seen || new Date().toISOString(),
            })
          })
          setOnlineUsers(Array.from(users.values()))
        }).subscribe((status, err) => {
          if (!stillCurrent() || channel !== presenceChannel) return
          if (err) console.log('[Lounge] Presence error:', err.message)
          if (status === 'SUBSCRIBED') {
            presenceRetries = 0
            channel.track({
              user_id: userId,
              full_name: profile?.full_name || 'User',
              main_photo: profile?.photos?.[profile?.main_photo_index || 0] || null,
              last_seen: new Date().toISOString(),
            })
          } else if ((status === 'CLOSED' || status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') && presenceRetries < maxRetries) {
            const delay = Math.min(1000 * Math.pow(2, presenceRetries++), 10000)
            presenceRetry = setTimeout(setupPresence, delay)
          }
        })
      } catch (err) {
        console.error('Error updating presence:', err)
        if (stillCurrent() && presenceRetries < maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, presenceRetries++), 10000)
          presenceRetry = setTimeout(setupPresence, delay)
        }
      }
    }

    setupMessages()
    fetchMessages(userId)
    setupPresence()
    return () => {
      mounted = false
      activeRef.current = false
      if (messageRetry) clearTimeout(messageRetry)
      if (presenceRetry) clearTimeout(presenceRetry)
      if (messageChannel) supabase.removeChannel(messageChannel)
      if (presenceChannel) {
        presenceChannel.untrack()
        supabase.removeChannel(presenceChannel)
      }
    }
  }, [userId, isCurrent, fetchMessages, addLiveMessage])

  const sendMessage = useCallback(async (content: string) => {
    if (!userId) throw new Error('Please log in to send a message')
    if (!content.trim()) throw new Error('Please enter a message')
    const session = sessionRef.current
    try {
      let filteredContent = content
      KEYWORD_FILTER_PATTERNS.forEach((pattern) => { filteredContent = filteredContent.replace(pattern, '***') })
      const { data, error: err } = await supabase.from('lounge_messages')
        .insert({ user_id: userId, content: filteredContent }).select().single()
      if (err) throw err
      const [message] = await enrichMessages([data as MessageRow])
      if (message && session === sessionRef.current) addLiveMessage(message, userId)
    } catch (err: any) {
      console.error('Error sending message:', err)
      throw new Error(errorText(err, 'Failed to send message'))
    }
  }, [userId, addLiveMessage])

  const reportMessage = useCallback(async (messageId: string, reason: string) => {
    if (!userId) throw new Error('Please log in to report a message')
    try {
      const { error: err } = await supabase.from('lounge_reports').insert({
        message_id: messageId, reported_by: userId, reason,
      })
      if (err) throw err
    } catch (err: any) {
      console.error('Error reporting message:', err)
      throw new Error(errorText(err, 'Failed to report message'))
    }
  }, [userId])

  return {
    messages: owner === userId ? messages : [],
    onlineUsers: owner === userId ? onlineUsers : [],
    loading: owner === userId ? loading : !!userId,
    error: owner === userId ? error : null,
    loadingOlder: owner === userId && loadingOlder,
    hasOlder: owner === userId && hasOlder,
    loadOlder,
    retryMessages: () => { if (userId) fetchMessages(userId) },
    sendMessage,
    reportMessage,
  }
}
