'use client'

import React from 'react'
import Navigation from '@/components/navigation'
import Footer from '@/components/footer'

export default function ChatRoomPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navigation />
      <div className="pt-24 pb-12 px-4 h-screen flex flex-col">
        <div className="max-w-6xl mx-auto w-full flex-1 flex flex-col">
          <h1 className="text-3xl md:text-4xl font-playfair font-bold mb-2 text-slate-900">
            Singles Lounge
          </h1>
          <p className="text-slate-600 mb-6">
            Connect with our community in real-time. Chat with singles from around the world!
          </p>

          {/* Rocket.Chat Embed */}
          <div className="flex-1 bg-white rounded-xl overflow-hidden soft-glow-lg border-2 border-rose-100">
            <iframe
              src="https://demo.rocket.chat/channel/general"
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
              }}
              title="Rocket.Chat Singles Lounge"
              allow="clipboard-read; clipboard-write"
            />
          </div>

          <p className="text-slate-600 text-sm mt-4">
            💡 Tip: Use this space to meet other members, ask questions, and share dating tips!
          </p>
        </div>
      </div>

      <Footer />
    </main>
  )
}
