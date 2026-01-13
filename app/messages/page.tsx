'use client'

import { useState } from 'react'
import Navigation from '@/components/navigation'
import { MessagesContent } from '@/components/messages-content'

export default function MessagesPage() {
  const [isChatOpen, setIsChatOpen] = useState(false)

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
