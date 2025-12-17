'use client'

import React, { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { X } from 'lucide-react'

interface ImagePreviewModalProps {
  imageUrl: string
  isOpen: boolean
  onClose: () => void
  sourceElement?: HTMLElement | null
}

export default function ImagePreviewModal({ imageUrl, isOpen, onClose, sourceElement }: ImagePreviewModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    if (!isOpen) return

    const sourceRect = sourceElement?.getBoundingClientRect()

    if (overlayRef.current && containerRef.current && imageRef.current) {
      // Animate overlay
      gsap.fromTo(
        overlayRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.3, ease: 'power2.out' }
      )

      // Animate container with circular expansion
      const startX = sourceRect?.left ?? window.innerWidth / 2
      const startY = sourceRect?.top ?? window.innerHeight / 2
      const startSize = Math.min(sourceRect?.width ?? 80, sourceRect?.height ?? 80)

      gsap.fromTo(
        containerRef.current,
        {
          x: startX - window.innerWidth / 2,
          y: startY - window.innerHeight / 2,
          width: startSize,
          height: startSize,
          borderRadius: '50%',
          opacity: 0,
        },
        {
          x: 0,
          y: 0,
          width: Math.min(window.innerWidth - 40, 600),
          height: 'auto',
          borderRadius: '0%',
          opacity: 1,
          duration: 0.5,
          ease: 'power2.out',
          onComplete: () => {
            if (containerRef.current) {
              containerRef.current.style.borderRadius = '12px'
            }
          },
        }
      )
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isOpen, sourceElement, onClose])

  if (!isOpen) return null

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center opacity-0"
      onClick={onClose}
    >
      <div
        ref={containerRef}
        className="relative bg-white shadow-2xl flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          ref={imageRef}
          src={imageUrl}
          alt="Preview"
          className="w-full h-auto max-h-96 object-contain"
        />
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition z-10"
          aria-label="Close preview"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  )
}
