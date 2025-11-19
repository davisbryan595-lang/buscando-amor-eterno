'use client'

import React, { useState } from 'react'
import Navigation from '@/components/navigation'
import Footer from '@/components/footer'
import ChatWindow from '@/components/chat-window'

const conversations = [
  {
    id: 1,
    name: 'Sofia',
    lastMessage: 'I love traveling too! Have you been to Portugal?',
    isOnline: true,
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
  },
  {
    id: 2,
    name: 'Isabella',
    lastMessage: 'That sounds amazing! When are you free?',
    isOnline: false,
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
  },
  {
    id: 3,
    name: 'Elena',
    lastMessage: 'Coffee date this weekend? ☕',
    isOnline: true,
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
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
                    <div className="relative">
                      <img
                        src={conv.image || "/placeholder.svg"}
                        alt={conv.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      {conv.isOnline && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
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
