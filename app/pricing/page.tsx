import { Suspense } from 'react'
import Navigation from '@/components/navigation'
import Footer from '@/components/footer'
import { PricingContent } from '@/components/pricing-content'

function PricingLoading() {
  return (
    <div className="pt-20 md:pt-24 pb-16 md:pb-20 px-4">
      <div className="w-full max-w-2xl mx-auto">
        <div className="h-12 bg-muted rounded mb-4 animate-pulse"></div>
        <div className="h-6 bg-muted rounded mb-8 animate-pulse w-2/3 mx-auto"></div>
        <div className="bg-card rounded-2xl p-12 space-y-4">
          <div className="h-20 bg-muted rounded animate-pulse"></div>
          <div className="h-40 bg-muted rounded animate-pulse"></div>
          <div className="h-12 bg-muted rounded animate-pulse"></div>
        </div>
      </div>
    </div>
  )
}

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navigation />
      <Suspense fallback={<PricingLoading />}>
        <PricingContent />
      </Suspense>
      <Footer />
    </main>
  )
}
