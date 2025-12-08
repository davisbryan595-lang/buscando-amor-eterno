'use client'

import React from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Heart, X } from 'lucide-react'

interface LikeNotificationProps {
  notification: {
    id: string
    liker_id: string
    liker_name: string | null
    liker_image: string | null
  }
  onDismiss: () => void
}

export function LikeNotification({ notification, onDismiss }: LikeNotificationProps) {
  const router = useRouter()

  const handleStartConversation = () => {
    onDismiss()
    router.push(`/messages?user=${notification.liker_id}`)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-8 space-y-6 animate-in fade-in zoom-in-95 duration-300">
        <div className="relative h-48 rounded-2xl overflow-hidden bg-gradient-to-br from-rose-100 to-pink-100">
          {notification.liker_image ? (
            <Image
              src={notification.liker_image}
              alt={notification.liker_name || 'User'}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Heart className="w-16 h-16 text-rose-200" />
            </div>
          )}
          <button
            onClick={onDismiss}
            className="absolute top-3 right-3 w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
            <span className="text-sm font-semibold text-rose-500">Someone likes you!</span>
          </div>

          <h2 className="text-2xl font-playfair font-bold text-slate-900">
            {notification.liker_name || 'Someone'} likes your profile!
          </h2>

          <p className="text-slate-600">
            Ready to start a conversation?
          </p>
        </div>

        <div className="space-y-3">
          <Button
            onClick={handleStartConversation}
            className="w-full py-3 bg-primary text-white rounded-full font-semibold hover:bg-rose-700 transition"
          >
            Start Conversation
          </Button>

          <Button
            onClick={onDismiss}
            variant="outline"
            className="w-full py-3 border-2 border-slate-300 text-slate-700 rounded-full font-semibold hover:bg-slate-50 transition"
          >
            Not Now
          </Button>
        </div>
      </div>
    </div>
  )
}
