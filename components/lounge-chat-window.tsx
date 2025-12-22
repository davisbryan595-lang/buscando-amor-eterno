'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Send, Heart } from 'lucide-react'
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
  const containerRef = useRef<HTMLDivElement>(null)

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

  return (
    <div ref={containerRef} className="flex flex-col h-full w-full bg-white/70 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-rose-100/50 shadow-lg sm:shadow-xl overflow-hidden">
      {/* Messages Container */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-2 py-3 sm:px-4 sm:py-4 md:px-6 md:py-6 space-y-2 sm:space-y-3 lg:space-y-4 bg-gradient-to-b from-white/50 via-rose-50/20 to-white/50"
      >
        {loading ? (
          <div className="flex items-center justify-center h-full w-full">
            <p className="text-slate-500 text-xs sm:text-sm md:text-base">Loading messages...</p>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full w-full px-4">
            <div className="text-center">
              <p className="text-slate-700 font-semibold mb-1 text-xs sm:text-sm md:text-base">Something went wrong</p>
              <p className="text-slate-500 text-xs sm:text-xs md:text-sm break-words">{error}</p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full w-full text-center px-3 sm:px-4">
            <Heart className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 text-rose-300 mb-2 sm:mb-3 md:mb-4 drop-shadow-lg" fill="currentColor" />
            <p className="text-base sm:text-lg md:text-2xl font-playfair font-bold text-slate-900 mb-1 sm:mb-2">Welcome to the Lounge!</p>
            <p className="text-xs sm:text-sm md:text-base text-slate-600 max-w-xs sm:max-w-sm">Be the first to say hello to our community 💕</p>
          </div>
        ) : (
          messages.map((message, index) => {
            const isOwnMessage = message.sender_id === user?.id

            return (
              <div
                key={message.id}
                className="flex gap-1.5 sm:gap-2 md:gap-3 animate-in fade-in w-full"
                style={{
                  animationDelay: `${index * 50}ms`,
                  animationFillMode: 'backwards',
                }}
              >
                {/* Avatar Container */}
                <div className={`flex flex-col justify-start flex-shrink-0 ${isOwnMessage ? 'order-2 ml-1 sm:ml-2' : 'order-1 mr-1 sm:mr-2'}`}>
                  {message.sender_image ? (
                    <div className="relative w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full overflow-hidden flex-shrink-0 ring-1.5 sm:ring-2 ring-rose-200">
                      <Image
                        src={message.sender_image}
                        alt={message.sender_name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-primary to-rose-500 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0 ring-1.5 sm:ring-2 ring-rose-200">
                      {message.sender_name?.[0].toUpperCase() || 'U'}
                    </div>
                  )}
                </div>

                {/* Message Bubble */}
                <div className={`flex flex-col gap-0.5 max-w-[calc(100%-2rem)] sm:max-w-[calc(100%-2.5rem)] md:max-w-[calc(100%-3rem)] ${isOwnMessage ? 'items-end order-1' : 'items-start order-2'}`}>
                  <p className="text-xs text-slate-500 px-1.5 sm:px-2 truncate">{message.sender_name}</p>
                  <div
                    className={`px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-2.5 rounded-lg sm:rounded-xl max-w-full ${
                      isOwnMessage
                        ? 'bg-gradient-to-r from-primary to-rose-600 text-white rounded-br-none shadow-sm sm:shadow-md'
                        : 'bg-white border border-rose-100/50 text-slate-900 rounded-bl-none shadow-xs sm:shadow-sm'
                    }`}
                  >
                    <p className="text-xs sm:text-sm md:text-sm whitespace-pre-wrap break-words">{message.content}</p>
                  </div>
                  <p className="text-xs text-slate-400 px-1.5 sm:px-2">
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
        className="p-3 sm:p-4 border-t border-rose-100/50 bg-white/50 backdrop-blur-sm flex gap-2 flex-shrink-0"
      >
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Say hello to the community..."
          disabled={sendingMessage}
          className="flex-1 px-4 py-2.5 bg-slate-50 border border-rose-100 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/50 focus:bg-white transition disabled:opacity-50 text-sm placeholder-slate-500"
        />
        <button
          type="submit"
          disabled={sendingMessage || !newMessage.trim()}
          className="p-2.5 bg-gradient-to-r from-primary to-rose-600 text-white rounded-full hover:shadow-lg hover:from-rose-700 hover:to-rose-800 transition disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 drop-shadow-md"
          aria-label="Send message"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  )
}
