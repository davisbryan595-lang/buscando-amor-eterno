import Navigation from '@/components/navigation'
import { MessagesContent } from '@/components/messages-content'

export default function MessagesPage() {
  return (
    <main className="h-screen bg-white flex flex-col overflow-hidden">
      <Navigation />
      <div className="flex-1 overflow-hidden">
        <MessagesContent />
      </div>
    </main>
  )
}
