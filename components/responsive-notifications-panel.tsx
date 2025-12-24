'use client'

import React, { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Heart, X, MessageCircle, Phone } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useMessages } from '@/hooks/useMessages'
import { useIsMobile } from '@/hooks/use-mobile'
import { toast } from 'sonner'

interface Notification {
  id: string
  type: 'like' | 'message' | 'call' | 'match'
  from_user_id?: string
  from_user_name?: string | null
  from_user_image?: string | null
  liker_id?: string
  liker_name?: string | null
  liker_image?: string | null
  message_preview?: string
  call_type?: 'audio' | 'video'
  call_status?: 'incoming' | 'missed'
}

interface ResponsiveNotificationsPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  notifications: Notification[]
  onDismiss: (id: string) => void
}

export function ResponsiveNotificationsPanel({
  open,
  onOpenChange,
  notifications,
  onDismiss,
}: ResponsiveNotificationsPanelProps) {
  const router = useRouter()
  const { initiateConversation } = useMessages()
  const isMobile = useIsMobile()
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [isMounted, setIsMounted] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  // Wait for hydration to complete before rendering
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Close on outside click for desktop
  useEffect(() => {
    if (!isMobile && open) {
      const handleClickOutside = (event: MouseEvent) => {
        if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
          onOpenChange(false)
        }
      }

      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open, isMobile, onOpenChange])

  const handleOpenNotification = async (notification: Notification) => {
    const userId = notification.from_user_id || notification.liker_id
    if (!userId) return

    setLoadingId(notification.id)
    try {
      await initiateConversation(userId)
      onDismiss(notification.id)
      onOpenChange(false)

      if (notification.type === 'call') {
        router.push(`/messages?user=${userId}&call=${notification.call_type}`)
      } else {
        router.push(`/messages?user=${userId}`)
      }
      toast.success('Opening chat...')
    } catch (error: any) {
      toast.error(error.message || 'Failed to open chat')
    } finally {
      setLoadingId(null)
    }
  }

  const handleDismiss = (id: string) => {
    onDismiss(id)
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart size={18} className="text-rose-500 fill-rose-500" />
      case 'message':
        return <MessageCircle size={18} className="text-blue-500 fill-blue-500" />
      case 'call':
        return <Phone size={18} className="text-green-500" />
      case 'match':
        return <Heart size={18} className="text-rose-500 fill-rose-500" />
      default:
        return <Heart size={18} className="text-rose-500 fill-rose-500" />
    }
  }

  const getNotificationText = (notif: Notification) => {
    const name = notif.from_user_name || notif.liker_name || 'Someone'
    switch (notif.type) {
      case 'like':
        return `${name} likes your profile`
      case 'message':
        return notif.message_preview ? `${name}: ${notif.message_preview}` : `${name} sent you a message`
      case 'call':
        return notif.call_status === 'missed'
          ? `Missed ${notif.call_type} call from ${name}`
          : `Incoming ${notif.call_type} call from ${name}`
      case 'match':
        return `You matched with ${name}!`
      default:
        return `New notification from ${name}`
    }
  }

  const getButtonText = (type: string) => {
    switch (type) {
      case 'call':
        return 'View'
      case 'message':
        return 'View'
      default:
        return 'Chat'
    }
  }

  // Don't render anything until hydration is complete to avoid mismatch
  if (!isMounted) {
    return null
  }

  const NotificationItem = ({ notif }: { notif: Notification }) => {
    const userId = notif.from_user_id || notif.liker_id
    const userName = notif.from_user_name || notif.liker_name
    const userImage = notif.from_user_image || notif.liker_image

    return (
      <div className="p-4 hover:bg-rose-50 transition">
        <div className="flex gap-3 items-start mb-3">
          <div className="relative w-12 h-12 flex-shrink-0">
            <Image
              src={userImage || '/placeholder.svg'}
              alt={userName || 'User'}
              fill
              className="rounded-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="flex items-center gap-2 font-semibold text-slate-900">
              <span className="truncate">{userName || 'Someone'}</span>
              {getNotificationIcon(notif.type)}
            </p>
            <p className="text-sm text-slate-600 line-clamp-2">
              {getNotificationText(notif)}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => handleOpenNotification(notif)}
            disabled={loadingId === notif.id}
            className="flex-1 py-2 bg-primary text-white rounded-full text-sm font-semibold hover:bg-rose-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingId === notif.id ? 'Opening...' : getButtonText(notif.type)}
          </button>
          <button
            onClick={() => handleDismiss(notif.id)}
            disabled={loadingId === notif.id}
            className="px-3 py-2 border border-slate-300 text-slate-700 rounded-full text-sm hover:bg-slate-50 transition disabled:opacity-50"
            aria-label="Dismiss notification"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    )
  }

  // Mobile: Show as Drawer with bottom slide animation using Portal to escape nav constraints
  if (isMobile) {
    return createPortal(
      <AnimatePresence>
        {open && (
          <>
            {/* Animated backdrop - covers entire viewport */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => onOpenChange(false)}
            />

            {/* Animated drawer content - slide up from bottom, positioned relative to viewport */}
            <motion.div
              key="drawer"
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{
                type: 'spring',
                damping: 30,
                stiffness: 300,
                opacity: { duration: 0.2 },
              }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 max-h-[85vh] overflow-hidden flex flex-col shadow-2xl"
            >
              {/* Handle bar for swipe hint */}
              <div className="flex justify-center pt-2 pb-1">
                <div className="w-12 h-1 bg-slate-300 rounded-full" />
              </div>

              {/* Header - sticky so it doesn't scroll */}
              <div className="px-4 py-3 border-b border-rose-100 bg-gradient-to-r from-white to-rose-50 flex-shrink-0 flex items-center justify-between sticky top-0 z-10">
                <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                  <Heart size={18} className="text-rose-500 fill-rose-500" />
                  Activity ({notifications.length})
                </h3>
                <button
                  onClick={() => onOpenChange(false)}
                  className="p-1 hover:bg-rose-100 rounded-full transition flex-shrink-0"
                  aria-label="Close notifications"
                >
                  <X size={20} className="text-slate-600" />
                </button>
              </div>

              {/* Content - scrollable */}
              <div className="flex-1 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="flex items-center justify-center min-h-32 p-8 text-center text-slate-600">
                    <p>No new notifications</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {notifications.map((notif) => (
                      <NotificationItem key={notif.id} notif={notif} />
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>,
      document.body
    )
  }

  // Desktop: Show as dropdown anchored to bell icon (top-right)
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="dropdown"
          ref={panelRef}
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          transition={{ duration: 0.15, type: 'spring', damping: 20 }}
          className="absolute top-full right-0 mt-2 w-96 bg-white border border-rose-100 rounded-2xl shadow-xl z-50 overflow-hidden"
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-rose-100 bg-gradient-to-r from-white to-rose-50">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <Heart size={18} className="text-rose-500 fill-rose-500" />
              New Likes ({notifications.length})
            </h3>
          </div>

          {/* Content */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-600 min-h-24 flex items-center justify-center">
                <p>No new notifications</p>
              </div>
            ) : (
              <div className="divide-y">
                {notifications.map((notif) => (
                  <NotificationItem key={notif.id} notif={notif} />
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
