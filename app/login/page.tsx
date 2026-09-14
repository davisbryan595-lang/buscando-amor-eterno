'use client'

import React, { Suspense } from 'react'
import Navigation from '@/components/navigation'
import Footer from '@/components/footer'
import LoginContent from './login-content'

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navigation />
      <Suspense fallback={null}>
        <LoginContent />
      </Suspense>
      <Footer />
    </main>
  )
}
