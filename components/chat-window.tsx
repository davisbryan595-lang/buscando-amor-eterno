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
    <div className="bg-gradient-to-b from-white to-rose-50 rounded-xl md:border md:border-rose-100 flex flex-col h-full md:soft-glow">
      {/* Header */}
      <div className="p-3 md:p-4 border-b border-rose-100 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2 md:gap-3 min-w-0">
          <div className="relative w-10 h-10 md:w-12 md:h-12 flex-shrink-0">
            <Image
              src={otherUserDetails?.image || conversation.other_user_image || "/placeholder.svg"}
              alt={otherUserDetails?.name || conversation.other_user_name || 'User'}
              fill
              className="rounded-full object-cover"
            />
            {conversation.is_online && (
              <div className="absolute bottom-0 right-0 w-2 h-2 md:w-3 md:h-3 bg-green-500 rounded-full border-2 border-white z-10" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-slate-900 text-sm md:text-base truncate">{otherUserDetails?.name || conversation.other_user_name || 'User'}</p>
            <p className="text-xs md:text-sm text-slate-600 truncate">
              {conversation.is_online ? 'Online' : getLastSeenText(conversation.last_message_time)}
            </p>
          </div>
        </div>

      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 md:space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-500 text-sm md:text-base">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs md:max-w-sm px-3 md:px-4 py-2 rounded-2xl text-sm md:text-base break-words ${
                  msg.sender_id === user?.id
                    ? 'bg-primary text-white rounded-br-none'
                    : 'bg-slate-200 text-slate-900 rounded-bl-none'
                }`}
              >
                <p>{msg.content}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Input */}
      <div className="p-3 md:p-4 border-t border-rose-100 flex gap-2 flex-shrink-0">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Message..."
          disabled={loading}
          className="flex-1 px-3 md:px-4 py-2 bg-white border border-rose-200 rounded-full text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
        />
        <button
          onClick={handleSend}
          disabled={loading}
          className="p-2 md:p-2.5 bg-primary text-white rounded-full hover:bg-rose-700 transition disabled:opacity-50 flex-shrink-0"
          aria-label="Send message"
        >
          <Send size={18} className="md:w-5 md:h-5" />
        </button>
      </div>
    </div>
  )
}
