'use client'

import React, { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import LoungeChatWindow from '@/components/lounge-chat-window'
import { ArrowLeft, Heart } from 'lucide-react'
import gsap from 'gsap'

export default function ChatRoomPage() {
  const router = useRouter()
  const headerRef = useRef<HTMLDivElement>(null)
  const chatRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!headerRef.current) return

    // Animate header on mount
    gsap.fromTo(
      headerRef.current,
      {
        opacity: 0,
        y: -20,
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
          scale: 0.98,
        },
        {
          opacity: 1,
          scale: 1,
          duration: 0.8,
          ease: 'power3.out',
          delay: 0.2,
        }
      )
    }
  }, [])

  return (
    <main className="h-screen w-screen bg-gradient-to-br from-rose-50 via-pink-50 to-orange-50 relative overflow-hidden flex flex-col">
      {/* Animated background elements - romantic theme */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Floating gradient orbs */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-primary/20 to-rose-300/20 rounded-full blur-3xl opacity-40 animate-float" />
        <div className="absolute top-1/4 -left-32 w-64 h-64 bg-gradient-to-br from-pink-300/20 to-primary/10 rounded-full blur-3xl opacity-30 animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-tr from-orange-200/15 to-primary/15 rounded-full blur-3xl opacity-35 animate-float-delayed" />
        <div className="absolute bottom-1/3 left-0 w-72 h-72 bg-gradient-to-tr from-rose-200/15 to-pink-200/15 rounded-full blur-3xl opacity-25 animate-pulse-slow" />

        {/* Floating hearts */}
        <div className="heart-float" style={{ left: '10%', animationDelay: '0s' }}>
          <Heart className="w-6 h-6 text-rose-400 drop-shadow-lg" fill="currentColor" />
        </div>
        <div className="heart-float" style={{ left: '25%', animationDelay: '1s' }}>
          <Heart className="w-5 h-5 text-rose-300 drop-shadow-lg" fill="currentColor" />
        </div>
        <div className="heart-float" style={{ left: '45%', animationDelay: '2s' }}>
          <Heart className="w-4 h-4 text-primary drop-shadow-lg" fill="currentColor" />
        </div>
        <div className="heart-float" style={{ left: '70%', animationDelay: '0.5s' }}>
          <Heart className="w-5 h-5 text-rose-400 drop-shadow-lg" fill="currentColor" />
        </div>
        <div className="heart-float" style={{ left: '85%', animationDelay: '1.5s' }}>
          <Heart className="w-6 h-6 text-rose-300 drop-shadow-lg" fill="currentColor" />
        </div>

        {/* Floating sparkles */}
        <div className="sparkle-float" style={{ left: '15%', animationDelay: '0.3s' }}>
          ✨
        </div>
        <div className="sparkle-float" style={{ left: '35%', animationDelay: '0.8s' }}>
          ✨
        </div>
        <div className="sparkle-float" style={{ left: '60%', animationDelay: '1.2s' }}>
          ✨
        </div>
        <div className="sparkle-float" style={{ left: '80%', animationDelay: '0.6s' }}>
          ✨
        </div>

        {/* Rose petals */}
        <div className="petal-float" style={{ left: '20%', animationDelay: '0s' }}>
          🌹
        </div>
        <div className="petal-float" style={{ left: '50%', animationDelay: '1s' }}>
          🌹
        </div>
        <div className="petal-float" style={{ left: '75%', animationDelay: '0.5s' }}>
          🌹
        </div>
      </div>

      {/* Header with back button - responsive */}
      <div ref={headerRef} className="relative z-20 flex items-center gap-2 sm:gap-3 md:gap-4 px-2 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 md:py-5 bg-gradient-to-r from-white/80 to-white/60 backdrop-blur-sm border-b border-rose-100/30 flex-shrink-0">
        <button
          onClick={() => router.push('/')}
          className="p-1.5 sm:p-2 hover:bg-rose-100/50 rounded-full transition-colors flex-shrink-0 active:scale-95"
          aria-label="Go back to home"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-primary" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl font-playfair font-bold text-slate-900 flex items-center gap-1.5 sm:gap-2 whitespace-nowrap overflow-hidden text-ellipsis">
            <Heart className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-rose-400 flex-shrink-0" fill="currentColor" />
            <span className="hidden xs:inline">Singles</span>
            <span className="hidden xs:inline">Lounge</span>
            <span className="xs:hidden">Lounge</span>
          </h1>
        </div>
      </div>

      {/* Full-screen chat area - responsive padding */}
      <div ref={chatRef} className="relative z-10 flex-1 overflow-hidden px-2 py-2 sm:px-3 sm:py-3 md:px-4 md:py-4 lg:px-6 lg:py-6">
        <LoungeChatWindow />
      </div>

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

        @keyframes heart-rise {
          0% {
            transform: translateY(100vh) scale(0);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(-100vh) scale(0);
            opacity: 0;
          }
        }

        @keyframes sparkle-drift {
          0% {
            transform: translateY(100vh) translateX(0) scale(0);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 0.8;
          }
          100% {
            transform: translateY(-100vh) translateX(30px) scale(1);
            opacity: 0;
          }
        }

        @keyframes petal-drift {
          0% {
            transform: translateY(100vh) translateX(0) rotate(0deg) scale(0);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 0.7;
          }
          100% {
            transform: translateY(-100vh) translateX(50px) rotate(360deg) scale(1);
            opacity: 0;
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

        .heart-float {
          position: fixed;
          bottom: 0;
          animation: heart-rise 6s ease-in-out infinite;
          pointer-events: none;
        }

        .sparkle-float {
          position: fixed;
          bottom: 0;
          font-size: 1.5rem;
          animation: sparkle-drift 7s ease-in-out infinite;
          pointer-events: none;
        }

        .petal-float {
          position: fixed;
          bottom: 0;
          font-size: 1.25rem;
          animation: petal-drift 8s ease-in-out infinite;
          pointer-events: none;
        }
      `}</style>
    </main>
  )
}
