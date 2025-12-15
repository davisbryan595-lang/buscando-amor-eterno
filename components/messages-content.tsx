'use client'

import React, { useState, useEffect, Suspense, useRef } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import gsap from 'gsap'
import ChatWindow from '@/components/chat-window'
import Image from 'next/image'
import { useMessages } from '@/hooks/useMessages'
import { useAuth } from '@/context/auth-context'
import { useSubscription } from '@/hooks/useSubscription'
import { X, ArrowLeft, Menu } from 'lucide-react'

function MessagesContentInner() {
  const { user } = useAuth()
  const { isPremium, loading: subLoading } = useSubscription()
  const { conversations, loading, error } = useMessages()
  const searchParams = useSearchParams()
  const userIdParam = searchParams.get('user')
  const [selectedConversation, setSelectedConversation] = useState<any>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isClosingChat, setIsClosingChat] = useState(false)
  const chatWindowRef = useRef<HTMLDivElement>(null)

  // Auto-select conversation if user_id is in query params
  useEffect(() => {
    if (userIdParam && conversations.length > 0) {
      const conversation = conversations.find((c) => c.other_user_id === userIdParam)
      if (conversation) {
        setSelectedConversation(conversation)
      } else {
        setSelectedConversation({
          id: userIdParam,
          user_id: user?.id,
          other_user_id: userIdParam,
          other_user_name: null,
          other_user_image: null,
          last_message: '',
          last_message_time: new Date().toISOString(),
          is_online: false,
          unread_count: 0,
        })
      }
    }
  }, [userIdParam, conversations, user?.id])

  const handleSelectConversation = (conversation: any) => {
    setSelectedConversation(conversation)
    setSidebarOpen(false)
  }

  const handleBackToConversations = () => {
    if (chatWindowRef.current) {
      setIsClosingChat(true)
      gsap.to(chatWindowRef.current, {
        x: '100%',
        duration: 0.4,
        ease: 'power2.in',
        onComplete: () => {
          setSelectedConversation(null)
          setIsClosingChat(false)
        },
      })
    } else {
      setSelectedConversation(null)
    }
  }

  if (loading) {
    return (
      <div className="pt-24 pb-12 px-4 h-screen flex items-center justify-center">
        <p className="text-slate-600">Loading conversations...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="pt-24 pb-12 px-4 h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <p className="text-slate-900 font-semibold mb-3">Unable to load conversations</p>
          <p className="text-slate-600 text-sm mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-primary text-white rounded-full hover:bg-rose-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="pt-24 pb-12 px-4 h-screen flex items-center justify-center">
        <p className="text-slate-600">Please log in to view messages.</p>
      </div>
    )
  }


  return (
    <div className="pt-20 md:pt-24 pb-12 h-screen flex flex-col bg-white">
      <div className="flex-1 flex gap-0 md:gap-4 lg:gap-6 relative overflow-hidden px-3 sm:px-4 md:px-6 lg:px-8">
        {/* Sidebar */}
        <div className={`absolute inset-0 md:static md:inset-auto w-full md:w-72 lg:w-96 bg-gradient-to-b from-white to-rose-50 md:rounded-xl md:border md:border-rose-100 overflow-y-auto transition-all duration-300 flex flex-col ${
          sidebarOpen ? 'opacity-100 pointer-events-auto z-20' : 'md:opacity-100 md:pointer-events-auto md:z-auto opacity-0 pointer-events-none md:flex z-0'
        }`}>
          <div className="p-3 md:p-4 border-b border-rose-100 sticky top-0 bg-white md:rounded-t-xl flex items-center justify-between">
            <h2 className="text-lg md:text-xl font-bold text-slate-900">Messages</h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden p-2 hover:bg-rose-100 rounded-lg transition"
              aria-label="Close conversations"
            >
              <X size={20} className="text-primary" />
            </button>
          </div>

          <div className="divide-y">
            {conversations.length === 0 ? (
              <div className="p-4 text-center text-slate-600 text-sm">No conversations yet</div>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => handleSelectConversation(conv)}
                  className={`w-full p-3 md:p-4 text-left hover:bg-rose-100 transition ${
                    selectedConversation?.id === conv.id ? 'bg-rose-100 border-l-4 border-primary' : ''
                  }`}
                >
                  <div className="flex gap-2 md:gap-3 items-center min-w-0">
                    <div className="relative w-10 h-10 md:w-12 md:h-12 flex-shrink-0">
                      <Image
                        src={conv.other_user_image || '/placeholder.svg'}
                        alt={conv.other_user_name || 'User'}
                        fill
                        className="rounded-full object-cover"
                      />
                      {conv.is_online && (
                        <div className="absolute bottom-0 right-0 w-2 h-2 md:w-3 md:h-3 bg-green-500 rounded-full border-2 border-white z-10" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 text-sm md:text-base truncate">{conv.other_user_name || 'User'}</p>
                      <p className="text-xs md:text-sm text-slate-600 truncate">{conv.last_message}</p>
                    </div>
                    {conv.unread_count > 0 && (
                      <span className="bg-rose-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                        {conv.unread_count}
                      </span>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat window */}
        {selectedConversation ? (
          <>
            {/* Desktop chat view */}
            <div className="hidden md:flex flex-1 overflow-hidden">
              <ChatWindow conversation={selectedConversation} onBack={() => setSelectedConversation(null)} />
            </div>

            {/* Mobile chat view */}
            {!sidebarOpen && (
              <div ref={chatWindowRef} className="md:hidden absolute inset-0 w-full h-full z-10">
                <ChatWindow conversation={selectedConversation} onBack={handleBackToConversations} />
              </div>
            )}
          </>
        ) : (
          <div className="hidden md:flex flex-1 items-center justify-center bg-gradient-to-br from-rose-50 to-white">
            <div className="text-center">
              <p className="text-slate-600 text-lg">Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export function MessagesContent() {
  return (
    <Suspense fallback={<div className="pt-24 pb-12 px-4 h-screen flex items-center justify-center"><p className="text-slate-600">Loading...</p></div>}>
      <MessagesContentInner />
    </Suspense>
  )
}
