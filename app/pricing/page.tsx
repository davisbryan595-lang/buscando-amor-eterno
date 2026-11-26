import Navigation from '@/components/navigation'
import Footer from '@/components/footer'
import { PricingContent } from '@/components/pricing-content'

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navigation />
      <PricingContent />
      <Footer />
    </main>
  )
}
