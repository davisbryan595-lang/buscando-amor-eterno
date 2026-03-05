'use client'

import React, { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Navigation from '@/components/navigation'
import Footer from '@/components/footer'
import { Check, AlertCircle, CheckCircle } from 'lucide-react'
import { StripeCheckoutButton } from '@/components/stripe-checkout-button'
import { useSubscription } from '@/hooks/useSubscription'

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
  const searchParams = useSearchParams()
  const router = useRouter()
  const { fetchSubscription, isPremium } = useSubscription()
  const [verifyingSession, setVerifyingSession] = useState(false)
  const [sessionStatus, setSessionStatus] = useState<'success' | 'error' | null>(null)
  const [statusMessage, setStatusMessage] = useState('')

  // Auto-redirect if user becomes premium
  useEffect(() => {
    if (isPremium && sessionStatus === 'success') {
      const redirectTimer = setTimeout(() => {
        router.push('/browse')
      }, 3000)
      return () => clearTimeout(redirectTimer)
    }
  }, [isPremium, sessionStatus, router])

  useEffect(() => {
    const sessionId = searchParams.get('session_id')

    if (sessionId) {
      verifyAndUpdateSubscription(sessionId)
    }
  }, [searchParams])

  const verifyAndUpdateSubscription = async (sessionId: string) => {
    setVerifyingSession(true)

    try {
      // Verify the session with our API
      const response = await fetch(`/api/stripe/verify-session?session_id=${sessionId}`)

      if (!response.ok) {
        throw new Error('Failed to verify session')
      }

      const sessionData = await response.json()

      // Check if payment was successful
      if (sessionData.status === 'paid') {
        setSessionStatus('success')
        setStatusMessage('Payment successful! Your premium membership is being activated.')

        // Refresh subscription data to reflect the new status
        // Small delay to ensure webhook has processed
        setTimeout(() => {
          fetchSubscription()
        }, 2000)
      } else if (sessionData.status === 'unpaid') {
        setSessionStatus('error')
        setStatusMessage('Payment was not completed. Please try again.')

        // Refresh subscription to reset state
        fetchSubscription()
      } else {
        // For other statuses, just refresh the subscription
        fetchSubscription()
      }
    } catch (error) {
      console.error('Error verifying session:', error)
      setSessionStatus('error')
      setStatusMessage('An error occurred while verifying your payment. Please contact support if needed.')

      // Still refresh subscription to ensure state is consistent
      fetchSubscription()
    } finally {
      setVerifyingSession(false)
    }
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navigation />
      <div className="pt-20 md:pt-24 pb-16 md:pb-20 px-4">
        <div className="w-full max-w-2xl mx-auto">
          {/* Status Messages */}
          {sessionStatus === 'success' && (
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg flex items-start gap-3">
              <CheckCircle className="text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <p className="font-semibold text-green-900 dark:text-green-100">{statusMessage}</p>
                <p className="text-sm text-green-800 dark:text-green-200 mt-1">You will be redirected shortly.</p>
              </div>
            </div>
          )}

          {sessionStatus === 'error' && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
              <AlertCircle className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <p className="font-semibold text-red-900 dark:text-red-100">{statusMessage}</p>
              </div>
            </div>
          )}

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

            <StripeCheckoutButton className="w-full" disabled={verifyingSession || isPremium} />

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
