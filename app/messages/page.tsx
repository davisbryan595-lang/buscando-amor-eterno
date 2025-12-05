'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Navigation from '@/components/navigation'
import Footer from '@/components/footer'
import ChatWindow from '@/components/chat-window'
import Image from 'next/image'
import { useMessages } from '@/hooks/useMessages'
import { useAuth } from '@/context/auth-context'
import { useSubscription } from '@/hooks/useSubscription'
import { Lock } from 'lucide-react'

export default function MessagesPage() {
  const { user } = useAuth()
  const { conversations, loading } = useMessages()
  const [selectedConversation, setSelectedConversation] = useState<any>(conversations[0])

  if (loading) {
    return (
      <main className="min-h-screen bg-white">
        <Navigation />
        <div className="pt-24 pb-12 px-4 h-screen flex items-center justify-center">
          <p className="text-slate-600">Loading conversations...</p>
        </div>
      </main>
    )
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-white">
        <Navigation />
        <div className="pt-24 pb-12 px-4 h-screen flex items-center justify-center">
          <p className="text-slate-600">Please log in to view messages.</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-white">
      <Navigation />
      <div className="pt-24 pb-12 px-4 h-screen flex flex-col">
        <div className="max-w-6xl mx-auto w-full flex-1 flex gap-6">
          <div className="w-full md:w-80 bg-gradient-to-b from-white to-rose-50 rounded-xl border border-rose-100 overflow-y-auto">
            <div className="p-4 border-b border-rose-100 sticky top-0 bg-white">
              <h2 className="text-xl font-bold text-slate-900">Messages</h2>
            </div>

            <div className="divide-y">
              {conversations.length === 0 ? (
                <div className="p-4 text-center text-slate-600">No conversations yet</div>
              ) : (
                conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv)}
                    className={`w-full p-4 text-left hover:bg-rose-100 transition ${
                      selectedConversation?.id === conv.id ? 'bg-rose-100' : ''
                    }`}
                  >
                    <div className="flex gap-3 items-center">
                      <div className="relative w-12 h-12">
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
                        <span className="bg-rose-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {conv.unread_count}
                        </span>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {selectedConversation && (
            <div className="flex-1 hidden md:flex">
              <ChatWindow conversation={selectedConversation} />
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  )
}
