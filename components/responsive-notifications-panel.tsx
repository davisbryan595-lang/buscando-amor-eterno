'use client'

import React, { useState } from 'react'
import { Heart, X } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useMessages } from '@/hooks/useMessages'
import { useIsMobile } from '@/hooks/use-mobile'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'

interface ResponsiveNotificationsPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  notifications: Array<{
    id: string
    liker_id: string
    liker_name: string | null
    liker_image: string | null
  }>
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

  const handleStartConversation = async (notification: any) => {
    setLoadingId(notification.liker_id)
    try {
      await initiateConversation(notification.liker_id)
      onDismiss(notification.id)
      onOpenChange(false)
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

  const NotificationsContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-rose-100 bg-gradient-to-r from-white to-rose-50 flex-shrink-0">
        <h3 className="font-semibold text-slate-900 flex items-center gap-2">
          <Heart size={18} className="text-rose-500 fill-rose-500" />
          New Likes ({notifications.length})
        </h3>
      </div>

      {notifications.length === 0 ? (
        <div className="flex-1 flex items-center justify-center p-8">
          <p className="text-center text-slate-600">No new notifications</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto divide-y max-h-[60vh] md:max-h-96">
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

  // Desktop: Show as Dialog
  if (!isMobile) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md p-0 gap-0 border-rose-100">
          <DialogHeader className="border-b border-rose-100 bg-gradient-to-r from-white to-rose-50">
            <DialogTitle className="flex items-center gap-2">
              <Heart size={18} className="text-rose-500 fill-rose-500" />
              New Likes ({notifications.length})
            </DialogTitle>
          </DialogHeader>
          <div className="px-0 py-0">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-600">
                <p>No new notifications</p>
              </div>
            ) : (
              <div className="divide-y max-h-96 overflow-y-auto">
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
        </DialogContent>
      </Dialog>
    )
  }

  // Mobile: Show as Drawer (bottom sheet)
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="border-rose-100">
        <DrawerHeader className="border-b border-rose-100 bg-gradient-to-r from-white to-rose-50">
          <DrawerTitle className="flex items-center gap-2">
            <Heart size={18} className="text-rose-500 fill-rose-500" />
            New Likes ({notifications.length})
          </DrawerTitle>
        </DrawerHeader>
        <div className="flex-1">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-slate-600">
              <p>No new notifications</p>
            </div>
          ) : (
            <div className="divide-y max-h-[60vh] overflow-y-auto">
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
      </DrawerContent>
    </Drawer>
  )
}
