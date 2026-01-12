'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/auth-context'
import { useLounge } from '@/hooks/useLounge'
import { ErrorBoundary } from './error-boundary'
import { Send, Flag, Users, ArrowLeft, Heart } from 'lucide-react'
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
      <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-br from-rose-50 dark:from-rose-950/30 to-pink-50 dark:to-pink-950/30">
        <div className="text-center max-w-md">
          <Users className="w-16 h-16 text-rose-300 mx-auto mb-6" />
          <h1 className="text-3xl font-playfair font-bold text-foreground mb-4">
            Join the Lounge
          </h1>
          <p className="text-muted-foreground mb-8">
            Please log in to chat with singles in the lounge
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => router.push('/login')}
              className="w-full px-8 py-3 bg-primary text-white rounded-full font-semibold hover:bg-rose-700 transition-colors"
            >
              Log In
            </button>
            <button
              onClick={() => router.push('/')}
              className="w-full px-8 py-3 bg-card text-primary border-2 border-primary rounded-full font-semibold hover:bg-card-hover transition-colors flex items-center justify-center gap-2"
            >
              <ArrowLeft size={18} />
              Back to Home
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-background relative overflow-hidden">
      {/* Animated background elements - subtle romantic theme */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Subtle floating gradient orbs - very minimal */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-rose-100/10 to-rose-200/5 rounded-full blur-3xl opacity-30 animate-float" />
        <div className="absolute top-1/4 -left-32 w-64 h-64 bg-gradient-to-br from-rose-100/5 to-rose-200/5 rounded-full blur-3xl opacity-20 animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-tr from-rose-100/8 to-rose-200/5 rounded-full blur-3xl opacity-25 animate-float-delayed" />
        <div className="absolute bottom-1/3 left-0 w-72 h-72 bg-gradient-to-tr from-rose-100/5 to-rose-200/5 rounded-full blur-3xl opacity-15 animate-pulse-slow" />

        {/* Subtle Floating hearts - refined and elegant */}
        <div className="heart-float" style={{ left: '8%', animationDelay: '0s' }}>
          <Heart className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-rose-300 drop-shadow-sm opacity-40" fill="currentColor" />
        </div>
        <div className="heart-float" style={{ left: '18%', animationDelay: '0.8s' }}>
          <Heart className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 text-rose-400 drop-shadow-sm opacity-45" fill="currentColor" />
        </div>
        <div className="heart-float" style={{ left: '32%', animationDelay: '1.6s' }}>
          <Heart className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-rose-300 drop-shadow-sm opacity-35" fill="currentColor" />
        </div>
        <div className="heart-float" style={{ left: '48%', animationDelay: '0.4s' }}>
          <Heart className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 text-rose-400 drop-shadow-sm opacity-40" fill="currentColor" />
        </div>
        <div className="heart-float" style={{ left: '62%', animationDelay: '1.2s' }}>
          <Heart className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-rose-300 drop-shadow-sm opacity-45" fill="currentColor" />
        </div>
        <div className="heart-float" style={{ left: '76%', animationDelay: '0s' }}>
          <Heart className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 text-rose-400 drop-shadow-sm opacity-35" fill="currentColor" />
        </div>

        {/* Subtle Floating sparkles - refined timing */}
        <div className="sparkle-float opacity-40" style={{ left: '12%', animationDelay: '0.2s', fontSize: 'clamp(0.75rem, 1.5vw, 1rem)' }}>
          ✨
        </div>
        <div className="sparkle-float opacity-35" style={{ left: '35%', animationDelay: '1s', fontSize: 'clamp(0.625rem, 1.25vw, 0.875rem)' }}>
          ✨
        </div>
        <div className="sparkle-float opacity-40 hidden sm:block" style={{ left: '58%', animationDelay: '1.8s', fontSize: 'clamp(0.75rem, 1.5vw, 1rem)' }}>
          ✨
        </div>
        <div className="sparkle-float opacity-35" style={{ left: '72%', animationDelay: '0.6s', fontSize: 'clamp(0.625rem, 1.25vw, 0.875rem)' }}>
          ✨
        </div>

        {/* Subtle Rose petals - refined appearance */}
        <div className="petal-float opacity-35" style={{ left: '15%', animationDelay: '0.5s', fontSize: 'clamp(0.75rem, 2vw, 1rem)' }}>
          🌹
        </div>
        <div className="petal-float opacity-30 hidden sm:block" style={{ left: '40%', animationDelay: '1.5s', fontSize: 'clamp(0.875rem, 2.25vw, 1.125rem)' }}>
          🌹
        </div>
        <div className="petal-float opacity-35" style={{ left: '65%', animationDelay: '0.1s', fontSize: 'clamp(0.75rem, 2vw, 1rem)' }}>
          🌹
        </div>
        <div className="petal-float opacity-30" style={{ left: '80%', animationDelay: '1.1s', fontSize: 'clamp(0.875rem, 2.25vw, 1.125rem)' }}>
          🌹
        </div>
      </div>

      {/* Header */}
      <div className="bg-card border-b border-border px-6 py-4 relative z-20">
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
                <h1 className="text-2xl font-playfair font-bold text-foreground">💕 Singles Lounge</h1>
                <p className="text-muted-foreground text-sm">Real-time chat with singles worldwide</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-card-subtle dark:bg-rose-900/30 rounded-full px-4 py-2">
              <Users size={16} className="text-primary" />
              <span className="text-foreground font-semibold">{onlineUsers.length}</span>
              <span className="text-muted-foreground text-sm">online</span>
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
            <div className="text-muted-foreground">Loading messages...</div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-xl font-playfair font-bold text-foreground mb-2">Welcome to the Lounge!</p>
              <p className="text-muted-foreground">Be the first to say hello to our community 💕</p>
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
                      <p className="text-muted-foreground text-sm italic">{msg.message}</p>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-baseline gap-2">
                        <p className="font-semibold text-foreground">{msg.sender_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(msg.created_at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                      <p className="text-foreground mt-1 break-words">{msg.message}</p>

                      {/* Report button */}
                      {msg.user_id !== user?.id && (
                        <button
                          onClick={() =>
                            reportingMessageId === msg.id
                              ? setReportingMessageId(null)
                              : setReportingMessageId(msg.id)
                          }
                          className="text-xs text-muted-foreground hover:text-rose-600 mt-2 flex items-center gap-1 transition"
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
                            className="w-full bg-white text-foreground text-sm rounded px-2 py-1 border border-rose-200 placeholder-muted-foreground resize-none"
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
                              className="text-xs bg-rose-100 hover:bg-rose-200 text-foreground px-3 py-1 rounded transition"
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
      <div className="bg-card border-t border-border px-6 py-4 relative z-20">
        <div className="max-w-6xl mx-auto">
          <form onSubmit={handleSendMessage} className="flex gap-3">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Say something to the lounge..."
              className="flex-1 bg-card-subtle border border-border rounded-full px-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition"
            />
            <button
              type="submit"
              disabled={!inputValue.trim()}
              className="bg-gradient-to-r from-primary to-rose-600 hover:from-rose-600 hover:to-rose-700 disabled:bg-muted disabled:cursor-not-allowed text-white px-6 py-3 rounded-full transition flex items-center gap-2 font-semibold"
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
      <style jsx global>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-30px);
          }
        }

        @keyframes float-delayed {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-40px);
          }
        }

        @keyframes pulse-slow {
          0%, 100% {
            opacity: 0.25;
          }
          50% {
            opacity: 0.4;
          }
        }

        @keyframes heart-rise {
          0% {
            transform: translateY(100vh) translateX(0) scale(1);
            opacity: 0;
          }
          5% {
            opacity: 1;
          }
          25% {
            transform: translateY(75vh) translateX(25px);
          }
          50% {
            transform: translateY(50vh) translateX(-15px);
          }
          75% {
            transform: translateY(25vh) translateX(20px);
          }
          95% {
            opacity: 1;
          }
          100% {
            transform: translateY(-100vh) translateX(0) scale(1);
            opacity: 0;
          }
        }

        @keyframes sparkle-drift {
          0% {
            transform: translateY(100vh) translateX(0) scale(1);
            opacity: 0;
          }
          5% {
            opacity: 1;
          }
          30% {
            transform: translateY(70vh) translateX(40px);
          }
          60% {
            transform: translateY(40vh) translateX(-20px);
          }
          90% {
            opacity: 0.9;
          }
          100% {
            transform: translateY(-100vh) translateX(50px) scale(1);
            opacity: 0;
          }
        }

        @keyframes petal-drift {
          0% {
            transform: translateY(100vh) translateX(0) rotate(0deg) scale(1);
            opacity: 0;
          }
          5% {
            opacity: 1;
          }
          30% {
            transform: translateY(70vh) translateX(50px) rotate(90deg);
          }
          60% {
            transform: translateY(40vh) translateX(-25px) rotate(180deg);
          }
          90% {
            opacity: 0.8;
          }
          100% {
            transform: translateY(-100vh) translateX(60px) rotate(360deg) scale(1);
            opacity: 0;
          }
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
          animation-delay: 1s;
        }

        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }

        .heart-float {
          position: fixed;
          bottom: 0;
          animation: heart-rise 7s ease-in linear infinite;
          pointer-events: none;
        }

        .sparkle-float {
          position: fixed;
          bottom: 0;
          font-size: 1.5rem;
          animation: sparkle-drift 8s ease-in linear infinite;
          pointer-events: none;
        }

        .petal-float {
          position: fixed;
          bottom: 0;
          font-size: 1.25rem;
          animation: petal-drift 9s ease-in linear infinite;
          pointer-events: none;
        }
      `}</style>
    </ErrorBoundary>
  )
}
