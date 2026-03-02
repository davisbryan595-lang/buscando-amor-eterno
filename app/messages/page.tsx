'use client'

import { useState } from 'react'
import Navigation from '@/components/navigation'
import { MessagesContent } from '@/components/messages-content'
import { PaywallModal } from '@/components/paywall-modal'
import { useSubscription } from '@/hooks/useSubscription'
import { useAuth } from '@/context/auth-context'
import { Mail } from 'lucide-react'

export default function MessagesPage() {
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [showPaywall, setShowPaywall] = useState(false)
  const { isPremium, loading: subLoading } = useSubscription()
  const { user } = useAuth()

  // Show paywall for non-premium users
  if (!subLoading && user && !isPremium) {
    return (
      <main className="h-screen bg-background dark:bg-background text-foreground flex flex-col overflow-hidden">
        <Navigation />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 bg-gradient-to-br from-rose-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-playfair font-bold text-foreground mb-4">
              Unlock Messaging
            </h1>
            <p className="text-muted-foreground mb-8">
              Send messages to your matches and start meaningful conversations with premium access.
            </p>
            <button
              onClick={() => setShowPaywall(true)}
              className="px-8 py-3 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white rounded-full font-semibold transition-all hover:scale-105"
            >
              Upgrade to Premium
            </button>
          </div>
        </div>
        <PaywallModal
          isOpen={showPaywall}
          onClose={() => setShowPaywall(false)}
          featureName="Send Messages"
          description="Connect with your matches and start meaningful conversations with premium access."
        />
      </main>
    )
  }

  return (
    <main className="h-screen bg-background dark:bg-background text-foreground flex flex-col overflow-hidden">
      <div className={`${isChatOpen ? 'md:block hidden' : 'block'}`}>
        <Navigation />
      </div>
      <div className="flex-1 overflow-hidden">
        <MessagesContent onChatOpenChange={setIsChatOpen} isChatOpen={isChatOpen} />
      </div>
    </main>
  )
}
