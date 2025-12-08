'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
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
  const { isPremium, loading: subLoading } = useSubscription()
  const { conversations, loading } = useMessages()
  const searchParams = useSearchParams()
  const userIdParam = searchParams.get('user')
  const [selectedConversation, setSelectedConversation] = useState<any>(null)

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
  }, [conversations, userIdParam, user?.id])

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

  if (!subLoading && !isPremium) {
    return (
      <main className="min-h-screen bg-white">
        <Navigation />
        <div className="pt-24 pb-12 px-4 flex items-center justify-center min-h-[80vh]">
          <div className="max-w-md mx-auto text-center space-y-6">
            <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto">
              <Lock className="w-8 h-8 text-primary" />
            </div>

            <div>
              <h1 className="text-3xl font-playfair font-bold text-slate-900 mb-2">
                Unlock Messaging
              </h1>
              <p className="text-slate-600">
                Upgrade to premium to start conversations and connect with matches.
              </p>
            </div>

            <div className="bg-gradient-to-br from-white to-rose-50 border-2 border-primary rounded-2xl p-6">
              <p className="text-5xl font-playfair font-bold text-primary mb-2">
                $12<span className="text-lg text-slate-600">/mo</span>
              </p>
              <ul className="space-y-2 text-slate-700 mb-6 text-sm">
                <li className="flex items-center gap-2">
                  ✓ Unlimited messages
                </li>
                <li className="flex items-center gap-2">
                  ✓ See who liked you
                </li>
                <li className="flex items-center gap-2">
                  ✓ Video date feature
                </li>
              </ul>
            </div>

            <Link
              href="/pricing"
              className="block py-3 bg-primary text-white rounded-full font-semibold hover:bg-rose-700 transition"
            >
              Upgrade to Premium
            </Link>

            <Link
              href="/browse"
              className="block py-3 border-2 border-primary text-primary rounded-full font-semibold hover:bg-rose-50 transition"
            >
              Back to Browse
            </Link>
          </div>
        </div>
        <Footer />
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
