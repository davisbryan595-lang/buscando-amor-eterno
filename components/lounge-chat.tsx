'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/auth-context'
import { useLounge } from '@/hooks/useLounge'
import { ErrorBoundary } from './error-boundary'
import { Send, Flag, Users, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'

function LoungeChatContent() {
  const router = useRouter()
  const { user } = useAuth()
  const { messages, onlineUsers, loading, sendMessage, reportMessage } = useLounge()
  const [inputValue, setInputValue] = useState('')
  const [reportingMessageId, setReportingMessageId] = useState<string | null>(null)
  const [reportReason, setReportReason] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim()) return

    await sendMessage(inputValue)
    setInputValue('')
  }

  const handleReportMessage = async (messageId: string) => {
    if (!reportReason.trim()) {
      toast.error('Please provide a reason for the report')
      return
    }

    await reportMessage(messageId, reportReason)
    setReportingMessageId(null)
    setReportReason('')
    toast.success('Message reported. Thank you for helping keep our community safe.')
  }

  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Join the Lounge</h2>
          <p className="text-slate-600">Please log in to chat with singles in the lounge</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-white relative overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-rose-100/40 px-6 py-4 relative z-20">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/')}
                className="text-primary hover:bg-rose-100/50 transition p-2 rounded-lg"
                title="Back to home"
              >
                <ArrowLeft size={24} />
              </button>
              <div>
                <h1 className="text-2xl font-playfair font-bold text-slate-900">💕 Singles Lounge</h1>
                <p className="text-slate-600 text-sm">Real-time chat with singles worldwide</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-rose-50 rounded-full px-4 py-2">
              <Users size={16} className="text-primary" />
              <span className="text-slate-900 font-semibold">{onlineUsers.length}</span>
              <span className="text-slate-600 text-sm">online</span>
            </div>
          </div>

          {/* Online users avatars */}
          {onlineUsers.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {onlineUsers.slice(0, 12).map((onlineUser) => (
                <div
                  key={onlineUser.user_id}
                  className="flex-shrink-0 group relative"
                  title={onlineUser.full_name}
                >
                  {onlineUser.main_photo ? (
                    <img
                      src={onlineUser.main_photo}
                      alt={onlineUser.full_name}
                      className="w-10 h-10 rounded-full border-2 border-primary object-cover hover:scale-110 transition-transform"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full border-2 border-primary bg-rose-100 flex items-center justify-center text-primary text-xs font-bold">
                      {onlineUser.full_name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                </div>
              ))}
              {onlineUsers.length > 12 && (
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-primary text-xs font-bold">
                  +{onlineUsers.length - 12}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Messages container */}
      <div className="flex-1 overflow-y-auto px-6 py-4 max-w-6xl mx-auto w-full relative z-10">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-slate-500">Loading messages...</div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-xl font-playfair font-bold text-slate-900 mb-2">Welcome to the Lounge!</p>
              <p className="text-slate-600">Be the first to say hello to our community 💕</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.message_type === 'system' ? 'justify-center' : ''}`}
              >
                {msg.message_type !== 'system' && (
                  <>
                    {msg.sender_image ? (
                      <img
                        src={msg.sender_image}
                        alt={msg.sender_name}
                        className="w-8 h-8 rounded-full object-cover flex-shrink-0 hover:scale-125 transition-transform cursor-pointer"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-primary text-xs font-bold flex-shrink-0 hover:scale-125 transition-transform cursor-pointer">
                        {msg.sender_name?.charAt(0).toUpperCase() || '?'}
                      </div>
                    )}
                  </>
                )}

                <div className={`flex-1 ${msg.message_type === 'system' ? '' : ''}`}>
                  {msg.message_type === 'system' ? (
                    <div className="flex justify-center">
                      <p className="text-slate-500 text-sm italic">{msg.message}</p>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-baseline gap-2">
                        <p className="font-semibold text-slate-900">{msg.sender_name}</p>
                        <p className="text-xs text-slate-500">
                          {new Date(msg.created_at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                      <p className="text-slate-700 mt-1 break-words">{msg.message}</p>

                      {/* Report button */}
                      {msg.user_id !== user?.id && (
                        <button
                          onClick={() =>
                            reportingMessageId === msg.id
                              ? setReportingMessageId(null)
                              : setReportingMessageId(msg.id)
                          }
                          className="text-xs text-slate-500 hover:text-rose-600 mt-2 flex items-center gap-1 transition"
                        >
                          <Flag size={12} />
                          Report
                        </button>
                      )}

                      {/* Report form */}
                      {reportingMessageId === msg.id && (
                        <div className="bg-rose-50 rounded p-3 mt-2 space-y-2 border border-rose-100">
                          <textarea
                            value={reportReason}
                            onChange={(e) => setReportReason(e.target.value)}
                            placeholder="Why are you reporting this message?"
                            className="w-full bg-white text-slate-900 text-sm rounded px-2 py-1 border border-rose-200 placeholder-slate-400 resize-none"
                            rows={2}
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleReportMessage(msg.id)}
                              className="text-xs bg-rose-600 hover:bg-rose-700 text-white px-3 py-1 rounded transition"
                            >
                              Submit Report
                            </button>
                            <button
                              onClick={() => {
                                setReportingMessageId(null)
                                setReportReason('')
                              }}
                              className="text-xs bg-rose-100 hover:bg-rose-200 text-slate-900 px-3 py-1 rounded transition"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Message input */}
      <div className="bg-white border-t border-rose-100/40 px-6 py-4 relative z-20">
        <div className="max-w-6xl mx-auto">
          <form onSubmit={handleSendMessage} className="flex gap-3">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Say something to the lounge..."
              className="flex-1 bg-slate-50 border border-rose-200 rounded-full px-4 py-3 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition"
            />
            <button
              type="submit"
              disabled={!inputValue.trim()}
              className="bg-gradient-to-r from-primary to-rose-600 hover:from-rose-600 hover:to-rose-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white px-6 py-3 rounded-full transition flex items-center gap-2 font-semibold"
            >
              <Send size={18} />
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function LoungeChat() {
  return (
    <ErrorBoundary>
      <LoungeChatContent />
    </ErrorBoundary>
  )
}
