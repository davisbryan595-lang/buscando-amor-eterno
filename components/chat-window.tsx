'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Send, Phone, Video, ArrowLeft } from 'lucide-react'
import Image from 'next/image'
import { useMessages } from '@/hooks/useMessages'
import { useAuth } from '@/context/auth-context'
import { useStartCall } from '@/hooks/useStartCall'
import { toast } from 'sonner'
import MessageContextMenu from '@/components/message-context-menu'
import TypingIndicator from '@/components/typing-indicator'
import { AnimatedMessage } from '@/components/animated-message'

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
}

export default function ChatWindow({ conversation, onBack }: ChatWindowProps) {
  const router = useRouter()
  const { user } = useAuth()
  const { messages, sendMessage, markAsRead, fetchMessages, fetchConversations, subscribeToConversation } = useMessages()
  const { startCall } = useStartCall()
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [callingState, setCallingState] = useState<'idle' | 'calling'>('idle')
  const [otherUserDetails, setOtherUserDetails] = useState<{ name: string; image: string | null } | null>(null)
  const [contextMenu, setContextMenu] = useState<{
    x: number
    y: number
    messageId: string
    content: string
    isOwn: boolean
  } | null>(null)
  const [showTypingIndicator] = useState(false)
  const [previousMessageCount, setPreviousMessageCount] = useState(0)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const unsubscribeRef = useRef<(() => void) | null>(null)

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }

  useEffect(() => {
    if (conversation?.other_user_id) {
      setPreviousMessageCount(0)
      fetchMessages(conversation.other_user_id)

      // Subscribe to real-time updates for this conversation
      unsubscribeRef.current = subscribeToConversation(conversation.other_user_id) || null

      // Fetch full user details if not available in conversation
      if (!conversation.other_user_name || !conversation.other_user_image) {
        const { supabase } = require('@/lib/supabase')
        const fetchUserDetails = async () => {
          try {
            const { data } = await supabase
              .from('profiles')
              .select('full_name, photos, main_photo_index')
              .eq('user_id', conversation.other_user_id)
              .single()

            if (data) {
              setOtherUserDetails({
                name: data.full_name,
                image: data.photos?.[data.main_photo_index || 0] || null,
              })
            }
          } catch (err) {
            console.error('Error fetching user details:', err)
          }
        }
        fetchUserDetails()
      }

      return () => {
        if (unsubscribeRef.current) {
          unsubscribeRef.current()
        }
      }
    }
  }, [conversation?.other_user_id, user?.id, fetchMessages, subscribeToConversation])

  // Mark all unread messages as read when opening the chat
  useEffect(() => {
    if (messages.length > 0 && user?.id) {
      const unreadMessages = messages.filter((msg) => msg.recipient_id === user.id && !msg.read)
      if (unreadMessages.length > 0) {
        unreadMessages.forEach((msg) => {
          markAsRead(msg.id)
        })
      }
    }
  }, [conversation?.id, user?.id, messages, markAsRead])

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    // Auto-scroll when new messages arrive
    if (messages.length > previousMessageCount) {
      scrollToBottom()
      setPreviousMessageCount(messages.length)
    }
  }, [messages, previousMessageCount])

  const handleSend = async () => {
    if (!newMessage.trim() || !user) return

    try {
      setLoading(true)
      await sendMessage(conversation.other_user_id, newMessage)
      setNewMessage('')
      inputRef.current?.focus()
    } catch (err: any) {
      console.error('Error sending message:', err)
      toast.error(err.message || 'Error sending message')
    } finally {
      setLoading(false)
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
    setCallingState('calling')
    try {
      await startCall(
        conversation.other_user_id,
        otherUserDetails?.name || conversation.other_user_name || 'User',
        'audio'
      )
    } finally {
      setCallingState('calling')
    }
  }

  const handleStartVideoCall = async () => {
    setCallingState('calling')
    try {
      await startCall(
        conversation.other_user_id,
        otherUserDetails?.name || conversation.other_user_name || 'User',
        'video'
      )
    } finally {
      setCallingState('calling')
    }
  }

  return (
    <div className="bg-gradient-to-b from-white to-rose-50 rounded-none md:rounded-xl border-0 md:border border-rose-100 flex flex-col h-full w-full soft-glow overflow-hidden">
      {/* Header */}
      <div className="sticky top-16 md:top-24 z-20 px-3 py-3 sm:p-4 lg:p-6 border-b border-rose-100 flex items-center justify-between flex-shrink-0 gap-2 bg-gradient-to-b from-white to-rose-50">
        <button
          onClick={() => router.push(`/profile/${conversation.other_user_id}`)}
          className="flex items-center gap-2 sm:gap-3 lg:gap-4 min-w-0 flex-1 hover:opacity-80 transition rounded-lg p-1 -m-1"
        >
          {onBack && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onBack()
              }}
              className="md:hidden p-1.5 sm:p-2 hover:bg-rose-100 rounded-full transition flex-shrink-0"
              aria-label="Back to conversations"
            >
              <ArrowLeft size={18} className="text-slate-700" />
            </button>
          )}
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
            <p className="font-semibold text-slate-900 text-sm sm:text-base lg:text-lg truncate">{otherUserDetails?.name || conversation.other_user_name || 'User'}</p>
            <p className="text-xs sm:text-sm lg:text-base text-slate-600 truncate">
              {conversation.is_online ? 'Online' : getLastSeenText(conversation.last_message_time)}
            </p>
          </div>
        </button>

        <div className="flex gap-1 sm:gap-2 lg:gap-3 flex-shrink-0">
          <button
            onClick={handleStartAudioCall}
            disabled={callingState === 'calling'}
            className="p-1.5 sm:p-2 lg:p-3 hover:bg-rose-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-full transition"
            title="Start audio call"
          >
            <Phone size={16} className="sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-primary" />
          </button>
          <button
            onClick={handleStartVideoCall}
            disabled={callingState === 'calling'}
            className="p-1.5 sm:p-2 lg:p-3 hover:bg-rose-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-full transition"
            title="Start video call"
          >
            <Video size={16} className="sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-primary" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-3 sm:p-4 lg:p-6 space-y-2 sm:space-y-3 lg:space-y-4 min-h-0">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-500">
            <p className="text-sm sm:text-base lg:text-lg">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <AnimatedMessage
                key={msg.id}
                id={msg.id}
                content={msg.content}
                isOwn={msg.sender_id === user?.id}
                onContextMenu={handleContextMenu}
              />
            ))}
            {showTypingIndicator && (
              <div className="flex justify-start">
                <div className="px-4 sm:px-5 md:px-6 py-2 sm:py-3 md:py-4 rounded-3xl rounded-bl-none bg-gradient-to-r from-slate-100 to-slate-50">
                  <TypingIndicator />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="sticky bottom-0 z-20 px-3 py-3 sm:p-4 lg:p-6 border-t border-rose-100 flex gap-2 flex-shrink-0 bg-gradient-to-t from-white to-rose-50">
        <input
          ref={inputRef}
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type a message..."
          disabled={loading}
          className="flex-1 px-3 sm:px-4 lg:px-6 py-1.5 sm:py-2 lg:py-3 text-xs sm:text-sm lg:text-base bg-white border border-rose-200 rounded-full focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
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

    </div>
  )
}
