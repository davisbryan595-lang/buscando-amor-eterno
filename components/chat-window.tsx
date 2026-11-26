'use client'

import React, { useState, useEffect, useRef, useLayoutEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Send, Phone, Video, ArrowLeft } from 'lucide-react'
import Image from 'next/image'
import { getPrivateChatCacheEpoch, onPrivateChatCacheReset, useMessages } from '@/hooks/useMessages'
import { useAuth } from '@/context/auth-context'
import { useStartCall } from '@/hooks/useStartCall'
import { useFeatureAccess } from '@/hooks/useFeatureAccess'
import { PaywallModal } from '@/components/paywall-modal'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import MessageContextMenu from '@/components/message-context-menu'
import TypingIndicator from '@/components/typing-indicator'
import { AnimatedMessage } from '@/components/animated-message'
import CallLogMessage from '@/components/call-log-message'
import { ReportUserButton } from '@/components/report-user-button'

const getLastSeenText = (timestamp?: string): string => {
  if (!timestamp) return 'Offline'

  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays}d ago`

  return date.toLocaleDateString()
}

interface Conversation {
  id: string
  other_user_id: string
  other_user_name: string | null
  other_user_image: string | null
  last_message: string
  is_online: boolean
  last_message_time?: string
}

interface ChatWindowProps {
  conversation: Conversation
  onBack?: () => void
  chat: ReturnType<typeof useMessages>
}

interface CallLog {
  id: string
  caller_id: string
  receiver_id: string
  call_type: 'audio' | 'video'
  status: 'ongoing' | 'completed' | 'missed' | 'declined' | 'cancelled'
  started_at: string
  answered_at?: string
  ended_at?: string
  duration?: number
  type: 'call_log'
}

const detailCache = new Map<string, { name: string; image: string | null; fetchedAt: number }>()
const callLogCache = new Map<string, { logs: CallLog[]; fetchedAt: number }>()
const CHAT_CACHE_TTL = 30_000
onPrivateChatCacheReset(() => {
  detailCache.clear()
  callLogCache.clear()
})

interface CombinedMessage {
  id: string
  type: 'text' | 'call_log'
  created_at: string
  sender_id?: string
  recipient_id?: string
  content?: string
  read?: boolean
  call_type?: 'audio' | 'video'
  status?: string
  started_at?: string
  duration?: number
  caller_id?: string
  receiver_id?: string
}

export default function ChatWindow({ conversation, onBack, chat }: ChatWindowProps) {
  const router = useRouter()
  const { user } = useAuth()
  const { messages, sendMessage, markAsRead, fetchMessages, closeConversation, loadMoreMessages, hasMoreMessages, typingStatus, handleTyping, stopTyping, subscribeToConversation } = chat
  const { startCall } = useStartCall()
  const { checkAccess, closePaywall, paywallState } = useFeatureAccess()
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [callingState, setCallingState] = useState<'idle' | 'calling'>('idle')
  const [otherUserDetails, setOtherUserDetails] = useState<{ name: string; image: string | null } | null>(null)
  const [callLogs, setCallLogs] = useState<CallLog[]>([])
  const [contextMenu, setContextMenu] = useState<{
    x: number
    y: number
    messageId: string
    content: string
    isOwn: boolean
  } | null>(null)
  const [showTypingIndicator, setShowTypingIndicator] = useState(false)
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const paginationRef = useRef(false)
  const scrollAnchorRef = useRef<{ element: Element; top: number } | null>(null)
  const nearBottomRef = useRef(true)
  const initialScrollRef = useRef(true)
  const conversationRef = useRef(conversation.other_user_id)
  conversationRef.current = conversation.other_user_id

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  // Fetch call logs and merge with messages
  const fetchAndMergeMessages = async (isCurrent: () => boolean) => {
    if (!conversation?.other_user_id || !user) return

    const key = `${user.id}:${conversation.other_user_id}`
    const cached = callLogCache.get(key)
    if (cached && Date.now() - cached.fetchedAt < CHAT_CACHE_TTL) {
      if (isCurrent()) setCallLogs(cached.logs)
      return
    }
    try {
      const { data: callLogsData } = await supabase
        .from('call_logs')
        .select('*')
        .or(`and(caller_id.eq.${user.id},receiver_id.eq.${conversation.other_user_id}),and(caller_id.eq.${conversation.other_user_id},receiver_id.eq.${user.id})`)
        .order('started_at', { ascending: true })
        .limit(100)

      if (isCurrent() && callLogsData) {
        callLogCache.set(key, { logs: callLogsData, fetchedAt: Date.now() })
        setCallLogs(callLogsData)
      }
    } catch (err) {
      console.error('Error fetching call logs:', err)
    }
  }

  // Merge messages and call logs chronologically
  const combinedMessages = useMemo<CombinedMessage[]>(() => {
    return [
      ...messages.filter(m => (m.sender_id === user?.id && m.recipient_id === conversation.other_user_id) || (m.sender_id === conversation.other_user_id && m.recipient_id === user?.id)).map(m => ({
        ...m,
        type: 'text' as const,
        created_at: m.created_at,
      })),
      ...(callLogs || []).map(c => ({
        id: c.id,
        type: 'call_log' as const,
        created_at: c.started_at,
        caller_id: c.caller_id,
        receiver_id: c.receiver_id,
        call_type: c.call_type,
        status: c.status,
        started_at: c.started_at,
        duration: c.duration,
      })),
    ].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

  }, [messages, callLogs, user?.id, conversation.other_user_id])

  useEffect(() => {
    const container = messagesContainerRef.current
    if (!container) return
    const other = conversation.other_user_id
    const handleScroll = () => {
      nearBottomRef.current = container.scrollHeight - container.scrollTop - container.clientHeight < 100
      if (container.scrollTop > 0 || !hasMoreMessages || paginationRef.current || initialScrollRef.current) return
      paginationRef.current = true
      const element = container.firstElementChild
      if (element) scrollAnchorRef.current = { element, top: element.getBoundingClientRect().top }
      void loadMoreMessages(other).finally(() => {
        if (conversationRef.current !== other) return
        paginationRef.current = false
        // No new DOM content (empty or failed page): release the anchor as well.
        requestAnimationFrame(() => {
          if (conversationRef.current === other) scrollAnchorRef.current = null
        })
      })
    }
    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [hasMoreMessages, conversation.other_user_id, loadMoreMessages])

  useEffect(() => {
    if (!conversation.other_user_id || !user?.id) return
    let current = true
    const cacheEpoch = getPrivateChatCacheEpoch()
    initialScrollRef.current = true
    nearBottomRef.current = true
    paginationRef.current = false
    scrollAnchorRef.current = null
    setCallLogs([])
    setOtherUserDetails(null)
    setShowTypingIndicator(false)
    void fetchMessages(conversation.other_user_id)
    const unsubscribeStatus = subscribeToConversation(conversation.other_user_id)
    void fetchAndMergeMessages(() => current && cacheEpoch === getPrivateChatCacheEpoch())

    if (!conversation.other_user_name || !conversation.other_user_image) {
      const key = `${user.id}:${conversation.other_user_id}`
      const cached = detailCache.get(key)
      if (cached && Date.now() - cached.fetchedAt < CHAT_CACHE_TTL) setOtherUserDetails(cached)
      const fetchUserDetails = async () => {
        if (cached && Date.now() - cached.fetchedAt < CHAT_CACHE_TTL) return
        try {
          const { data, error } = await supabase.from('profiles')
            .select('full_name, photos, main_photo_index')
            .eq('user_id', conversation.other_user_id).maybeSingle()
          if (error) throw error
          if (current && cacheEpoch === getPrivateChatCacheEpoch() && data) {
            const details = { name: data.full_name, image: data.photos?.[data.main_photo_index || 0] || null, fetchedAt: Date.now() }
            detailCache.set(key, details)
            setOtherUserDetails(details)
          }
        } catch (err: any) {
          console.error('Error fetching user details:', err?.message || JSON.stringify(err))
        }
      }
      void fetchUserDetails()
    }
    return () => {
      current = false
      unsubscribeStatus()
      closeConversation(conversation.other_user_id)
      stopTyping(conversation.other_user_id)
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    }
  }, [conversation.other_user_id, user?.id, fetchMessages, closeConversation, stopTyping, subscribeToConversation])

  useEffect(() => {
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    const typing = typingStatus?.user_id === conversation.other_user_id && typingStatus.is_typing
    setShowTypingIndicator(!!typing)
    if (typing) typingTimeoutRef.current = setTimeout(() => setShowTypingIndicator(false), 4000)
    return () => { if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current) }
  }, [typingStatus, conversation.other_user_id])

  useEffect(() => {
    if (!user?.id) return
    messages.filter(msg => msg.sender_id === conversation.other_user_id && msg.recipient_id === user.id && !msg.read)
      .forEach(msg => { void markAsRead(msg.id, msg.sender_id) })
  }, [conversation.other_user_id, user?.id, messages, markAsRead])

  useLayoutEffect(() => {
    const container = messagesContainerRef.current
    if (!container || !combinedMessages.length) return
    if (scrollAnchorRef.current) {
      const { element, top } = scrollAnchorRef.current
      if (element.isConnected) container.scrollTop += element.getBoundingClientRect().top - top
    } else if (initialScrollRef.current || nearBottomRef.current) {
      container.scrollTop = container.scrollHeight
      initialScrollRef.current = false
      nearBottomRef.current = true
    }
  }, [combinedMessages])

  const handleSend = async () => {
    if (!newMessage.trim() || !user) return

    try {
      setLoading(true)
      await sendMessage(conversation.other_user_id, newMessage)
      setNewMessage('')
      stopTyping(conversation.other_user_id)
      inputRef.current?.focus()
    } catch (err: any) {
      console.error('Error sending message:', err)
      toast.error(err.message || 'Error sending message')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value)
    if (e.target.value.trim()) {
      handleTyping(conversation.other_user_id)
    }
  }

  const handleContextMenu = (e: React.MouseEvent | React.TouchEvent, messageId: string, content: string, isOwn: boolean) => {
    e.preventDefault()
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    setContextMenu({
      x: e instanceof MouseEvent ? e.clientX : rect.left,
      y: e instanceof MouseEvent ? e.clientY : rect.bottom,
      messageId,
      content,
      isOwn,
    })
  }

  const handleDeleteMessage = (messageId: string) => {
    // TODO: Implement message deletion
    toast.info('Message deletion coming soon!')
  }

  const handleMessageLongPress = (messageId: string) => {
    const message = messages.find((m) => m.id === messageId)
    if (message) {
      const element = document.getElementById(`message-${messageId}`)
      if (element) {
        const rect = element.getBoundingClientRect()
        handleContextMenu(
          { currentTarget: element } as unknown as React.MouseEvent,
          messageId,
          message.content,
          message.sender_id === user?.id
        )
      }
    }
  }

  const handleStartAudioCall = async () => {
    if (!checkAccess('Voice calls').hasAccess) return
    setCallingState('calling')
    try {
      await startCall(
        conversation.other_user_id,
        otherUserDetails?.name || conversation.other_user_name || 'User',
        'audio'
      )
    } finally {
      setCallingState('idle')
    }
  }

  const handleStartVideoCall = async () => {
    if (!checkAccess('Video calls').hasAccess) return
    setCallingState('calling')
    try {
      await startCall(
        conversation.other_user_id,
        otherUserDetails?.name || conversation.other_user_name || 'User',
        'video'
      )
    } finally {
      setCallingState('idle')
    }
  }

  return (
    <div className="bg-card dark:bg-card rounded-none md:rounded-xl border-0 md:border border-rose-100 dark:border-rose-900/40 flex flex-col h-full w-full soft-glow overflow-hidden">
      {/* Header */}
      <div className="sticky top-16 md:top-24 z-20 px-3 py-3 sm:p-4 lg:p-6 border-b border-rose-100 dark:border-rose-900/40 flex items-center justify-between flex-shrink-0 gap-2 bg-card dark:bg-card">
        <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 min-w-0 flex-1">
          {onBack && (
            <button
              onClick={onBack}
              className="md:hidden p-1.5 sm:p-2 hover:bg-card-hover dark:hover:bg-card-hover rounded-full transition flex-shrink-0"
              aria-label="Back to conversations"
            >
              <ArrowLeft size={18} className="text-foreground" />
            </button>
          )}
          <button
            onClick={() => router.push(`/profile/${conversation.other_user_id}`)}
            className="flex items-center gap-2 sm:gap-3 lg:gap-4 min-w-0 flex-1 hover:opacity-80 transition rounded-lg p-1 -m-1"
          >
            <div className="relative w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 flex-shrink-0">
              <Image
                src={otherUserDetails?.image || conversation.other_user_image || "/placeholder.svg"}
                alt={otherUserDetails?.name || conversation.other_user_name || 'User'}
                fill
                className="rounded-full object-cover border-2 border-rose-100"
                priority
              />
              {conversation.is_online && (
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 bg-green-500 rounded-full border-2 sm:border-3 border-white z-10" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-foreground text-sm sm:text-base lg:text-lg truncate">{otherUserDetails?.name || conversation.other_user_name || 'User'}</p>
              <p className="text-xs sm:text-sm lg:text-base text-muted-foreground truncate">
                {conversation.is_online ? 'Online' : getLastSeenText(conversation.last_message_time)}
              </p>
            </div>
          </button>
        </div>

        <div className="flex gap-1 sm:gap-2 lg:gap-3 flex-shrink-0 items-center">
          <button
            onClick={handleStartAudioCall}
            disabled={callingState === 'calling'}
            className="p-1.5 sm:p-2 lg:p-3 hover:bg-card-hover dark:hover:bg-card-hover disabled:opacity-50 disabled:cursor-not-allowed rounded-full transition"
            title="Voice calls require Premium ($12/month)"
            aria-label="Start voice call or view Premium options"
          >
            <Phone size={16} className="sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-primary" />
          </button>
          <button
            onClick={handleStartVideoCall}
            disabled={callingState === 'calling'}
            className="p-1.5 sm:p-2 lg:p-3 hover:bg-card-hover dark:hover:bg-card-hover disabled:opacity-50 disabled:cursor-not-allowed rounded-full transition"
            title="Video calls require Premium ($12/month)"
            aria-label="Start video call or view Premium options"
          >
            <Video size={16} className="sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-primary" />
          </button>
          <div className="w-px h-6 bg-border opacity-30" />
          <ReportUserButton
            userId={conversation.other_user_id}
            userName={otherUserDetails?.name || conversation.other_user_name || 'User'}
            subtle={true}
          />
        </div>
      </div>

      {/* Messages */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-3 sm:p-4 lg:p-6 space-y-2 sm:space-y-3 lg:space-y-4 min-h-0">
        {combinedMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <p className="text-sm sm:text-base lg:text-lg">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <>
            {combinedMessages.map((item) => {
              // Render call log messages with WhatsApp-style formatting
              if (item.type === 'call_log') {
                return (
                  <div key={item.id} className="flex justify-center my-3">
                    <CallLogMessage
                      callLog={{
                        id: item.id,
                        caller_id: item.caller_id || '',
                        receiver_id: item.receiver_id || '',
                        call_type: (item.call_type as 'audio' | 'video') || 'audio',
                        status: (item.status as 'ongoing' | 'completed' | 'missed' | 'declined' | 'cancelled') || 'completed',
                        started_at: item.started_at || item.created_at,
                        duration: item.duration,
                      }}
                      currentUserId={user?.id || ''}
                      onCallBack={() =>
                        handleStartAudioCall()
                      }
                    />
                  </div>
                )
              }

              return (
                <AnimatedMessage
                  key={item.id}
                  id={item.id}
                  content={item.content || ''}
                  isOwn={item.sender_id === user?.id}
                  onContextMenu={handleContextMenu}
                />
              )
            })}
            {showTypingIndicator && (
              <div className="flex justify-start">
                <div className="px-4 sm:px-5 md:px-6 py-2 sm:py-3 md:py-4 rounded-3xl rounded-bl-none bg-card-subtle dark:bg-card-subtle">
                  <TypingIndicator />
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="sticky bottom-0 z-20 px-3 py-3 sm:p-4 lg:p-6 border-t border-rose-100 dark:border-rose-900/40 flex gap-2 flex-shrink-0 bg-card dark:bg-card">
        <input
          ref={inputRef}
          type="text"
          value={newMessage}
          onChange={handleInputChange}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type a message..."
          disabled={loading}
          className="flex-1 px-3 sm:px-4 lg:px-6 py-1.5 sm:py-2 lg:py-3 text-xs sm:text-sm lg:text-base bg-card-subtle dark:bg-card-subtle border border-rose-200 dark:border-rose-900/30 rounded-full focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 text-foreground dark:text-white"
        />
        <button
          onClick={handleSend}
          disabled={loading}
          className="p-1.5 sm:p-2 lg:p-3 bg-primary text-white rounded-full hover:bg-rose-700 transition disabled:opacity-50 flex-shrink-0"
          aria-label="Send message"
        >
          <Send size={16} className="sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
        </button>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <MessageContextMenu
          messageId={contextMenu.messageId}
          content={contextMenu.content}
          isOwn={contextMenu.isOwn}
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          onDelete={handleDeleteMessage}
        />
      )}

      <PaywallModal
        isOpen={paywallState.isPaywallOpen}
        onClose={closePaywall}
        featureName={paywallState.featureName}
        description={paywallState.description}
      />
    </div>
  )
}
