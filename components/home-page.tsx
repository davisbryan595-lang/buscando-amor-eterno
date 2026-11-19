'use client'

import Navigation from '@/components/navigation'
import Hero from '@/components/hero'
import SuccessStories from '@/components/success-stories'
import Features from '@/components/features'
import Footer from '@/components/footer'
import { useProfileProtection } from '@/hooks/useProfileProtection'

export default function HomePage() {
  useProfileProtection(true, '/onboarding')

  return (
    <main className="w-full bg-background text-foreground">
      <Navigation />
      <Hero />
      <SuccessStories />
      <Features />
      <Footer />
    </main>
  )
}
