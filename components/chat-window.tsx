'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Send, Phone, Video, ArrowLeft } from 'lucide-react'
import Image from 'next/image'
import { useMessages } from '@/hooks/useMessages'
import { useAuth } from '@/context/auth-context'
import { toast } from 'sonner'
import MessageContextMenu from '@/components/message-context-menu'
import TypingIndicator from '@/components/typing-indicator'

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
  const { user } = useAuth()
  const { messages, sendMessage, markAsRead, fetchMessages, fetchConversations } = useMessages()
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [otherUserDetails, setOtherUserDetails] = useState<{ name: string; image: string | null } | null>(null)
  const [contextMenu, setContextMenu] = useState<{
    x: number
    y: number
    messageId: string
    content: string
    isOwn: boolean
  } | null>(null)
  const [showTypingIndicator] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (conversation?.other_user_id) {
      fetchMessages(conversation.other_user_id)

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
    }
  }, [conversation?.other_user_id, user?.id, fetchMessages])

  // Mark all unread messages as read when opening the chat
  useEffect(() => {
    if (messages.length > 0 && user?.id) {
      const unreadMessages = messages.filter((msg) => msg.recipient_id === user.id && !msg.read)
      if (unreadMessages.length > 0) {
        unreadMessages.forEach((msg) => {
          markAsRead(msg.id)
        })
        // Refresh conversations to clear unread badge
        fetchConversations()
      }
    }
  }, [conversation?.id, messages.length, user?.id, markAsRead, fetchConversations])

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom()
  }, [messages])

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

  return (
    <div className="bg-gradient-to-b from-white to-rose-50 rounded-xl border border-rose-100 flex flex-col h-full w-full soft-glow">
      {/* Header */}
      <div className="p-4 lg:p-6 border-b border-rose-100 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3 lg:gap-4 min-w-0">
          {onBack && (
            <button
              onClick={onBack}
              className="md:hidden p-2 hover:bg-rose-100 rounded-full transition flex-shrink-0"
              aria-label="Back to conversations"
            >
              <ArrowLeft size={20} className="text-slate-700" />
            </button>
          )}
          <div className="relative w-12 h-12 lg:w-14 lg:h-14 flex-shrink-0">
            <Image
              src={otherUserDetails?.image || conversation.other_user_image || "/placeholder.svg"}
              alt={otherUserDetails?.name || conversation.other_user_name || 'User'}
              fill
              className="rounded-full object-cover border-2 border-rose-100"
            />
            {conversation.is_online && (
              <div className="absolute bottom-0 right-0 w-3 h-3 md:w-4 md:h-4 bg-green-500 rounded-full border-3 border-white z-10" />
            )}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-slate-900 text-base lg:text-lg truncate">{otherUserDetails?.name || conversation.other_user_name || 'User'}</p>
            <p className="text-sm lg:text-base text-slate-600">
              {conversation.is_online ? 'Online' : getLastSeenText(conversation.last_message_time)}
            </p>
          </div>
        </div>

        <div className="flex gap-2 lg:gap-3 flex-shrink-0">
          <a
            href={`/video-date?partner=${conversation.other_user_id}&type=audio`}
            className="p-2 lg:p-3 hover:bg-rose-100 rounded-full transition"
            title="Start audio call"
          >
            <Phone size={20} className="text-primary lg:w-6 lg:h-6" />
          </a>
          <a
            href={`/video-date?partner=${conversation.other_user_id}&type=video`}
            className="p-2 lg:p-3 hover:bg-rose-100 rounded-full transition"
            title="Start video call"
          >
            <Video size={20} className="text-primary lg:w-6 lg:h-6" />
          </a>
        </div>
      </div>

      {/* Messages */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-3 lg:space-y-4 min-h-0">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-500">
            <p className="text-base lg:text-lg">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex w-full ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  id={`message-${msg.id}`}
                  onContextMenu={(e) => handleContextMenu(e, msg.id, msg.content, msg.sender_id === user?.id)}
                  className={`max-w-xs lg:max-w-md xl:max-w-lg px-4 py-2 lg:py-3 rounded-2xl ${
                    msg.sender_id === user?.id
                      ? 'bg-primary text-white rounded-br-none'
                      : 'bg-slate-200 text-slate-900 rounded-bl-none'
                  }`}
                >
                  <p className="text-sm lg:text-base break-words">{msg.content}</p>
                </div>
              </div>
            ))}
            {showTypingIndicator && (
              <div className="flex justify-start">
                <div className="px-5 md:px-6 py-3 md:py-4 rounded-3xl rounded-bl-none bg-gradient-to-r from-slate-100 to-slate-50">
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
      <div className="p-4 lg:p-6 border-t border-rose-100 flex gap-2 lg:gap-3 flex-shrink-0">
        <input
          ref={inputRef}
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type your message..."
          disabled={loading}
          className="flex-1 px-4 lg:px-6 py-2 lg:py-3 text-sm lg:text-base bg-white border border-rose-200 rounded-full focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
        />
        <button
          onClick={handleSend}
          disabled={loading}
          className="p-2 lg:p-3 bg-primary text-white rounded-full hover:bg-rose-700 transition disabled:opacity-50 flex-shrink-0"
          aria-label="Send message"
        >
          <Send size={20} className="lg:w-6 lg:h-6" />
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
