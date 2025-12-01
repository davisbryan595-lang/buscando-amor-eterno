'use client'

import React from 'react'
import Navigation from '@/components/navigation'
import Footer from '@/components/footer'
import { Heart } from 'lucide-react'

export default function ChatRoomPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50">
      <Navigation />
      <div className="pt-24 pb-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <Heart className="w-16 h-16 text-rose-400 mx-auto mb-4" />
            <h1 className="text-4xl font-playfair font-bold mb-2 text-slate-900">
              Singles Lounge
            </h1>
            <p className="text-slate-600 mb-8 max-w-2xl mx-auto">
              A community chat feature coming soon. For now, connect with matches through private messages!
            </p>
            
            <div className="bg-white rounded-2xl p-12 shadow-md border border-rose-100 max-w-2xl mx-auto">
              <p className="text-slate-700 mb-6">
                We're building an amazing group chat experience where members can:
              </p>
              <ul className="space-y-3 text-left mb-8 text-slate-600">
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold text-lg">✓</span>
                  <span>Connect with the entire community</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold text-lg">✓</span>
                  <span>Share stories and experiences</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold text-lg">✓</span>
                  <span>Discover group events and activities</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary font-bold text-lg">✓</span>
                  <span>Build friendships beyond matches</span>
                </li>
              </ul>

              <div className="bg-rose-50 rounded-xl p-6 border border-rose-200">
                <p className="text-sm text-slate-700">
                  <strong>In the meantime,</strong> use our Messages feature to have private conversations with your matches and explore meaningful connections one-on-one.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
