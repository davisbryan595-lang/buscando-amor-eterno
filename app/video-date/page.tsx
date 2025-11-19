'use client'

import React, { useEffect } from 'react'
import Navigation from '@/components/navigation'
import Footer from '@/components/footer'
import { Lock } from 'lucide-react'

export default function VideoDatePage() {
  return (
    <main className="min-h-screen bg-white">
      <Navigation />
      <div className="pt-24 pb-12 px-4 h-screen flex flex-col">
        <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col">
          <h1 className="text-3xl md:text-4xl font-playfair font-bold mb-6 text-slate-900">
            Start a Video Date
          </h1>

          {/* Jitsi Meet Embed */}
          <div className="flex-1 bg-slate-900 rounded-xl overflow-hidden soft-glow-lg relative">
            <iframe
              allow="camera; microphone; fullscreen"
              src={`https://meet.jit.si/BuscandoAmorEterno-${Math.random().toString(36).substring(7)}`}
              style={{
                height: '100%',
                width: '100%',
                border: 0,
              }}
              title="Jitsi Meet Video Conference"
            />

            {/* Overlay for non-logged-in users */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center rounded-xl hidden md:flex">
              <div className="bg-white p-8 rounded-2xl text-center soft-glow-lg">
                <Lock size={48} className="text-primary mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  Premium Feature
                </h2>
                <p className="text-slate-600 mb-6">
                  Video dates are available for premium members
                </p>
              </div>
            </div>
          </div>

          <p className="text-slate-600 mt-4 text-sm flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full" />
            Your video session is encrypted and private
          </p>
        </div>
      </div>

      <Footer />
    </main>
  )
}
