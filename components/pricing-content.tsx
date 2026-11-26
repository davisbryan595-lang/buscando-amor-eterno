'use client'

import React from 'react'
import Link from 'next/link'
import { Check, Crown } from 'lucide-react'
import { useSubscription } from '@/hooks/useSubscription'

const freeFeatures = [
  'Free signup and profile creation',
  'Up to 10 profile views per day',
  'Unlimited text conversations',
  'Lounge conversations',
]

const premiumFeatures = [
  'Unlimited profile browsing',
  'Voice calls',
  'Video calls',
  'All free features included',
]

export function PricingContent() {
  const { isPremium } = useSubscription()

  return (
    <div className="px-4 pb-16 pt-28 md:pb-20 md:pt-32">
      <div className="mx-auto max-w-5xl">
        <p className="text-center text-sm font-semibold uppercase tracking-[0.18em] text-primary">Membership</p>
        <h1 className="mt-3 text-center font-playfair text-4xl font-bold text-foreground md:text-5xl">Simple plans, meaningful connections</h1>
        <p className="mx-auto mt-4 max-w-2xl text-center text-base text-muted-foreground sm:text-lg">Keep chatting and connecting for free, or request Premium for unlimited browsing and calls.</p>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <section className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
            <h2 className="text-2xl font-bold text-foreground">Free</h2>
            <p className="mt-3 text-4xl font-playfair font-bold text-foreground">$0 <span className="text-base font-normal text-muted-foreground">/ always</span></p>
            <ul className="mt-7 space-y-4">
              {freeFeatures.map((feature) => (
                <li key={feature} className="flex items-start gap-3 text-sm text-foreground">
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-primary" />{feature}
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-3xl border-2 border-primary bg-gradient-to-br from-rose-50 to-card p-6 shadow-lg dark:from-rose-950/30 sm:p-8">
            <div className="flex items-center gap-2 text-primary"><Crown size={20} /><span className="text-sm font-semibold uppercase tracking-wide">Premium</span></div>
            <p className="mt-3 text-4xl font-playfair font-bold text-foreground">$12 <span className="text-base font-normal text-muted-foreground">/ month</span></p>
            <ul className="mt-7 space-y-4">
              {premiumFeatures.map((feature) => (
                <li key={feature} className="flex items-start gap-3 text-sm text-foreground">
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-primary" />{feature}
                </li>
              ))}
            </ul>
            <div className="mt-8 rounded-2xl bg-primary/10 p-4 text-sm leading-6 text-foreground">
              {isPremium
                ? 'You have Premium. Contact support if you need help with your Premium subscription.'
                : 'Online checkout is not available yet. Contact support to request Premium access.'}
            </div>
            <Link href="/contact" className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-primary px-6 py-3 font-semibold text-white transition hover:bg-rose-700">
              {isPremium ? 'Contact Support' : 'Request Premium through Support'}
            </Link>
          </section>
        </div>
        <p className="mt-6 text-center text-xs leading-5 text-muted-foreground">Premium access is currently handled by support. No payment will be collected on this page.</p>
      </div>
    </div>
  )
}
