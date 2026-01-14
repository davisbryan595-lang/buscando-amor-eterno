'use client'

import React, { useState } from 'react'
import { Heart, X, MessageCircle, Phone } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useMessages } from '@/hooks/useMessages'
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

interface NotificationsDropdownProps {
  notifications: Notification[]
  onDismiss: (id: string) => void
}

export function NotificationsDropdown({
  notifications,
  onDismiss,
}: NotificationsDropdownProps) {
  const router = useRouter()
  const { initiateConversation } = useMessages()
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const handleOpenNotification = async (notification: Notification) => {
    const userId = notification.from_user_id || notification.liker_id
    if (!userId) return

    setLoadingId(notification.id)
    try {
      await initiateConversation(userId)
      onDismiss(notification.id)

      // Route based on notification type
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

  return (
    <div className="absolute right-0 mt-2 w-96 max-w-[calc(100vw-16px)] bg-card dark:bg-card border border-rose-100 dark:border-rose-900/40 rounded-2xl shadow-2xl z-50 overflow-hidden">
      <div className="p-4 border-b border-rose-100 dark:border-rose-900/40 bg-gradient-to-r from-card to-card-subtle dark:from-card dark:to-card-subtle">
        <h3 className="font-semibold text-foreground dark:text-white flex items-center gap-2">
          <Heart size={18} className="text-rose-500 fill-rose-500" />
          Activity ({notifications.length})
        </h3>
      </div>

      {notifications.length === 0 ? (
        <div className="p-8 text-center text-muted-foreground">
          <p className="text-sm">No new notifications</p>
        </div>
      ) : (
        <div className="max-h-96 overflow-y-auto divide-y">
          {notifications.map((notif) => {
            const userId = notif.from_user_id || notif.liker_id
            const userName = notif.from_user_name || notif.liker_name
            const userImage = notif.from_user_image || notif.liker_image

            return (
              <div key={notif.id} className="p-4 hover:bg-card-subtle dark:hover:bg-card-subtle transition">
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
                    <p className="flex items-center gap-2 font-semibold text-foreground dark:text-white">
                      <span className="truncate">{userName || 'Someone'}</span>
                      {getNotificationIcon(notif.type)}
                    </p>
                    <p className="text-sm text-muted-foreground line-clamp-2">
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
                    className="px-3 py-2 border border-muted dark:border-slate-600 text-foreground dark:text-white rounded-full text-sm hover:bg-card-subtle dark:hover:bg-card-subtle transition disabled:opacity-50"
                    aria-label="Dismiss notification"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
