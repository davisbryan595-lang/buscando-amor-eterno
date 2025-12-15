import Navigation from '@/components/navigation'
import Footer from '@/components/footer'
import { MessagesContent } from '@/components/messages-content'

export default function MessagesPage() {
  return (
    <main className="min-h-screen bg-white flex flex-col">
      <Navigation />
      <div className="flex-1 overflow-hidden">
        <MessagesContent />
      </div>
    </main>
  )
}
