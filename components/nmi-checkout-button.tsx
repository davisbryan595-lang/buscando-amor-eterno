'use client'

import { useAuth } from '@/context/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface NmiCheckoutButtonProps {
  className?: string
  children?: React.ReactNode
  disabled?: boolean
  onSuccess?: () => void
  onError?: (message: string) => void
}

declare global {
  interface Window {
    CollectJS?: {
      configure: (opts: Record<string, unknown>) => void
      startPaymentRequest: () => void
    }
  }
}

export function NmiCheckoutButton({
  className = '',
  children = 'Start Your Premium Membership',
  disabled = false,
  onSuccess,
  onError,
}: NmiCheckoutButtonProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [scriptReady, setScriptReady] = useState(false)
  const userRef = useRef(user)
  const scriptRef = useRef<HTMLScriptElement | null>(null)
  const configured = useRef(false)

  const tokenizationKey = process.env.NEXT_PUBLIC_NMI_TOKENIZATION_KEY

  useEffect(() => {
    userRef.current = user
  }, [user])

  useEffect(() => {
    if (!tokenizationKey || scriptRef.current) {
      if (!tokenizationKey) {
        console.error('NMI tokenization key is not configured')
      }
      return
    }

    const script = document.createElement('script')
    script.src = 'https://secure.networkmerchants.com/token/Collect.js'
    script.setAttribute('data-tokenization-key', tokenizationKey)
    script.async = true
    script.onload = () => {
      console.log('NMI CollectJS loaded successfully')
      setScriptReady(true)
    }
    script.onerror = () => {
      console.error('Failed to load NMI CollectJS script')
    }
    document.head.appendChild(script)
    scriptRef.current = script

    return () => {
      if (scriptRef.current && document.head.contains(scriptRef.current)) {
        document.head.removeChild(scriptRef.current)
        scriptRef.current = null
        configured.current = false
      }
    }
  }, [tokenizationKey])

  useEffect(() => {
    if (!scriptReady || configured.current || !window.CollectJS) return

    try {
      window.CollectJS.configure({
        callback: handleToken,
      })
      configured.current = true
    } catch (error) {
      console.error('Failed to configure CollectJS:', error)
      configured.current = true
    }
  }, [scriptReady])

  const handleToken = async (response: { payment_token: string }) => {
    const currentUser = userRef.current
    if (!currentUser) {
      router.push('/signup')
      return
    }

    try {
      setIsLoading(true)

      const { data: sessionData } = await supabase.auth.getSession()
      const accessToken = sessionData?.session?.access_token

      const res = await fetch('/api/nmi/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({ paymentToken: response.payment_token }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Payment failed')
      }

      onSuccess?.()
      router.push('/pricing?payment=success')
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Payment failed'
      console.error('NMI payment error:', error)
      onError?.(msg)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClick = () => {
    if (!user) {
      router.push('/signup')
      return
    }

    try {
      if (!window.CollectJS) {
        onError?.('Payment system is not ready. Please refresh and try again.')
        return
      }

      // Wrap in try-catch for PaymentRequestAbstraction errors
      window.CollectJS.startPaymentRequest()
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to start payment'
      console.error('Error starting payment request:', error)

      // If PaymentRequest API not supported, redirect to Stripe checkout as fallback
      if (errorMsg.includes('PaymentRequest') || errorMsg.includes('Abstraction')) {
        handleStripeCheckout()
      } else {
        onError?.(errorMsg || 'Failed to start payment. Please try again.')
      }
    }
  }

  const handleStripeCheckout = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to create checkout session')
      }

      const { url } = await response.json()
      if (url) {
        window.location.href = url
      }
    } catch (error) {
      console.error('Stripe checkout error:', error)
      onError?.(
        error instanceof Error
          ? error.message
          : 'Payment system error. Please try again.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  const isButtonDisabled = isLoading || disabled || !scriptReady

  return (
    <button
      onClick={handleClick}
      disabled={isButtonDisabled}
      className={`py-3 md:py-4 bg-primary text-white rounded-full text-base md:text-lg font-semibold hover:bg-rose-700 transition transform hover:scale-105 soft-glow disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {isLoading
        ? 'Processing...'
        : disabled && !isLoading
        ? 'Already Premium'
        : !scriptReady
        ? 'Loading...'
        : children}
    </button>
  )
}
