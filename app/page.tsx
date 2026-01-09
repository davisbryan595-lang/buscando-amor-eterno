'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/context/auth-context'
import Navigation from '@/components/navigation'
import Hero from '@/components/hero'
import SuccessStories from '@/components/success-stories'
import Features from '@/components/features'
import Footer from '@/components/footer'
import { useProfileProtection } from '@/hooks/useProfileProtection'
import { Loader } from 'lucide-react'

export default function HomePage() {
  const { user, loading: authLoading } = useAuth()
  const { isLoading: protectionLoading } = useProfileProtection(true, '/onboarding')

  // Show loading while checking auth state
  if (authLoading || protectionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="animate-spin" size={40} />
      </div>
    )
  }

  // If user is logged in and has a complete profile, or not logged in, show home
  // If user is logged in but profile incomplete, they'll be redirected by useProfileProtection
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
