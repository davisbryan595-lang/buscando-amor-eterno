'use client'

import React from 'react'
import Link from 'next/link'
import Navigation from '@/components/navigation'
import Footer from '@/components/footer'
import { Check } from 'lucide-react'

const features = [
  'Unlimited messaging',
  'Video calls',
  'Advanced filters',
  'See who liked you',
  'Verified profiles',
  'Priority support',
  'Ad-free experience',
  'Profile boost',
]

export default function PricingPage() {
  const handleCheckout = () => {
    alert('🎉 Taking you to payment... (Mock checkout)\n\nIn a real app, this would integrate Stripe for $12/month subscription.')
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navigation />
      <div className="pt-20 md:pt-24 pb-16 md:pb-20 px-4">
        <div className="w-full max-w-2xl mx-auto">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-playfair font-bold text-center mb-3 md:mb-4 text-foreground">
            Premium Membership
          </h1>
          <p className="text-center text-muted-foreground mb-8 md:mb-12 text-base sm:text-lg">
            Start your journey to eternal love today
          </p>

          <div className="bg-gradient-to-br from-card to-card-subtle dark:from-card dark:to-card-subtle border-2 border-primary rounded-2xl p-6 sm:p-8 md:p-12 soft-glow-lg">
            <div className="text-center mb-8">
              <p className="text-sm md:text-base text-muted-foreground mb-2">Monthly Subscription</p>
              <p className="text-4xl sm:text-5xl md:text-6xl font-playfair font-bold text-primary mb-2">
                $12<span className="text-lg md:text-2xl text-muted-foreground">/month</span>
              </p>
              <p className="text-sm md:text-base text-muted-foreground">Billed monthly, cancel anytime</p>
            </div>

            <ul className="space-y-3 md:space-y-4 mb-8 md:mb-12">
              {features.map((feature, index) => (
                <li key={index} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white flex-shrink-0">
                    <Check size={16} />
                  </div>
                  <span className="text-sm md:text-base text-foreground">{feature}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={handleCheckout}
              className="w-full py-3 md:py-4 bg-primary text-white rounded-full text-base md:text-lg font-semibold hover:bg-rose-700 transition transform hover:scale-105 soft-glow"
            >
              Start Your Premium Membership
            </button>

            <p className="text-center text-muted-foreground text-xs md:text-sm mt-6">
              Secure payment with SSL encryption. No hidden fees.
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
