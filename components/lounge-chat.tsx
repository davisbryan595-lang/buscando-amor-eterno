'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/context/auth-context'
import { useLounge } from '@/hooks/useLounge'
import { Send, Flag, Users } from 'lucide-react'
import { toast } from 'sonner'

export default function LoungeChat() {
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
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Join the Lounge</h2>
          <p className="text-slate-400">Please log in to chat with singles in the lounge</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Header */}
      <div className="bg-slate-800/50 backdrop-blur border-b border-slate-700 px-6 py-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-white">Singles Lounge</h1>
              <p className="text-slate-400 text-sm">Real-time chat with singles worldwide</p>
            </div>
            <div className="flex items-center gap-2 bg-slate-700/50 rounded-full px-4 py-2">
              <Users size={16} className="text-primary" />
              <span className="text-white font-semibold">{onlineUsers.length}</span>
              <span className="text-slate-400 text-sm">online</span>
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
                      className="w-10 h-10 rounded-full border-2 border-primary object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full border-2 border-primary bg-slate-700 flex items-center justify-center text-white text-xs font-bold">
                      {onlineUser.full_name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900" />
                </div>
              ))}
              {onlineUsers.length > 12 && (
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-white text-xs font-bold">
                  +{onlineUsers.length - 12}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Messages container */}
      <div className="flex-1 overflow-y-auto px-6 py-4 max-w-6xl mx-auto w-full">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-slate-400">Loading messages...</div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-white mb-2">No messages yet</h3>
              <p className="text-slate-400">Be the first to start a conversation!</p>
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
                        className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
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
                        <p className="font-semibold text-white">{msg.sender_name}</p>
                        <p className="text-xs text-slate-500">
                          {new Date(msg.created_at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                      <p className="text-slate-100 mt-1 break-words">{msg.message}</p>

                      {/* Report button */}
                      {msg.user_id !== user?.id && (
                        <button
                          onClick={() =>
                            reportingMessageId === msg.id
                              ? setReportingMessageId(null)
                              : setReportingMessageId(msg.id)
                          }
                          className="text-xs text-slate-500 hover:text-red-400 mt-2 flex items-center gap-1 transition"
                        >
                          <Flag size={12} />
                          Report
                        </button>
                      )}

                      {/* Report form */}
                      {reportingMessageId === msg.id && (
                        <div className="bg-slate-700/30 rounded p-3 mt-2 space-y-2">
                          <textarea
                            value={reportReason}
                            onChange={(e) => setReportReason(e.target.value)}
                            placeholder="Why are you reporting this message?"
                            className="w-full bg-slate-800 text-white text-sm rounded px-2 py-1 border border-slate-600 placeholder-slate-500 resize-none"
                            rows={2}
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleReportMessage(msg.id)}
                              className="text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded transition"
                            >
                              Submit Report
                            </button>
                            <button
                              onClick={() => {
                                setReportingMessageId(null)
                                setReportReason('')
                              }}
                              className="text-xs bg-slate-700 hover:bg-slate-600 text-white px-3 py-1 rounded transition"
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
      <div className="bg-slate-800/50 backdrop-blur border-t border-slate-700 px-6 py-4">
        <div className="max-w-6xl mx-auto">
          <form onSubmit={handleSendMessage} className="flex gap-3">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Say something to the lounge..."
              className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-primary transition"
            />
            <button
              type="submit"
              disabled={!inputValue.trim()}
              className="bg-primary hover:bg-rose-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg transition flex items-center gap-2 font-semibold"
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
