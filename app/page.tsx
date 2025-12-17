'use client'

import React, { useState, useEffect } from 'react'
import Navigation from '@/components/navigation'
import Hero from '@/components/hero'
import SuccessStories from '@/components/success-stories'
import Features from '@/components/features'
import Footer from '@/components/footer'

export default function HomePage() {
  return (
    <main className="w-full bg-white">
      <Navigation />
      <Hero />
      <SuccessStories />
      <Features />
      <Footer />
    </main>
  )
}
