'use client'

import React from 'react'
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

export function PricingContent() {

  return (
    <div className="pt-20 md:pt-24 pb-16 md:pb-20 px-4">
      <div className="w-full max-w-2xl mx-auto">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-playfair font-bold text-center mb-3 md:mb-4 text-foreground">
Free Access
        </h1>
        <p className="text-center text-muted-foreground mb-8 md:mb-12 text-base sm:text-lg">
All features are currently available at no cost.
        </p>

        <div className="bg-gradient-to-br from-card to-card-subtle dark:from-card dark:to-card-subtle border-2 border-primary rounded-2xl p-6 sm:p-8 md:p-12 soft-glow-lg">
          <div className="text-center mb-8">
            <p className="text-sm md:text-base text-muted-foreground mb-2">Current membership status</p>
            <p className="text-4xl sm:text-5xl md:text-6xl font-playfair font-bold text-primary mb-2">
              Free
            </p>
            <p className="text-sm md:text-base text-muted-foreground">No payment required</p>
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

          <div className="w-full rounded-lg bg-primary/10 px-4 py-3 text-center text-sm font-medium text-primary">
            Browse, message, match, and call freely while free access is enabled.
          </div>
        </div>
      </div>
    </div>
  )
}
