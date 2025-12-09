'use client'

import React, { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import ChatWindow from '@/components/chat-window'
import Image from 'next/image'
import { useMessages } from '@/hooks/useMessages'
import { useAuth } from '@/context/auth-context'
import { useSubscription } from '@/hooks/useSubscription'
import { X } from 'lucide-react'

function MessagesContentInner() {
  const { user } = useAuth()
  const { isPremium, loading: subLoading } = useSubscription()
  const { conversations, loading, error } = useMessages()
  const searchParams = useSearchParams()
  const userIdParam = searchParams.get('user')
  const [selectedConversation, setSelectedConversation] = useState<any>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

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
          other_user_name: 'User',
          other_user_image: null,
          last_message: '',
          last_message_time: new Date().toISOString(),
          is_online: false,
          unread_count: 0,
        })
      }
    } else if (!selectedConversation && conversations.length > 0) {
      setSelectedConversation(conversations[0])
    }
  }, [conversations, userIdParam, user?.id, selectedConversation])

  const handleSelectConversation = (conversation: any) => {
    setSelectedConversation(conversation)
    setSidebarOpen(false)
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
    <div className="pt-24 pb-12 px-4 h-screen flex flex-col">
      <div className="max-w-6xl mx-auto w-full flex-1 flex gap-6 relative">
        {/* Mobile sidebar toggle */}
        <div className="md:hidden absolute left-0 top-0 z-30">
          {!sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 hover:bg-rose-100 rounded-lg transition"
              aria-label="Open conversations"
            >
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}
        </div>

        {/* Sidebar */}
        <div className={`absolute md:static inset-0 md:inset-auto w-full md:w-80 bg-gradient-to-b from-white to-rose-50 rounded-xl border border-rose-100 overflow-y-auto transition-opacity duration-300 z-20 ${
          sidebarOpen ? 'opacity-100 pointer-events-auto' : 'md:opacity-100 md:pointer-events-auto opacity-0 pointer-events-none md:relative'
        }`}>
          <div className="p-4 border-b border-rose-100 sticky top-0 bg-white flex items-center justify-between rounded-t-xl">
            <h2 className="text-xl font-bold text-slate-900">Messages</h2>
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
              <div className="p-4 text-center text-slate-600">No conversations yet</div>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => handleSelectConversation(conv)}
                  className={`w-full p-4 text-left hover:bg-rose-100 transition ${
                    selectedConversation?.id === conv.id ? 'bg-rose-100 border-l-4 border-primary' : ''
                  }`}
                >
                  <div className="flex gap-3 items-center">
                    <div className="relative w-12 h-12 flex-shrink-0">
                      <Image
                        src={conv.other_user_image || '/placeholder.svg'}
                        alt={conv.other_user_name || 'User'}
                        fill
                        className="rounded-full object-cover"
                      />
                      {conv.is_online && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white z-10" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900">{conv.other_user_name || 'User'}</p>
                      <p className="text-sm text-slate-600 truncate">{conv.last_message}</p>
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
        {selectedConversation && (
          <div className="flex-1 hidden md:flex">
            <ChatWindow conversation={selectedConversation} />
          </div>
        )}

        {/* Mobile chat view */}
        {selectedConversation && !sidebarOpen && (
          <div className="md:hidden absolute inset-0 w-full h-full">
            <ChatWindow conversation={selectedConversation} />
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
