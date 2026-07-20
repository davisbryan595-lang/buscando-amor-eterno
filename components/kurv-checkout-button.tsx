'use client'

import { useAuth } from '@/context/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface KurvCheckoutButtonProps {
  className?: string
  children?: React.ReactNode
  disabled?: boolean
  onSuccess?: () => void
  onError?: (message: string) => void
}

declare global {
  interface Window {
    Kurv?: {
      openPaymentModal: (opts: Record<string, unknown>) => void
      openCheckout: (opts: Record<string, unknown>) => void
    }
  }
}

export function KurvCheckoutButton({
  className = '',
  children = 'Start Your Premium Membership',
  disabled = false,
  onSuccess,
  onError,
}: KurvCheckoutButtonProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [scriptReady, setScriptReady] = useState(false)
  const userRef = useRef(user)
  const scriptRef = useRef<HTMLScriptElement | null>(null)

  const kurvPublicKey = process.env.NEXT_PUBLIC_KURV_KEY

  useEffect(() => {
    userRef.current = user
  }, [user])

  useEffect(() => {
    if (!kurvPublicKey || scriptRef.current) return

    const script = document.createElement('script')
    script.src = 'https://sdk.kurv.app/kurv-checkout.js'
    script.async = true
    script.onload = () => setScriptReady(true)
    script.onerror = () => {
      console.error('Failed to load Kurv script')
      onError?.('Payment system unavailable. Please try again.')
    }
    document.head.appendChild(script)
    scriptRef.current = script

    return () => {
      if (scriptRef.current) {
        document.head.removeChild(scriptRef.current)
        scriptRef.current = null
      }
    }
  }, [kurvPublicKey, onError])

  const handlePaymentSuccess = async (transactionId: string) => {
    const currentUser = userRef.current
    if (!currentUser) {
      router.push('/signup')
      return
    }

    try {
      setIsLoading(true)

      const { data: sessionData } = await supabase.auth.getSession()
      const accessToken = sessionData?.session?.access_token

      const res = await fetch('/api/kurv/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({ transactionId }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Payment failed')
      }

      onSuccess?.()
      router.push('/pricing?payment=success')
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Payment failed'
      console.error('Kurv payment error:', error)
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

    if (!window.Kurv) {
      onError?.('Payment system not ready. Please refresh the page.')
      return
    }

    window.Kurv.openCheckout({
      publicKey: kurvPublicKey,
      amount: 1200,
      currency: 'USD',
      description: 'Premium Membership - $12/month',
      customerEmail: user.email,
      customerId: user.id,
      onSuccess: (response: any) => {
        handlePaymentSuccess(response.transactionId || response.id)
      },
      onError: (error: any) => {
        const errorMsg = error?.message || 'Payment failed. Please try again.'
        onError?.(errorMsg)
      },
      onClose: () => {
        console.log('Checkout closed')
      },
    })
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
