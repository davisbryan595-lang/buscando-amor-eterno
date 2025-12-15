'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Send, Lock } from 'lucide-react'
import gsap from 'gsap'
import Link from 'next/link'
import Image from 'next/image'
import { useMessages } from '@/hooks/useMessages'
import { useAuth } from '@/context/auth-context'
import { toast } from 'sonner'
import MessageBubble from '@/components/message-bubble'
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

export default function ChatWindow({ conversation }: { conversation: Conversation }) {
  const { user } = useAuth()
  const { messages, sendMessage, markAsRead, fetchMessages } = useMessages()
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [otherUserDetails, setOtherUserDetails] = useState<{ name: string; image: string | null } | null>(null)
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; messageId: string; content: string; isOwn: boolean } | null>(null)
  const [showTypingIndicator, setShowTypingIndicator] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

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
  }, [conversation?.other_user_id, fetchMessages, conversation.other_user_name, conversation.other_user_image])

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      gsap.to(messagesContainerRef.current, {
        scrollTop: messagesContainerRef.current?.scrollHeight,
        duration: 0.5,
        ease: 'power2.out',
      })
    }
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
    <div className="bg-white flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-4 sm:px-5 md:px-8 py-5 md:py-7 border-b border-rose-100 flex items-center justify-between flex-shrink-0 bg-gradient-to-r from-white to-rose-50/50">
        <div className="flex items-center gap-3 md:gap-5 min-w-0">
          <div className="relative w-12 h-12 md:w-16 md:h-16 flex-shrink-0">
            <Image
              src={otherUserDetails?.image || conversation.other_user_image || "/placeholder.svg"}
              alt={otherUserDetails?.name || conversation.other_user_name || 'User'}
              fill
              className="rounded-full object-cover border-2 border-rose-100"
            />
            {conversation.is_online && (
              <div className="absolute bottom-0 right-0 w-4 h-4 md:w-5 md:h-5 bg-green-500 rounded-full border-3 border-white z-10" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-bold text-slate-900 text-base md:text-2xl truncate">{otherUserDetails?.name || conversation.other_user_name || 'User'}</p>
            <p className="text-sm md:text-base text-slate-600 mt-1">
              {conversation.is_online ? (
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-green-500 rounded-full inline-block"></span>
                  Active now
                </span>
              ) : (
                getLastSeenText(conversation.last_message_time)
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-4 sm:px-5 md:px-8 py-5 md:py-7 space-y-5 md:space-y-6 bg-white w-full">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-400">
            <div className="text-center">
              <p className="text-lg md:text-xl font-semibold mb-3">No messages yet</p>
              <p className="text-base md:text-lg">Start a conversation with {otherUserDetails?.name || conversation.other_user_name}!</p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <div
                key={msg.id}
                id={`message-${msg.id}`}
                onClick={(e) => {
                  // Prevent context menu from opening on normal click
                  if (e.detail === 1) {
                    setContextMenu(null)
                  }
                }}
              >
                <MessageBubble
                  id={msg.id}
                  content={msg.content}
                  isOwn={msg.sender_id === user?.id}
                  timestamp={msg.created_at}
                  onContextMenu={(e) =>
                    handleContextMenu(e, msg.id, msg.content, msg.sender_id === user?.id)
                  }
                  onLongPress={handleMessageLongPress}
                />
              </div>
            ))}
            {showTypingIndicator && (
              <div className="flex justify-start">
                <div className="px-8 md:px-10 py-6 md:py-8 rounded-3xl rounded-bl-none bg-gradient-to-r from-slate-100 to-slate-50">
                  <TypingIndicator />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="px-4 sm:px-5 md:px-8 py-5 md:py-7 border-t border-rose-100 flex gap-3 md:gap-4 flex-shrink-0 bg-gradient-to-r from-white to-rose-50/50">
        <input
          ref={inputRef}
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type your message..."
          disabled={loading}
          className="flex-1 px-5 md:px-6 py-4 md:py-5 bg-white border border-rose-200 rounded-full text-base md:text-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 transition shadow-sm hover:shadow-md"
        />
        <button
          onClick={handleSend}
          disabled={loading}
          className="p-4 md:p-5 bg-primary text-white rounded-full hover:bg-rose-700 transition disabled:opacity-50 flex-shrink-0 shadow-sm hover:shadow-lg active:scale-95 transform duration-75"
          aria-label="Send message"
        >
          <Send size={22} className="md:w-7 md:h-7" />
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
