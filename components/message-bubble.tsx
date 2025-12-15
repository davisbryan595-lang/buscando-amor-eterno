'use client'

import React, { useRef, useEffect } from 'react'
import gsap from 'gsap'

interface MessageBubbleProps {
  id: string
  content: string
  isOwn: boolean
  timestamp: string
  onContextMenu: (e: React.MouseEvent | React.TouchEvent, messageId: string) => void
  onLongPress: (messageId: string) => void
}

export default function MessageBubble({
  id,
  content,
  isOwn,
  timestamp,
  onContextMenu,
  onLongPress,
}: MessageBubbleProps) {
  const bubbleRef = useRef<HTMLDivElement>(null)
  const longPressTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)

  useEffect(() => {
    if (bubbleRef.current) {
      gsap.from(bubbleRef.current, {
        opacity: 0,
        y: 20,
        scale: 0.9,
        duration: 0.4,
        ease: 'back.out',
      })
    }
  }, [])

  const getFormattedTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    }

    longPressTimeoutRef.current = setTimeout(() => {
      onLongPress(id)
    }, 500)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return

    const deltaX = Math.abs(e.touches[0].clientX - touchStartRef.current.x)
    const deltaY = Math.abs(e.touches[0].clientY - touchStartRef.current.y)

    if (deltaX > 10 || deltaY > 10) {
      if (longPressTimeoutRef.current) {
        clearTimeout(longPressTimeoutRef.current)
      }
    }
  }

  const handleTouchEnd = () => {
    if (longPressTimeoutRef.current) {
      clearTimeout(longPressTimeoutRef.current)
    }
  }

  return (
    <div
      ref={bubbleRef}
      className={`flex ${isOwn ? 'justify-end' : 'justify-start'} group`}
      onContextMenu={onContextMenu}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className={`relative max-w-xs sm:max-w-sm md:max-w-2xl lg:max-w-3xl px-5 sm:px-6 md:px-8 py-4 sm:py-5 md:py-6 rounded-3xl text-base sm:text-lg md:text-xl break-words shadow-md transition-all duration-200 hover:shadow-lg ${
          isOwn
            ? 'bg-primary text-white rounded-br-none'
            : 'bg-gradient-to-r from-slate-100 to-slate-50 text-slate-900 rounded-bl-none border border-slate-200'
        }`}
      >
        <p className="leading-relaxed">{content}</p>
        <span
          className={`text-sm mt-3 block opacity-70 ${
            isOwn ? 'text-white/70' : 'text-slate-500'
          }`}
        >
          {getFormattedTime(timestamp)}
        </span>

        {/* Hover action indicator */}
        <div
          className={`absolute top-1/2 -translate-y-1/2 text-xs px-2 py-1 rounded-full bg-slate-800 text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap ${
            isOwn ? '-left-20' : '-right-20'
          }`}
        >
          {isOwn ? '⋮ Right-click' : '⋮ Right-click'}
        </div>
      </div>
    </div>
  )
}
