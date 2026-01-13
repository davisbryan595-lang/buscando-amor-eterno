'use client'

import React, { useEffect, useState } from 'react'

interface AnimatedMessageProps {
  id: string
  content: string
  isOwn: boolean
  onContextMenu?: (e: React.MouseEvent | React.TouchEvent, messageId: string, content: string, isOwn: boolean) => void
  onLongPress?: (messageId: string) => void
}

export function AnimatedMessage({
  id,
  content,
  isOwn,
  onContextMenu,
  onLongPress,
}: AnimatedMessageProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Trigger animation on mount
    const timer = requestAnimationFrame(() => {
      setIsVisible(true)
    })
    return () => cancelAnimationFrame(timer)
  }, [])

  return (
    <div
      className={`flex w-full transition-all duration-300 ease-out ${
        isVisible ? 'opacity-100' : 'opacity-0'
      } ${isOwn ? 'justify-end' : 'justify-start'}`}
      style={{
        transform: isVisible ? 'translateY(0)' : `translateY(${isOwn ? '10px' : '-10px'})`,
        transitionProperty: 'opacity, transform',
        transitionDuration: '300ms',
        transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}
    >
      <div
        id={`message-${id}`}
        onContextMenu={(e) => onContextMenu?.(e, id, content, isOwn)}
        onTouchEnd={(e) => {
          const touch = e.touches[0] || e.changedTouches[0]
          const element = document.getElementById(`message-${id}`)
          if (element) {
            const rect = element.getBoundingClientRect()
            const rect2 = { ...rect, left: touch.clientX, bottom: touch.clientY } as any
            onContextMenu?.(
              { currentTarget: element, clientX: touch.clientX, clientY: touch.clientY } as unknown as React.MouseEvent,
              id,
              content,
              isOwn
            )
          }
        }}
        className={`max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg px-3 sm:px-4 py-1.5 sm:py-2 lg:py-3 rounded-2xl ${
          isOwn
            ? 'bg-primary text-white rounded-br-none'
            : 'bg-card-subtle dark:bg-card-subtle text-foreground rounded-bl-none'
        }`}
      >
        <p className="text-xs sm:text-sm lg:text-base break-words">{content}</p>
      </div>
    </div>
  )
}
