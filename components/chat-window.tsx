'use client'

import React, { useState } from 'react'
import { Send, Phone, Video } from 'lucide-react'
import Link from 'next/link'

interface Conversation {
  id: number
  name: string
  lastMessage: string
  isOnline: boolean
  image: string
}

export default function ChatWindow({ conversation }: { conversation: Conversation }) {
  const [messages, setMessages] = useState([
    { id: 1, sender: 'them', text: 'Hi! How are you?' },
    { id: 2, sender: 'you', text: 'Hey! Im doing great, thanks for asking!' },
    { id: 3, sender: 'them', text: 'I love traveling too! Have you been to Portugal?' },
    { id: 4, sender: 'you', text: 'Not yet, but it\'s on my list! Is that where you\'re from?' },
    { id: 5, sender: 'them', text: 'Yes! Born and raised in Lisbon 🌊' },
  ])
  const [newMessage, setNewMessage] = useState('')

  const handleSend = () => {
    if (newMessage.trim()) {
      setMessages([
        ...messages,
        { id: messages.length + 1, sender: 'you', text: newMessage },
      ])
      setNewMessage('')
    }
  }

  return (
    <div className="bg-gradient-to-b from-white to-rose-50 rounded-xl border border-rose-100 flex flex-col h-full soft-glow">
      {/* Header */}
      <div className="p-4 border-b border-rose-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={conversation.image || "/placeholder.svg"}
              alt={conversation.name}
              className="w-12 h-12 rounded-full object-cover"
            />
            {conversation.isOnline && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
            )}
          </div>
          <div>
            <p className="font-semibold text-slate-900">{conversation.name}</p>
            <p className="text-sm text-slate-600">
              {conversation.isOnline ? 'Online' : 'Offline'}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button className="p-2 hover:bg-rose-100 rounded-full transition">
            <Phone size={20} className="text-primary" />
          </button>
          <Link href="/video-date" className="p-2 hover:bg-rose-100 rounded-full transition">
            <Video size={20} className="text-primary" />
          </Link>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === 'you' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs px-4 py-2 rounded-2xl ${
                msg.sender === 'you'
                  ? 'bg-primary text-white rounded-br-none'
                  : 'bg-slate-200 text-slate-900 rounded-bl-none'
              }`}
            >
              <p>{msg.text}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-rose-100 flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2 bg-white border border-rose-200 rounded-full focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <button
          onClick={handleSend}
          className="p-2 bg-primary text-white rounded-full hover:bg-rose-700 transition"
          aria-label="Send message"
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  )
}
