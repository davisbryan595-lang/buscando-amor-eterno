'use client'

import React, { useRef, useEffect, useState } from 'react'
import gsap from 'gsap'
import Image from 'next/image'
import ImagePreviewModal from '@/components/image-preview-modal'

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
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [imageSourceElement, setImageSourceElement] = useState<HTMLElement | null>(null)

  // Detect image URLs in content (handles URLs like https://... or http://...)
  const urlRegex = /(https?:\/\/[^\s]+\.(?:jpg|jpeg|png|gif|webp|svg))/gi
  const imageUrls = content.match(urlRegex) || []
  const hasImages = imageUrls.length > 0
  const textContent = content.replace(urlRegex, '').trim()

  useEffect(() => {
    if (bubbleRef.current) {
      gsap.set(bubbleRef.current, { opacity: 0, y: 20, scale: 0.9 })
      gsap.to(bubbleRef.current, {
        opacity: 1,
        y: 0,
        scale: 1,
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

  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>, imageUrl: string) => {
    e.stopPropagation()
    setImageSourceElement(e.currentTarget)
    setPreviewImage(imageUrl)
  }

  return (
    <>
      <div
        ref={bubbleRef}
        className={`flex ${isOwn ? 'justify-end' : 'justify-start'} group`}
        onContextMenu={onContextMenu}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className={`relative max-w-xs sm:max-w-sm md:max-w-2xl lg:max-w-3xl px-4 sm:px-5 md:px-6 py-3 sm:py-4 md:py-5 rounded-3xl text-sm sm:text-base md:text-lg break-words shadow-md transition-all duration-200 hover:shadow-lg ${
            isOwn
              ? 'bg-primary text-white rounded-br-none'
              : 'bg-gradient-to-r from-card-subtle to-card text-black dark:text-slate-100 rounded-bl-none border border-border dark:from-card-subtle dark:to-card'
          }`}
        >
          {textContent && <p className="leading-relaxed">{textContent}</p>}

          {/* Image gallery */}
          {hasImages && (
            <div className={`grid gap-2 mt-2 ${imageUrls.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
              {imageUrls.map((imageUrl, idx) => (
                <div key={idx} className="relative w-full overflow-hidden rounded-lg group/img cursor-pointer">
                  <img
                    src={imageUrl}
                    alt={`Message image ${idx + 1}`}
                    className="w-full h-48 object-cover hover:scale-110 transition-transform duration-300"
                    onClick={(e) => handleImageClick(e, imageUrl)}
                  />
                </div>
              ))}
            </div>
          )}

          <span
            className={`text-xs mt-2 block ${
              isOwn ? 'text-white/70' : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            {getFormattedTime(timestamp)}
          </span>

          {/* Hover action indicator */}
          <div
            className={`absolute top-1/2 -translate-y-1/2 text-xs px-2 py-1 rounded-full bg-foreground text-background dark:bg-card-subtle dark:text-foreground opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap ${
              isOwn ? '-left-20' : '-right-20'
            }`}
          >
            {isOwn ? '⋮ Right-click' : '⋮ Right-click'}
          </div>
        </div>
      </div>

      {/* Image preview modal */}
      {previewImage && (
        <ImagePreviewModal
          imageUrl={previewImage}
          isOpen={!!previewImage}
          onClose={() => setPreviewImage(null)}
          sourceElement={imageSourceElement}
        />
      )}
    </>
  )
}
