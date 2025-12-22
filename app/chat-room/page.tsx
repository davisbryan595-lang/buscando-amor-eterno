'use client'

import React, { useEffect, useRef } from 'react'
import Navigation from '@/components/navigation'
import Footer from '@/components/footer'
import LoungeChatWindow from '@/components/lounge-chat-window'
import { Heart } from 'lucide-react'
import gsap from 'gsap'

export default function ChatRoomPage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const chatRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!headerRef.current) return

    // Animate header elements on mount
    gsap.fromTo(
      headerRef.current,
      {
        opacity: 0,
        y: 20,
      },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: 'power3.out',
      }
    )

    // Animate chat window
    if (chatRef.current) {
      gsap.fromTo(
        chatRef.current,
        {
          opacity: 0,
          y: 30,
          scale: 0.98,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          ease: 'power3.out',
          delay: 0.3,
        }
      )
    }
  }, [])

  return (
    <main className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-orange-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Floating gradient orbs for 3D effect */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-primary/20 to-rose-300/20 rounded-full blur-3xl opacity-40 animate-float" />
        <div className="absolute top-1/4 -left-32 w-64 h-64 bg-gradient-to-br from-pink-300/20 to-primary/10 rounded-full blur-3xl opacity-30 animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-tr from-orange-200/15 to-primary/15 rounded-full blur-3xl opacity-35 animate-float-delayed" />
        <div className="absolute bottom-1/3 left-0 w-72 h-72 bg-gradient-to-tr from-rose-200/15 to-pink-200/15 rounded-full blur-3xl opacity-25 animate-pulse-slow" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <Navigation />

        <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Header Section */}
            <div ref={headerRef} className="text-center mb-8 sm:mb-12">
              <div className="flex justify-center mb-4">
                <Heart className="w-12 h-12 sm:w-16 sm:h-16 text-rose-400 drop-shadow-lg" />
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-playfair font-bold mb-2 sm:mb-4 text-slate-900">
                Singles Lounge
              </h1>
              <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto px-2">
                Connect with our vibrant community, share stories, and find your tribe 💕
              </p>
            </div>

            {/* Chat Window */}
            <div ref={chatRef} className="h-96 sm:h-[32rem] md:h-[36rem] mb-8">
              <LoungeChatWindow />
            </div>

            {/* Info Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-rose-100/50 shadow-md hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-rose-500 flex items-center justify-center text-white flex-shrink-0 text-lg">
                    💬
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-slate-900 mb-1 text-sm sm:text-base">Real-Time Chat</h3>
                    <p className="text-xs sm:text-sm text-slate-600">Instant messaging with the entire community. No refresh needed!</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-rose-100/50 shadow-md hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-rose-500 flex items-center justify-center text-white flex-shrink-0 text-lg">
                    👥
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-slate-900 mb-1 text-sm sm:text-base">Community Hub</h3>
                    <p className="text-xs sm:text-sm text-slate-600">Meet singles from around the world and build meaningful connections.</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-rose-100/50 shadow-md hover:shadow-lg transition-shadow md:col-span-2">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-rose-500 flex items-center justify-center text-white flex-shrink-0 text-lg">
                    ⭐
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-slate-900 mb-1 text-sm sm:text-base">Safe & Welcoming</h3>
                    <p className="text-xs sm:text-sm text-slate-600">A respectful space where everyone can be themselves and find genuine connections.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />

      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-30px);
          }
        }

        @keyframes float-delayed {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-40px);
          }
        }

        @keyframes pulse-slow {
          0%, 100% {
            opacity: 0.25;
          }
          50% {
            opacity: 0.4;
          }
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
          animation-delay: 1s;
        }

        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
      `}</style>
    </main>
  )
}
