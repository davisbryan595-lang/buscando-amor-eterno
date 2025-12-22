'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Send } from 'lucide-react'
import Image from 'next/image'
import { useLounge } from '@/hooks/useLounge'
import { useAuth } from '@/context/auth-context'
import { toast } from 'sonner'

interface LoungeChatWindowProps {
  autoScroll?: boolean
}

export default function LoungeChatWindow({ autoScroll = true }: LoungeChatWindowProps) {
  const { user } = useAuth()
  const { messages, loading, error, sendMessage } = useLounge()
  const [newMessage, setNewMessage] = useState('')
  const [sendingMessage, setSendingMessage] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    if (messagesEndRef.current && autoScroll) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, autoScroll])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newMessage.trim()) return

    setSendingMessage(true)
    try {
      await sendMessage(newMessage)
      setNewMessage('')
    } catch (err: any) {
      toast.error(err.message || 'Failed to send message')
    } finally {
      setSendingMessage(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-slate-600">Loading lounge messages...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-slate-900 font-semibold mb-2">Unable to load lounge</p>
          <p className="text-slate-600 text-sm">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-rose-100 shadow-lg overflow-hidden">
      {/* Messages Container */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-white via-rose-50/30 to-white"
      >
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center">
            <div className="text-slate-600">
              <p className="text-lg font-semibold mb-2">Welcome to the Lounge!</p>
              <p className="text-sm">Be the first to say hello to our community 👋</p>
            </div>
          </div>
        ) : (
          messages.map((message, index) => {
            const isOwnMessage = message.sender_id === user?.id

            return (
              <div
                key={message.id}
                className="flex gap-3 animate-in fade-in"
                style={{
                  animationDelay: `${index * 50}ms`,
                  animationFillMode: 'backwards',
                }}
              >
                {/* Avatar Container */}
                <div className={`flex flex-col ${isOwnMessage ? 'order-2' : 'order-1'}`}>
                  {message.sender_image ? (
                    <div className="relative w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                      <Image
                        src={message.sender_image}
                        alt={message.sender_name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-rose-500 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                      {message.sender_name?.[0].toUpperCase() || 'U'}
                    </div>
                  )}
                </div>

                {/* Message Bubble */}
                <div className={`flex flex-col ${isOwnMessage ? 'items-end order-1' : 'items-start order-2'}`}>
                  <p className="text-xs text-slate-500 mb-1">{message.sender_name}</p>
                  <div
                    className={`px-4 py-2.5 rounded-lg max-w-xs ${
                      isOwnMessage
                        ? 'bg-primary text-white rounded-br-none'
                        : 'bg-slate-100 text-slate-900 rounded-bl-none'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    {new Date(message.created_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form
        onSubmit={handleSendMessage}
        className="p-4 border-t border-rose-100 bg-white flex gap-2"
      >
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Say hello to the community..."
          disabled={sendingMessage}
          className="flex-1 px-4 py-2.5 bg-slate-50 border border-rose-100 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/50 focus:bg-white transition disabled:opacity-50 text-sm"
        />
        <button
          type="submit"
          disabled={sendingMessage || !newMessage.trim()}
          className="p-2.5 bg-primary text-white rounded-full hover:bg-rose-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
          aria-label="Send message"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  )
}
