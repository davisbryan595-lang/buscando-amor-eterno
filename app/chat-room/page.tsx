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
    <main className="h-screen w-screen bg-white relative overflow-hidden flex flex-col">
      {/* Animated background elements - subtle romantic theme */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Subtle floating gradient orbs - very minimal */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-rose-100/10 to-rose-200/5 rounded-full blur-3xl opacity-30 animate-float" />
        <div className="absolute top-1/4 -left-32 w-64 h-64 bg-gradient-to-br from-rose-100/5 to-rose-200/5 rounded-full blur-3xl opacity-20 animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-tr from-rose-100/8 to-rose-200/5 rounded-full blur-3xl opacity-25 animate-float-delayed" />
        <div className="absolute bottom-1/3 left-0 w-72 h-72 bg-gradient-to-tr from-rose-100/5 to-rose-200/5 rounded-full blur-3xl opacity-15 animate-pulse-slow" />

        {/* Enhanced Floating hearts - more visible with larger sizes and better opacity */}
        <div className="heart-float" style={{ left: '5%', animationDelay: '0s' }}>
          <Heart className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 text-rose-400 drop-shadow-lg opacity-70" fill="currentColor" />
        </div>
        <div className="heart-float" style={{ left: '15%', animationDelay: '0.5s' }}>
          <Heart className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 text-rose-500 drop-shadow-lg opacity-80" fill="currentColor" />
        </div>
        <div className="heart-float" style={{ left: '25%', animationDelay: '1s' }}>
          <Heart className="w-3.5 h-3.5 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 text-rose-300 drop-shadow-lg opacity-75" fill="currentColor" />
        </div>
        <div className="heart-float" style={{ left: '40%', animationDelay: '1.5s' }}>
          <Heart className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 text-primary drop-shadow-lg opacity-70" fill="currentColor" />
        </div>
        <div className="heart-float" style={{ left: '55%', animationDelay: '0.8s' }}>
          <Heart className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 text-rose-400 drop-shadow-lg opacity-80" fill="currentColor" />
        </div>
        <div className="heart-float" style={{ left: '70%', animationDelay: '0.3s' }}>
          <Heart className="w-3.5 h-3.5 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 text-red-400 drop-shadow-lg opacity-75" fill="currentColor" />
        </div>
        <div className="heart-float" style={{ left: '82%', animationDelay: '1.2s' }}>
          <Heart className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 text-rose-300 drop-shadow-lg opacity-70" fill="currentColor" />
        </div>
        <div className="heart-float" style={{ left: '92%', animationDelay: '0.6s' }}>
          <Heart className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 text-rose-500 drop-shadow-lg opacity-80" fill="currentColor" />
        </div>

        {/* Enhanced Floating sparkles - more visible with better sizing and timing */}
        <div className="sparkle-float" style={{ left: '10%', animationDelay: '0s', fontSize: 'clamp(1rem, 3vw, 2rem)' }}>
          ✨
        </div>
        <div className="sparkle-float" style={{ left: '30%', animationDelay: '0.4s', fontSize: 'clamp(0.875rem, 2.5vw, 1.75rem)' }}>
          ✨
        </div>
        <div className="sparkle-float" style={{ left: '50%', animationDelay: '0.8s', fontSize: 'clamp(1rem, 3vw, 2rem)' }}>
          ✨
        </div>
        <div className="sparkle-float" style={{ left: '65%', animationDelay: '0.2s', fontSize: 'clamp(0.875rem, 2.5vw, 1.75rem)' }}>
          ✨
        </div>
        <div className="sparkle-float" style={{ left: '80%', animationDelay: '0.6s', fontSize: 'clamp(1rem, 3vw, 2rem)' }}>
          ✨
        </div>
        <div className="sparkle-float" style={{ left: '88%', animationDelay: '1s', fontSize: 'clamp(0.875rem, 2.5vw, 1.75rem)' }}>
          ✨
        </div>

        {/* Enhanced Rose petals - more visible with better sizing and timing */}
        <div className="petal-float" style={{ left: '12%', animationDelay: '0s', fontSize: 'clamp(1rem, 3vw, 1.5rem)' }}>
          🌹
        </div>
        <div className="petal-float" style={{ left: '35%', animationDelay: '0.5s', fontSize: 'clamp(1.125rem, 3.5vw, 1.75rem)' }}>
          🌹
        </div>
        <div className="petal-float" style={{ left: '58%', animationDelay: '1s', fontSize: 'clamp(1rem, 3vw, 1.5rem)' }}>
          🌹
        </div>
        <div className="petal-float" style={{ left: '75%', animationDelay: '0.3s', fontSize: 'clamp(1.125rem, 3.5vw, 1.75rem)' }}>
          🌹
        </div>
        <div className="petal-float" style={{ left: '88%', animationDelay: '0.7s', fontSize: 'clamp(1rem, 3vw, 1.5rem)' }}>
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
          <h1 className="text-sm sm:text-base md:text-lg lg:text-xl font-playfair font-bold text-slate-900 flex items-center gap-1.5 sm:gap-2 whitespace-nowrap overflow-hidden">
            <Heart className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-rose-400 flex-shrink-0" fill="currentColor" />
            <span>Singles Lounge</span>
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
            transform: translateY(100vh) translateX(0) scale(1);
            opacity: 0;
          }
          5% {
            opacity: 1;
          }
          25% {
            transform: translateY(75vh) translateX(25px);
          }
          50% {
            transform: translateY(50vh) translateX(-15px);
          }
          75% {
            transform: translateY(25vh) translateX(20px);
          }
          95% {
            opacity: 1;
          }
          100% {
            transform: translateY(-100vh) translateX(0) scale(1);
            opacity: 0;
          }
        }

        @keyframes sparkle-drift {
          0% {
            transform: translateY(100vh) translateX(0) scale(1);
            opacity: 0;
          }
          5% {
            opacity: 1;
          }
          30% {
            transform: translateY(70vh) translateX(40px);
          }
          60% {
            transform: translateY(40vh) translateX(-20px);
          }
          90% {
            opacity: 0.9;
          }
          100% {
            transform: translateY(-100vh) translateX(50px) scale(1);
            opacity: 0;
          }
        }

        @keyframes petal-drift {
          0% {
            transform: translateY(100vh) translateX(0) rotate(0deg) scale(1);
            opacity: 0;
          }
          5% {
            opacity: 1;
          }
          30% {
            transform: translateY(70vh) translateX(50px) rotate(90deg);
          }
          60% {
            transform: translateY(40vh) translateX(-25px) rotate(180deg);
          }
          90% {
            opacity: 0.8;
          }
          100% {
            transform: translateY(-100vh) translateX(60px) rotate(360deg) scale(1);
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
          animation: heart-rise 5.5s ease-in linear infinite;
          pointer-events: none;
        }

        .sparkle-float {
          position: fixed;
          bottom: 0;
          font-size: 1.5rem;
          animation: sparkle-drift 6.5s ease-in linear infinite;
          pointer-events: none;
        }

        .petal-float {
          position: fixed;
          bottom: 0;
          font-size: 1.25rem;
          animation: petal-drift 7.5s ease-in linear infinite;
          pointer-events: none;
        }
      `}</style>
    </main>
  )
}
