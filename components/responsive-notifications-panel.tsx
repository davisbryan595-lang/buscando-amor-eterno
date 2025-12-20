'use client'

import React, { useState } from 'react'
import { Heart, X } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
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

  const NotificationItem = ({ notif }: { notif: any }) => (
    <div className="p-4 hover:bg-rose-50 transition">
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
  )

  // Mobile: Show as Drawer with bottom slide animation
  if (isMobile) {
    return (
      <AnimatePresence>
        {open && (
          <>
            {/* Animated backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => onOpenChange(false)}
            />

            {/* Animated drawer content - slide up from bottom */}
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
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 max-h-[80vh] overflow-hidden flex flex-col shadow-2xl"
            >
              {/* Handle bar for swipe hint */}
              <div className="flex justify-center pt-2 pb-1">
                <div className="w-12 h-1 bg-slate-300 rounded-full" />
              </div>

              {/* Header */}
              <div className="px-4 py-3 border-b border-rose-100 bg-gradient-to-r from-white to-rose-50 flex-shrink-0">
                <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                  <Heart size={18} className="text-rose-500 fill-rose-500" />
                  New Likes ({notifications.length})
                </h3>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-slate-600">
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
      </AnimatePresence>
    )
  }

  // Desktop: Show as Dialog with fade and slide from right
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <motion.div
            key="dialog-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => onOpenChange(false)}
            className="fixed inset-0 bg-black/50 z-40"
          />
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        transition={{
          type: 'spring',
          damping: 30,
          stiffness: 300,
          opacity: { duration: 0.2 },
        }}
      >
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
                  <NotificationItem key={notif.id} notif={notif} />
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </motion.div>
    </Dialog>
  )
}
