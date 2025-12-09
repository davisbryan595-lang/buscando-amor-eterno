import Navigation from '@/components/navigation'
import Footer from '@/components/footer'
import { MessagesContent } from '@/components/messages-content'

export default function MessagesPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navigation />
      <MessagesContent />
      <Footer />
    </main>
  )
}
