'use client'

import React, { useState, useEffect } from 'react'
import { Send, Lock } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useMessages } from '@/hooks/useMessages'
import { useAuth } from '@/context/auth-context'
import { toast } from 'sonner'

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

  const handleSend = async () => {
    if (!newMessage.trim() || !user) return

    try {
      setLoading(true)
      await sendMessage(conversation.other_user_id, newMessage)
      setNewMessage('')
    } catch (err: any) {
      console.error('Error sending message:', err)
      toast.error(err.message || 'Error sending message')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-4 md:p-6 border-b border-rose-100 flex items-center justify-between flex-shrink-0 bg-gradient-to-r from-white to-rose-50">
        <div className="flex items-center gap-3 md:gap-4 min-w-0">
          <div className="relative w-10 h-10 md:w-14 md:h-14 flex-shrink-0">
            <Image
              src={otherUserDetails?.image || conversation.other_user_image || "/placeholder.svg"}
              alt={otherUserDetails?.name || conversation.other_user_name || 'User'}
              fill
              className="rounded-full object-cover border-2 border-rose-100"
            />
            {conversation.is_online && (
              <div className="absolute bottom-0 right-0 w-3 h-3 md:w-4 md:h-4 bg-green-500 rounded-full border-2 border-white z-10" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-slate-900 text-base md:text-lg truncate">{otherUserDetails?.name || conversation.other_user_name || 'User'}</p>
            <p className="text-xs md:text-sm text-slate-500">
              {conversation.is_online ? (
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full inline-block"></span>
                  Online
                </span>
              ) : (
                getLastSeenText(conversation.last_message_time)
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-5 bg-white">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-400">
            <div className="text-center">
              <p className="text-base md:text-lg font-medium mb-2">No messages yet</p>
              <p className="text-sm md:text-base">Start the conversation!</p>
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg px-4 md:px-5 py-2 md:py-3 rounded-2xl text-sm md:text-base break-words shadow-sm ${
                  msg.sender_id === user?.id
                    ? 'bg-primary text-white rounded-br-none'
                    : 'bg-slate-100 text-slate-900 rounded-bl-none'
                }`}
              >
                <p>{msg.content}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Input */}
      <div className="p-4 md:p-6 border-t border-rose-100 flex gap-2 md:gap-3 flex-shrink-0 bg-gradient-to-r from-white to-rose-50">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type your message..."
          disabled={loading}
          className="flex-1 px-4 md:px-5 py-3 md:py-4 bg-white border border-rose-200 rounded-full text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 transition"
        />
        <button
          onClick={handleSend}
          disabled={loading}
          className="p-3 md:p-4 bg-primary text-white rounded-full hover:bg-rose-700 transition disabled:opacity-50 flex-shrink-0 shadow-sm hover:shadow-md"
          aria-label="Send message"
        >
          <Send size={20} className="md:w-6 md:h-6" />
        </button>
      </div>
    </div>
  )
}
