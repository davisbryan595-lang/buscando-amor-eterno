'use client'

import React, { useState, useEffect } from 'react'
import { Send, Phone, Video, Lock } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useMessages } from '@/hooks/useMessages'
import { useAuth } from '@/context/auth-context'
import { toast } from 'sonner'
import AudioCall from '@/components/audio-call'
import VideoCall from '@/components/video-call'

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
  const [audioCallActive, setAudioCallActive] = useState(false)
  const [videoCallActive, setVideoCallActive] = useState(false)

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

  const handleStartAudioCall = () => {
    setAudioCallActive(true)
    toast.success(`Audio call started with ${otherUserDetails?.name || conversation.other_user_name || 'User'}`)
  }

  const handleEndAudioCall = () => {
    setAudioCallActive(false)
    toast.info('Audio call ended')
  }

  const handleStartVideoCall = () => {
    setVideoCallActive(true)
    toast.success(`Video call started with ${otherUserDetails?.name || conversation.other_user_name || 'User'}`)
  }

  const handleEndVideoCall = () => {
    setVideoCallActive(false)
    toast.info('Video call ended')
  }

  return (
    <div className="bg-gradient-to-b from-white to-rose-50 rounded-xl border border-rose-100 flex flex-col h-full soft-glow">
      {/* Header */}
      <div className="p-4 border-b border-rose-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative w-12 h-12">
            <Image
              src={otherUserDetails?.image || conversation.other_user_image || "/placeholder.svg"}
              alt={otherUserDetails?.name || conversation.other_user_name || 'User'}
              fill
              className="rounded-full object-cover"
            />
            {conversation.is_online && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white z-10" />
            )}
          </div>
          <div>
            <p className="font-semibold text-slate-900">{otherUserDetails?.name || conversation.other_user_name || 'User'}</p>
            <p className="text-sm text-slate-600">
              {conversation.is_online ? 'Online' : getLastSeenText(conversation.last_message_time)}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleStartAudioCall}
            className="p-2 hover:bg-rose-100 rounded-full transition"
            aria-label="Start audio call"
          >
            <Phone size={20} className="text-primary" />
          </button>
          <button
            onClick={handleStartVideoCall}
            className="p-2 hover:bg-rose-100 rounded-full transition"
            aria-label="Start video call"
          >
            <Video size={20} className="text-primary" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-500">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs px-4 py-2 rounded-2xl ${
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
      <div className="p-4 border-t border-rose-100 flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type a message..."
          disabled={loading}
          className="flex-1 px-4 py-2 bg-white border border-rose-200 rounded-full focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
        />
        <button
          onClick={handleSend}
          disabled={loading}
          className="p-2 bg-primary text-white rounded-full hover:bg-rose-700 transition disabled:opacity-50"
          aria-label="Send message"
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  )
}
