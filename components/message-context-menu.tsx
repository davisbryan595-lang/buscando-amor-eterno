'use client'

import React, { useRef, useEffect } from 'react'
import gsap from 'gsap'
import { Copy, Trash2, Share2, Flag } from 'lucide-react'
import { toast } from 'sonner'

interface MessageContextMenuProps {
  messageId: string
  content: string
  isOwn: boolean
  x: number
  y: number
  onClose: () => void
  onDelete?: (messageId: string) => void
}

export default function MessageContextMenu({
  messageId,
  content,
  isOwn,
  x,
  y,
  onClose,
  onDelete,
}: MessageContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (menuRef.current) {
      gsap.from(menuRef.current, {
        opacity: 0,
        scale: 0.9,
        y: -10,
        duration: 0.2,
        ease: 'back.out',
      })
    }

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  const handleCopy = () => {
    navigator.clipboard.writeText(content)
    toast.success('Message copied!')
    onClose()
  }

  const handleDelete = () => {
    if (onDelete) {
      onDelete(messageId)
      toast.success('Message deleted')
      onClose()
    }
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        text: content,
      })
    } else {
      handleCopy()
    }
    onClose()
  }

  const handleReport = () => {
    toast.info('Message reported to moderators')
    onClose()
  }

  // Adjust position to keep menu in viewport
  let menuX = x
  let menuY = y

  useEffect(() => {
    if (menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect()
      if (rect.right > window.innerWidth) {
        menuX = window.innerWidth - rect.width - 10
      }
      if (rect.bottom > window.innerHeight) {
        menuY = window.innerHeight - rect.height - 10
      }
    }
  }, [x, y])

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
      />

      {/* Menu */}
      <div
        ref={menuRef}
        className="fixed z-50 bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden"
        style={{
          left: `${menuX}px`,
          top: `${menuY}px`,
        }}
      >
        <button
          onClick={handleCopy}
          className="w-full px-4 py-3 flex items-center gap-3 hover:bg-slate-50 transition text-slate-900 text-sm"
        >
          <Copy size={18} />
          Copy
        </button>

        {isOwn && (
          <button
            onClick={handleDelete}
            className="w-full px-4 py-3 flex items-center gap-3 hover:bg-red-50 transition text-red-600 text-sm border-t border-slate-200"
          >
            <Trash2 size={18} />
            Delete
          </button>
        )}

        {!isOwn && (
          <button
            onClick={handleReport}
            className="w-full px-4 py-3 flex items-center gap-3 hover:bg-red-50 transition text-red-600 text-sm border-t border-slate-200"
          >
            <Flag size={18} />
            Report
          </button>
        )}

        <button
          onClick={handleShare}
          className="w-full px-4 py-3 flex items-center gap-3 hover:bg-slate-50 transition text-slate-900 text-sm border-t border-slate-200"
        >
          <Share2 size={18} />
          Share
        </button>
      </div>
    </>
  )
}
