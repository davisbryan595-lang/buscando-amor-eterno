'use client'

import React, { useState } from 'react'
import { Heart, X } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useMessages } from '@/hooks/useMessages'
import { toast } from 'sonner'

interface NotificationsDropdownProps {
  notifications: Array<{
    id: string
    liker_id: string
    liker_name: string | null
    liker_image: string | null
  }>
  onDismiss: (id: string) => void
}

export function NotificationsDropdown({
  notifications,
  onDismiss,
}: NotificationsDropdownProps) {
  const router = useRouter()
  const { initiateConversation } = useMessages()
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const handleStartConversation = async (notification: any) => {
    setLoadingId(notification.liker_id)
    try {
      await initiateConversation(notification.liker_id)
      onDismiss(notification.id)
      router.push(`/messages?user=${notification.liker_id}`)
      toast.success('Conversation started!')
    } catch (error: any) {
      toast.error(error.message || 'Failed to start conversation')
    } finally {
      setLoadingId(null)
    }
  }

  const handleReject = (id: string) => {
    onDismiss(id)
  }

  return (
    <div className="absolute right-0 mt-2 w-96 bg-white border border-rose-100 rounded-2xl shadow-2xl z-50 overflow-hidden">
      <div className="p-4 border-b border-rose-100 bg-gradient-to-r from-white to-rose-50">
        <h3 className="font-semibold text-slate-900 flex items-center gap-2">
          <Heart size={18} className="text-rose-500 fill-rose-500" />
          New Likes ({notifications.length})
        </h3>
      </div>

      {notifications.length === 0 ? (
        <div className="p-8 text-center text-slate-600">
          <p>No new notifications</p>
        </div>
      ) : (
        <div className="max-h-96 overflow-y-auto divide-y">
          {notifications.map((notif) => (
            <div key={notif.id} className="p-4 hover:bg-rose-50 transition">
              <div className="flex gap-3 items-start mb-3">
                <div className="relative w-12 h-12 flex-shrink-0">
                  <Image
                    src={notif.liker_image || '/placeholder.svg'}
                    alt={notif.liker_name || 'User'}
                    fill
                    className="rounded-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 truncate">
                    {notif.liker_name || 'Someone'}
                  </p>
                  <p className="text-sm text-slate-600">likes your profile</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleStartConversation(notif)}
                  disabled={loadingId === notif.liker_id}
                  className="flex-1 py-2 bg-primary text-white rounded-full text-sm font-semibold hover:bg-rose-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loadingId === notif.liker_id ? 'Starting...' : 'Chat'}
                </button>
                <button
                  onClick={() => handleReject(notif.id)}
                  disabled={loadingId === notif.liker_id}
                  className="px-3 py-2 border border-slate-300 text-slate-700 rounded-full text-sm hover:bg-slate-50 transition disabled:opacity-50"
                  aria-label="Dismiss"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
