'use client'

import React, { useState } from 'react'
import Navigation from '@/components/navigation'
import Footer from '@/components/footer'
import ChatWindow from '@/components/chat-window'
import Image from 'next/image'

const conversations = [
  {
    id: 1,
    name: 'Sofia',
    lastMessage: 'I love traveling too! Have you been to Portugal?',
    isOnline: true,
    image: '/placeholder.svg?height=200&width=200',
  },
  {
    id: 2,
    name: 'Isabella',
    lastMessage: 'That sounds amazing! When are you free?',
    isOnline: false,
    image: '/placeholder.svg?height=200&width=200',
  },
  {
    id: 3,
    name: 'Elena',
    lastMessage: 'Coffee date this weekend? ☕',
    isOnline: true,
    image: '/placeholder.svg?height=200&width=200',
  },
]

export default function MessagesPage() {
  const [selectedChat, setSelectedChat] = useState(conversations[0])

  return (
    <main className="min-h-screen bg-white">
      <Navigation />
      <div className="pt-24 pb-12 px-4 h-screen flex flex-col">
        <div className="max-w-6xl mx-auto w-full flex-1 flex gap-6">
          {/* Conversations List */}
          <div className="w-full md:w-80 bg-gradient-to-b from-white to-rose-50 rounded-xl border border-rose-100 overflow-y-auto">
            <div className="p-4 border-b border-rose-100 sticky top-0 bg-white">
              <h2 className="text-xl font-bold text-slate-900">Messages</h2>
            </div>

            <div className="divide-y">
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedChat(conv)}
                  className={`w-full p-4 text-left hover:bg-rose-100 transition ${
                    selectedChat.id === conv.id ? 'bg-rose-100' : ''
                  }`}
                >
                  <div className="flex gap-3 items-center">
                    <div className="relative w-12 h-12">
                      <Image
                        src={conv.image || "/placeholder.svg"}
                        alt={conv.name}
                        fill
                        className="rounded-full object-cover"
                      />
                      {conv.isOnline && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white z-10" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900">{conv.name}</p>
                      <p className="text-sm text-slate-600 truncate">{conv.lastMessage}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Chat Window */}
          <div className="flex-1 hidden md:flex">
            <ChatWindow conversation={selectedChat} />
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
